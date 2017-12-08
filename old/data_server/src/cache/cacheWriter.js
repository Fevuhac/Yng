const cache = require('./cache');
const redisKey = require('./consts/redisKey');
var RedisUtil = require('../utils/RedisUtil');

class CacheWriter{
    constructor(){
        this._data = new Map();
    }

    //奖池增加金币
    _addBonuspool(value){
        return new Promise(function (resolve, reject) {
            let v = Math.max(0, value);
            RedisUtil.getClient().incrbyfloat(redisKey.PLATFORM_DATA.BONUSPOOL, v, function (err, result) {
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
            RedisUtil.getClient().incrbyfloat(redisKey.PLATFORM_DATA.BONUSPOOL, -v, function (err, result) {
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
            RedisUtil.getClient().incrbyfloat(redisKey.PLATFORM_DATA.PUMPPOOL, v, function (err, result) {
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
    async addCost(value, account){
        if (!value || value < 0) return;
        let rate = 0.05;
        let pump = value * rate;
        let bonus = value - pump;
        await this._addBonuspool(bonus);
        await this._addPumppool(pump);
    
        account.pump_pool = pump;  //注意该变量为增量类型，下同
        account.bonus_pool = bonus;   
        (!this._checkPersonalGpctOut(account)) && account.commit();
    }

    /**
     * 从奖池中扣除奖励
     * @param {*奖励，> 0} value 
     */
    async subReward(value, account) {
        if (!value || value < 0) return;
        await this._reduceBonuspool(value);

        account.bonus_pool = -value;  //注意该变量为增量类型，下同
        account.commit();
    }

     /**
     * 个人捕获率修正失效检查
     */
    _checkPersonalGpctOut (account) {
        if (!account) return false;
        let wl = account.gain_loss;
        let out = account.gain_loss_limit;
        let start = account.gain_loss_snapshot; //被设置时的盈亏值
        console.log('wl = ', wl, ' out = ', out, ' start = ', start);
        out = Math.abs(out);
        start = Math.abs(start); 
        if (out && start) {
            let cc = Math.abs(wl) - start; 
            if (Math.abs(cc) >= out) {
                account.gain_loss_limit = 0;
                account.gain_loss_snapshot = 0;
                account.player_catch_rate = 1;
                account.commit();
                return true;
            }    
        }
        return false;
    }

}

module.exports = new CacheWriter();