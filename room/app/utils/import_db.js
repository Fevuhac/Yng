const dbclient = require('../../../database').dbclient;

module.exports = {
    mysqlClient: new dbclient.MysqlConnector(),
    redisClient: new dbclient.RedisConnector(),
}