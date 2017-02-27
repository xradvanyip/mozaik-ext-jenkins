import request from 'superagent';
import config  from './config';
import moment  from 'moment';
import Promise from 'bluebird';
import chalk   from 'chalk';
import fs      from 'fs';
import _ from 'lodash';
require('superagent-bluebird-promise');


const viewBuildTypes = [
    'lastBuild',
    'lastFailedBuild',
    'lastSuccessfulBuild'
];


/**
 * Configures and returns jenkins client.
 *
 * @param {Mozaik} mozaik
 * @returns {Object}
 */
const client = mozaik => {

    let averageComplexityHistory = [];
    let averageMaintainabilityHistory = [];

    mozaik.loadApiConfig(config);
    const caFilePath = config.get('jenkins.customCa');
    let certificate;

    if (caFilePath.length > 0) {
        try {
            certificate = fs.readFileSync(caFilePath);
        } catch(error) {
            mozaik.logger.error(chalk.red(`[jenkins] an error occurred while trying to read custom certificate (${ error })`));
            throw error;
        }
    }

    const buildRequest = (path) => {
        const url = config.get('jenkins.baseUrl') + path;
        let req = request.get(url);

        if (certificate) {
            req = req.ca(certificate);
        }

        mozaik.logger.info(chalk.yellow(`[jenkins] fetching from ${ url }`));

        return req
            .auth(
                config.get('jenkins.basicAuthUser'),
                config.get('jenkins.basicAuthPassword')
            )
            .promise()
            .catch(error => {
                mozaik.logger.error(chalk.red(`[jenkins] ${ error.error }`));
                throw error;
            })
        ;
    };

    const calculateMetrics = (data) => {
        const report = data.reports;
        let avgM = parseFloat(data.summary.average.maintainability);
        let avgC = 0;
        let worstM = report[0].complexity.maintainability;
        let worstC = report[0].complexity.methodAggregate.cyclomatic;

        for (let i in report) {
            avgC += report[i].complexity.methodAggregate.cyclomatic;
            if (report[i].complexity.maintainability < worstM) worstM = report[i].complexity.maintainability;
            if (report[i].complexity.methodAggregate.cyclomatic > worstC) worstC = report[i].complexity.methodAggregate.cyclomatic;
        }
        avgC /= report.length;
        return {
            avgMaintainability: avgM,
            avgComplexity: avgC,
            worstMaintainability: worstM,
            worstComplexity: worstC
        }
    };

    const calculateMetricsAverage = (params, metrics) => {

        let promises = [];
        const jobs = params.jobs;

        _.each(jobs, (job) => {
            const metrcisDataPromise = buildRequest(`/job/${ params.folder}/job/${ job }/ws/plato_reports/report.json`)
                .then((res) => {
                    return calculateMetrics(res.body)
                })
            promises.push(metrcisDataPromise);
        });

        return Promise.all(promises).then(values => {

            const metricsValues = [];

            _.each(values, (value) => {
                metricsValues.push(value[metrics]);
            })
            const average = _.sum(metricsValues) / metricsValues.length;
            return _.round(average, 2);
        });

    };

    const calculateCoverageAverage = (params) => {

        let promises = [];
        const jobs = params.jobs;

        _.each(jobs, (job) => {
            const dataPromise = buildRequest(`/job/${ params.folder}/job/${ job }/ws/coverage/coverage.json`)
                .then((res) => {
                    return res.body.coverage ? res.body.coverage.percent /* for lab */ : res.body.total.statements.pct /* for istanbul */
                })
            promises.push(dataPromise);
        });

        return Promise.all(promises).then(values => {

            const average = _.sum(values) / values.length;
            return _.round(average, 2);
        });

    };

    const newHistoryItem = (data) => {
        const now = moment();

        const element = {
            data,
            timestamp: now
        };

        return element;
    }


    const makeHistory = (history, entry) => {
        const historyLength = history.length;

        if (historyLength === 0) {
            let newHistory = [];
            newHistory.push(newHistoryItem(entry));
            return newHistory;
        } else if (history[historyLength-1].data !== entry) {
            let newHistory;

            if (historyLength < 5)
                newHistory = history.slice(0, historyLength);
            else
                newHistory = history.slice(1, historyLength);

            newHistory.push(newHistoryItem(entry));
            return newHistory;
        } else
            return history;
    }

    const apiMethods = {
        jobs() {
            return buildRequest('/api/json?tree=jobs[name,lastBuild[number,building,timestamp,result]]&pretty=true')
                .then(res => res.body.jobs)
            ;
        },

        jobsOfFolder(params) {
            return buildRequest(`/job/${ params.jobFolder }/api/json?tree=jobs[name,lastBuild[number,building,timestamp,result]]&pretty=true`)
                .then(res => res.body.jobs)
            ;
        },

        job(params) {
            return buildRequest(`/job/${ params.job }/api/json?pretty=true&depth=10&tree=builds[number,duration,result,builtOn,timestamp,id,building,url]`)
                .then(res => res.body.builds)
            ;
        },

        jobBuild(params) {
            return buildRequest(`/job/${ params.job }/${ params.buildNumber }/api/json?pretty=true`)
                .then(res => res.body)
            ;
        },

        view(params) {
            return buildRequest(`/view/${ params.view }/api/json?pretty=true&depth=1`)
                .then(res => {
                    const view   = res.body;
                    const builds = [];

                    // Fetch builds details
                    view.jobs.forEach(job => {
                        viewBuildTypes.forEach(buildType => {
                            if (job[buildType]) {
                                builds.push(
                                    apiMethods.jobBuild({
                                        job:         job.name,
                                        buildNumber: job[buildType].number
                                    })
                                    .then(build => {
                                        job[buildType] = build;
                                    })
                                );
                            }
                        });
                    });

                    return Promise.all(builds)
                        .then(() => view)
                    ;
                })
            ;
        },

        platoReport(params) {
            return buildRequest(`/job/${ params.job }/ws/plato_reports/report.json`)
                .then(res => {
                    return calculateMetrics(res.body)
                });
        },

        platoComplexityAverage(params) {
            return calculateMetricsAverage(params, 'avgComplexity');
        },

        platoMaintainabilityAverage(params) {
            return calculateMetricsAverage(params, 'avgMaintainability');
        },

        platoComplexityAverageHistory(params) {
            return calculateMetricsAverage(params, 'avgComplexity')
            .then((currentValue) => {
                averageComplexityHistory = makeHistory(averageComplexityHistory, currentValue);
                return averageComplexityHistory;
            });
        },

        platoMaintainabilityAverageHistory(params) {
            return calculateMetricsAverage(params, 'avgMaintainability')
            .then((currentValue) => {
                averageMaintainabilityHistory = makeHistory(averageMaintainabilityHistory, currentValue);
                return averageMaintainabilityHistory;
            });
        },

        coverageAverage(params) {
            return calculateCoverageAverage(params);
        }
    };

    return apiMethods;
};


export default client;
