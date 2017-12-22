//匹配服，负责匹配玩家
const plugins = require('../plugins');
const pomelo = require('pomelo');
const redisClient = require('../../utils/import_db').redisClient;
const EventEmitter = require('events').EventEmitter;
class Matching {
    constructor() {
        this._event = new EventEmitter();
    }

    get event(){
        return this._event;
    }

    async start() {
        let result = await redisClient.start(pomelo.app.get('redis'));
        if (!result) {
            process.exit(0);
            return;
        }
        this._instance = new plugins[sysConfig.GAME_TYPE].MatchingInstance();
        this._instance.start();
        logger.info('排位赛匹配服启动成功');
    }

    stop() {
        this._instance.stop();
    }
}

module.exports = new Matching();