const dbUtils = require('../../../database').dbUtils;
const databaseConfig = require('../../../database').databaseConfig;
const application= require('../../../base/application');
const logHelper = require('../../../base/logHelper');

export default {
    logHelper:logHelper,
    redisAccountSync:dbUtils.redisAccountSync,
    application:application,
    databaseConfig:databaseConfig,
    
};