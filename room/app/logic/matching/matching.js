//匹配服，负责匹配玩家
const plugins = require('../plugins');
class Matching {
    constructor() {
        this._instance = new plugins[sysConfig.GAME_TYPE].MatchingInstance();
    }

    start() {
        this._instance.start();
    }

    stop() {
        this._instance.stop();
    }
}

module.exports = new Matching();