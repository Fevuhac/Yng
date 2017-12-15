const RankMatchRoom = require('./room');
class RankHall{
    constructor(){
        this._roomMap = new Map();
        this._canRun = true;
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

    rpc_join(users, cb){

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