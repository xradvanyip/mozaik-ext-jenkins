import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import Mozaik                           from 'mozaik/browser';
import JobItem                          from './JobItem.jsx';
import jenkinsUtil                      from './../common/jenkins-util';


class Jobs extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            jobs: [],
            title: 'Jenkins'
        };

        const { job } = props;

        if(job && jenkinsUtil.containsDirPart(job)) {
            this.state.title = `${jenkinsUtil.getFolderPart(job)}/`;    // this.setState() would cause unnecessry re-render
        }
    }

    getApiRequest() {
        const { job } = this.props;

        if(job && jenkinsUtil.containsDirPart(job)) {
            const jobFolderPart = jenkinsUtil.getFolderPart(job);
            const jobFolder = jenkinsUtil.fitApiURL(jobFolderPart);

            return {
                id: `jenkins.jobsOfFolder.${job}`,
                params: { jobFolder }
            };
        }

        return { id: 'jenkins.jobs' };
    }

    onApiData(jobs) {
        this.setState({ jobs });
    }

    render() {
        const { title, jobs } = this.state;

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{title} </span>jobs
                    <span className="widget__header__count">
                        {jobs.length}
                    </span>
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {jobs.map((job, index) => (
                        <JobItem key={index} job={job} />
                    ))}
                </div>
            </div>
        );
    }
}

Jobs.displayName = 'Jobs';

Jobs.propTypes = {
    job:    PropTypes.string
};


reactMixin(Jobs.prototype, ListenerMixin);
reactMixin(Jobs.prototype, Mozaik.Mixin.ApiConsumer);


export default Jobs;
