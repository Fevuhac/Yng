const pomelo = require('pomelo');
const Income = require('./income');
const async = require('async');
const eventType = require('../../consts/eventType');
const cacheKey = require('../../cache/cacheKey');


class DataCenter {
    constructor() {
        this._income = new Income();
        this._income.on(eventType.PUMPWATER, this.onPumpWater.bind(this));
    }

    start() {
        logger.info('数据中心服务器启动成功 1111')
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

            logger.info('数据中心服务器启动成功')
            this._income.start();
        }.bind(this));
    }

    stop() {
        mysqlClient.stop();
    }

    onPumpWater(pumpwater){
        console.log('--------------------dataCenter onPumpWater:',pumpwater);
        redisClient.cmd.set(cacheKey.PUMPWATER, pumpwater);
        redisClient.pub(eventType.PUMPWATER, {pumpwater:pumpwater});
    }

}

module.exports = new DataCenter();

