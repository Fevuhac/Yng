const shareData = require('../../../cache/shareData');
const dataType = require('../../../cache/dataType');
const consts = require('./consts');

let SKIN_CFGS = null;
let VIP_CFG = null;
let WEAPON_UP_CFG = null;
let LEVEL_CFG = null;
let FISH_CFG = null;
let MATH_ADJUST_CFG = null;
let SKILL_CFGS = {};
let GOD_UP_CFG = null;

const DEBUG = 1;
let log = null;
if (DEBUG === 1) {
    log = console.log; 
}else if (DEBUG === 2) {
    log = logger.info;
}


class Cost{
    constructor(){
        SKIN_CFGS = GAMECFG.newweapon_weapons_cfg;
        VIP_CFG = GAMECFG.vip_vip_cfg;
        FISH_CFG = GAMECFG.fish_fish_cfg;
        WEAPON_UP_CFG = GAMECFG.newweapon_upgrade_cfg;
        LEVEL_CFG = GAMECFG.player_level_cfg;
        MATH_ADJUST_CFG = GAMECFG.common_mathadjust_const_cfg;
        GOD_UP_CFG = GAMECFG.goddess_goddessup_cfg;

        SKILL_CFGS = {};
        const CFG = GAMECFG.skill_skill_cfg;
        for (let i = 0; i < CFG.length; i ++) {
            let data = CFG[i];
            SKILL_CFGS[data.id] = data;
        }
    }

    /**
     * 查找女神特权
     */
    //查找当前女神特权
    findGodSProperty (godId, godLevel, spId) {
        let sps = {};
        for (let i = 0; i < GOD_UP_CFG.length; i ++) {
            let cfg = GOD_UP_CFG[i];
            if (cfg.id === godId && cfg.level > 0 && godLevel >= cfg.level) {
                let k = cfg.property;
                sps[k] = cfg.value;
            }
        }
        return sps[spId];
    }

    /**
     * 返回技能配置
     */
    getSkillCfg (skillId) {
        return skillId && SKILL_CFGS[skillId] || null;
    }

    /**
     * 开炮消耗
     * @param params
     * {
     *  weapon_skin:1,
     *  weapon:10
     * }
     */
    fire_gold_cost(params){
        return Math.floor(params.weapon * SKIN_CFGS[params.weapon_skin].power[1]);
    }

    /**
     * 开炮经验值
     * @param params
     * {
     *  gold: 100,
     *
     * }
     */
    fire_gain_exp(params){
        let userExp = Math.ceil(params.gold*GAMECFG.common_const_cfg.GOLDEN_EXP_TIMES);
        let spData = this.findGodSProperty(params.godId, params.godLevel, consts.GOD_PROPERTY_ID.lv10);
        if (spData > 0) {
            userExp *= (1 + spData); //女神特权:捕鱼获得升级经验提高x%
        }
        return userExp;

    }

    /**
     * 开炮积攒激光能量
     */
    fire_gain_laser (params) {
        let skin = params.weapon_skin;
        let wpLv = params.weapon;
        let old = params.energy;
        const wp = WEAPON_UP_CFG[wpLv];
        let pp = wp.addpower;
        let skinCost = SKIN_CFGS[skin].power[1];
        if (skinCost > 0) {
            pp *= skinCost;
        }
        let godSpVal = this.findGodSProperty(params.godId, params.godLevel, consts.GOD_PROPERTY_ID.lv11);
        if (godSpVal > 0) {
            pp *= (1 + godSpVal); //女神特权加成激光增量
        }
        old += pp;
        return old;
    }

    /**
     * 重置经验等级
     * @param level
     * @param exp
     * @returns {{exp: *, level: *}}
     */
    reset_exp_level(level, exp, gain){
        let next = level;
        let level_cfgs = GAMECFG.player_level_cfg;
        if (next >= level_cfgs.length) {
            return {full: true};
        }
        let cfg = level_cfgs[next - 1];
        if (exp + gain >= cfg.exp_max) {
            exp = -cfg.exp_max;
            level = next + 1;
        }else{
            exp = gain;
        }
        return {
            exp: exp,
            level: level
        };

    }

    /**
     * 查找翻盘基金配置
     */
    getComebackCfg (foudId) {
        if (foudId >= 0) {
            const FUND = GAMECFG.shop_fund_cfg;
            for (let i = 0; i < FUND.length; i ++) {
                let fd = FUND[i];
                if (fd.id === foudId) {
                    return fd;
                }
            }
        }
        return null;
    }

    /**
     * 获取有翻盘基金捕获率因子
     */
    getComebackHitRate (weaponLv, foudId) {
        if (foudId >= 0) {
            const FUND = GAMECFG.shop_fund_cfg;
            let wpLv = -1;
            let hitrate = 1;
            for (let i = 0; i < FUND.length; i ++) {
                let fd = FUND[i];
                if (fd.id === foudId) {
                    wpLv = fd.weaponlevel;
                    hitrate = fd.hitrate;
                    break;
                }
            }
            if (wpLv > 0 && wpLv >= weaponLv) {
                return hitrate;
            }
        }
        return 1;
    }
    /**
     * 检查roipct时间戳是否过期,并返回当前捕获率因子
     */
    checkRoipctTimeStamp (roipctTime, gold, wpLvMax) {
        let roiPCT = 1;
        const a = MATH_ADJUST_CFG.A;    //--数值调整参数名称 
        if (roipctTime ||  gold >= a * wpLvMax) {
            roiPCT = MATH_ADJUST_CFG.ROIPCT;
            let now = new Date().getTime();  
            if (!roipctTime) {
                roipctTime = now;
            }else{
                let tt = now - roipctTime;
                if (tt >= MATH_ADJUST_CFG.LONG * 1000) {
                    roipctTime = 0;
                    roiPCT = 1;
                }
            }
        }else{
            roiPCT = 1;
        }
        return [roiPCT, roipctTime];
    }

    /**
     * 玩家武器最大等级
     */
    getWpLevelMax (weaponEnergy) {
        let maxLv = 1;
        if (weaponEnergy && weaponEnergy instanceof Object) {
            for (let wlv in weaponEnergy) {
                let num = parseInt(wlv);
                maxLv = Math.max(num, maxLv);
            }
        }
        return maxLv;
    }

    /**
     * 返回当前技能的修正系数
     */
    getSkillGpctValue (skillIngIds) {
        if (!skillIngIds || skillIngIds.length == 0) {
            return 1;
        }
        let hitrate = 1;
        for(let i = 0; i < skillIngIds.length; i ++) {
            const skill = SKILL_CFGS[skillIngIds[i]];
            if (skill.hitrate > hitrate) {
                hitrate = skill.hitrate;
            }
        }
        return hitrate;
    }

    /**
     * 获取vip影响技能hitrate加成
     */
    getVippingSkillPct (vip, skillIds) {
        let cfg = VIP_CFG[vip];
        if (!cfg) return 0;
        let data = cfg.vip_skillAddition; //5.指定技能威力提高：vip_skillAddition
        if (data) {
            if (!skillIds || skillIds.length == 0) {
                return 0;
            }
            for (let i = 0; i < data.length; i ++) {
                let sk = data[i];
                if (!sk.length < 2) {
                    continue;
                }
                let id = sk[0];
                for(let j = 0; j < skillIds.length; j ++) {
                    if (id === skillIds[j]) {
                        return sk[1];
                    }
                }
            }
        }
        return 0;
    }

    /**
     * 翻盘基金捕获率更新
     * 满足条件每次减去衰减并保留四位小数
     */
    subComebackHitRate (weaponLv, comeback) {
        if (!comeback) return -1;
        let info = this.getComebackCfg(comeback.cb_id);
        let oldComebackHitrate = comeback.hitrate || -1;
        if (info && info.weaponlevel >= weaponLv && oldComebackHitrate > 1) {
            let hitrate = oldComebackHitrate - info.changerate;
            hitrate = parseFloat(hitrate.toFixed(4));
            oldComebackHitrate = (hitrate < 1) ? 1 : hitrate;
        }
        return oldComebackHitrate;
    }

    /**
     * 计算鱼被捕获
     */
    _calFishGot (params) {
        let floor = params.floor;
        floor --; //剩余死亡次数，默认初始1，特殊鱼>1;若是该值为0，则死掉，反之只是受伤；普通鱼命中则直接设为0，特殊鱼可能存在递减操作
        floor = Math.max(0, floor);

        let reward = params.goldVal;
        reward *= params.weaponLv;
        reward *= params.skinReward;
        reward = Math.round(reward); 

        let data = {
            gold: reward, 
            floor: floor,
        }
        return data;
    }

    /**
     * 计算碰撞与否
     */
    catchNot (params, account, fishModel) {
        if (!params) {
            logger.error('--碰撞参数错误');
            return null;
        }
        let level = account.level;
        let vip = account.vip;
        let gold = account.gold;
        let comeback = account.comeback;
        let weaponEnergy = account.weapon_energy;
        let heartbeat = account.heartbeat;
        let roipctTime = account.roipct_time;

        const L_CFG = LEVEL_CFG[level - 1];
        let yPCT = L_CFG.yPCT;
        let glaPCT = yPCT;
        let newcomergold = L_CFG.newcomergold;
        let vipHitrate = VIP_CFG[vip].vip_hitrate;
        let wpLvMax = this.getWpLevelMax(weaponEnergy);
        let tData = this.checkRoipctTimeStamp(roipctTime, gold, wpLvMax);
        let roiPCT = tData[0];
        let roipctTimeNew = tData[1];
        let pumpWater = shareData.get(dataType.PUMPWATER); //抽水系数，全服一个值：休闲周期=1,//吃分周期<1,//出分周期>1

        let ret = {};
        let fishFloor = {};//鱼已被
        let costGold = {}; //打死不存在的鱼，则补偿其消耗
        for (let bk in params) {
            let bd = params[bk];
            let skin = bd.skin;
            let weaponLv = bd.level;
            let fishes = bd.fishes;
            let skillIngIds = bd.skill_ing;            
            let vipSkillPct = vip > 0 && this.getVippingSkillPct(vip, skillIngIds) || 0;
            let skinReward = 1;
            let skinPct = 1; //TODO:武器星级可对皮肤捕获率加成,字段pct
            let bulletBornSkillHitrate = this.getSkillGpctValue(skillIngIds) || 1;  
            if (bulletBornSkillHitrate === 1) {
                let SKIN = SKIN_CFGS[skin];
                if (!SKIN) {
                    logger.error('skin = ', skin, weaponLv);
                }
                const WP_POWER = SKIN_CFGS[skin].power;
                skinPct = WP_POWER[0];
                skinReward = WP_POWER[2];
            }else{
                bulletBornSkillHitrate *= (1 + vipSkillPct);
                //TODO:武器星级可对激光捕获率加成,字段power//bulletBornSkillHitrate * (1 + wp.getWpStarData().power); //激光威力加成
            }

            let isPlayerPowerSkillIng = bk.indexOf('skill_') >= 0 && skin && weaponLv && skillIngIds && skillIngIds.length > 0; //玩家主动技能：核弹或激光
            let isFishPowerSkillIng = false; //鱼死亡技能：炸弹、闪电
            let tNames = bk.split('=');
            if (tNames && tNames.length === 2) {
                let sfk = tNames[1];
                isFishPowerSkillIng = fishFloor[sfk] === 0 || fishModel.findDeadHistory(sfk);
                isFishPowerSkillIng = isFishPowerSkillIng && (tNames[0].indexOf('fsk_') >= 0); 
            }

            //被鱼技能(炸弹或闪电)命中的，默认百分百命中
            if (isFishPowerSkillIng) {
                let i = fishes.length;
                while (i > 0 && i --) {
                    let tfish = fishes[i];
                    let fk = tfish.nameKey;
                    let fish = fishModel.getActorData(fk);
                    if (!fish || fishFloor[fk] === 0) {
                        fishes.splice(i, 1);
                        continue;
                    }
                    let fireFlag = tfish.fireFlag;
                    if (fireFlag === consts.FIRE_FLAG.LIGHTING || fireFlag === consts.FIRE_FLAG.BOMB) {
                        let gotData = this._calFishGot({
                            floor: fish.floor,
                            goldVal: fish.goldVal,
                            weaponLv: weaponLv,
                            skinReward: skinReward,
                        })
                        gotData.fireFlag = fireFlag;
                        fishFloor[fk] = gotData.floor;
                        ret[fk] = gotData;
                        fishes.splice(i, 1);
                    }
                }
                if (fishes.length === 0) {
                    continue;
                }
            }

            //正常捕获率计算
            let WUP = WEAPON_UP_CFG[weaponLv];
            if (!WUP) {
                logger.error('wep = ', weaponLv, WUP, skin, bk, account.id);
            }
            let weaponspct = WUP.weaponspct * this.getComebackHitRate(weaponLv, comeback.cb_id);

            let fishbasepctTotal = 0; 
            let fishGoldTotal = 0;
            let i = fishes.length;
            while (i > 0 && i --) {
                let tfish = fishes[i];
                let fk = tfish.nameKey;
                let fish = fishModel.getActorData(fk);
                if (!fish) {
                    //该鱼已经被销毁，但是在死亡历史上存在过(防止玩家修改上传数据刷分)，则补偿玩家消耗
                    if (fishModel.findDeadHistory(fk)) {
                        costGold[bk] = costGold[bk] || 0;
                        costGold[bk] ++;
                    }
                    logger.error('--碰撞参数错误:该鱼不存在1 ', fk);
                    fishes.splice(i, 1);
                    continue;
                }
                let temp = fk.split('__');
                fish.name = temp[0]; 
                let fishCfg = fishModel.getFishCfg(fish.name);
                fishbasepctTotal += fishCfg.fishbasepct;
                fishGoldTotal += fish.goldVal;
            }

            for (let i = 0; i < fishes.length; i ++) {
                let tfish = fishes[i];
                let fk = tfish.nameKey;
                let fireFlag = tfish.fireFlag;
                let fpos = tfish.fishPos;
                let fish = fishModel.getActorData(fk);
                if (fishFloor[fk] === 0) {
                    costGold[bk] = costGold[bk] || 0;
                    costGold[bk] ++;
                    continue;
                }
                const TAG = 'numberTest ---';
                log && log(TAG + '------------fish---start----------------------------1')

                let fishCfg = fishModel.getFishCfg(fish.name);
                let fishbasepct = fishCfg.fishbasepct;
                let basPCT = fishbasepct * fishCfg.mapct * weaponspct;

                log && log(TAG + '--weaponLv = ', weaponLv);
                log && log(TAG + '--skin = ', skin);
                log && log(TAG + '--fish.name = ', fish.name);
                log && log(TAG + '--fishbasepct = ', fishbasepct);
                log && log(TAG + '--mapct = ', fishCfg.mapct, fireFlag);

                let mofPCT = fishbasepct/fishbasepctTotal; 
                let isPowerFired = isPlayerPowerSkillIng && (fireFlag == consts.FIRE_FLAG.NBOMB || fireFlag == consts.FIRE_FLAG.LASER);//被激光或核弹打中
                if (fishGoldTotal > 0 && fireFlag) {
                    mofPCT = fish.goldVal / fishGoldTotal;
                }

                log && log(TAG + '--basPCT = ', basPCT);
                log && log(TAG + '--glaPCT = ', glaPCT);
                log && log(TAG + '--roiPCT = ', roiPCT);
                log && log(TAG + '--mofPCT = ', mofPCT);
        
                log && log(TAG + '--heartbeat = ', heartbeat);
                log && log(TAG + '--pumpWater = ', pumpWater);
                log && log(TAG + '--roipctTime = ', roipctTime);

                let gpct = basPCT * glaPCT * roiPCT * mofPCT;
                log && log(TAG + '--gpct = ', gpct);
                if (!isPowerFired) {    
                    heartbeat = Math.floor(heartbeat);
                    let rcPCT = 1 + Math.sin(heartbeat * MATH_ADJUST_CFG.PICHANGE) * Math.min((MATH_ADJUST_CFG.DIVERGE + Math.ceil(heartbeat/30) * MATH_ADJUST_CFG.DRATIO), 0.6);
                    log && log(TAG + '--gpct = ', gpct, ' rcPCT = ', rcPCT, heartbeat);
                    gpct *= rcPCT;
                    gpct *= pumpWater; 
                }
                let nrPCT = gold < newcomergold ? 100 : 1;
                gpct *= nrPCT;

                log && log(TAG + '--nrPCT = ', nrPCT, gpct);

                gpct *= bulletBornSkillHitrate;
                log && log(TAG + '--bulletBornSkillHitrate = ', bulletBornSkillHitrate, gpct);

                gpct *= (1 + vipHitrate);
                log && log(TAG + '--vipHitrate = ', vipHitrate, gpct);

                gpct *= skinPct;
                log && log(TAG + '--skinPct = ', skinPct, gpct);
                
                let ranVal = Math.random();
                log && log(TAG + '--gpct = ',gpct, ranVal);
                if (gpct === NaN) {
                    throw new Error('debug test--!');
                }
                let gotData = {};        
                if (gpct >= ranVal) {
                    gotData = this._calFishGot({
                        floor: fish.floor,
                        goldVal: fish.goldVal,
                        weaponLv: weaponLv,
                        skinReward: skinReward,
                    });
                    gotData.fireFlag = fireFlag;
                    fishFloor[fk] = gotData.floor;
                }
                ret[fk] = gotData;
            } 
        }
        return {ret: ret, roipct_time: roipctTimeNew, costGold: costGold};
    }

    /**
     * 检查是否充足
     */
    checkEnough (skillId, curWpLv, account) {
        let notEnough = 0;
        let skill = account.skill;
        if (skill) {
            const CFG = SKILL_CFGS[skillId];
            if (skillId === consts.SKILL_ID.SK_LASER) {
                let wpEnergy = account.weapon_energy;
                if (wpEnergy && curWpLv) {
                    const wp = WEAPON_UP_CFG[curWpLv];
                    if (!wp || wpEnergy[curWpLv] < wp.needpower) {
                        notEnough = 3;
                    }
                }
            }else{
                let ownC = skill[skillId] || 0;
                if (ownC <= 0) {
                    if (account.pearl < CFG.cost) {
                        notEnough = 1;
                    }
                }
            }
        }else{
            notEnough = 2;
        }
        return notEnough
    }

    /**
     * 技能消耗
     * 充足则直接扣，反之扣钻石
     */
    useSkill (skillId, curWpLv, account) {
        let ret = {};
        let notEnough = this.checkEnough(skillId, curWpLv, account);
        if (notEnough === 0) {
            let skill = account.skill;
            let ownC = skill[skillId] || 0;
            if (ownC > 0) {
                ownC --;
            }else{
                const CFG = SKILL_CFGS[skillId];
                let cost = CFG.cost;
                let ownPearl = account.pearl;
                if (ownPearl >= cost) {
                    ownPearl -= cost;
                    ret.costPearl = cost;
                }
                ret.pearl = ownPearl;
            }
            ret.skillC = ownC;
        }
        ret.notEnough = notEnough;
        return ret
    }

    /**
     * 更新心跳
     * 每消耗MIN(炮最高倍率,场景最高倍率)*1的金币，心跳+1
     */
    updateHeartBeat (cost, max_level, heartbeatMinCost, heartbeat, wpEnergy) {
        let minCost = heartbeatMinCost;
        if (!minCost) {
            let max = this.getWpLevelMax(wpEnergy);
            minCost = Math.min(max, max_level || max) * MATH_ADJUST_CFG.HRATIO;
            heartbeatMinCost = minCost;
        }
        let temp = cost/minCost;
        heartbeat += temp;
        if (heartbeat > 180) {
            heartbeat = 1;
            let max = this.getWpLevelMax(wpEnergy);
            heartbeatMinCost = Math.min(max, max_level || max) * MATH_ADJUST_CFG.HRATIO;
        }else{
            //保留六位小数
            heartbeat = heartbeat.toFixed(6);
            heartbeat = parseFloat(heartbeat);
        }
        return [heartbeat, heartbeatMinCost];
    }
}

module.exports = new Cost();


