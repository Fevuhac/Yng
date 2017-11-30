const dbUtils = require('../../../database').dbUtils;


module.exports = {
    redisAccountSync:dbUtils.redisAccountSync,
    mysqlAccountSync:dbUtils.mysqlAccountSync,
};