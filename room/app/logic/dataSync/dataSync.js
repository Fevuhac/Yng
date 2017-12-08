const pomelo = require('pomelo');
const async = require('async');
const eventType = require('../../consts/eventType');
const redisKey = require('../../utils/import_def').REDISKEY;
const redisClient = require('../../utils/import_db').redisClient;
const mysqlClient = require('../../utils/import_db').mysqlClient;
const changeSync = require('./changeSync');
const pumpwater = require('./pumpwater');
const timeSyc = require('./timeSyc');

class DataSync {
    constructor() {
        pumpwater.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
        changeSync.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
        timeSyc.on(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
    }

    start() {
        async.waterfall([function (cb) {
            let config = pomelo.app.get('mysql');
            mysqlClient.start(config, cb);
        },function (connector, cb) {
            let redis_config = pomelo.app.get('redis');
            redisClient.start(redis_config,cb);
        }],function (err) {
            if(err){
                logger.error('连接数据库失败:', err);
                return;
            }

            pumpwater.start();
            changeSync.start();
            timeSyc.start();

            logger.info('数据同步服启动成功');

        }.bind(this));
    }

    stop() {
        mysqlClient.stop();
        redisClient.stop();
        timeSyc.stop();
    }

    platform_data_change(type, value){
        redisClient.pub(eventType.PLATFORM_DATA_CHANGE, {type:type, value:value});
    }

}

module.exports = new DataSync();

