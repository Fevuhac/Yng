const cache = require('./cache');
const redisKey = require('../utils/import_def').REDISKEY;
const redisClient = require('../utils/import_db').redisClient;

class CacheWriter{
    constructor(){
        this._data = new Map();
    }

    /**
     * 操作各种带key的池子，奖金池、抽水池
     * @param {*} key 
     * @param {*} value 
     */
    _optBonusPool(key, value){
        return new Promise(function (resolve, reject) {
            redisClient.cmd.incrbyfloat(key, value, function (err, result) {
                if(err){
                    logger.error('池子操作失败', key);
                    reject(err);
                    return;
                }
                logger.error('---------- _optBonusPool:key = ', key, ' value =', value, ' result = ',result); 
                cache.set(key, result);
                resolve(result);
            });
        });
    }

    /**
     * 根据消耗更新奖金池和抽水池,> 0 增加，< 0 扣除
     * @param {*消耗，> 0增加，<0扣除} value 
     */
    async addCost(value){
        let rate = 0.05;
        let pump = value * rate;
        let bonus = value - pump;
        await this._optBonusPool(redisKey.PLATFORM_DATA.BONUS_POOL, bonus);
        await this._optBonusPool(redisKey.PLATFORM_DATA.PUMP_POOL, pump);
        return {
            pump: pump,
            bonus: bonus,
        };
    }

    /**
     * 从奖池中扣除奖励
     * @param {*奖励，> 0} value 
     */
    async subReward(value) {
        if (!value || value < 0) return;
        await this._optBonusPool(redisKey.PLATFORM_DATA.BONUS_POOL, -value);
    }

}

module.exports = new CacheWriter();