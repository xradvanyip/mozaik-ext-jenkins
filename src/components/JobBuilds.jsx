import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import JobBuild                        from './JobBuild.jsx';
import jenkinsUtil                     from './../common/jenkins-util';


class JobBuilds extends Component {
    constructor(props) {
        super(props);

        this.state = { builds: [] };
    }

    getApiRequest() {
        const { job } = this.props;

        return {
            id:     `jenkins.job.${job}`,
            params: { job }
        };
    }

    onApiData(builds) {
        this.setState({ builds });
    }

    render() {
        const { builds } = this.state;
        const { job, title }  = this.props;

        const finalTitle = title ? (
            <span>{title}</span>
        ) : (
            <span>
                Jenkins <span className="widget__header__subject">{ jenkinsUtil.getShortJobName(job) }</span> builds
            </span>
        );
        
        title : jenkinsUtil.getShortJobName(job);

        return (
            <div>
                <div className="widget__header">
                    {finalTitle}
                    <span className="widget__header__count">
                        {builds.length}
                    </span>
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {builds.map(build => (
                        <JobBuild key={build.number} build={build} />
                    ))}
                </div>
            </div>
        );
    }
}

JobBuilds.displayName = 'JobBuilds';

JobBuilds.propTypes = {
    title: PropTypes.string,
    job:   PropTypes.string.isRequired
};

reactMixin(JobBuilds.prototype, ListenerMixin);
reactMixin(JobBuilds.prototype, Mozaik.Mixin.ApiConsumer);


export default JobBuilds;
