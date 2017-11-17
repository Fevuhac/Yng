const Player = require('../../../base/player');
const fishCmd = require('../fishCmd');
const cost = require('../cost');
const FishCode = require('../fishCode');
const consts = require('../consts');


class FishPlayer extends Player {
    constructor(opts) {
        super(opts);
        this._account = opts.account || {};
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
            logger.error('1 energy = ', wpEng);

            this.account = account;
            this._resetDIY();

            utils.invokeCallback(cb, null);
            this.emit(fishCmd.push.player_notify.route, {player: this, data:{
                seatId: this.seatId,
                gold: this.account.gold,
                pearl: this.account.pearl,
                wp_level: this.account.weapon,
                wp_skin: this.account.weapon_skin.equip,
            }});
        }.bind(this));
    }


    /**
     * 开炮
     */
    c_fire(data, cb){
        logger.error('玩家开火:', this.account.nickname);
        logger.error('玩家开火:', this.uid);
        logger.error('玩家开火:', data);
        let curWpLv = this.DIY.weapon;
        let curSkin = this.DIY.weapon_skin;
        let energy = this.DIY.weapon_energy[curWpLv]
        if (curSkin != data.wp_skin || curWpLv != data.wp_level || (Object.keys(this.DIY.weapon_energy).length > 0 && energy === undefined)) {
            logger.error('curSkin = ', curSkin, data.wp_skin);
            logger.error('curWpLv = ', curWpLv, data.wp_level );
            logger.error('energy = ', energy);
            utils.invokeCallback(cb, FishCode.NOT_MATCH_WEAPON);
            return;
        }
        energy = energy || 0;
        let gainLaser = energy;
        if(this.account.gold > 0){
            let costGold = cost.fire_gold_cost({weapon_skin:curSkin, weapon:curWpLv});
            if(costGold > this.account.gold){
                costGold = this.account.gold; //最后一炮不足以开炮时，则默认剩余全部用完可开一次，下一次开炮则破产
            }

            let gainExp = cost.fire_gain_exp({gold:costGold});
            if(gainExp > 0){
                let oldLv = this.account.level;
                let result = cost.reset_exp_level(this.account.level, this.account.exp, gainExp);
                if (!result.full) {
                    if (result.level > oldLv) {
                        this.account.level = result.level;//升级了，数据服负责发放升级奖励
                    }
                    this.account.exp = result.exp; //注意经验是增量
                }
            }

            let heart = cost.updateHeartBeat(costGold, this._sceneCfg.max_level, this.account.heartbeat_min_cost, this.account.heartbeat, this.DIY.weapon_energy);
            this.account.heartbeat = heart[0];
            this.account.heartbeat_min_cost = heart[1];

            gainLaser = cost.fire_gain_laser({weapon_skin:curSkin, weapon: curWpLv, energy: energy});
            this.DIY.weapon_energy[curWpLv] = gainLaser;
            this.account.weapon_energy = this.DIY.weapon_energy;
            this.account.gold = -costGold; //TODO：金币消耗日志
            this._save();
        }
        
        utils.invokeCallback(cb, null, {
            wp_laser: {wp_level: curWpLv, laser: gainLaser},
            exp: this.account.exp,
            level: this.account.level,
            gold: this.account.gold
        });

        if(this.account.gold > 0){
            this.emit(fishCmd.push.fire.route, {player: this, data:{
                seatId: this.seatId,
                fire_point: data.fire_point,
                wp_skin: curSkin,
                wp_level: curWpLv,
                gold: this.account.gold,
                fire_fish: data.fire_fish,
            }});
        }
    }

    /**
     * 碰撞鱼捕获率判定
     */
    c_catch_fish(data, cb){
        let tData = cost.catchNot(data.b_fishes, this.account, this.fishModel);
        let ret = tData.ret; 
        let gainGold = 0;
        for (var fk in ret) {
            let gold = ret[fk].gold;
            if (gold >= 0) {
                gainGold += gold;
            }
        }
        this.account.gold = gainGold; //TODO：金币获得日志
        this.account.roipct_time = tData.roipct_time;
        this._save();
        logBuilder.addGoldLog(this.account.uid, gainGold, 0, this.account.gold, 0,this.account.level);

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

        let skill = this.account.skill;
        if (skill) {
            skill[skillId] = ret.skillC;
            this.account.skill = skill;
        }
        let costPearl = ret.costPearl
        console.log('costPearl = ', costPearl)
        costPearl > 0 && (this.account.pearl = -costPearl);
        this._save();

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
            let firePoint = data.fire_point;
            skillPower = firePoint;
            this._skState[skillId].flag = 1;
            this._startSkillTicker(skillId);
            if (skillId === consts.SKILL_ID.SK_LASER) {
                let curWpLv = data.wp_level;
                let reset = 0;
                this.DIY.weapon_energy[curWpLv] = reset;
                this.account.weapon_energy = this.DIY.weapon_energy;
                this._save();
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
                 logger.error('wpskin = ', wpSkin, own);
                 utils.invokeCallback(cb, null);
                 return;
             }
             this.DIY.weapon_skin = wpSkin;
             oldSkin.equip = wpSkin;
             this.account.weapon_skin = oldSkin;
             this._save();
         }else if (event === consts.FIGHTING_NOTIFY.WP_LEVEL) {
             let wpLv = evtData;
             let wpEng = this.account.weapon_energy;
             if (wpEng && wpEng[wpLv] >= 0) {
                 this.DIY.weapon = wpLv;
                 this.account.weapon = wpLv;
                 this._save();
             }else{
                 logger.error('energy = ', wpEng, wpEng[wpLv]);
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
     */
    _resetDIY () {
        let account = this.account;
        this._DIY = {
            weapon: account.weapon,
            weapon_skin: account.weapon_skin.equip,
            weapon_energy: account.weapon_energy,
        };
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

    _save(){
        if(this.kindId === consts.ENTITY_TYPE.PLAYER){
            this.account.commit();
        }
    }
}

module.exports = FishPlayer;
