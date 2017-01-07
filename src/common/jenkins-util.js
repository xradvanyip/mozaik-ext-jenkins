
'use strict';

const jenkinsUtil = {
  containsDirPart: jobName => {
    return jobName.includes('/');
  },

  fitApiURL: jobName => {
    return jobName.replace(/[\/]/,'/job/');
  },

  getShortJobName: jobName => {
    const tokens = jobName.split('/');
    return tokens[tokens.length - 1];
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
