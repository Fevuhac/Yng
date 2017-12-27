// //--[[
// description: 大陆版player
// author: linyang
// date: 20171129
// ATTENTION：
// //--]]

const Player = require('../../../base/player');
const fishCmd = require('../../../../cmd/fishCmd');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const FishCode = require('../fishCode');
const consts = require('../consts');

const configReader = require('../configReader');
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const playerChangeEvent = require('../../../../cache/playerChangeEvent');
const gamePlay = require('../gamePlay/gamePlay');
const Pirate = require('./pirate');
const Rmatch = require('./rmatch');

const FIRE_DELAY = 50; //开炮事件服务端与客户端的延时,单位毫秒
const DEBUG = 1;
let log = null;
if (DEBUG === 1) {
    log = logger.error; 
}else if (DEBUG === 2) {
    log = logger.info;
}

class FishPlayer extends Player {
    constructor(opts) {
        super(opts);
        this._account = opts.account || {};
        this._roomId = null;
        this._connectState = CONSTS.constDef.PALYER_STATE.ONLINE;
        this._resetDIY();
	    this._sword = 0;  //玩家战力（）
        this._skState = {}; //0准备 1进行中 2结束
        this._sceneCfg = null;
        this._fishModel = null; 
        this._seatId = -1; //座位号，从0开始
        this._gameInfo = {
            gameMode:null,
            sceneId:null
        };

        this._lastFireFish = null;
        this._bkData = {};
        this._fireC = 0;
        this._collisionC = 0;
        this._tc = 0;
        this._fireTimestamp = 0;
        this._lastFireIdx = 0;
        this.cost = gamePlay.cost;

        this._pirate = null;
        this._pirateTimestamp = null;

        this._rmatch = null;

        playerChangeEvent.on(this.uid, function(key, value){
            this.account[key] = value;
        }.bind(this));
    }

    set roomId(value){
        this._roomId = value;
    }

    get roomId(){
        return this._roomId;
    }

    set connectState(value){
        this._connectState = value;
    }

    get connectState(){
        return this._connectState;
    }

    /**
     * 获取玩家战力
     * weapon
     * @returns {number}
     */
    get sword(){
        return this._sword;
    }

    /**
     * 设置场景配置
     * @param value
     */
    set sceneCfg(value){
        this._sceneCfg = value;
    }

    set fishModel(value){
        this._fishModel = value;
    }

    get fishModel() {
        return this._fishModel;
    }
    
    setDIY(key, value){
        if(this._DIY[key]){
            this._DIY[key] = value;
        }
    }

    get DIY(){
        return this._DIY;
    }

    get seatId(){
        return this._seatId;
    }

    set seatId(id){
        this._seatId = id;
        logger.error('seatId changed = ', id);
    }

    set account(value) {
        this._account = value;
    }

    get account() {
        return this._account
    }

    save(){
        this.account.commit();
    }

    c_query_fishes (data, cb) {
        let fm = this.fishModel;
        let fishes = fm.getLiveFish();
        utils.invokeCallback(cb, null, {
            fishes: fishes,
        });
        logger.error('--c_query_fishes--done');
    }

    static sBaseField() {
        const baseField = [
            ACCOUNTKEY.NICKNAME,
            ACCOUNTKEY.SEX,
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
            ACCOUNTKEY.PIRATE,
        ];
        return baseField;
    }

    getBaseField () {
        return FishPlayer.sBaseField();
    }

    c_player_notify(data, cb){
        redisAccountSync.getAccount(this.uid, this.getBaseField(), function (err, account) {
            if(!!err){
                utils.invokeCallback(cb, CONSTS.SYS_CODE.DB_ERROR);
                return;
            }
            if(!account){
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_NOT_EXIST);
                return
            }
            
            let wpEng = account.weapon_energy;
            this.account = account;
            this._resetDIY();

            utils.invokeCallback(cb, null);
            this.emit(fishCmd.push.player_notify.route, {player: this, data:{
                seatId: this.seatId,
                gold: this.account.gold,
                pearl: this.account.pearl,
                wp_level: this.DIY.weapon,
                wp_skin: this.DIY.weapon_skin,
            }});
        }.bind(this));
    }


    /**
     * 开炮
     */
    c_fire(data, cb){
        let isReal = this.isRealPlayer();
        let curWpLv = this.DIY.weapon;
        let curSkin = this.DIY.weapon_skin;
        let energy = this.DIY.weapon_energy[curWpLv];
        if (curSkin != data.wp_skin || curWpLv != data.wp_level || (Object.keys(this.DIY.weapon_energy).length > 0 && energy === undefined)) {
            isReal && log && log('curSkin = ', curSkin, data.wp_skin);
            isReal && log && log('curWpLv = ', curWpLv, data.wp_level );
            isReal && log && log('energy = ', energy);
            utils.invokeCallback(cb, FishCode.NOT_MATCH_WEAPON);
            return;
        }
        let wpBk = data.wp_bk;
        //logger.error('wbk = ', wpBk);
        if (isReal) {
            let bd = this.cost.parseBulletKey(wpBk);
            let now = new Date().getTime();
            if (this._fireTimestamp > 0) {
                let passed = now - this._fireTimestamp;
                const SKIN_CFGS = configReader.getValue('newweapon_weapons_cfg', curSkin);
                //logger.error('bidx = ', bd.bIdx, this._lastFireIdx);
                if (this._lastFireIdx && bd.bIdx - this._lastFireIdx === 1 && passed + FIRE_DELAY < SKIN_CFGS.interval * 1000) {
                    utils.invokeCallback(cb, FishCode.INVALID_WP_FIRE);
                    logger.error('passed = ', passed);
                    return;
                }
            }
            this._fireTimestamp = now;
            this._lastFireIdx = bd.bIdx;
        }
        if (!this._bkData[wpBk]) {
            this._bkData[wpBk] = {
                cost: 0,
                clone: 0,
            }
        }
        if (this._bkData[wpBk].cost > 0) {
            utils.invokeCallback(cb, FishCode.INVALID_WP_BK);
            return;
        }else if (this._bkData[wpBk].cost === -1) {
            this._bkData[wpBk].cost = 0;
            utils.invokeCallback(cb, null);
            return;
        }
        energy = energy || 0;
        let gainLaser = energy;
        let newComebackHitrate = this.account.comeback.hitrate || 1;
        let costGold = 0;
        let nextFireBCC = 0; //下一炮子弹可能分裂出的子弹数
        if(this.account.gold > 0){
            costGold = this.cost.fire_gold_cost({weapon_skin:curSkin, weapon:curWpLv});
            if(costGold > this.account.gold){
                costGold = this.account.gold; //最后一炮不足以开炮时，则默认剩余全部用完可开一次，下一次开炮则破产
            }
            
            this._fireC += costGold;
            isReal && log && log('numberTest--玩家开火累计消耗:', this._fireC);
            
            nextFireBCC = this.cost.calBulletClonedCount(curSkin);
            this._bkData[wpBk].clone = nextFireBCC;
            this._bkData[wpBk].cost = costGold;
            
            let saveData = {
                level: this.account.level,
                exp: this.account.exp,
            };
            let gainExp = this.cost.fire_gain_exp({
                gold:costGold,
                godId: -1, //todo
                godLevel: -1, //todo
            });
            if(gainExp > 0){
                let oldLv = saveData.level;
                let result = this.cost.reset_exp_level(oldLv, saveData.exp, gainExp);
                if (!result.full) {
                    if (result.level > oldLv) {
                        saveData.level = result.level;//升级了，数据服负责发放升级奖励
                    }
                    saveData.exp = result.exp; //注意经验是增量
                }
            }
            newComebackHitrate = this.cost.subComebackHitRate(curWpLv, this.account.comeback);
            if (newComebackHitrate > 0) {
                saveData.comeback_hitrate = newComebackHitrate;
            }            
            let heart = this.cost.newHeartBeat(costGold, this._sceneCfg.max_level, this.account.heartbeat_min_cost, this.account.heartbeat, this.DIY.weapon_energy);
            gainLaser = this.cost.fire_gain_laser({
                weapon_skin:curSkin, 
                weapon: curWpLv, 
                energy: energy,
                godId: -1, //todo 
                godLevel: -1, //todo
            });
            this.DIY.weapon_energy[curWpLv] = gainLaser;
            saveData.weapon_energy = this.DIY.weapon_energy;
            saveData.gold = -costGold;
            saveData.heartbeat = heart[0];
            saveData.heartbeat_min_cost = heart[1];
            this._save(saveData);
            costGold > 0 && isReal && this.addCost(costGold);//贡献奖池和抽水
            isReal && this.checkPersonalGpctOut();
        }
        
        utils.invokeCallback(cb, null, {
            wp_laser: {wp_level: curWpLv, laser: gainLaser},
            exp: this.account.exp,
            level: this.account.level,
            gold: this.account.gold,
            comeback_hitrate: newComebackHitrate,
            costGold: costGold,
            nextFireBCC: nextFireBCC,
        });
        
        if(this.account.gold > 0){
            this.emit(fishCmd.push.fire.route, {player: this, data:{
                seatId: this.seatId,
                fire_point: data.fire_point,
                wp_skin: curSkin,
                wp_level: curWpLv,
                gold: this.account.gold,
                fire_fish: data.fire_fish,
                wp_bk: wpBk,
                costGold: costGold,
            }});
        }
    }

    /**
     * 碰撞鱼捕获率判定
     */
    c_catch_fish(data, cb){
        let isReal = this.isRealPlayer();
        let bFishes = data.b_fishes;
        let bks = Object.keys(bFishes);

        //校验子弹是否真的存在过 //子弹不存在，则无消耗，不能碰撞
        for (let bk in bFishes) {
            if (bk.indexOf('=') > 0) {
                //被鱼技能打死的鱼，不做此校验
                continue;
            }
            let td = bFishes[bk];
            let bd = this._bkData[bk];
            if (!bd) {
                bd = this._bkData[td.cloneBk];
                if (bd) {
                    if (bd.clone > 0) {
                        bd.clone --;
                        continue;
                    }
                    bd = null;
                }
            }
            if (!bd || !bd.cost) {
                isReal && log && log('numberTest--无效碰撞', bk);
                bd && (bd.cost = -1);//碰撞事件比开火事件先收到，视为无效碰撞，则下一次收到该开火事件时不处理
                delete bFishes[bk];
            }
        }

        //检测是否可捕获
        let tData = this.cost.catchNot(bFishes, this.account, this.fishModel, isReal);
        let ret = tData.ret; 
        let gainGold = 0;
        let oldRrewardFishGold = this.account.bonus && this.account.bonus.gold_count || 0;
        let rewardFishNum = 0;
        let pirateData = null;
        for (let fk in ret) {
            let gold = ret[fk].gold;
            if (gold >= 0) {
                gainGold += gold;
                isReal && log && log('numberTest--奖励鱼 = ', fk, gold);
                if (isReal) {
                    let temp = this._missionCoutWithFish(fk, gold);
                    temp.rewardFishFlag === 1 && (rewardFishNum ++);
                    temp.pirateFlag > 0 && this._pirate && (pirateData = this._pirate.getProgress());
                }
            }
        }
        let newRrewardFishGold = this.account.bonus && this.account.bonus.gold_count || 0;
        newRrewardFishGold -= oldRrewardFishGold;
        newRrewardFishGold = Math.max(newRrewardFishGold, 0);
        
        this._collisionC += gainGold;
        isReal && log && log('numberTest--玩家累计获得:', this._collisionC);

        let tc = gainGold;
        let fireCostBack = tData.costGold;
        if (fireCostBack) {
            for (let bk in fireCostBack) {
                let fc = fireCostBack[bk];
                let bkd = this._bkData[bk];
                if (!bkd) {
                    continue;
                }
                isReal && log && log('fc = ', fc, bk, bkd.cost);
                if (bkd.cost > 0 && fc) {
                    gainGold += bkd.cost;
                    bkd.cost = 0;
                }
            }
        }
        for (let i = 0; i < bks.length; i ++) {
            let bk = bks[i];
            if (this._bkData[bk] && this._bkData[bk].cost > 0) {
                this._bkData[bk].cost = 0;
            }
        }
        tc = gainGold - tc;
        tc > 0 && this.backCost(tc);
        this._tc += tc;
        isReal && log && log('numberTest--子弹补偿:', tc, ' 累计补偿 = ', this._tc);

        gainGold > 0 && isReal && this.subReward(gainGold);//从奖池中扣除本次奖励

        this._save({
            gold: gainGold,
            roipct_time: tData.roipct_time,
            pirateData: pirateData,
        });

        utils.invokeCallback(cb, null, {
            bonus: this.account.bonus,
            rewardFishGold: newRrewardFishGold,
            rewardFishNum: rewardFishNum,
            pirateData: pirateData,
        });

        this.emit(fishCmd.push.catch_fish.route, {player: this, data:{
            seatId: this.seatId,
            catch_fishes: ret,
            gold: this.account.gold
        }});

        //排位赛统计
        isReal && this._rmatch && this._rmatch.fireCount(bks, ret);
    }

    /**
     * 技能消耗之后处理
     */
    _afterSkillCost (skillId, ret) {
        let saveData = {};
        let skill = this.account.skill;
        if (skill) {
            skill[skillId] = ret.skillC;
            saveData.skill = skill;
            saveData.skillUsed = {
                id: skillId,
                ct: ret.skillC,
            }
        }
        let costVal = 0;
        ret.costPearl > 0 && (saveData.pearl = -ret.costPearl, costVal = ret.costPearl);
        ret.costGold > 0 && (saveData.gold = -ret.costGold, costVal = ret.costGold);

        let sceneFlag = GAMECFG.common_log_const_cfg.GAME_FIGHTING;
        if (costVal > 0 && this.isRealPlayer()) {
            if (this._isNbomb(skillId)) {
                this.addCost(costVal);//贡献奖池和抽水
                sceneFlag = GAMECFG.common_log_const_cfg.NUCLER_COST;
            }else{
                this.addCostOther(costVal);
            }
        }
        this._save(saveData, sceneFlag);

        let common = {
            skill_id: skillId,
            skill_count: ret.skillC,
        };
        ret.pearl >= 0 && (common.pearl = ret.pearl);
        ret.gold >= 0 && (common.gold = ret.gold);
        return common;
    }

    /**
     * 开始使用技能
     */
    c_use_skill(data, cb){
        let skillId = data.skill;
        if (!this._skState) {
            this._skState = {};
        }
        if (!this._skState[skillId]) {
            this._skState[skillId] = {};
        }
        if (this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_ING);
            return;
        }
        if (this._skState[skillId].flag) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }

        let isReal = this.isRealPlayer();

        //核弹在确认发射时才扣钱
        if (skillId === consts.SKILL_ID.SK_NBOMB0 || skillId === consts.SKILL_ID.SK_NBOMB1 || skillId === consts.SKILL_ID.SK_NBOMB2) {
            if (isReal && this._rmatch && !this._rmatch.isNormalFireEnd()) {
                utils.invokeCallback(cb, null, {
                    rmatch: true,
                });
                return;
            }
            
            this._skState[skillId].flag = 0;
            utils.invokeCallback(cb, null, {
                skill_id: skillId,
            });
            this.emit(fishCmd.push.use_skill.route, {player: this, data:{
                common: {
                    skill_id: skillId,
                },
            }});
            return;
        }else if (skillId === consts.SKILL_ID.SK_LASER) {
            if (isReal && this._rmatch) {
                utils.invokeCallback(cb, null, {
                    rmatch: true,
                });
                return;
            }
        }

        let ret = this.cost.useSkill(skillId, data.wp_level, this.account);
        
        //开始持续时间定时器，结束时即技能结束
        if (skillId === consts.SKILL_ID.SK_FREEZ || skillId === consts.SKILL_ID.SK_AIM) {
            this._startSkillTicker(skillId);
        }else if(skillId === consts.SKILL_ID.SK_LASER && ret.notEnough === 3) {
            utils.invokeCallback(cb, FishCode.INVALID_WP_LASER);
            return;
        }
        this._skState[skillId].flag = 0;
        let common = this._afterSkillCost(skillId, ret);
        utils.invokeCallback(cb, null, common);
        this.emit(fishCmd.push.use_skill.route, {player: this, data:{
            common: {
                skill_id: skillId,
            },
            call_ready: data.call,
        }});
    }

    /**
     * 锁定技能，锁定鱼
     */
    c_use_skill_lock_fish(data, cb){
        let tfishKey = data.tfish;
        let fish = this.fishModel.getActorData(tfishKey);
        if (!fish) {
            utils.invokeCallback(cb, FishCode.LOCK_FAILD);
            return;
        }

        let skillId = consts.SKILL_ID.SK_AIM;
        let flag = this._skState[skillId].flag;
        if (flag === undefined || flag === null || !this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        this._skState[skillId].flag = 1;

        utils.invokeCallback(cb, null);
        this.emit(fishCmd.push.use_skill.route, {player: this, data:{
            skill_lock: tfishKey,
            skill_id: skillId,
        }});
    }

    /**
     * 召唤技能,召唤鱼
     */
    c_use_skill_call_fish(data, cb){
        let skillId = consts.SKILL_ID.SK_CALL;
        if (this._skState[skillId].flag !== 0 || this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        this._skState[skillId].flag = 1;
        this._startSkillTicker(skillId);

        let fishKey = data.tfish;
        let fishPath = data.path;
        let call = {
            fish_key: fishKey,
            fish_path: fishPath,
        }
        utils.invokeCallback(cb, null);

        this.emit(fishCmd.push.use_skill.route, {player: this, data:{
            skill_call: call,
            skill_id: skillId,
        }});
    }

    _isNbomb(skillId) {
        return skillId === consts.SKILL_ID.SK_NBOMB0 || skillId === consts.SKILL_ID.SK_NBOMB1 || skillId === consts.SKILL_ID.SK_NBOMB2;
    }

    /**
     * 激光或核弹确定打击位置
     */
    c_use_skill_sure(data, cb){
        let skillId = data.skill;
        if (this._skState[skillId].flag !== 0 || this._skState[skillId].ticker) {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL_STATE);
            return;
        }
        let skillPower = null;
        if (skillId === consts.SKILL_ID.SK_LASER || this._isNbomb(skillId)) {
            let wpBk = data.wp_bk;
            if (!this._bkData[wpBk]) {
                this._bkData[wpBk] = {};
            }
            this._bkData[wpBk].cost = true;

            let firePoint = data.fire_point;
            skillPower = firePoint;
            this._skState[skillId].flag = 1;
            this._startSkillTicker(skillId);
            if (skillId === consts.SKILL_ID.SK_LASER) {
                let curWpLv = data.wp_level;
                let reset = 0;
                this.DIY.weapon_energy[curWpLv] = reset;
                this._save({
                    weapon_energy: this.DIY.weapon_energy,
                });
                utils.invokeCallback(cb, null, {
                   wp_level: curWpLv,
                   laser: reset, 
                });
            }else {
                //核弹需要在确认发射时才扣钱
                let ret = null;
                if (this.isRealPlayer() && this._rmatch) {
                    ret = this.cost.useSkillWithRmatch(skillId, data.wp_level, this.account, this._rmatch.nbombCost);
                    this._rmatch.nbFlag(true);
                }else{
                    ret = this.cost.useSkill(skillId, data.wp_level, this.account);   
                }
                let common = this._afterSkillCost(skillId, ret);
                utils.invokeCallback(cb, null, common);
            }
            this.emit(fishCmd.push.use_skill.route, {player: this, data:{
                skill_power: skillPower,
                skill_id: skillId,
                wp_bk: wpBk,
            }});
        }else {
            utils.invokeCallback(cb, FishCode.INVALID_SKILL);
            return;
        }
    }

     /**
     * 战斗行为通知
     * 注意，只是变更通知，并不需持久化
     */
     c_fighting_notify(data, cb){
         let event = data.event;
         let evtData = data.event_data;
         let ret = null;
         switch (event) {
             case consts.FIGHTING_NOTIFY.WP_SKIN: {
                let wpSkin = evtData;
                let oldSkin = this.account.weapon_skin;
                let own = oldSkin.own;
                let isExist = false;
                if (own) {
                    for (let i = 0; i < own.length; i ++) {
                       if (wpSkin == own[i]) {
                           isExist = true;
                           break;
                       } 
                    }
                }
                if (!isExist) {
                    log && log('wpskin = ', wpSkin, own);
                    utils.invokeCallback(cb, null);
                    return;
                }
                this.DIY.weapon_skin = wpSkin;
                this.rpcRankMatchCall(rankMatchCmd.remote.weaponChange.route, {
                    wp_skin: wpSkin,
                });
             }
             break;

             case consts.FIGHTING_NOTIFY.WP_LEVEL: {
                let wpLv = evtData;
                let wpEng = this.account.weapon_energy;
                if (wpEng && (wpEng[wpLv] >= 0 || wpLv === 1) && wpLv >= this._sceneCfg.min_level && wpLv <= this._sceneCfg.max_level) {
                    this.DIY.weapon = wpLv;
                }else{
                    log && log('energy = ', wpEng, wpEng[wpLv]);
                    utils.invokeCallback(cb, null);
                    return;
                }
             }
             break;

             case consts.FIGHTING_NOTIFY.MINI_GAME: {
                let mtype = evtData.type;
                let mgold = evtData.gold;
                if (mgold === 0) {
                    this._miniTimestamp = new Date().getTime();
                }else if (mgold > 0 && this._miniTimestamp) {
                    let cfg = null;
                    if (mtype === 0) {
                        cfg = configReader.getValue('new_mini_game_coincatch_cfg', 1001);
                    }else if (mtype === 1) {
                        cfg = configReader.getValue('new_mini_game_crazyfugu_cfg', 1001);
                    }else {
                        return;
                    }
                    let dt = cfg.cd * 1000;
                    let now  = new Date().getTime();
                    now -= this._miniTimestamp;
                    const goldMax = cfg.maxscore;
                    if (now >= dt && mgold > 0 && mgold < goldMax && mgold > 0 && this.isRealPlayer()) {
                        this.subReward(mgold);//从奖池中扣除本次奖励
                        this._save({
                            gold: mgold,
                        }, GAMECFG.common_log_const_cfg.MINI_GAME);
                        ret = {
                            gold: this.account.gold,
                        }
                    }
                    this._miniTimestamp = null;
                }
             }
             break;

             case consts.FIGHTING_NOTIFY.DROP:{
                if (evtData.isPirateReward) {
                    let pirate = this._pirate;
                    if (pirate && pirate.isFinished()) {
                        pirate.reset();
                        this._save({
                            pirateData: -1,
                        });
                        this._pirate = null;
                    }
                }
             }
             break;
             
             case consts.FIGHTING_NOTIFY.RMATCH_READY: 
                this._rmatchReady(evtData);
             break;

             case consts.FIGHTING_NOTIFY.RMATCH_NB:
                if (this._rmatch && !evtData) {              
                    this._rmatch.nbFlag(false);  
                    this.rpcRankMatchCall(rankMatchCmd.remote.cancelNbomb.route);
                    this.clearRmatch();
                } 
             break;
         }

        utils.invokeCallback(cb, null, ret);

        this.emit(fishCmd.push.fighting_notify.route, {player: this, data:{
            seatId: this.seatId,
            event: event,
            event_data: evtData,
        }});
    }

    /**
     * 查询海盗任务
     */
    c_query_pirate (data, cb) {
        let pirate = this._generatePirate();
        let pirateData = pirate && pirate.getProgress() || null;
        utils.invokeCallback(cb, null, {
            pirateData: pirateData
        });
    }

    /**
     * 清除技能持续时间定时器
     */
    clearSkillTickers () {
        if (this._skState) {
            for (let skillId in this._skState) {
                this._clearSkillTicker(skillId);
            }
            this._skState = null;
        }
    }

    /**
     * 开启指定技能定时器
     */
    _startSkillTicker (skillId) {
        const cfg = configReader.getValue('skill_skill_cfg', skillId);
        let duration = cfg.skill_duration;
        if (duration > 0 && !this._skState[skillId].ticker) {
            let self = this;
            this._skState[skillId].ticker = setTimeout(function () {
                let skId = this;
                self._clearSkillTicker(skId);
                //广播某玩家某技能结束 
                self.emit(fishCmd.push.use_skill_end.route, {player: self, data:{
                    seatId: self.seatId,
                    skill: skId,
                }});
            }.bind(skillId), duration * 1000);
        }
    }

    /**
     * 关闭指定技能定时器
     */
    _clearSkillTicker (skillId) {
        if (!this._skState) return;
        let ts = this._skState[skillId];
        if (!ts) return;
        ts.ticker && clearTimeout(ts.ticker);
        ts.ticker = null;
        ts.flag = null;
    }

    /**
     * 重置diy
     * 注意：重置的武器倍率不能超过当前场景允许的最大等级
     */
    _resetDIY () {
        let account = this.account;
        let aw = account.weapon;
        let weapon = this.DIY && this.DIY.weapon || 1;
        let oldWpLv = weapon;
        if (!this._sceneCfg) {
            weapon = aw;
        }else if (aw >= this._sceneCfg.min_level && aw <= this._sceneCfg.max_level) {
            weapon = aw;
        }
        if (oldWpLv && weapon > oldWpLv && this.DIY && this.DIY.weapon_energy && this.DIY.weapon_energy[weapon]) {
            weapon = oldWpLv;
        }
        this._DIY = {
            weapon: weapon,
            weapon_skin: account.weapon_skin.equip,
            weapon_energy: account.weapon_energy,
        };

        //注意：原始数据可能无1倍激光能量标记，此处兼容处理
        this.DIY.weapon_energy = this.DIY.weapon_energy || {}; 
        let wbks = Object.keys(GAMECFG.newweapon_upgrade_cfg);
        for (let i = 0; i < wbks.length; i ++) {
            let lv = parseInt(wbks[i]);
            if (lv > aw) {
                break;
            }
            if (!this.DIY.weapon_energy[lv]) {
                this.DIY.weapon_energy[lv] = 0;
            }
        }
    }
    
    /**
     * 机器人开火
     */
    robotFire () {}

    /**
     * 是否是真人
     */
    isRealPlayer () {
        return true;
    }

    /**
     * 将更新后的数据及时持久化
     * 注意：
     * 1、房间内不能直接改变武器等级和皮肤并持久化，因为武器升级和切换皮肤在数据服操作，且实际武器等级可能超过了当前房间所允许的区间
     * 2、data所含字段必须是account含有字段，反之不会持久化
     */
    _save(data, sceneFlag){
        if(this.isRealPlayer() && data && Object.keys(data).length > 0){
            data.hasOwnProperty('gold') && (this.account.gold = data.gold);
            data.hasOwnProperty('weapon_energy') && (this.account.weapon_energy = data.weapon_energy);
            data.hasOwnProperty('heartbeat') && (this.account.heartbeat = data.heartbeat);
            data.hasOwnProperty('heartbeat_min_cost') && (this.account.heartbeat_min_cost = data.heartbeat_min_cost);
            data.hasOwnProperty('roipct_time') && (this.account.roipct_time = data.roipct_time);
            data.hasOwnProperty('pearl') && (this.account.pearl = data.pearl);
            data.hasOwnProperty('skill') && (this.account.skill = data.skill);
            data.hasOwnProperty('exp') && (this.account.exp = data.exp);
            data.hasOwnProperty('level') && (this.account.level = data.level);
            data.hasOwnProperty('comeback_hitrate') && (this.account.comeback.hitrate = data.comeback_hitrate, this.account.comeback = this.account.comeback);
            if (data.hasOwnProperty('pirateData') && data.pirateData) {
                let td = this.account.pirate;
                let tp = data.pirateData;
                if (tp === -1) {
                    delete this.account.pirate[this._sceneCfg.name];
                    td = this.account.pirate;
                }else{
                    td[this._sceneCfg.name] = tp;
                }
                this.account.pirate = td;
                logger.error('pirate = ', tp);
            }

            this.account.commit();
            this.writeLog(data, sceneFlag);
        }
    }

    writeLog (data, sceneFlag) {
        sceneFlag = sceneFlag || GAMECFG.common_log_const_cfg.GAME_FIGHTING;
        //金币日志
        if (data.hasOwnProperty('gold')) {
            if (data.gold > 0) {
                logBuilder.addGoldLog(this.account.id, data.gold, 0, this.account.gold, sceneFlag, this.account.level);
            }else if (data.gold < 0) {
                logBuilder.addGoldLog(this.account.id, 0, -data.gold, this.account.gold, sceneFlag, this.account.level);
            }
        }

        //钻石日志
        if (data.hasOwnProperty('pearl')) {
            if (data.pearl > 0) {
                logBuilder.addPearlLog(this.account.id, data.pearl, 0, this.account.pearl, sceneFlag, this.account.level);
            }else if (data.pearl < 0) {
                logBuilder.addPearlLog(this.account.id, 0, -data.pearl, this.account.pearl, sceneFlag, this.account.level);
            }
        }

        //技能日志
        if (data.hasOwnProperty('skillUsed')) {
            let skillUsed = data.skillUsed;
            logBuilder.addSkillLog(this.account.id, skillUsed.id, 0, 1, skillUsed.ct);
        }
    }

    /**
     * 捕获鱼相关任务统计
     */
    _missionCoutWithFish (fk, gold, skin, star) {
        let temp = fk.split('#');
        let fishName = temp[0];
        let cfg = fishName && this.fishModel.getFishCfg(fishName) || null;
        let data = {};
        if (cfg) {
            //奖金鱼统计
            if (cfg.display_type === 4) {
                let bonus = this.account.bonus;
                if (!bonus.fish_count) {
                    bonus.fish_count = 0;
                }
                bonus.fish_count += 1;
                if (!bonus.gold_count) {
                    bonus.gold_count = 0;
                }
                let reward = this.cost.calGoldenFishReward(gold, skin, star);
                bonus.gold_count += reward;
                this.account.bonus = bonus;
                data.rewardFishFlag =  1;
            }

            //海盗任务统计(排位赛进行中不统计)
            if (this._pirate && !this._rmatch) {
                data.pirateFlag = this._pirate.countFish(fishName);
            }
            //TODO:捕鱼积分统计
        }
        return data;
    }

    /**
     * 返回玩家重连时需要继续的关键数据
     */
    getContinueData () {
        let data = {}
        if (this._bkData) {
            let mBIdx = {};
            for (let bk in this._bkData) {
                let td = this.cost.parseBulletKey(bk);
                if (td && td.hasOwnProperty('uIdx') && td.hasOwnProperty('bIdx')) {
                    let uIdx = td.uIdx;
                    let bIdx = td.bIdx;
                    if (!mBIdx[uIdx]) {
                        mBIdx[uIdx] = 0;
                    }
                    mBIdx[uIdx] = Math.max(mBIdx[uIdx], bIdx);
                }
            }
            if (Object.keys(mBIdx).length > 0) {
                data.mBIdx = mBIdx;
            }
        }
        return data;
    }

    /**
     * 贡献抽水和奖池
     */
    addCost (costVal) { }

    /**
     * 从奖池扣除奖励
     */
    subReward (gainVal) { }

    /**
     * 返还消耗
     */
    backCost (costVal) { }
    
    /**
     * 其他消耗:
     * 购买皮肤、购买月卡、购买VIP礼包、购买道具（提现功能内非实物类购买）、购买钻石、购买技能等各种其他非赌博消耗
     * 即未参于奖池和抽水
     */
    addCostOther (costVal) {}

    /**
     * 个人捕获率修正过期检查
     */
    checkPersonalGpctOut () {}

    /**
     * 个人捕获率充值修正
     * @param {当前捕获的鱼的金币} catchGold 
     */
    rechargeRevise(catchGold){return 1;}
    
    /**
     * 初始化海盗任务
     */
    _generatePirate () {
        if (!this.isRealPlayer()) {
            return null;
        }
        if (this.account.pirate && this._sceneCfg && !this._pirate) {
            let now = new Date().getTime();
            if (this._pirateTimestamp && now - this._pirateTimestamp < this._sceneCfg.pirate_time * 1000) {
                return null;
            }
            let name = this._sceneCfg.name;
            this._pirate = new Pirate(this.account.pirate[name], this._sceneCfg);
            this._pirateTimestamp = now;
        }       
        return this._pirate; 
    }

    /**
     * 排位赛：客户端准备就绪，等待开始通知
     */
    _rmatchReady (evtData) {
        if (this._rmatch) return;
        this._rmatch = new Rmatch();
        this._rmatch.setServerData(evtData.rankMatch);
        this.rpcRankMatchCall(rankMatchCmd.remote.ready.route, {
            serverId: evtData.game.serverId,
        });
    }

    /**
     * 排位赛：正式开始
     */
    startRmatch (evtData) {
        if (!this._rmatch) return;
        this._rmatch.setNbCost(evtData.nbomb_cost);
        this._rmatch.registerUpdateFunc(function (data, isFiredWithNB) {
            logger.error('当前战绩===', data);
            if (isFiredWithNB) {
                this.rpcRankMatchCall(rankMatchCmd.remote.useNbomb.route, data);
                this.clearRmatch();
            }else{
                this.rpcRankMatchCall(rankMatchCmd.remote.fightInfo.route, data);
            }
        }.bind(this));
    }

    /**
     * 排位赛：全程结束，销毁
     */
    clearRmatch () {
        this._rmatch = null;
        logger.error('比赛结束，重置状态');
    }

    /**
     * 战斗服向比赛服发送数据
     * @param {*} method 
     * @param {*} data 
     * @param {*} cb 
     */
    rpcRankMatchCall(method, data, cb){
        if (!this.isRealPlayer()) return;
        if (!this._rmatch) return;
        data = data || {};
        data.uid = this.account.id;
        data.roomId = this._rmatch.roomId;
        super.rpcRankMatchCall(method, this._rmatch.sid, data, cb);
    }
}

module.exports = FishPlayer;