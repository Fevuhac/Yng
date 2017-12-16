const hall = require('../plugins');
const event = require('../../logic/base/event');
const plugins = require('../plugins');
class RankMatch{
    constructor(){
        this._instance = new plugins[sysConfig.GAME_TYPE].MatchRankInstance();
    }

    start() {
        this._instance.start();
    }

    stop() {
        this._instance.stop();
    }

    remoteRpc(method, data, cb){
        if(!event.emit(method, data, cb, method)){
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
        }
    }

    getLoadInfo(){
        return this._instance.getLoadStatistics();
    }

}

module.exports = new RankMatch();