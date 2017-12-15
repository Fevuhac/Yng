const RankMatchRoom = require('./room');
const fishCode = require('../fishCode');
class RankHall{
    constructor(){
        this._roomMap = new Map();
        this._uids = new Map();
        this._canRun = true;
    }

    get roomCount(){
        return this._roomMap.size;
    }

    _tick(){
        for(let room of this._roomMap.values()){
            room.update();
            if(room.state == 2){
                this._roomMap.delete(room.id);
            }
        }
    }

    _desctroy(){

    }

    runTask() {
        if (!this._canRun) return;
        setTimeout(function () {
            this._tick();
            runTask();
        }.bind(this), 100);
    }

    start(){

    }

    stop(){
        this._canRun = false;
    }

    // let account = {
    //     uid:uuidv1(),
    //     nickname: baseInfo.nickname,
    //     figure_url: baseInfo.figure_url,
    //     weapon_skin: weapon_skin,
    //     type: consts.ENTITY_TYPE.MATCH_ROBOT
    // };
    rpc_join(users, cb){
        for(let i = 0; i< users.length; ++i){
            let user = users[i];
            if(this._uids.has(user.uid)){
                cb(fishCode.MATCH_REPEATE_JOIN);
                return
            }
        }
    }

    rpc_ready(data, cb){
        let room = this._roomMap.get(data.roomId);
        if(!room){
            cb('房间不存在');
            return;
        }

        room.setReady(data.uid);
        cb();        
    }

    rpc_fight_info(data, cb){
        let room = this._roomMap.get(data.roomId);
        if(!room){
            cb('比赛房间已经解散');
            return;
        }

        if(room.gameover()){
            cb('比赛房间已经结束');
            return;
        }
    }

    c_chat(data, cb){

    }
}

//todo:排位比赛
module.exports = RankHall;