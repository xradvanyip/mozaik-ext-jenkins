import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                     from './../common/jenkins-util';
import moment                          from 'moment';

class PlatoComplexityAverageTable extends Component {
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
            id: `jenkins.platoComplexityAverage.${folder}`,
            params: {
                jobs: jobs,
                folder: folderApiURLpart,
            }
        };
    }

    onApiData(data) {
        console.log('ComplexityAvgH ', JSON.stringify(data));

        const newHistory = this.makeHistory(data);

        this.setState({
            history: newHistory
        });
    }

    makeHistory(entry) {
        const { history } = this.state;
        const historyLength = history.length;

        if(historyLength === 0) {
            let newHistory = [];
            newHistory.push(this.newHistoryItem(entry));
            return newHistory;
        } else if(history[historyLength-1].data !== entry) {
            let newHistory;

            if(historyLength < 5)
                newHistory = history.slice(0, historyLength);
            else
                newHistory = history.slice(1, historyLength);

            newHistory.push(this.newHistoryItem(entry));
            return newHistory;
        } else
            return history;
    }

    newHistoryItem(data) {
        const now = moment();
        const element = {
            data,
            timestamp: now
        };
        return element;
    }

    render() {
        const { job, title } = this.props;
        const { history } = this.state;

        let rows = [];
        let previousData = null

        history.forEach((entry) => {
            rows.unshift(
                (<div className="jenkins__plato-table__row">
                    <div className="jenkins__plato-table__timestamp">{entry.timestamp.format('YYYY MMM D, H:mm:ss')}</div>
                    <div className="jenkins__plato-table__value">
                        {entry.data}
                        {
                            previousData
                            ? entry.data > previousData
                                ? <i className="fa fa-caret-up jenkins__plato-table__icon jenkins__plato-table__icon-worsen"/>
                                : <i className="fa fa-caret-down jenkins__plato-table__icon jenkins__plato-table__icon-better"/>
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

PlatoComplexityAverageTable.displayName = 'PlatoComplexityAverageTable';

PlatoComplexityAverageTable.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoComplexityAverageTable.prototype, ListenerMixin);
reactMixin(PlatoComplexityAverageTable.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoComplexityAverageTable;
