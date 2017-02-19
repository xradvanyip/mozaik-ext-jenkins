import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                     from './../common/jenkins-util';
import moment                          from 'moment';

class PlatoMaintainabilityAverageTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            history: []
        };
    }

    getApiRequest() {
        const { jobs, folder } = this.props;

        const folderApiURLpart = jenkinsUtil.fitApiURL(folder);

        return {
            id: `jenkins.platoMaintainabilityAverageHistory.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(newHistory) {
        this.setState({
            history: newHistory
        });
    }

    render() {
        const { title } = this.props;
        const { history } = this.state;

        let rows = [];
        let previousData = null

        history.forEach((entry) => {
            const amStatusClass = `jenkins__plato-status__average-value--${ jenkinsUtil.getMaintainabilityThreshold(entry.data) }`;

            rows.unshift(
                (<div className="jenkins__plato-table__row">
                    <div className="jenkins__plato-table__timestamp">{moment(entry.timestamp).format('YYYY MMM D, H:mm:ss')}</div>
                    <div className="jenkins__plato-table__value">
                        <span className={amStatusClass}>{entry.data}</span>
                        {
                            previousData
                            ? entry.data < previousData
                                ? <i className="fa fa-caret-down jenkins__plato-table__icon jenkins__plato-table__icon-worsen"/>
                                : <i className="fa fa-caret-up jenkins__plato-table__icon jenkins__plato-table__icon-better"/>
                            : <span />
                        }
                    </div>
                </div>)
            );
            previousData = entry.data;
        })
        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{title}</span>
                    <i className="fa fa-line-chart"/>
                </div>
                <div className="widget__body">
                    <div className="jenkins__plato-table__row jenkins__plato-table__header">
                        <div className="jenkins__plato-table__header__timestamp">Observed</div>
                        <div className="jenkins__plato-table__header__value">Avg.</div>
                    </div>
                        {rows}
                </div>
            </div>
        );
    }
}

PlatoMaintainabilityAverageTable.displayName = 'PlatoMaintainabilityAverageTable';

PlatoMaintainabilityAverageTable.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoMaintainabilityAverageTable.prototype, ListenerMixin);
reactMixin(PlatoMaintainabilityAverageTable.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoMaintainabilityAverageTable;
