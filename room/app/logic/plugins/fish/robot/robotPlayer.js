const Player = require('../entity/player');
const consts = require('../consts');
const uuidv1 = require('uuid/v1');

class RobotPlayer extends Player {
    constructor(opts) {
        super(opts);
        this._joinTime = Date.now();
        this._scene = opts.scene;
    }

    get joinTime(){
        return this._joinTime;
    }

    get scene(){
        return this._scene;
    }

    //创建机器人
    static allocPlayer(data) {
        let uid = uuidv1();
        let player = new RobotPlayer({uid:uid, account: dbUtils.redisAccountSync.genAccount(uid,data.account),
            kindId: consts.ENTITY_TYPE.ANDROID, scene:data.scene});
        player.gameInfo = {
            gameMode: data.gameMode,
            sceneType: data.sceneType
        };
        return player;
    }

}


module.exports = RobotPlayer;