// //--[[
// description: 战斗内各种消耗计算（大陆版）
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：引用外部参数不可在该内中修改
// //--]]

const cacheReader = require('../../../../cache/cacheReader');
const consts = require('../consts');

const TAG = 'numberTest ---';
const DEBUG = 1;

class Cost {
    constructor() {
        this._configReader = require('../configReader');
        this.MATH_ADJUST_CFG = GAMECFG.common_mathadjust_const_cfg;

        if (DEBUG === 1) {
            this.log = console.log;
        } else if (DEBUG === 2) {
            this.log = logger.info;
        }
    }

    _getWpLevelCfg (level) {
        return this._configReader.getValue('newweapon_upgrade_cfg', level);
    }

    _getWpSKinCfg (skin) {
        return this._configReader.getValue('newweapon_weapons_cfg', skin);
    }

    _getVipCfg (vip) {
        return this._configReader.getValue('vip_vip_cfg', vip);
    }

    /**
     * 抽水系数，全服一个值：休闲周期=1,//吃分周期<1,//出分周期>1
     */
    getPumpWater () {
        return cacheReader.pumpwater;
    }

    /**
     * 当前奖池
     */
    getRewardPool () {
        return 0;
    }

    /**
     * 获取全服命中修正
     */
    getGlobalByGM () {
        return 1;
    }

    /**
     * 查找女神特权
     */
    //查找当前女神特权
    findGodSProperty(godId, godLevel, spId) {
        if (godId >= 0 && godLevel >= 0) {
            let sps = this._configReader.getValueByKey1('goddess_goddessup_cfg', godId, godLevel);
            if (spId == sps.property) {
                return sps.value;
            }
        }
        return 0;
    }

    /**
     * 返回技能配置
     */
    _getSkillCfg(skillId) {
        return this._configReader.getValue('skill_skill_cfg', skillId);
    }

    /**
     * 开炮消耗
     * @param params
     * {
     *  weapon_skin:1,
     *  weapon:10
     * }
     * TODO：多平台
     */
    fire_gold_cost(params) {
        return Math.floor(params.weapon * this._getWpSKinCfg(params.weapon_skin).power[1]);
    }

    /**
     * 开炮经验值
     * @param params
     * {
     *  gold: 100,
     *
     * }
     */
    fire_gain_exp(params) {
        let userExp = Math.ceil(params.gold * GAMECFG.common_const_cfg.GOLDEN_EXP_TIMES);
        let spData = this.findGodSProperty(params.godId, params.godLevel, consts.GOD_PROPERTY_ID.lv10);
        if (spData > 0) {
            userExp *= (1 + spData); //女神特权:捕鱼获得升级经验提高x%
        }
        return userExp;

    }

    /**
     * 开炮积攒激光能量
     */
    fire_gain_laser(params) {
        let skin = params.weapon_skin;
        let wpLv = params.weapon;
        let old = params.energy;
        const wp = this._getWpLevelCfg(wpLv);
        let pp = wp.addpower;
        let skinCost = this._getWpSKinCfg(skin).power[1];
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
    reset_exp_level(level, exp, gain) {
        let next = level;
        let level_cfgs = GAMECFG.player_level_cfg;
        if (next >= level_cfgs.length) {
            return { full: true };
        }
        let cfg = level_cfgs[next - 1];
        if (exp + gain >= cfg.exp_max) {
            exp = -cfg.exp_max;
            level = next + 1;
        } else {
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
    getComebackCfg(foudId) {
        if (foudId >= 0) {
            const FUND = GAMECFG.shop_fund_cfg;
            for (let i = 0; i < FUND.length; i++) {
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
    getComebackHitRate(weaponLv, foudId) {
        if (foudId >= 0) {
            const FUND = GAMECFG.shop_fund_cfg;
            let wpLv = -1;
            let hitrate = 1;
            for (let i = 0; i < FUND.length; i++) {
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
    checkRoipctTimeStamp(roipctTime, gold, wpLvMax) {
        let roiPCT = 1;
        const MAC = this.MATH_ADJUST_CFG;
        const a = MAC.A;    //--数值调整参数名称
        if (roipctTime || gold >= a * wpLvMax) {
            roiPCT = MAC.ROIPCT;
            let now = new Date().getTime();
            if (!roipctTime) {
                roipctTime = now;
            } else {
                let tt = now - roipctTime;
                if (tt >= MAC.LONG * 1000) {
                    roipctTime = 0;
                    roiPCT = 1;
                }
            }
        } else {
            roiPCT = 1;
        }
        return [roiPCT, roipctTime];
    }

    /**
     * 玩家武器最大等级
     */
    getWpLevelMax(weaponEnergy) {
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
    getSkillGpctValue(skillIngIds) {
        if (!skillIngIds || skillIngIds.length == 0) {
            return 1;
        }
        let hitrate = 1;
        for (let i = 0; i < skillIngIds.length; i++) {
            const skill = this._getSkillCfg(skillIngIds[i]);
            if (skill.hitrate > hitrate) {
                hitrate = skill.hitrate;
            }
        }
        return hitrate;
    }

    /**
     * 获取vip影响技能hitrate加成
     */
    getVippingSkillPct(vip, skillIds) {
        let cfg = this._getVipCfg(vip);
        if (!cfg) return 0;
        let data = cfg.vip_skillAddition; //5.指定技能威力提高：vip_skillAddition
        if (data) {
            if (!skillIds || skillIds.length == 0) {
                return 0;
            }
            for (let i = 0; i < data.length; i++) {
                let sk = data[i];
                if (!sk.length < 2) {
                    continue;
                }
                let id = sk[0];
                for (let j = 0; j < skillIds.length; j++) {
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
    subComebackHitRate(weaponLv, comeback) {
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
     * 处理鱼死亡层数
     */
    _calFishFloor(params) {
        let floor = params.floor;
        floor --; //剩余死亡次数，默认初始1，特殊鱼>1;若是该值为0，则死掉，反之只是受伤；普通鱼命中则直接设为0，特殊鱼可能存在递减操作
        floor = Math.max(0, floor);
        let data = {
            floor: floor,
        }
        return data;
    }

    /**
     * 组合鱼捕获奖励数据
     */
    _calFishGot(params) {
        let data = this._calFishFloor(params);
        data.gold = this._calFishReward(params);
        return data;
    }

    /**
     * 当前子弹当前鱼可以得多少分
     */
    _calFishReward(params) {
        let reward = params.goldVal;
        reward *= params.weaponLv;
        reward *= params.skinReward;
        reward = Math.round(reward);
        return reward;
    }

    /**
     * 计算捕获率
     */
    _calGpct (params) {
        let fishCfg = params.fishCfg;
        let weaponspct = params.weaponspct;
        let fireFlag = params.fireFlag; 
        let fishbasepctTotal = params.fishbasepctTotal; 
        let isPlayerPowerSkillIng = params.isPlayerPowerSkillIng; 
        let fishGoldTotal = params.fishGoldTotal;
        let goldVal = params.goldVal;
        let glaPCT = params.glaPCT;
        let roiPCT = params.roiPCT; 
        let heartbeat = params.heartbeat; 
        let pumpWater = params.pumpWater; 
        let newcomergold = params.newcomergold; 
        let bulletBornSkillHitrate = params.bulletBornSkillHitrate;
        let vipHitrate = params.vipHitrate;
        let skinPct = params.skinPct;
        let gold = params.gold;
        let fishbasepct = params.fishbasepct;

        let basPCT = fishbasepct * fishCfg.mapct * weaponspct;
        
        let log = params.isReal && this.log || null;
        log && log(TAG + '------------fish---start----------------------------1')
        log && log(TAG + '--fishbasepct = ', fishbasepct);
        log && log(TAG + '--mapct = ', fishCfg.mapct, fireFlag);

        let mofPCT = fishbasepct / fishbasepctTotal;
        let isPowerFired = isPlayerPowerSkillIng && (fireFlag === consts.FIRE_FLAG.NBOMB || fireFlag === consts.FIRE_FLAG.LASER);//被激光或核弹打中
        if (fishGoldTotal > 0 && fireFlag) {
            mofPCT = goldVal / fishGoldTotal;
        }
        log && log(TAG + '--goldVal = ', goldVal);
        log && log(TAG + '--fishName = ', fishCfg.name);
        log && log(TAG + '--basPCT = ', basPCT);
        log && log(TAG + '--glaPCT = ', glaPCT);
        log && log(TAG + '--roiPCT = ', roiPCT);
        log && log(TAG + '--mofPCT = ', mofPCT);
        log && log(TAG + '--heartbeat = ', heartbeat);
        log && log(TAG + '--pumpWater = ', pumpWater);

        let gpct = basPCT * glaPCT * roiPCT * mofPCT;
        log && log(TAG + '--gpct = ', gpct);

        if (!isPowerFired) {
            heartbeat = Math.floor(heartbeat);
            const MAC = this.MATH_ADJUST_CFG;
            let rcPCT = 1 + Math.sin(heartbeat * MAC.PICHANGE) * Math.min((MAC.DIVERGE + Math.ceil(heartbeat / 30) * MAC.DRATIO), MAC.HVALUE);
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
        if (gpct === NaN) {
            throw new Error('debug test--!');
        }
        return gpct;
    }

    /**
     * 根据计算捕获率判定是否可以被捕获
     */
    _isCaughtByGpct (params) {
        let gpct = this._calGpct(params);
        let ranVal = Math.random();
        let log = params.isReal && this.log || null;
        log && log(TAG + '--gpct = ', gpct, ranVal);
        return gpct >= ranVal;
    }

    /**
     * 解析子弹数据
     */
    parseBulletKey (bk) {
        let ts = bk.split('_');
        let data = {
            uIdx: parseInt(ts[0]),
            skin: parseInt(ts[1]),
            wpLv: parseInt(ts[2]),
            skillId: parseInt(ts[3]),
            rmatching: parseInt(ts[4]),
            bIdx: parseInt(ts[5]),
        };
        let tl = ts.length;
        if (bk.indexOf('_=') > 0 && tl > 5) {
            data.fishSkill = ts[3];
            data.skillId = 0;
            data.rmatching = parseInt(ts[tl - 2]);
            data.bIdx = parseInt(ts[tl - 1]);
            ts = bk.split('_=');
            ts = ts[1].split('@');
            data.sfk = ts[0];
        }
        return data;
    }

    /**
     * 计算碰撞与否
     * TODO：多平台
     */
    catchNot(params, account, fishModel, isReal, bFishGold) {
        bFishGold = bFishGold || {};
        let level = account.level;
        let vip = account.vip;
        let gold = account.gold;
        let comeback = account.comeback;
        let weaponEnergy = account.weapon_energy;
        let heartbeat = account.heartbeat;
        let roipctTime = account.roipct_time;

        const L_CFG = this._configReader.getValue('player_level_cfg', level);
        let yPCT = L_CFG.yPCT;
        let glaPCT = yPCT;
        let newcomergold = L_CFG.newcomergold;
        let vipHitrate = this._getVipCfg(vip).vip_hitrate;
        let wpLvMax = this.getWpLevelMax(weaponEnergy);
        let tData = this.checkRoipctTimeStamp(roipctTime, gold, wpLvMax);
        let roiPCT = tData[0];
        let roipctTimeNew = tData[1];
        let pumpWater = this.getPumpWater();
        let player_catch_rate = account.player_catch_rate || 1;

        let ret = {};
        let fishFloor = {};//鱼已被
        let costGold = {}; //打死不存在的鱼，则补偿其消耗
        for (let bk in params) {
            let bd = params[bk];
            let fishes = bd.fishes;
            if (fishes.length === 0) {
                continue;
            }
            let td = this.parseBulletKey(bk);
            let skin = td.skin;
            let weaponLv = td.wpLv;
            let rewardLv = weaponLv; //奖励倍数
            let skillIngIds = bd.skill_ing;
            let vipSkillPct = vip > 0 && this.getVippingSkillPct(vip, skillIngIds) || 0;
            let skinReward = 1;
            let skinPct = 1; //TODO:武器星级可对皮肤捕获率加成,字段pct
            let SKIN = null;
            let bulletBornSkillHitrate = this.getSkillGpctValue(skillIngIds) || 1;
            if (bulletBornSkillHitrate === 1) {
                (!SKIN) && (SKIN = this._getWpSKinCfg(skin));
                if (!SKIN) {
                    logger.error('skin = ', skin, weaponLv);
                }
                const WP_POWER = SKIN.power;
                skinPct = WP_POWER[0];
                skinReward = WP_POWER[2];
            } else {
                bulletBornSkillHitrate *= (1 + vipSkillPct);
                //TODO:武器星级可对激光捕获率加成,字段power//bulletBornSkillHitrate * (1 + wp.getWpStarData().power); //激光威力加成
            }
            let bGold = bFishGold[bk] || {};
            let isPlayerPowerSkillIng = false;//玩家主动技能：核弹或激光
            let isFishPowerSkillIng = false; //鱼死亡技能：炸弹、闪电
            let fireFlag = consts.FIRE_FLAG.NORMAL;
            if (td.fishSkill && td.sfk) {
                let sfk = td.sfk
                isFishPowerSkillIng = fishFloor[sfk] === 0 || fishModel.findDeadHistory(sfk);
                let skillId = td.fishSkill;
                if (skillId === 'lighting') {
                    fireFlag = consts.FIRE_FLAG.LIGHTING;
                } else if (skillId === 'bomb') {
                    fireFlag = consts.FIRE_FLAG.BOMB;
                } else {
                    isFishPowerSkillIng = false;
                }
            } else if (td.skillId > 0) {
                let skillId = td.skillId;
                isPlayerPowerSkillIng = skin && weaponLv && skillIngIds && skillIngIds.length > 0;
                if (skillId === consts.SKILL_ID.SK_LASER) {
                    fireFlag = consts.FIRE_FLAG.LASER;
                } else if (skillId == consts.SKILL_ID.SK_NBOMB0 || skillId == consts.SKILL_ID.SK_NBOMB1 || skillId == consts.SKILL_ID.SK_NBOMB2) {
                    fireFlag = consts.FIRE_FLAG.NBOMB;
                    const CFG = this._getSkillCfg(skillId);
                    rewardLv = CFG.ratio;//当有核弹时，参与计算的倍率应当为技能倍率
                } else {
                    isPlayerPowerSkillIng = false;
                }
            }

            //被鱼技能(炸弹或闪电)命中的，默认百分百命中
            if (isFishPowerSkillIng) {
                let i = fishes.length;
                while (i > 0 && i--) {
                    let tfish = fishes[i];
                    let fk = tfish.nameKey;
                    let fish = fishModel.getActorData(fk);
                    if (!fish || fishFloor[fk] === 0) {
                        fishes.splice(i, 1);
                        continue;
                    }
                    if (fireFlag === consts.FIRE_FLAG.LIGHTING || fireFlag === consts.FIRE_FLAG.BOMB) {
                        let gotData = this._calFishGot({
                            floor: fish.floor,
                            goldVal: fish.goldVal,
                            weaponLv: rewardLv,
                            skinReward: skinReward,
                            fishRewad: bGold[fk],
                        });
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
            let WUP = this._getWpLevelCfg(weaponLv);
            if (!WUP) {
                logger.error('wep = ', weaponLv, WUP, skin, bk, account.id);
            }
            let weaponspct = WUP.weaponspct * this.getComebackHitRate(weaponLv, comeback.cb_id);

            let fishbasepctTotal = 0;
            let fishGoldTotal = 0;
            let i = fishes.length;
            while (i > 0 && i--) {
                let tfish = fishes[i];
                let fk = tfish.nameKey;
                let fish = fishModel.getActorData(fk);
                if (!fish) {
                    //该鱼已经被销毁，但是在死亡历史上存在过(防止玩家修改上传数据刷分)，则补偿玩家消耗
                    if (fishModel.findDeadHistory(fk)) {
                        costGold[bk] = costGold[bk] || 0;
                        costGold[bk]++;
                    }
                    logger.error('--碰撞参数错误:该鱼不存在1 ', fk);
                    fishes.splice(i, 1);
                    continue;
                }
                let temp = fk.split('#');
                fish.name = temp[0];
                let fishbasepct = fishModel.getFishBasePct(fk);
                fishbasepctTotal += fishbasepct;
                fishGoldTotal += fish.goldVal;
            }

            for (let i = 0; i < fishes.length; i++) {
                let tfish = fishes[i];
                let fk = tfish.nameKey;
                let fpos = tfish.fishPos;
                let fish = fishModel.getActorData(fk);
                if (fishFloor[fk] === 0) {
                    costGold[bk] = costGold[bk] || 0;
                    costGold[bk]++;
                    continue;
                }                
                let fishCfg = fishModel.getFishCfg(fish.name);
                let fishbasepct = fishModel.getFishBasePct(fk);
                let isCaught = this._isCaughtByGpct({
                    fishCfg: fishCfg, 
                    fishbasepct: fishbasepct,
                    weaponspct: weaponspct, 
                    fireFlag: fireFlag, 
                    fishbasepctTotal: fishbasepctTotal, 
                    isPlayerPowerSkillIng: isPlayerPowerSkillIng, 
                    fishGoldTotal: fishGoldTotal, 
                    goldVal: fish.goldVal, 
                    glaPCT: glaPCT, 
                    roiPCT: roiPCT, 
                    heartbeat: heartbeat, 
                    pumpWater: pumpWater, 
                    newcomergold: newcomergold, 
                    bulletBornSkillHitrate: bulletBornSkillHitrate,
                    vipHitrate: vipHitrate,
                    skinPct: skinPct,
                    gold: gold,
                    player_catch_rate: player_catch_rate,
                    isReal: isReal,
                });
                let gotData = {};
                if (isCaught) {
                    gotData = this._calFishGot({
                        floor: fish.floor,
                        goldVal: fish.goldVal,
                        weaponLv: rewardLv,
                        skinReward: skinReward,
                        fishRewad: bGold[fk],
                    });
                    gotData.fireFlag = fireFlag;
                    gotData.rmatching = td.rmatching;
                    fishFloor[fk] = gotData.floor;
                }else if (skin === consts.WP_SKIN_ID.CHIYANNVSHEN) {
                    (!SKIN) && (SKIN = this._getWpSKinCfg(skin));
                    SKIN && SKIN.effectvalue > 0 && fishModel.resetFish(fk, SKIN.effectvalue);
                }
                ret[fk] = gotData;
            }
        }
        return { ret: ret, roipct_time: roipctTimeNew, costGold: costGold };
    }

    /**
     * 检查是否充足
     */
    checkWithCost (account, ownC, cost) {
        if (ownC <= 0) {
            if (account.pearl < cost) {
                return 1;
            }
        }
        return 0;
    }

    checkEnough(skillId, curWpLv, account) {
        let notEnough = 0;
        let skill = account.skill;
        if (skill) {
            const CFG = this._getSkillCfg(skillId);
            if (skillId === consts.SKILL_ID.SK_LASER) {
                let wpEnergy = account.weapon_energy;
                if (wpEnergy && curWpLv) {
                    const wp = this._getWpLevelCfg(curWpLv);
                    if (!wp || wpEnergy[curWpLv] < wp.needpower) {
                        notEnough = 3;
                    }
                }
            } else {
                let ownC = skill[skillId] || 0;
                notEnough = this.checkWithCost(account, ownC, CFG.cost);
            }
        } else {
            notEnough = 2;
        }
        return notEnough
    }

    skillCostWithMoney (account, cost) {
        let ret = {};
        let own = account.pearl;
        if (own >= cost) {
            own -= cost;
            ret.costPearl = cost;
        }
        ret.pearl = own;
        return ret;
    }

    /**
     * 技能消耗
     * 充足则直接扣，反之扣钻石
     */
    useSkill(skillId, curWpLv, account) {
        let ret = {};
        let notEnough = this.checkEnough(skillId, curWpLv, account);
        if (notEnough === 0) {
            let skill = account.skill;
            let ownC = skill[skillId] || 0;
            if (ownC > 0) {
                ownC--;
            } else {
                const CFG = this._getSkillCfg(skillId);
                let cost = CFG.cost;
                let temp = this.skillCostWithMoney(account, cost);
                temp.costPearl >= 0 && (ret.costPearl = temp.costPearl);
                temp.pearl >= 0 && (ret.pearl = temp.pearl);
                temp.costGold >= 0 && (ret.costGold = temp.costGold);
                temp.gold >= 0 && (ret.gold = temp.gold);
            }
            ret.skillC = ownC;
        }
        ret.notEnough = notEnough;
        return ret
    }

    /**
     * 排位赛：技能消耗
     * 不管充足与否，扣除对应金币
     */
    useSkillWithRmatch(skillId, curWpLv, account, costVal) {
        let ret = {};
        let notEnough = this.checkEnough(skillId, curWpLv, account);
        let skill = account.skill;
        let ownC = skill[skillId] || 0;
        ret.gold = account.gold;
        ret.costGold = costVal;
        ret.skillC = ownC;
        ret.notEnough = notEnough;
        return ret
    }

    /**
     * 更新心跳
     * 每消耗MIN(炮最高倍率,场景最高倍率)*1的金币，心跳+1
     */
    newHeartBeat(cost, max_level, heartbeatMinCost, heartbeat, wpEnergy) {
        const MAC = this.MATH_ADJUST_CFG;
        let minCost = heartbeatMinCost;
        if (!minCost) {
            let max = this.getWpLevelMax(wpEnergy);
            minCost = Math.min(max, max_level || max) * MAC.HRATIO;
            heartbeatMinCost = minCost;
        }
        let temp = cost / minCost;
        heartbeat += temp;
        if (heartbeat > 180) {
            heartbeat = 1;
            let max = this.getWpLevelMax(wpEnergy);
            heartbeatMinCost = Math.min(max, max_level || max) * MAC.HRATIO;
        } else {
            //保留六位小数
            heartbeat = heartbeat.toFixed(6);
            heartbeat = parseFloat(heartbeat);
        }
        return [heartbeat, heartbeatMinCost];
    }

    /**
     * 计算奖金鱼奖金
     * 注意其加成方式
     */
    calGoldenFishReward (gold, skin, star) {
        let reward = gold;
        if (skin === consts.WP_SKIN_ID.DIANWAN) {
            const cfg = this._getWpSKinCfg(skin);
            if (cfg && cfg.effectvalue > 0) {
                reward *= cfg.effectvalue;
            }
        }
        const wpStarCfg = this._configReader.getWeaponStarData(skin, star);
        if (wpStarCfg && wpStarCfg.golden >= 0) {
            reward *= (1 + wpStarCfg.golden);  
        }
        reward /= 10;//策划约定
        reward = Math.floor(reward);
        return reward;
    }

    /**
     * 指定皮肤的武器产生多少颗克隆子弹，一般是0
     * 注意：星舰黎明必须返回，客户端在处理子弹反弹时需要克隆子弹，以达到入射逐渐变短，出射逐渐增长的效果
     */
    calBulletClonedCount (skin) {
        let count = 0;
        switch(skin) {
            case consts.WP_SKIN_ID.LIMING:
            case consts.WP_SKIN_ID.YUELIANGTU:
                count = 10 + Math.floor(Math.random()*40); //星舰黎明和月亮兔子弹 分裂出来的子弹都是根据第一个子弹克隆，约定一个最多碰撞分裂次数
            break;

            case consts.WP_SKIN_ID.JIAN20: 
                count = 3 + Math.floor(Math.random()*5); //除掉自己
            break;

            case consts.WP_SKIN_ID.PAOPAOTANG:{
                const cfg = this._getWpSKinCfg(skin);
                let rv = Math.random();
                if (rv < cfg.effectvalue) {
                    count = 8;
                }
                //logger.error('calBulletClonedCount count = ', count, rv, cfg.effectvalue);
            }
            break;
        }
        return count;
    }

}

module.exports = Cost;


