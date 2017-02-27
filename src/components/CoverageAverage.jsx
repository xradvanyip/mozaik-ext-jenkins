import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                      from './../common/jenkins-util';


class CoverageAverage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            avgCoverage: 0,
        };
    }

    getApiRequest() {
        const { jobs, folder } = this.props;

        const folderApiURLpart = jenkinsUtil.fitApiURL(folder);

        return {
            id: `jenkins.coverageAverage.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(data) {
        this.setState({
            avgCoverage: data,
        });
    }

    render() {
        const { job, title } = this.props;
        const { avgCoverage } = this.state;

        const acStatusClass = `jenkins__coverage-status__average-value jenkins__coverage-status__average-value--${ jenkinsUtil.getCoverageThreshold(avgCoverage) }`;

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{title}</span>
                    <i className="fa fa-heartbeat"/>
                </div>
                <div className="jenkins__coverage-status">
                    <span className="jenkins__coverage-status jenkins__coverage-status__title">Coverage</span>
                    <div className="jenkins__coverage-status__average-value">
                        <span className={acStatusClass}>{avgCoverage} %</span>
                    </div>
                </div>
            </div>
        );
    }
}

CoverageAverage.displayName = 'CoverageAverage';

CoverageAverage.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(CoverageAverage.prototype, ListenerMixin);
reactMixin(CoverageAverage.prototype, Mozaik.Mixin.ApiConsumer);


export default CoverageAverage;
