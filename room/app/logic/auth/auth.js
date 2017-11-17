const pomelo = require('pomelo');

class Auth {
    constructor() {
    }

    start() {
        let config = pomelo.app.get('redis');
        redisClient.start(config, function (err, connector) {
            if(err){
                logger.error('连接redis数据库失败:', err);
                return;
            }
        });
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
        dbUtils.redisAccountSync.accountCheck(uid, function (err, platform) {
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

