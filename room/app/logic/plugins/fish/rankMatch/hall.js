const RankMatchRoom = require('./room');
const fishCode = require('../fishCode');
const config = require('../config');

class RankHall{
    constructor(){
        this._roomMap = new Map();
        this._uids = new Map();
        this._canRun = true;
    }

    get roomCount(){
        return this._roomMap.size;
    }

    remoteRpc(method, data, cb){
        if(!this[method]){
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }
        this[method](data, function (err, result) {
            utils.invokeCallback(cb, err, result);
        });
    }

    _tick(){
        for(let room of this._roomMap.values()){
            room.update();
            if(room.isGameOver()){
                this._roomMap.delete(room.roomId);
                logger.error('比赛结束，移除房间');
            }
        }
    }

    _desctroy(){

    }

    _runTask() {
        if (!this._canRun) return;
        setTimeout(function () {
            this._tick();
            this._runTask();
        }.bind(this), 100);
    }

    start(){
        this._runTask();
    }

    stop(){
        this._canRun = false;
    }

    rpc_join(data, cb){
        let room = new RankMatchRoom({users: data.users});
        this._roomMap.set(room.roomId, room);
        cb(null, {
            roomId: room.roomId,
            countdown: room.countdown,
            bulletNum: config.MATCH.FIRE,
        });
    }

    rpc_ready(data, cb){
        let room = this._roomMap.get(data.roomId);
        if(!room){
            cb(fishCode.MATCH_ROOM_NOT_EXIST);
            return;
        }
        room.setReady(data);
        cb();        
    }

    _rpcInfo(data, cb){
        let room = this._roomMap.get(data.roomId);
        if(!room){
            cb(fishCode.MATCH_ROOM_NOT_EXIST);
            return;
        }

        if(room.isGameOver()){
            cb(fishCode.MATCH_ROOM_GAMEOVER);
            return;
        }
        cb && cb(0, room);
    }

    rpc_fight_info(data, cb){
        this._rpcInfo(data, function(code, room) {
            if (code != 0) return;
            room.setFightInfo(data);
            cb && cb(null);
        });
    }

    rpc_weapon_change(data, cb) {
        this._rpcInfo(data, function(code, room) {
            if (code != 0) return;
            room.weaponChange(data);
            cb && cb(null);
        });
    }

    rpc_use_nbomb(data, cb) {
        this._rpcInfo(data, function(code, room) {
            if (code != 0) return;
            room.useNbomb(data);
            cb && cb(null);
        });
    }

    rpc_cancel_nbomb(data, cb) {
        this._rpcInfo(data, function(code, room) {
            if (code != 0) return;
            room.cancelNbomb(data);
            cb && cb(null);
        });
    }
    
    c_chat(data, cb){

    }
}

//todo:排位比赛
module.exports = RankHall;