import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                      from './../common/jenkins-util';


class PlatoComplexityAverage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            avgComplexity: 0,
        };
    }

    getApiRequest() {
        const { jobs, folder } = this.props;

        const folderApiURLpart = jenkinsUtil.fitApiURL(folder);

        return {
            id: `jenkins.platoComplexityAverage.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(data) {
        this.setState({
            avgComplexity: data,
        });
    }

    render() {
        const { job, title } = this.props;
        const { avgComplexity } = this.state;

        const acStatusClass = `jenkins__plato-status__average-value jenkins__plato-status__average-value--${ jenkinsUtil.getComplexityThreshold(avgComplexity) }`;

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{title}</span>
                    <i className="fa fa-heartbeat"/>
                </div>
                <div className="jenkins__plato-status">
                    <span className="jenkins__plato-status jenkins__plato-status__title">Complexity</span>
                    <div className="jenkins__plato-status__average-value">
                        <span className={acStatusClass}>{avgComplexity}</span>
                    </div>
                </div>
            </div>
        );
    }
}

PlatoComplexityAverage.displayName = 'PlatoComplexityAverage';

PlatoComplexityAverage.propTypes = {
    jobs: PropTypes.string.isRequired,
    folders: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoComplexityAverage.prototype, ListenerMixin);
reactMixin(PlatoComplexityAverage.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoComplexityAverage;
