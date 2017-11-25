const Player = require('../../../base/player');
const fishCmd = require('../fishCmd');
const cost = require('../cost');
const FishCode = require('../fishCode');
const consts = require('../consts');

const DEBUG = 2;
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
            sceneType:null
        };
        this._activeTime = Date.now();
        this._lastFireFish = null;
        this._bkCost = {};
        this._fireC = 0;
        this._collisionC = 0;
    }


    static allocPlayer(data){
        let promise = new Promise((resolve, reject)=>{
            dbUtils.redisAccountSync.getAccount(data.uid, consts.PLAYER_BASE_INFO_FIELDS, function (err, account) {
                if(!!err){
                    reject(CONSTS.SYS_CODE.DB_ERROR);
                    return;
                }
                if(!account){
                    reject(CONSTS.SYS_CODE.PLAYER_NOT_EXIST);
                    return
                }

                let player = new FishPlayer({uid:data.uid, sid:data.sid, account:account,kindId:consts.ENTITY_TYPE.PLAYER});
                player.gameInfo = {
                    gameMode:data.gameMode,
                    sceneType:data.sceneType
                };
                resolve(player);
            });
        });
        return promise;
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
    }

    set gameInfo(info){
        this._gameInfo = info
    }

    get gameInfo(){
        return this._gameInfo
    }

    set account(value) {
        this._account = value;
    }

    get account() {
        return this._account
    }

    get activeTime(){
        return this._activeTime
    }

    updateActiveTime(){
        this._activeTime = Date.now();
    }

    c_player_notify(data, cb){
        dbUtils.redisAccountSync.getAccount(this.uid, consts.PLAYER_BASE_INFO_FIELDS, function (err, account) {
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
        this._fireC ++;
        log && log('numberTest--玩家开火:', this.account.nickname, this._fireC);

        let curWpLv = this.DIY.weapon;
        let curSkin = this.DIY.weapon_skin;
        let energy = this.DIY.weapon_energy[curWpLv];
        if (curSkin != data.wp_skin || curWpLv != data.wp_level || (Object.keys(this.DIY.weapon_energy).length > 0 && energy === undefined)) {
            log && log('curSkin = ', curSkin, data.wp_skin);
            log && log('curWpLv = ', curWpLv, data.wp_level );
            log && log('energy = ', energy);
            utils.invokeCallback(cb, FishCode.NOT_MATCH_WEAPON);
            return;
        }
        let wpBk = data.wp_bk;
        if (this._bkCost[wpBk] > 0) {
            utils.invokeCallback(cb, FishCode.INVALID_WP_BK);
            return;
        }else if (this._bkCost[wpBk] === -1) {
            this._bkCost[wpBk] = 0;
            utils.invokeCallback(cb, null);
            return;
        }

        energy = energy || 0;
        let gainLaser = energy;
        let newComebackHitrate = this.account.comeback.hitrate || 1;
        if(this.account.gold > 0){
            let costGold = cost.fire_gold_cost({weapon_skin:curSkin, weapon:curWpLv});
            if(costGold > this.account.gold){
                costGold = this.account.gold; //最后一炮不足以开炮时，则默认剩余全部用完可开一次，下一次开炮则破产
            }
            this._bkCost[wpBk] = costGold;
            let saveData = {
                level: this.account.level,
                exp: this.account.exp,
            };
            let gainExp = cost.fire_gain_exp({gold:costGold});
            if(gainExp > 0){
                let oldLv = saveData.level;
                let result = cost.reset_exp_level(oldLv, saveData.exp, gainExp);
                if (!result.full) {
                    if (result.level > oldLv) {
                        saveData.level = result.level;//升级了，数据服负责发放升级奖励
                    }
                    saveData.exp = result.exp; //注意经验是增量
                }
            }
            newComebackHitrate = cost.subComebackHitRate(curWpLv, this.account.comeback);
            if (newComebackHitrate > 0) {
                saveData.comeback_hitrate = newComebackHitrate;
            }
            let heart = cost.updateHeartBeat(costGold, this._sceneCfg.max_level, this.account.heartbeat_min_cost, this.account.heartbeat, this.DIY.weapon_energy);
            gainLaser = cost.fire_gain_laser({weapon_skin:curSkin, weapon: curWpLv, energy: energy});
            this.DIY.weapon_energy[curWpLv] = gainLaser;
            saveData.weapon_energy = this.DIY.weapon_energy;
            saveData.gold = -costGold;
            saveData.heartbeat = heart[0];
            saveData.heartbeat_min_cost = heart[1];
            this._save(saveData);
        }
        
        utils.invokeCallback(cb, null, {
            wp_laser: {wp_level: curWpLv, laser: gainLaser},
            exp: this.account.exp,
            level: this.account.level,
            gold: this.account.gold,
            comeback_hitrate: newComebackHitrate,
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
            }});
        }
    }

    /**
     * 碰撞鱼捕获率判定
     */
    c_catch_fish(data, cb){
        this._collisionC ++;
        log && log('numberTest--玩家发送碰撞数据:', this.account.nickname, this._collisionC);

        //校验子弹是否真的存在过 //子弹不存在，则无消耗，不能碰撞
        let bFishes = data.b_fishes;
        let bks = Object.keys(bFishes);
        for (let bk in bFishes) {
            if (!this._bkCost[bk]) {
                log && log('numberTest--无效碰撞', bk);
                this._bkCost[bk] = -1;//碰撞事件比开火事件先收到，视为无效碰撞，则下一次收到该开火事件时不处理
                delete bFishes[bk];
            }
        }
        let tData = cost.catchNot(bFishes, this.account, this.fishModel);
        let ret = tData.ret; 
        let gainGold = 0;
        for (let fk in ret) {
            let gold = ret[fk].gold;
            if (gold >= 0) {
                gainGold += gold;
            }
        }
        let fireCostBack = tData.costGold;
        if (fireCostBack) {
            for (let bk in fireCostBack) {
                let fc = fireCostBack[bk];
                logger.error('fc = ', fc, bk, this._bkCost[bk]);
                if (this._bkCost[bk] > 0 && fc) {
                    gainGold += this._bkCost[bk];
                    this._bkCost[bk] = 0;
                }
            }
        }
        for (let i = 0; i < bks.length; i ++) {
            let bk = bks[i];
            if (this._bkCost[bk] > 0) {
                this._bkCost[bk] = 0;
            }
        }

        this._save({
            gold: gainGold,
            roipct_time: tData.roipct_time
        });

        utils.invokeCallback(cb, null, {
            catch_fishes: ret,
            gold: this.account.gold
        });

        this.emit(fishCmd.push.catch_fish.route, {player: this, data:{
            seatId: this.seatId,
            catch_fishes: ret,
            gold: this.account.gold
        }});
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

        let ret = cost.useSkill(skillId, data.wp_level, this.account);
        
        //开始持续时间定时器，结束时即技能结束
        if (skillId === consts.SKILL_ID.SK_FREEZ || skillId === consts.SKILL_ID.SK_AIM) {
            this._startSkillTicker(skillId);
        }else if(skillId === consts.SKILL_ID.SK_LASER && ret.notEnough === 3) {
            utils.invokeCallback(cb, FishCode.INVALID_WP_LASER);
            return;
        }
        this._skState[skillId].flag = 0;

        let saveData = {};
        let skill = this.account.skill;
        if (skill) {
            skill[skillId] = ret.skillC;
            saveData.skill = skill;
        }
        let costPearl = ret.costPearl;
        costPearl > 0 && (saveData.pearl = -costPearl);
        this._save(saveData);

        let common = {
            skill_id: skillId,
            skill_count: ret.skillC,
            pearl: ret.pearl,
        };
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
        if (skillId === consts.SKILL_ID.SK_LASER || skillId === consts.SKILL_ID.SK_NBOMB0 || skillId === consts.SKILL_ID.SK_NBOMB1 || skillId === consts.SKILL_ID.SK_NBOMB2) {
            let wpBk = data.wp_bk;
            this._bkCost[wpBk] = true;

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
                utils.invokeCallback(cb, null);
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
         if (event === consts.FIGHTING_NOTIFY.WP_SKIN) {
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
         }else if (event === consts.FIGHTING_NOTIFY.WP_LEVEL) {
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

        utils.invokeCallback(cb, null);

        this.emit(fishCmd.push.fighting_notify.route, {player: this, data:{
            seatId: this.seatId,
            event: event,
            event_data: evtData,
        }});
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
        const cfg = cost.getSkillCfg(skillId);
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
    robotFire () {
        let fishKey = this._lastFireFish;
        if (fishKey) {
            if (this.fishModel.findFish(fishKey)) {
                if (Math.random() > 0.9) {
                    fishKey = null;
                }
            }
        }
        if (!fishKey) {
            fishKey = this.fishModel.findMaxValueFish();
            this._lastFireFish = fishKey;
        }
        this.c_fire({
            wp_level: this.DIY.weapon,
            wp_skin: this.DIY.weapon_skin, 
            fire_fish: fishKey
        });
    }

    /**
     * 将更新后的数据及时持久化
     * 注意：
     * 1、房间内不能直接改变武器等级和皮肤并持久化，因为武器升级和切换皮肤在数据服操作，且实际武器等级可能超过了当前房间所允许的区间
     * 2、data所含字段必须是account含有字段，反之不会持久化
     */
    _save(data){
        if(this.kindId === consts.ENTITY_TYPE.PLAYER && data && Object.keys(data).length > 0){
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
            this.account.commit();

            //金币日志
            if (data.hasOwnProperty('gold')) {
                if (data.gold > 0) {
                    logBuilder.addGoldLog(this.account.id, data.gold, 0, this.account.gold, GAMECFG.common_log_const_cfg.GAME_FIGHTING, this.account.level);
                }else if (data.gold < 0) {
                    logBuilder.addGoldLog(this.account.id, 0, -data.gold, this.account.gold, GAMECFG.common_log_const_cfg.GAME_FIGHTING, this.account.level);
                }
            }

            //钻石日志
            if (data.hasOwnProperty('pearl')) {
                //todo
            }

            //技能日志
            if (data.hasOwnProperty('skill')) {
                //todo
            }
        }
    }
    
}

module.exports = FishPlayer;