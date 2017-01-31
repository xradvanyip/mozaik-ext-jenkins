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
    const short = jenkinsUtil.getShortJobName(jobName);
    return jenkinsUtil.getShortJobName(jobName).replace(/-/g, ' ');
  },

  getFolderPart: jobName => {
    const lastSlash = jobName.lastIndexOf('/');
    if(lastSlash === -1) {
      return '';
    }
    return jobName.substring(0, lastSlash);
  }
}

export default jenkinsUtil;
