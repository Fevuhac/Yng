const ChannelPlayer =  require('./channelPlayer');
const GoddessPlayer = require('../goddess/goddessPlayer');
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const consts = require('../consts');

class PlayerFactory{
    constructor(){
    }

    _allocPlayer(data, classObj){
        let promise = new Promise((resolve, reject)=>{
            let baseField = classObj.sBaseField();
            //logger.error('account data.uid= ', data.uid, baseField);
            redisAccountSync.getAccount(data.uid, baseField, function (err, account) {
                if(!!err){
                    reject(CONSTS.SYS_CODE.DB_ERROR);
                    return;
                }
                if(!account){
                    reject(CONSTS.SYS_CODE.PLAYER_NOT_EXIST);
                    return
                }

                //logger.error('account = ', account);
                let player = new classObj({uid:data.uid, sid:data.sid, account:account,kindId:consts.ENTITY_TYPE.PLAYER});
                player.gameInfo = {
                    gameMode:data.gameMode,
                    sceneType:data.sceneType
                };
                resolve(player);
            });
        });
        return promise;
    }

    async createPlayer(data){
        let classObj = this.getPlayerClass(data.gameMode);
        if (!classObj) {
            return null;
        }
        return await this._allocPlayer(data, classObj);
    }

    getPlayerClass (mode) {
        switch (mode) {
            case consts.GAME_MODE.GODDESS:
                return GoddessPlayer;
            break;

            case consts.GAME_MODE.SINGLE: 
            case consts.GAME_MODE.MULTI:
                return ChannelPlayer;
            break;

            case consts.GAME_MODE.MATCH:
            break;

            default:
            break
        }
        return null;
    }
}

module.exports = new PlayerFactory();