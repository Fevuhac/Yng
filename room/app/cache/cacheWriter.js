const cache = require('./cache');
const redisKey = require('../utils/import_def').REDISKEY;
const redisClient = require('../utils/import_db').redisClient;

class CacheWriter{
    constructor(){
        this._data = new Map();
    }

    //奖池增加金币
    _addBonuspool(value){
        return new Promise(function (resolve, reject) {
            let v = Math.max(0, value);
            // INCRBY

            redisClient.cmd.incrbyfloat(redisKey.PLATFORM_DATA.BONUSPOOL, v, function (err, result) {
                if(err){
                    logger.error('奖池金币添加失败');
                    reject(err);
                    return;
                }

                cache.set(redisKey.PLATFORM_DATA.BONUSPOOL, result);
                resolve(result);
            });
        });
    }

    _reduceBonuspool(value){
        return new Promise(function (resolve, reject) {
            let v = Math.max(0, value);
            // INCRBY
            redisClient.cmd.incrbyfloat(redisKey.PLATFORM_DATA.BONUSPOOL, -v, function (err, result) {
                if(err){
                    logger.error('奖池金币扣除失败');
                    reject(err);
                    return;
                }
                cache.set(redisKey.PLATFORM_DATA.BONUSPOOL, result);
                resolve(result);
            });
        });
    }

    //抽水池增加金币
    _addPumppool(value){
        return new Promise(function (resolve, reject) {
            let v = Math.max(0, value);
            redisClient.cmd.incrbyfloat(redisKey.PLATFORM_DATA.PUMPPOOL, v, function (err, result) {
                if(err){
                    logger.error('抽水池金币添加失败');
                    reject(err);
                    return;
                }

                cache.set(redisKey.PLATFORM_DATA.PUMPPOOL, result);
                resolve(result);
            });
        });
    }

    /**
     * 消耗贡献给抽水和奖池
     * @param {*消耗，> 0} value 
     */
    addCost(value){
        if (!value || value < 0) return;
        let rate = 0.05;
        let pump = value * rate;
        let bonus = value - pump;
        this._addBonuspool(bonus);
        this._addPumppool(pump);
    }

    /**
     * 从奖池中扣除奖励
     * @param {*奖励，> 0} value 
     */
    subReward(value) {
        if (!value || value < 0) return;
        //todo
        this._reduceBonuspool(value);
    }

}

module.exports = new CacheWriter();