const pomelo = require('pomelo')
const FishCode = require('./fishCode');
const Room = require('./room');
const GoddessRoom = require('./goddess/goddessRoom');

const consts = require('./consts')
const fishCmd = require('../../../logic/plugins/fish/fishCmd');
const event = require('../../base/event');

const ROBOT_EVENT = new Set([fishCmd.request.robot_catch_fish.route.split('.')[2]]);

class Scene {
    constructor(gameType, sceneType) {
        this.app = pomelo.app;
        this.gameType = gameType;
        this.sceneType = sceneType;
        this._config = null
        this.entities = new Map();
        this.roomMap = new Map();
        this.roomId_incr = 1;
    }

    getRoomCount(){
        return this.roomMap.size;
    }

    start() {
        //获取游戏场景配置
        this._config = GAMECFG.scene_scenes_cfg[this.sceneType];

        if (!this._config) {
            return FishCode.NOT_SUPPORT_SCENETYPE
        }
    }

    stop() {

    }

    multiRoom(robot){
        return this._searchMultiRoom(robot);
    }

    matchRoom(){
        return this._matchRoom();
    }

    joinGame(player) {
        if (!player || !player.uid) {
            return CONSTS.SYS_CODE.ARGS_INVALID
        }

        let ret = this._access(player.account);
        if (ret.code !== CONSTS.SYS_CODE.OK.code) {
            return ret
        }

        return this._enterRoom(player);
    }

    leaveGame(uid) {
        let data = null;
        let room = this._getRoom(uid);
        if (!!room) {
            data = room.leave(uid);
            if (room.isDestroy()) {
                room.stop();
                this.roomMap.delete(room.roomId);
            }
        }
        this.entities.delete(uid)

        return data;
    }

    kickOfflinePlayer(){
        let scene_uids = [];
        for(let room of this.roomMap.values()){
            let uids = room.kickOffline();
            if (room.isDestroy()) {
                room.stop();
                this.roomMap.delete(room.roomId);
            }

            for(let uid of uids){
                this.entities.delete(uid);
                scene_uids.push(uid);
            }
        }

        return scene_uids;
    }

    getSceneRoom(uid){
        return this._getRoom(uid);
    }

    _getRoom(uid) {
        let roomId = this.entities.get(uid)
        if (!roomId) {
            return
        }

        return this.roomMap.get(roomId);
    }

    _getPlayer(uid) {
        let roomId = this.entities.get(uid)
        if (!roomId) {
            return null;
        }
        let room = this.roomMap.get(roomId);
        if (!!room) {
            return room.getPlayer(uid);
        }

        return null;
    }

    _enterRoom(player) {
        let ret = CONSTS.SYS_CODE.OK;
        let mode = player.gameInfo.gameMode;
        switch (mode) {
            case consts.GAME_MODE.GODDESS:
                let room = this._createRoom(mode, GoddessRoom, 1);
                room.join(player);
                this.entities.set(player.uid, room.roomId);
            break;

            case consts.GAME_MODE.SINGLE: {
                let room = this._createRoom(mode, Room, 1);
                room.join(player);
                this.entities.set(player.uid, room.roomId);
            }
                break;
            case consts.GAME_MODE.MULTI: {
                let room = this._searchMultiRoom();
                if(!room){
                    room = this._createRoom(mode);
                }
                room.join(player);
                this.entities.set(player.uid, room.roomId);
            }
                break;
            case consts.GAME_MODE.MATCH: {
                let room = this._matchRoom();
                if(!room){
                    room = this._createRoom(mode);
                }
                room.join(player);
                this.entities.set(player.uid, room.roomId);
            }
                break;
            default:
                ret = FishCode.NOT_SUPPORT_ROOMMODE;
                break
        }
        return ret;
    }

    _createRoom(mode, className, playerMax) {
        className =  className || Room;
        playerMax = playerMax || consts.ROOM_MAX_PLAYER;
        let roomId = `${this.sceneType}_${this._genRoomId()}`;
        let room = new className({
            roomId: roomId, 
            config: this._config, 
            mode: mode, 
            sceneType:this.sceneType,
            playerMax: playerMax,
        });
        room.start();

        this.roomMap.set(roomId, room);

        return room;
    }


    _searchMultiRoom(robot) {
        for (let room of this.roomMap.values()) {
            if (room.mode === consts.GAME_MODE.MULTI && (room.playerCount() < consts.ROOM_MAX_PLAYER
        || !robot && room.kickRobot())) {
                return room;
            }
        }
        return null;
    }

    _matchRoom(){
        for (let room of this.roomMap.values()) {
            if (room.mode === consts.GAME_MODE.MATCH && room.playerCount() < 2) {

                return room;
            }
        }
        return null;
    }

    _genRoomId() {
        return this.roomId_incr++;
    }

    //场景进入条件
    _access(account) {
        if (account.gold < this._config.needgold) {
            return FishCode.GOLD_NOT_ENOUTH;
        }

        if (account.weapon < this._config.min_level) {
            return FishCode.WEAPON_LEVEL_LOW;
        }

        return CONSTS.SYS_CODE.OK;
    }


    //场景限制
    _limit(route, uid, data){

        // if(route === fishCmd.request.fire.route.split('.')[2]){
        //     return true;
        // }

        return false;
    }

    _robotEvent(route, data, cb){
        if(!ROBOT_EVENT.has(route)){
            return false;
        }
        event.emit(route, data, cb);
        return true;
    }

    static registe(route){
        let prototype = Scene.prototype;
        prototype[route] = function (route, uid, data, cb) {
            if(this._limit(route, uid, data)){
                utils.invokeCallback(cb, FishCode.NOT_SUPPORT_OPERATE);
                return;
            }

            let player = this._getPlayer(uid);
            if (!player) {
                utils.invokeCallback(cb,  FishCode.PLAYER_NOT_EXIST);
                return;
            }
            player.updateActiveTime();
            if(this._robotEvent(route, data, cb)){
                return;
            }

            let func = player[route];
            if(typeof func != 'function'){
                utils.invokeCallback(cb, FishCode.INTERFACE_DEVELOPPING);
                return;
            }
            func.apply(player, Array.prototype.slice.call(arguments, 2));
        };
    }

}

function attach(){
    let req = fishCmd.request;
    for(let k of Object.keys(req)){
        Scene.registe(req[k].route.split('.')[2]);
    }
}

attach();

module.exports = Scene;