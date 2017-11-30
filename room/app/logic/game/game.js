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
    }

    start() {
        let config = pomelo.app.get('redis');
        redisClient.start(config, function (err, connector) {
            if (err) {
                logger.error('连接redis数据库失败:', err);
                return;
            }
            cacheRunner.start();

            mysqlClient.start(pomelo.app.get('mysql'), function (err, connecotr) {
                if (err) {
                    logger.error('连接mysql数据库失败:', err);
                    return;
                }
                logger.info('连接mysql数据库成功');
            });

        }.bind(this));
    }

    stop() {
        redisClient.stop();
        // pomelo.app.get('sync').flush();
    }

    getScene(gameType, sceneType) {
        let inst = this.instances.get(gameType);
        if (!inst) {
            return;
        }
        return inst.getScene(sceneType);
    }

    //获取玩家负载信息
    getLoadInfo() {
        let info = [...this.instances.values()].reduce(function (prev, next) {
            let sub = next.getLoadStatistics();
            return {
                playerCount: prev.playerCount + sub.playerCount,
                roomCount: prev.roomCount + sub.roomCount
            }
        }, {
            playerCount: 0,
            roomCount: 0
        });

        return info;
    }

    getInstance(gameType) {
        let inst = this.instances.get(gameType);
        if (!inst) {
            inst = new plugins[gameType].Instance();
            this.instances.set(gameType, inst);
            inst.run();
        }
        return inst;
    }

    //玩家加入
    onPlayerJoin(data, cb) {
        let inst = this.getInstance(data.gameType);
        inst.enterScene(data, function (err, roomId) {
            if (!err) {
                logger.error('onPlayerJoin enter ok', data.uid);
            }
            utils.invokeCallback(cb, err, roomId);
        }.bind(this));
    }

    /**
     * 玩家连接状态
     * @param {*} data {uid,state, sid,gameType,sceneType}
     * @param {*} cb 
     */
    onPlayerConnectState(data, cb) {
        let inst = this.getInstance(data.gameType);
        if (!inst) {
            logger.error('onPlayerConnectState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
            return
        }

        inst.setPlayerState(data, function (err, roomId) {
            if (err) {
                logger.error('onPlayerConnectState error', err);
                utils.invokeCallback(cb, err);
                return
            }
            utils.invokeCallback(cb, err, roomId);
        });
    }

    //玩家离开{uid,gameType,sceneType}
    onPlayerLeave(data, cb) {
        let inst = this.getInstance(data.gameType);
        if (!inst) {
            utils.invokeCallback(cb, null);
            return
        }
        inst.leaveScene(data.uid, data.sceneType, cb);
    }


    onPumpwater(msg) {
        shareData.set(dataType.PUMPWATER, msg.pumpwater);
    }
}

module.exports = new Game();