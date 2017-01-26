import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import moment                          from 'moment';
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import { getBuildStatus }              from './util';
import JobStatusPreviousBuild          from './JobStatusPreviousBuild.jsx';
import jenkinsUtil                      from './../common/jenkins-util';


class JobStatus extends Component {
    constructor(props) {
        super(props);

        this.state = { builds: [] };
    }

    getApiRequest() {
        const { job, layout } = this.props;

        const jobApiURLpart = jenkinsUtil.fitApiURL(job);

        return {
            id:     `jenkins.job.${job}`,
            params: { 
                job: jobApiURLpart,
                layout
            }
        };
    }

    onApiData(builds) {
        this.setState({ builds });
    }

    render() {
        const { job, layout, title } = this.props;
        const { builds }             = this.state;

        let currentNode  = null;
        let previousNode = null;
        let statusClasses;
        let iconClasses;

        const finalTitle = title ? (
            <span>{title}</span>
        ) : (
            <span>
                <span>Jenkins job&nbsp;</span>
                <br />
                <span className="widget__header__subject" >{ layout === 'bold' ? jenkinsUtil.getShortJobSpaceEscaped(job) : jenkinsUtil.getShortJobName(job) }</span>
            </span>
        );

        if (layout === 'bold') {
            if (builds.length > 0) {
                const currentBuild = builds[0];
                if (currentBuild.result === 'SUCCESS') {
                    iconClasses = 'fa fa-check';
                }

                statusClasses = `widget__body__colored jenkins__view__job__build__colored_status--${ getBuildStatus(currentBuild).toLowerCase() }`;

                currentNode = (
                    <div className="jenkins__job-status__current">
                        Build #{currentBuild.number}<br />
                        <a className="jenkins__job-status__current__status" href={currentBuild.url}>
                            {finalTitle}&nbsp;
                            <i className={iconClasses}/>
                        </a><br/>
                        <time className="jenkins__job-status__current__time">
                            <i className="fa fa-clock-o"/>&nbsp;
                            {moment(currentBuild.timestamp, 'x').fromNow()}
                        </time>
                    </div>
                );

            }

            return (
                <div className={statusClasses}>
                    {currentNode}
                </div>
            );
        }

        iconClasses = 'fa fa-close';

        if (builds.length > 0) {
            const currentBuild = builds[0];
            if (currentBuild.result === 'SUCCESS') {
                iconClasses = 'fa fa-check';
            }

            statusClasses = `jenkins__job-status__current__status jenkins__job-status__current__status--${ getBuildStatus(currentBuild).toLowerCase() }`;

            currentNode = (
                <div className="jenkins__job-status__current">
                    Build #{currentBuild.number}<br />
                    <a className={statusClasses} href={currentBuild.url}>
                        {currentBuild.result}&nbsp;
                        <i className={iconClasses} />
                    </a><br/>
                    <time className="jenkins__job-status__current__time">
                        <i className="fa fa-clock-o" />&nbsp;
                        {moment(currentBuild.timestamp, 'x').fromNow()}
                    </time>
                </div>
            );

            if (builds.length > 1) {
                previousNode = <JobStatusPreviousBuild build={builds[1]} />;
            }
        }

        return (
            <div>
                <div className="widget__header">
                    {finalTitle}
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {currentNode}
                    {previousNode}
                </div>
            </div>
        );
    }
}

JobStatus.displayName = 'JobStatus';

JobStatus.propTypes = {
    job:    PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
    title:  PropTypes.string
};

JobStatus.defaultProps = {
    layout: 'default'
};

reactMixin(JobStatus.prototype, ListenerMixin);
reactMixin(JobStatus.prototype, Mozaik.Mixin.ApiConsumer);


export default JobStatus;
