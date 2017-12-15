// //--[[
// description: 保卫女神玩家
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：
// //--]]
const ChannelPlayer =  require('../entity/channelPlayer');
const FishCode = require('../fishCode');
const fishCmd = require('../fishCmd');
const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const configReader = require('../configReader');

class GoddessPlayer extends ChannelPlayer {
    constructor (data) {
        super(data);
        this._godIdx = 0;
        this._godHp = 0;
    }

    static sBaseField () {
        let baseField = ChannelPlayer.sBaseField();
        const self = [
            ACCOUNTKEY.GODDESS,
        ];
        return baseField.concat(self);
    }

    getBaseField(){
        return GoddessPlayer.sBaseField();
    }

    getCurGod () {
        let goddess = this.account.goddess;
        if (goddess && goddess.length > this._godIdx) {
            return goddess[this._godIdx];
        }
        return null;
    }

    godStart () {
        let god = this.getCurGod();
        return god.startWaveIdx;
    }

    /**
     * 准备就绪
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_ready (data, cb) {
        this._godIdx = data.godIdx;
        let god = this.getCurGod();
        let isUnlocked = god != null;
        if (god) {
            let unlock = god.unlock;
            isUnlocked = god.hp > 0 && god.level > 0;
            for (let i = 0; i < unlock.length; i ++) {
                if (unlock[i] != 2) {
                    isUnlocked = false;
                    break;
                }
            }
        }
        if (!isUnlocked) {
            utils.invokeCallback(cb, FishCode.LOCK_GOD);
            return;
        }
        
        this._godHp = god.hp;
        this._setPauseAwayFlag();//进入房间，则标记暂离

        let cfg = configReader.getGodLevelData(god.id, god.level);
        let hpPercent = god.hp / cfg.hp;
        utils.invokeCallback(cb, null, {
            hpPercent: hpPercent,
        });
        this.emit(fishCmd.push.god_ready.route, {player: this});
    }

    /**
     * 客户端主动暂停，例如打开一个ui弹窗
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_pause (data, cb) {
        if (this._godIdx != data.godIdx) {
            utils.invokeCallback(cb, FishCode.INVALID_GOD);
            return;
        }
        logger.error('---client is pause.', data.godIdx)
        utils.invokeCallback(cb, null, {});
        this.emit(fishCmd.push.god_pause.route, {player: this});
    } 

    /**
     * 客户端主动继续，例如关闭刚刚打开的弹窗
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_continue (data, cb) {
        if (this._godIdx != data.godIdx) {
            utils.invokeCallback(cb, FishCode.INVALID_GOD);
            return;
        }

        logger.error('---client is conitue.', data.godIdx);
        utils.invokeCallback(cb, null, {});
        this.emit(fishCmd.push.god_continue.route, {player: this});
    } 

    /**
     * 女神受伤
     * @param {*} data 
     * @param {*} cb 
     */
    c_god_hurt (data, cb) {         
        logger.error('---client is c_god_hurt.', data.godIdx, data.fishKey, data.isInGroup);

        if (this._godIdx != data.godIdx) {
            utils.invokeCallback(cb, FishCode.INVALID_GOD);
            return;
        }
        let fish = this.fishModel.getActorData(data.fishKey);
        if (!fish) {
            logger.error('该鱼不存在或已死，为啥还要碰撞？');
            utils.invokeCallback(cb, null);
            return;
        }
        if (!this._godHp) {
            logger.error('女神已死');
            utils.invokeCallback(cb, null);
            return;
        }
        let hurtVal = this.fishModel.getHurtValue(data.fishKey);
        if (!hurtVal || hurtVal < 0) {
            logger.error('女神受伤数据有误');
            utils.invokeCallback(cb, null);
            return;
        }
        let god = this.getCurGod();
        let cfg = configReader.getGodLevelData(god.id, god.level);
        this._godHp -= hurtVal;
        let hpPercent = this._godHp / cfg.hp;
        if (hpPercent <= 0) {
            hpPercent = 0;
            this._godHp = 0;
        }
        utils.invokeCallback(cb, null, {
            hpPercent: hpPercent, 
            hurtVal: hurtVal,
        });
        this.emit(fishCmd.push.god_hurt.route, {player: this, hpPercent: hpPercent});
    }

    save(){
        let goddess = this.account.goddess;
        if (goddess && goddess.length > this._godIdx) {
            let god = goddess[this._godIdx];
            if (this._godHp === 0) {
                //女神死了，则恢复到默认血量,且暂离失效
                let cfg = configReader.getGodLevelData(god.id, god.level);
                god.hp = cfg.hp;
                god.isPauseAway = false;
                god.startWaveIdx = 0;
            }else{
                god.hp = this._godHp;
                god.isPauseAway = true;
                god.startWaveIdx = this.fishModel.getStart();
            }
            this.account.goddess = goddess;
            super.save();
        }
    }

    _setPauseAwayFlag () {
        let goddess = this.account.goddess;
        if (goddess && goddess.length > this._godIdx) {
            let god = goddess[this._godIdx];
            god.isPauseAway = true;
            this.account.goddess = goddess;
            super.save();
        }
    }
            

}

module.exports = GoddessPlayer;