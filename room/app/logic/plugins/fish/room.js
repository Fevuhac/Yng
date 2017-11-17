const pomelo = require('pomelo')
const fishCmd = require('./fishCmd');
const consts = require('./consts');
const cost = require('./cost');
const config = require('./config');
const FishModel = require('./fishModel');
const EventEmitter = require('events').EventEmitter;

class Room {
    constructor(opts) {
        this._roomId = opts.roomId;
        this._config = opts.config;
        this._mode = opts.mode;
        this._sceneType = opts.sceneType;

        this._evtor = new EventEmitter();

        let fishModel = new FishModel(this._evtor);
        fishModel.init(this._sceneType);
        this._fishModel = fishModel;

        this._roomId = opts.roomId;
        this._flushFishTimer = -1;
        this.playerMap = new Map();
        this.channel = pomelo.app.get('channelService').getChannel(this._roomId, true);
    }

    /**
     * 获取房间内玩家金币
     * @returns {number}
     */
    get avgGold(){
        if(this.playerMap.size == 0){
            return config.ROBOT.GOLD_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.gold;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    /**
     * 获取房间内玩家钻石
     * @returns {number}
     */
    get avgPearl(){
        if(this.playerMap.size == 0){
            return config.ROBOT.PEARL_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.pearl;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    get avgExp(){
        if(this.playerMap.size == 0){
            return config.ROBOT.EXP_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.exp;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    get avgVIP(){
        if(this.playerMap.size == 0){
            return config.ROBOT.EXP_DEFAULT;
        }

        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.vip;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    /**
     * 获取房间内玩家角色平均等级
     * @returns {number}
     */
    get avgLevel(){
        if(this.playerMap.size == 0){
            return 1;
        }

        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.level;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    /**
     * 获取房间内玩家武器平均等级
     * @returns {number}
     */
    get avgWeaponLevel(){
        if(this.playerMap.size == 0){
            return 1;
        }
        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.DIY.weapon;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    /**
     * 获取房间内玩家段位平均等级
     * @returns {number}
     */
    get avgRankLevel(){
        if(this.playerMap.size == 0){
            return 1;
        }
        let total = [...this.playerMap.values()].reduce(function (prev,next) {
            return prev + next.account.rank;
        }, 0);

        return Math.ceil(total/this.playerMap.size);
    }

    //获取房间配置
    get config() {
        return this._config
    }

    //获取房间模式
    get mode() {
        return this._mode;
    }

    get sceneType(){
        return this._sceneType;
    }

    get roomId() {
        return this._roomId;
    }

    start() {
        this._evtor.on(consts.FLUSH_EVENT, this.onFlushFish.bind(this));
        let fish_dt = 1; //秒
        this._flushFishTimer = setInterval(function () {
            if (this._skillIce && this._skillIce.ticker) {
                return;
            }
            this._fishModel.checkNewFish(fish_dt);
        }.bind(this), fish_dt * 1000);
    }

    stop() {
        for (let player of this.playerMap.values()) {
            player.emit('kick', {player:player, data:{}});
            this.playerMap.delete(player.uid);
        }

        if (this._skillIce && this._skillIce.ticker) {
            clearTimeout(this._skillIce.ticker);
            this._skillIce.ticker = null;
        }
        this._fishModel.clearAllLifeTicker();
        clearInterval(this._flushFishTimer);
        this._evtor.removeListener(consts.FLUSH_EVENT, this.onFlushFish.bind(this));
        this._evtor = null;
    }

    /**
     * 玩家加入房间
     * @param player
     */
    join(player) {
        this._initDIY(player);
        this.playerMap.set(player.uid, player);
        player.seatId = this.playerMap.size - 1;
        player.fishModel = this._fishModel;
        player.sceneCfg = this._config;
        this._addChannel(player);
        this._addPlayerEvent(player);

        let players = [];
        for (let v of this.playerMap.values()) {
            players.push({
                id: v.uid,
                seatId: v.seatId,
                nickname:v.account.nickname,
                wp_skin: v.DIY.weapon_skin,
                wp_level: v.DIY.weapon,
                gold: v.account.gold,
                pearl: v.account.pearl,
                figure_url: v.account.figure_url,
                kindId: v.kindId,
                skill: v.account.skill,
            })
        }

        logger.error('room 玩家加入', player.account.nickname, '-----', player.uid);
        logger.error('room 玩家加入', player.account.nickname, '-----', player.account.toJSON());
        this._broadcast(fishCmd.push.enter_room.route, players);
    }

    /**
     * 玩家离开房间
     * @param uid
     */
    leave(uid) {
        let player = this.playerMap.get(uid);
        if (!!player) {
            this._removeChannel(player);
            player.clearSkillTickers();
            this.playerMap.delete(uid);
        }
        this._broadcast(fishCmd.push.leave_room.route, {seatId: player.seatId});
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
    isDestroy(){
        if(this.playerMap.size == 0){
            return true;
        }

        for(let player of this.playerMap.values()){
            if(player.kindId === consts.ENTITY_TYPE.PLAYER){
                return false;
            }
        }
        return true;
    }

    _initDIY(player) {
        if (player.account.weapon > this.config.max_level) {
            player.setDIY('weapon', this.config.max_level);
        }
    }

    _addChannel(player){
        switch (player.kindId){
            case consts.ENTITY_TYPE.PLAYER:
                this.channel.add(player.uid, player.sid);
                break;
            case consts.ENTITY_TYPE.ANDROID:
            default:
                break;
        }
    }

    _removeChannel(player){
        switch (player.kindId){
            case consts.ENTITY_TYPE.PLAYER:
                this.channel.leave(player.uid, player.sid);
                break;
            case consts.ENTITY_TYPE.ANDROID:
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
                ret.floor === 0 && this._fishModel.removeActorData(fk);
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
                    data.skill_ice = this.pauseWithSkillIce(skillId);
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
        this._broadcast(fishCmd.push.flush_fish.route,{
            evtName: evtName,
            evtData: evtData
        });
    }

    /**
     * 玩家使用冰冻，暂定刷新鱼、暂停生命计时器
     */
    pauseWithSkillIce(skillId) {
        let skillCfg = cost.getSkillCfg(skillId);
        let dt = skillCfg.skill_duration;

        if (!this._skillIce) {
            this._skillIce = {};
        }
        if (this._skillIce.ticker) {
            clearTimeout(this._skillIce.ticker);
            this._skillIce.ticker = null;
            let time = new Date().getTime();
            time -= this._skillIce.time;
            let passed = Math.ceil(time / 1000);
            this._skillIce.dt -= passed;
            if (this._skillIce.dt < 0) {
                this._skillIce.dt = 0;
            }
        } else {
            this._skillIce.dt = 0;
            this._skillIce.time = new Date().getTime();
        }
        this._skillIce.dt += dt;
        this._skillIce.ticker = setTimeout(function () {
            clearTimeout(this._skillIce.ticker);
            this._skillIce.ticker = null;
            this._skillIce.dt = 0;
            this._skillIce.time = 0;
            this._fishModel.resumeLifeTicker();
        }.bind(this), this._skillIce.dt * 1000);
        this._fishModel.pauseLifeTicker();
        return this._skillIce.dt;
    }

}

module.exports = Room;