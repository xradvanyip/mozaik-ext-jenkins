import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                     from './../common/jenkins-util';
import moment                          from 'moment';
import { default as BarChart }         from './historyChart/BarChart.jsx';

class PlatoComplexityAverageChart extends Component {
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
            id: `jenkins.platoComplexityAverageHistory.${folder}`,
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

        // converts to format required by BarChart component
        const data = history.map(entry => ({
            x:        moment(entry.timestamp).format('H:mm:ss;MMM D;YYYY'),
            y:        entry.data,
            cssClass: `jenkins__plato-graph__fill--${ jenkinsUtil.getComplexityThreshold(entry.data) }`
        }));

        const barChartOptions = {
            mode:            'stacked',
            xLegend:         'date',
            xLegendPosition: 'right',
            yLegend:         'complexity',
            yLegendPosition: 'top',
            xPadding:        0.3,
            barClass:        d => d.cssClass
        };

        return (
            <div>
                <div className="widget__header">
                    {title}
                    <i className="fa fa-line-chart"/>
                </div>
                <div className="widget__body">
                    <BarChart data={[{ data: data }]} options={barChartOptions}/>
                </div>
            </div>
        );
    }
}

PlatoComplexityAverageChart.displayName = 'PlatoComplexityAverageChart';

PlatoComplexityAverageChart.propTypes = {
    jobs: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    title: PropTypes.string
};

reactMixin(PlatoComplexityAverageChart.prototype, ListenerMixin);
reactMixin(PlatoComplexityAverageChart.prototype, Mozaik.Mixin.ApiConsumer);


export default PlatoComplexityAverageChart;
