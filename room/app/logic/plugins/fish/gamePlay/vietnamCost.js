// //--[[
// description: 战斗内各种消耗计算（越南版）
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：引用外部参数不可在该内中修改
// //--]]

const Cost = require('./cost')
const cacheReader = require('../../../../cache/cacheReader');
const consts = require('../consts');
const TAG = 'numberTest ---';

class VietnamCost extends Cost{
    constructor(){
        super();
    }

    /**
     * 当前奖池
     */
    getRewardPool () {
        return cacheReader.bonuspool;
    }

    /**
     * 获取全服命中修正
     */
    getGlobalByGM () {
        return cacheReader.platformCatchRate;
    }

    /**
     * 计算鱼被捕获
     */
    _calFishGot(params) {
        let data = this._calFishFloor(params);
        data.gold = params.fishRewad || this._calFishReward(params);
        return data;
    }
    
    /**
     * 计算捕获率
     * 个人命中
     * 全服命中
     */
    _calGpct (params) {
        let gpct = super._calGpct(params);

        let personal = params.player_catch_rate;
        gpct *= personal;
    
        let log = params.isReal && this.log || null;
        log && log(TAG + '------------个人修正 = ', personal, gpct);

        let gl = this.getGlobalByGM();
        gpct *= gl;
        log && log(TAG + '------------全服修正 = ', gl, gpct);

        return gpct;
    }

    /**
     * 计算碰撞与否
     * 先通过奖池筛选：
     * 判断此鱼分数*子弹倍率 是否 > 奖池 
     * 如果大于，则直接认为无法命中
     * 如果小于等于，才进入命中计算
     */
    catchNot(params, account, fishModel, isReal, bFishGold) {
        let ret = {};
        let rewardPool = this.getRewardPool();
        
        let log = isReal && this.log || null;
        log && log(TAG + '------------奖池筛选---start----------------------------1')
        log && log(TAG + '------------当前奖池 = ',rewardPool, ' 当前抽水池 = ', cacheReader.pumppool);

        let vip = account.vip;
        bFishGold = bFishGold || {};
        for (let bk in params) {
            let bd = params[bk];
            let fishes = bd.fishes;
            let fishLen = fishes.length;
            if (fishLen === 0) {
                continue;
            }
            let td = this.parseBulletKey(bk);
            let skin = td.skin;
            let weaponLv = td.wpLv;
            let skillIngIds = bd.skill_ing;
            let rewardLv = weaponLv;
            if (td.skillId > 0) {
                let skillId = td.skillId;
                if (skillId == consts.SKILL_ID.SK_NBOMB0 || skillId == consts.SKILL_ID.SK_NBOMB1 || skillId == consts.SKILL_ID.SK_NBOMB2) {
                    const CFG = this._getSkillCfg(skillId);
                    rewardLv = CFG.ratio;//当有核弹时，参与计算的倍率应当为技能倍率
                }
            }

            let skinReward = 1;
            let bulletBornSkillHitrate = this.getSkillGpctValue(skillIngIds) || 1;
            if (bulletBornSkillHitrate === 1) {
                let SKIN = this._getWpSKinCfg(skin);
                if (!SKIN) {
                    logger.error('skin = ', skin, weaponLv);
                }
                const WP_POWER = SKIN.power;
                skinReward = WP_POWER[2];
            }
            let fishGolds = {};
            log && log(TAG + '------------当前子弹捕鱼条数 = ',fishLen)
            while (fishLen > 0 && fishLen--) {
                let tfish = fishes[fishLen];
                let fk = tfish.nameKey;
                let fish = fishModel.getActorData(fk);
                if (!fish) {
                    fishes.splice(fishLen, 1);
                    continue;
                }
                let fishRewad = this._calFishReward({
                    goldVal: fish.goldVal,
                    weaponLv: rewardLv,
                    skinReward: skinReward,
                });
                if (fishRewad > rewardPool) {
                    fishes.splice(fishLen, 1);
                    ret[fk] = {};
                }else{
                    fishGolds[fk] = fishRewad;
                    rewardPool -= fishRewad;
                    log && log(TAG + '------------模拟扣除奖池 = ', fishRewad);
                    log && log(TAG + '------------模拟扣除奖池 剩余 = ', rewardPool);
                }
            }
            bFishGold[bk] = fishGolds;
            if (fishes.length === 0) {
                continue;
            }
        }
        let  superRes = super.catchNot(params, account, fishModel, isReal, bFishGold);
        for (let k in ret) {
            superRes.ret[k] = ret[k];
        }
        return superRes;
    }

    checkWithCost (account, ownC, cost) {
        if (ownC <= 0) {
            if (account.gold < cost) {
                return 1;
            }
        }
        return 0;
    }

    skillCostWithMoney (account, cost) {
        let ret = {};
        let own = account.gold;
        if (own >= cost) {
            own -= cost;
            ret.costGold = cost;
        }
        ret.gold = own;
        return ret;
    }
}

module.exports = VietnamCost;