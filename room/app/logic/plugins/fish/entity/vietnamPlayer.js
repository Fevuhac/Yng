// //--[[
// description: 越南版player
// author: scott
// date: 20171129
// ATTENTION：
// //--]]

const FishPlayer = require('./player');
const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const consts = require('../consts');
const cacheWriter = require('../../../../cache/cacheWriter');

class VietnamPlayer extends FishPlayer{
    constructor(data){
        super(data);
    }

    static sBaseField(){
        let baseField = FishPlayer.sBaseField();
        const self = [
            ACCOUNTKEY.BONUS_POOL,
            ACCOUNTKEY.PUMP_POOL,
            ACCOUNTKEY.COST,
            ACCOUNTKEY.CASH,
            ACCOUNTKEY.RECHARGE,
            ACCOUNTKEY.GAIN_LOSS,
            ACCOUNTKEY.GAIN_LOSS_LIMIT,
            ACCOUNTKEY.GAIN_LOSS_SNAPSHOT,
        ];
        return baseField.concat(self);
    }

    getBaseField () {
        return VietnamPlayer.sBaseField();
    }

    /**
     * 贡献抽水和奖池
     * 注意：玩家字段同步更新
     */
    async addCost (costVal) {
        let ret = await cacheWriter.addCost(costVal);
        logger.error('sdfsd--', ret);
        if (ret) {
            this.account.pump_pool = ret.pump;  //注意该变量为增量类型，下同
            this.account.bonus_pool = ret.bonus;   
            this.account.commit();
            logger.error('sdfsd-2-', ret);
        }
    }

    /**
     * 返还消耗
     */
    async backCost (costVal) {
        this.addCost(-costVal);
     }
    
    /**
     * 从奖池扣除奖励
     */
    async subReward (gainVal) {
        if (!gainVal || gainVal < 0) return;
        await cacheWriter.subReward(gainVal);
        this.account.bonus_pool = -gainVal;  //注意该变量为增量类型，下同
        this.account.commit();
    }

    /**
     * 其他消耗:
     * 购买皮肤、购买月卡、购买VIP礼包、购买道具（提现功能内非实物类购买）、购买钻石、购买技能等各种其他非赌博消耗
     * 即未参于奖池和抽水
     */
    addCostOther (costVal) {
        if (!costVal || costVal < 0) return;
        this.account.cost = costVal;  //注意该变量为增量类型，下同
        this.account.commit();
    }

    /**
     * 个人捕获率修正失效检查
     */
    checkPersonalGpctOut () {
        let wl = this.account.gain_loss;
        let out = this.account.gain_loss_limit;
        let start = this.account.gain_loss_snapshot; //被设置时的盈亏值
        logger.error('wl = ', wl, ' out = ', out, ' start = ', start);
        out = Math.abs(out);
        start = Math.abs(start); 
        if (out && start) {
            let cc = Math.abs(wl) - start; 
            if (Math.abs(cc) >= out) {
                this.account.gain_loss_limit = 0;
                this.account.gain_loss_snapshot = 0;
                this.account.player_catch_rate = 1;
                this.account.commit();
            }    
        }
    }
}

module.exports = VietnamPlayer;
