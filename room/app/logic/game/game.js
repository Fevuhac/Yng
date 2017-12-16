const pomelo = require('pomelo');
const plugins = require('../plugins');
const Entity = require('../base/entity');
const cacheRunner = require('../../cache/runner');
const redisClient = require('../../utils/import_db').redisClient;
const mysqlClient = require('../../utils/import_db').mysqlClient;

class Game extends Entity {
    constructor() {
        super({})
        this.instances = new Map(); //服务器实例
        this._instance = new plugins[sysConfig.GAME_TYPE].Instance();
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
        cacheRunner.start();
        this._instance.start();
        logger.info('游戏战斗服启动成功');
    }

    stop() {
        this._instance.stop();
        redisClient.stop();
        mysqlClient.stop();
        // pomelo.app.get('sync').flush();
    }

    getScene(sceneId) {
        return this._instance.getScene(sceneId);
    }

    //获取玩家负载信息
    getLoadInfo() {
        return this._instance.getLoadStatistics();
    }

    //玩家加入
    onPlayerJoin(data, cb) {
        this._instance.enterScene(data, function (err, roomId) {
            if (!err) {
                logger.error('onPlayerJoin enter ok', data.uid);
            }
            utils.invokeCallback(cb, err, roomId);
        }.bind(this));
    }

    /**
     * 玩家连接状态
     * @param {*} data {uid,state, sid,sceneId}
     * @param {*} cb 
     */
    onPlayerConnectState(data, cb) {
        this._instance.setPlayerState(data, function (err, roomId) {
            if (err) {
                logger.error('onPlayerConnectState error', err);
                utils.invokeCallback(cb, err);
                return
            }
            utils.invokeCallback(cb, err, roomId);
        });
    }

    //玩家离开{uid,sceneId}
    onPlayerLeave(data, cb) {
        this._instance.leaveScene(data.uid, data.scene, cb);
    }
}

module.exports = new Game();