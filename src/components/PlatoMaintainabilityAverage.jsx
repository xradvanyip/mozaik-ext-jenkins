import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                      from './../common/jenkins-util';


class PlatoMaintainabilityAverage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            avgMaintainability: 0,
        };
    }

    getApiRequest() {
        const { jobs, folder } = this.props;

        const folderApiURLpart = jenkinsUtil.fitApiURL(folder);

        return {
            id: `jenkins.platoMaintainabilityAverage.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(data) {
        this.setState({
            avgMaintainability: data,
        });
    }

    render() {
        const { job, title } = this.props;
        const { avgMaintainability } = this.state;

        const acStatusClass = `jenkins__plato-status__average-value jenkins__plato-status__average-value--${ jenkinsUtil.getMaintainabilityThreshold(avgMaintainability) }`;

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{title}</span>
                    <i className="fa fa-heartbeat"/>
                </div>
                <div className="jenkins__plato-status">
                    <span className="jenkins__plato-status jenkins__plato-status__title">Maintainability</span>
                    <div className="jenkins__plato-status__average-value">
                        <span className={acStatusClass}>{avgMaintainability} %</span>
                    </div>
                </div>
            </div>
        );
    }
}

PlatoMaintainabilityAverage.displayName = 'PlatoMaintainabilityAverage';

PlatoMaintainabilityAverage.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoMaintainabilityAverage.prototype, ListenerMixin);
reactMixin(PlatoMaintainabilityAverage.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoMaintainabilityAverage;
