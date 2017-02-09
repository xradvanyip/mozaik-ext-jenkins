'use strict';

const jenkinsUtil = {
  containsDirPart: jobName => {
    // return jobName.includes('/');  // IE11 does not implement includes
    return jobName.indexOf('/') >= 0;
  },

  fitApiURL: jobName => {
    return jobName.replace(/[\/]/g,'/job/');
  },

  getShortJobName: jobName => {
    const tokens = jobName.split('/');
    return tokens[tokens.length - 1];
  },

  getShortJobSpaceEscaped: jobName => {
    return jenkinsUtil.getShortJobName(jobName).replace(/-/g, ' ');
  },

  getFolderPart: jobName => {
    const lastSlash = jobName.lastIndexOf('/');
    if(lastSlash === -1) {
      return '';
    }
    return jobName.substring(0, lastSlash);
  },

  getMaintainabilityThreshold: value => {
    if (value < 50) return "red";
    if (value < 80) return "yellow";
    return "green";
  },

  getComplexityThreshold: value => {
    if (value > 10) return "red";
    if (value > 5) return "yellow";
    return "green";
  }
};

export default jenkinsUtil;
