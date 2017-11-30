const Player = require('../entity/player');
const consts = require('../consts');
const uuidv1 = require('uuid/v1');
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
class RobotPlayer extends Player {
    constructor(opts) {
        super(opts);
        this._joinTime = Date.now();
        this._room = opts.room;
    }

    get joinTime(){
        return this._joinTime;
    }

    get room(){
        return this._room;
    }

    //创建机器人
    static allocPlayer(data) {
        let uid = uuidv1();
        let player = new RobotPlayer({uid:uid, account: redisAccountSync.genAccount(uid,data.account),
            kindId: consts.ENTITY_TYPE.ROBOT, room:data.room});
        player.gameInfo = {
            gameMode: data.gameMode,
            sceneType: data.sceneType
        };
        return player;
    }

}


module.exports = RobotPlayer;