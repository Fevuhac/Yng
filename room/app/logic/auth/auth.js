const pomelo = require('pomelo');
const redisClient = require('../../utils/import_db').redisClient;
const redisAccountSync = require('../../utils/import_utils').redisAccountSync;

class Auth {
    constructor() {
    }

    async start() {
        let result = await redisClient.start(pomelo.app.get('redis'));
        if (!result) {
            process.exit(0);
        }
    }

    stop() {
        redisClient.stop();
    }

    /**
     * 认证token是否有效
     * @param token
     * @param cb
     */

    _getUidByToken(token) {
        let arr = token.split("_");
        if (arr.length != 2) {
            return null;
        }
        return arr[0];
    }

    authenticate(token, cb){
        let uid = this._getUidByToken(token);
        redisAccountSync.accountCheck(uid, function (err, platform) {
            if(!!err && err === 500){
                utils.invokeCallback(cb, CONSTS.SYS_CODE.DB_ERROR);
                return;
            }

            if(!platform){
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_ILLEGAL);
                return;
            }

            utils.invokeCallback(cb, null, {uid:uid});
        });
    }

}

module.exports = new Auth();

