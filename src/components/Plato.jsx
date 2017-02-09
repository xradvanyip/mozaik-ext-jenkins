import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import jenkinsUtil                      from './../common/jenkins-util';


class Plato extends Component {
  constructor(props) {
      super(props);

      this.state = { avgMaintainability: 100.0,
                     avgComplexity: 1.0,
                     worstMaintainability: 100.0,
                     worstComplexity: 1 };
  }

  getApiRequest() {
      const { job } = this.props;

      const jobApiURLpart = jenkinsUtil.fitApiURL(job);

      return {
          id:     `jenkins.platoReport.${job}`,
          params: {
              job: jobApiURLpart
          }
      };
  }

  onApiData(data) {
      this.setState({ avgMaintainability: data.avgMaintainability,
                      avgComplexity: data.avgComplexity,
                      worstMaintainability: data.worstMaintainability,
                      worstComplexity: data.worstComplexity });
  }

  render() {
    const { job, title } = this.props;
    const { avgMaintainability, avgComplexity, worstMaintainability, worstComplexity } = this.state;

    const finalTitle = title || jenkinsUtil.getShortJobName(job);
    const amStatusClass = `jenkins__plato-status__report jenkins__plato-status__report--${ jenkinsUtil.getMaintabilityThreshold(avgMaintainability) }`;
    const acStatusClass = `jenkins__plato-status__report jenkins__plato-status__report--${ jenkinsUtil.getComplexityThreshold(avgComplexity) }`;
    const wmStatusClass = `jenkins__plato-status__report jenkins__plato-status__report--${ jenkinsUtil.getMaintabilityThreshold(worstMaintainability) }`;
    const wcStatusClass = `jenkins__plato-status__report jenkins__plato-status__report--${ jenkinsUtil.getComplexityThreshold(worstComplexity) }`;

    return (
      <div>
          <div className="widget__header">
              <span className="widget__header__subject">{finalTitle}</span>
              <i className="fa fa-heartbeat" />
          </div>
          <div className="jenkins__plato-status">
              Maintainability:<br/>
              <div className="jenkins__plato-status__report">
                  AVG: <span className={amStatusClass}>{parseFloat(avgMaintainability).toFixed(2)}</span><br/>
                  Worst: <span className={amStatusClass}>{parseFloat(worstMaintainability).toFixed(2)}</span>
              </div>
              <br/>
              Complexity:<br/>
              <div className="jenkins__plato-status__report">
                  AVG: <span className={acStatusClass}>{parseFloat(avgComplexity).toFixed(2)}</span><br/>
                  Worst: <span className={wcStatusClass}>{worstComplexity}</span>
              </div>
          </div>
      </div>
    );
  }
}

Plato.displayName = 'Plato';

Plato.propTypes = {
    job:    PropTypes.string.isRequired,
    title:  PropTypes.string
};


reactMixin(Plato.prototype, ListenerMixin);
reactMixin(Plato.prototype, Mozaik.Mixin.ApiConsumer);


export default Plato;
