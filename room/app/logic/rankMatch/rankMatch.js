const hall = require('../plugins');
const event = require('../../logic/base/event');
const plugins = require('../plugins');
const pomelo = require('pomelo');
const redisClient = require('../../utils/import_db').redisClient;
const mysqlClient = require('../../utils/import_db').mysqlClient;
class RankMatch {
    constructor() {
        this._instance = new plugins[sysConfig.GAME_TYPE].MatchRankInstance();
    }

    async start() {
        let result = await redisClient.start(pomelo.app.get('redis'));
        if (!result) {
            process.exit(0);
            return;
        }
        result = await mysqlClient.start(pomelo.app.get('mysql'));
        if (!result) {
            process.exit(0);
            return;
        }

        this._instance.start();
        logger.info('排位赛比赛服启动成功');
    }

    stop() {
        this._instance.stop();
    }

    remoteRpc(method, data, cb) {
        if (!event.emit(method, data, method, cb)) {
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
        }
    }

    getLoadInfo() {
        return this._instance.getLoadStatistics();
    }

}

module.exports = new RankMatch();