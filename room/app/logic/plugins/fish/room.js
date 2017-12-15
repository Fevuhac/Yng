const pomelo = require('pomelo')
const fishCmd = require('./fishCmd');
const consts = require('./consts');
const Cost = require('./gamePlay/cost');
const config = require('./config');
const FishModel = require('./fishModel');
const EventEmitter = require('events').EventEmitter;
const configReader = require('./configReader');

class Room {
    constructor(opts) {
        this._roomId = opts.roomId;
        this._config = opts.config;
        this._mode = opts.mode;
        this._sceneType = opts.sceneType;
        this._evtor = new EventEmitter();

        this.createFishModel();

        this._flushFishTimer = -1;
        this.playerMap = new Map();
        this.channel = pomelo.app.get('channelService').getChannel(this._roomId, true);

        this._seatState = {};
        for (let i = 0; i < opts.playerMax; i++) {
            this._seatState[i] = 0;
        }
        this._robotJoinTimestamp = 0;
    }

    createFishModel () {
        let fishModel = new FishModel(this._evtor, this._sceneType);
        this._fishModel = fishModel;
    }

    /**
     * 机器人是否可以加入
     */
    isRobotJoinEnabled () {
        let tc = this.getEmptiyCount();
        if (tc === 0) {
            return false;
        }
        let tick = 8 * Math.pow(3, tc) * (1.5 - Math.random());
        let now = new Date().getTime();
        //logger.error('robot tick = ', tick, tc, now - this._robotJoinTimestamp, now, this._robotJoinTimestamp);
        if (now - this._robotJoinTimestamp >= tick * 1000) {
          //  logger.error('---can join---')
            return true;
        }
        return false;
    }

    /**
     * 房间空位数量
     */
    getEmptiyCount() {
        let tc = 0;
        for (let k in this._seatState) {
            if (this._seatState[k] === 0) {
                tc ++;
            }
        }
        return tc;
    }

    /**
     * 分配一个座位号
     */
    generateSeatId() {
        for (let k in this._seatState) {
            if (this._seatState[k] === 0) {
                this._seatState[k] = 1;
                return parseInt(k);
            }
        }
        return -1;
    }


    /**
     * 获取房间内玩家金币
     * @returns {number}
     */
    get avgGold() {
        if (this.playerMap.size == 0) {
            return config.ROBOT.GOLD_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.gold;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    /**
     * 获取房间内玩家钻石
     * @returns {number}
     */
    get avgPearl() {
        if (this.playerMap.size == 0) {
            return config.ROBOT.PEARL_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.pearl;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    get avgExp() {
        if (this.playerMap.size == 0) {
            return config.ROBOT.EXP_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.exp;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    get avgVIP() {
        if (this.playerMap.size == 0) {
            return config.ROBOT.EXP_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.vip;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    /**
     * 获取房间内玩家角色平均等级
     * @returns {number}
     */
    get avgLevel() {
        if (this.playerMap.size == 0) {
            return 1;
        }

        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.level;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    /**
     * 获取房间内玩家武器平均等级
     * @returns {number}
     */
    get avgWeaponLevel() {
        if (this.playerMap.size == 0) {
            return 1;
        }
        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.DIY.weapon;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    /**
     * 获取房间内玩家段位平均等级
     * @returns {number}
     */
    get avgRankLevel() {
        if (this.playerMap.size == 0) {
            return 1;
        }
        let total = [...this.playerMap.values()].reduce(function (prev, next) {
            return prev + next.account.rank;
        }, 0);

        return Math.ceil(total / this.playerMap.size);
    }

    //获取房间配置
    get config() {
        return this._config
    }

    //获取房间模式
    get mode() {
        return this._mode;
    }

    get sceneType() {
        return this._sceneType;
    }

    get roomId() {
        return this._roomId;
    }

    isNewFishEnabled () {
        if (this._skillIceTicker) {
            return false;
        }
        return true;
    }

    start() {
        this._evtor.on(consts.FLUSH_EVENT, this.onFlushFish.bind(this));
        let fish_dt = 1; //秒
        this._flushFishTimer = setInterval(function () {
            if (!this.isNewFishEnabled()) {
                return;
            }
            this._fishModel.checkNewFish(fish_dt);
        }.bind(this), fish_dt * 1000);
    }

    stop() {
        logger.error('玩家离开');
        for (let player of this.playerMap.values()) {
            this._clearPlayerResource(player);
            this.playerMap.delete(player.uid);
        }

        this._clearSkillIceTicker();
        this._fishModel.clearAllLifeTicker();
        clearInterval(this._flushFishTimer);
        this._evtor.removeListener(consts.FLUSH_EVENT, this.onFlushFish.bind(this));
        this._evtor = null;

        if(this.channel){
            this.channel.destroy();
            this.channel = null;
        }
    }

    _genPlayerProcolInfo(player){
        return {
            id: player.uid,
            seatId: player.seatId,
            nickname: player.account.nickname,
            wp_skin: player.DIY.weapon_skin,
            wp_level: player.DIY.weapon,
            wp_energy: player.DIY.weapon_energy,
            gold: player.account.gold,
            pearl: player.account.pearl,
            figure_url: player.account.figure_url,
            kindId: player.kindId,
            skill: player.account.skill,
            cData:player.getContinueData(),
        };
    }

    /**
     * 玩家加入房间
     * @param player
     */
    join(player) {
        if(this.playerMap.has(player.uid)){
            logger.error('玩家已经在房间内',player.uid);
            return;
        }

        let seatId = this.generateSeatId();
        if (seatId === -1) {
            logger.error('座位分配失败，无法加入');
            return;
        }

        logger.error('&&&&&&&&&&&&&&&&&&&&& 玩家坐下', player.uid, 'seat:',seatId );
        this._initDIY(player);
        this.playerMap.set(player.uid, player);
        player.seatId = seatId;
        player.fishModel = this._fishModel;
        player.sceneCfg = this._config;
        player.roomId = this._roomId;
        this._addChannel(player);
        this._addPlayerEvent(player);

        let players = [];
        for (let v of this.playerMap.values()) {
            logger.error('  v.uid = ', v.uid);
            players.push(this._genPlayerProcolInfo(v))
        }
        logger.error('room 玩家加入', player.account.nickname, '-----', player.uid, player.seatId);
        this._broadcast(fishCmd.push.enter_room.route, players);

        let isRobot = !player.isRealPlayer();
        //logger.error('isRealPlayer = ', isRobot)
        isRobot && (this._robotJoinTimestamp = new Date().getTime());
    }

    /**
     * 玩家离开房间
     * @param uid
     */
    leave(uid) {
        let player = this.playerMap.get(uid);
        let data = null;
        if (!!player) {
            data = {
                gold: player.account.gold,
                pearl: player.account.pearl,
            }
            player.save();
            this._clearPlayerResource(player);
            this.playerMap.delete(uid);
        }
        return data;
    }

    kickRobot(){
        for (let player of this.playerMap.values()) {
            if(consts.ENTITY_TYPE.ROBOT == player.kindId){
                this._clearPlayerResource(player);
                this.playerMap.delete(player.uid);
                logger.error('机器人被玩家抢占位置', player.uid);
                return player.uid;
            }
        }
    }

    kickOffline() {
        let now = Date.now();
        let uids = [];
        for (let player of this.playerMap.values()) {
            if (consts.ENTITY_TYPE.PLAYER == player.kindId &&
                (now - player.activeTime > config.PLAYER.OFFLINE_TIMEOUT)) {
                    this.leave(player.uid);
                    logger.error('玩家离线时间超时，被踢出游戏房间', player.uid);
                    uids.push(player.uid);
            }
        }
        return uids;
    }


    setPlayerState(uid, state, sid) {
        let player = this.playerMap.get(uid);
        if (!!player) {
            player.connectState = state;
            player.updateActiveTime();

            if(CONSTS.constDef.PALYER_STATE.OFFLINE == state){
                logger.error('-----------玩家网络断开:', uid);
                this._removeChannel(player);
            }
            else{
                player.sid = sid;
                this._addChannel(player);

                let players = [];
                for (let v of this.playerMap.values()) {
                    players.push(this._genPlayerProcolInfo(v))
                }
                player.send(fishCmd.push.enter_room.route, players);
            }

            this._broadcast(fishCmd.push.playerState.route,{
                state:state,
                uid:uid
            });

            return true;
        }
        logger.error('------not found-----玩家网络断开:', uid);
        return false;
    }

    getPlayer(uid) {
        return this.playerMap.get(uid);
    }

    /**
     * 房间内玩家数量
     * @returns {number}
     */
    playerCount() {
        return this.playerMap.size;
    }

    /**
     * 判断房间是否需要销毁
     */
    isDestroy() {
        if (this.playerMap.size == 0) {
            return true;
        }

        for (let player of this.playerMap.values()) {
            if (player.kindId === consts.ENTITY_TYPE.PLAYER) {
                return false;
            }
        }
        return true;
    }

    _clearPlayerResource(player){
        player.emit('kick', {
            player: player,
            data: {}
        });

        this._removeChannel(player);
        player.clearSkillTickers();
        this._seatState[player.seatId] = 0;
        logger.error('&&&&&&&&&&&&&&&&&&&&& 玩家离开', player.uid, 'seat:',player.seatId );
        this._broadcast(fishCmd.push.leave_room.route, {
            seatId: player.seatId
        });
    }

    _initDIY(player) {
        if (player.account.weapon > this.config.max_level) {
            player.setDIY('weapon', this.config.max_level);
        }
    }

    _addChannel(player) {
        switch (player.kindId) {
            case consts.ENTITY_TYPE.PLAYER:
                this.channel.add(player.uid, player.sid);
                break;
            case consts.ENTITY_TYPE.ROBOT:
            default:
                break;
        }
    }

    _removeChannel(player) {
        switch (player.kindId) {
            case consts.ENTITY_TYPE.PLAYER:
                this.channel.leave(player.uid, player.sid);
                break;
            case consts.ENTITY_TYPE.ROBOT:
            default:
                break;
        }
    }

    _broadcast(route, data) {
        this.channel.pushMessage(route, packMsg(data));
    }

    _addPlayerEvent(player) {
        player.on(fishCmd.push.player_notify.route, function (event) {
            let player = event.player;
            let data = event.data;
            this._broadcast(fishCmd.push.player_notify.route, data);
        }.bind(this));

        player.on(fishCmd.push.fire.route, function (event) {
            let player = event.player;
            let data = event.data;
            this._broadcast(fishCmd.push.fire.route, data);
        }.bind(this));

        player.on(fishCmd.push.catch_fish.route, function (event) {
            let player = event.player;
            let data = event.data;
            for (let fk in data.catch_fishes) {
                let ret = data.catch_fishes[fk];
                ret && ret.floor >= 0 && this._fishModel.updateLifeState(fk, ret.floor);
            }
            this._broadcast(fishCmd.push.catch_fish.route, data);
        }.bind(this));


        player.on(fishCmd.push.use_skill.route, function (event) {
            let player = event.player;
            let data = event.data;
            let common = data.common;
            if (common) {
                let skillId = common.skill_id;
                if (skillId === consts.SKILL_ID.SK_FREEZ) {
                    this.pauseWithSkillIce(skillId, function () {
                        this._broadcast(fishCmd.push.use_skill_end.route, {
                            ice_all_over: true
                        });
                    }.bind(this));
                }
            }

            if (data.skill_call) {
                let call = data.skill_call;
                this._fishModel.callAnSpecialFish(call.fish_key, call.fish_path);
            }
            data.seatId = player.seatId;
            this._broadcast(fishCmd.push.use_skill.route, data);
        }.bind(this));

        player.on(fishCmd.push.use_skill_end.route, function (event) {
            let player = event.player;
            let data = event.data;
            this._broadcast(fishCmd.push.use_skill_end.route, data);
        }.bind(this));

        player.on(fishCmd.push.fighting_notify.route, function (event) {
            let player = event.player;
            let data = event.data;
            this._broadcast(fishCmd.push.fighting_notify.route, data);
        }.bind(this));

    }

    onFlushFish(evtName, evtData) {
        this._broadcast(fishCmd.push.flush_fish.route, {
            evtName: evtName,
            evtData: evtData
        });
    }

    /**
     * 玩家使用冰冻，暂定刷新鱼、暂停生命计时器
     * 上一个玩家正在使用冰冻，下一个玩家有开始使用，则重置冰冻为当前玩家冰冻技能持续时间
     */
    pauseWithSkillIce(skillId, allOverDoneFunc) {
        let skillCfg = configReader.getValue('skill_skill_cfg', skillId);
        let dt = skillCfg.skill_duration;
        this._clearSkillIceTicker();
        this._skillIceTicker = setTimeout(function () {
            this._clearSkillIceTicker();
            this._fishModel.resumeLifeTicker();
            allOverDoneFunc && allOverDoneFunc();
        }.bind(this), dt * 1000);
        this._fishModel.pauseLifeTicker();
        return dt;
    }

    /**
     * 清除冰冻计时器
     */
    _clearSkillIceTicker() {
        if (this._skillIceTicker) {
            clearTimeout(this._skillIceTicker);
            this._skillIceTicker = null;
        }
    }

}

module.exports = Room;