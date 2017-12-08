const FishPlayer = require('./player');
const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const consts = require('../consts');
const cacheWriter = require('../../../../cache/cacheWriter');

class VietnamPlayer extends FishPlayer{
    constructor(data){
        super(data);
    }

    static allocPlayer(data){
        let promise = new Promise((resolve, reject)=>{
            logger.error('account data.uid= ', data.uid);
            redisAccountSync.getAccount(data.uid, VietnamPlayer.baseField, function (err, account) {
                if(!!err){
                    reject(CONSTS.SYS_CODE.DB_ERROR);
                    return;
                }
                if(!account){
                    reject(CONSTS.SYS_CODE.PLAYER_NOT_EXIST);
                    return
                }

                logger.error('account = ', account);
                
                let player = new VietnamPlayer({uid:data.uid, sid:data.sid, account:account,kindId:consts.ENTITY_TYPE.PLAYER});
                player.gameInfo = {
                    gameMode:data.gameMode,
                    sceneType:data.sceneType
                };
                resolve(player);
            });
        });
        return promise;
    }

    getBaseField(){
        return VietnamPlayer.baseField;
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

VietnamPlayer.baseField = [
    ACCOUNTKEY.NICKNAME,
    ACCOUNTKEY.LEVEL,
    ACCOUNTKEY.WEAPON,
    ACCOUNTKEY.WEAPON_SKIN,
    ACCOUNTKEY.GOLD,
    ACCOUNTKEY.PEARL,
    ACCOUNTKEY.VIP,
    ACCOUNTKEY.COMEBACK,
    ACCOUNTKEY.WEAPON_ENERGY,
    ACCOUNTKEY.HEARTBEAT,
    ACCOUNTKEY.ROIPCT_TIME,
    ACCOUNTKEY.SKILL,
    ACCOUNTKEY.EXP,
    ACCOUNTKEY.FIGURE_URL,
    ACCOUNTKEY.BONUS,
    ACCOUNTKEY.PLAYER_CATCH_RATE,
    ACCOUNTKEY.BONUS_POOL,
    ACCOUNTKEY.PUMP_POOL,
    ACCOUNTKEY.COST,
    ACCOUNTKEY.CASH,
    ACCOUNTKEY.RECHARGE,
    ACCOUNTKEY.GAIN_LOSS,
    ACCOUNTKEY.GAIN_LOSS_LIMIT,
    ACCOUNTKEY.GAIN_LOSS_SNAPSHOT,
];

module.exports = VietnamPlayer;
