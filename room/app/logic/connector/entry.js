const event = require('../base/event');
const entryCmd = require('../../cmd/entryCmd');
const pomelo = require('pomelo');
const async = require('async');
const constsDef = require('../../consts/constDef');


class Entry {
    constructor() {
        event.on(entryCmd.req.login.route, this.onLogin.bind(this));
        event.on(entryCmd.req.logout.route, this.onEnterGame.bind(this));
        event.on(entryCmd.req.enterGame.route, this.onEnterGame.bind(this));
        event.on(entryCmd.req.leaveGame.route, this.onLeaveGame.bind(this));
    }

    start() {
        logger.info('连接服务器启动成功');
    }

    stop() {
        logger.info('连接服务器已经停止');
    }

    _newGame(data, session, cb) {
        async.waterfall([function (cb) {
            pomelo.app.rpc.balance.balanceRemote.allocGame(session, data.gameType, cb);
        }, function (gameId, cb) {
            session.set('gameId', gameId);
            session.pushAll(cb);
        }, function (cb) {
            pomelo.app.rpc.game.playerRemote.enter(session, data, cb);
        }], function (err, roomId) {
            if (err) {
                cb(err);
            } else {
                cb(null, roomId);
            }
        })
    }

    _reconnectGame(data, gameId, session, cb) {
        data.state = constsDef.PALYER_STATE.ONLINE;
        async.waterfall([function (cb) {
            session.set('gameId', gameId);
            session.pushAll(cb);
        }, function (cb) {
            pomelo.app.rpc.game.playerRemote.playerConnectState(session, {
                uid: data.uid,
                state: data.state,
                sid: data.sid,
                gameType: data.gameType,
                sceneType: data.sceneType
            }, cb);
        }], function (err, roomId) {
            if (err) {
                cb(err);
            } else {
                cb(null, roomId);
            }
        })
    }

    onLogin(msg, session, cb) {
        let token = msg.data.token;
        if (!token) {
            utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.ARGS_INVALID));
            return;
        }

        let self = this;
        let sessionService = pomelo.app.get('sessionService');
        async.waterfall([
            function (cb) {
                pomelo.app.rpc.auth.authRemote.authenticate(session, token, cb);
            },
            function (result, cb) {
                data.uid = result.uid;
                sessionService.kick(data.uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                session.bind(data.uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        session.on('closed', self._playerOffline.bind(this));
                        cb();
                    }
                });
            }
        ], function (err) {
            if (!err) {
                err = CONSTS.SYS_CODE.OK;
            }
            utils.invokeCallback(cb, null, answer.respNoData(err));
            logger.error(`用户[${data.uid}]登陆成功`);
        });
    }

    onLogout(msg, session, cb) {
        utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
    }

    /**
     * 加入游戏房间
     * @param {*} msg 
     * @param {*} session 
     * @param {*} cb 
     */
    onEnterGame(msg, session, cb) {
        let data = {
            gameType: sysConfig.GAME_TYPE,
            gameMode: msg.data.flag, // 详见GAME_MODE定义
            sceneType: msg.data.scene_name,
            sid: session.frontendId
        };

        let self = this;
        let sessionService = pomelo.app.get('sessionService');
        async.waterfall([
            function (cb) {
                session.set('gameType', data.gameType);
                session.set('sceneType', data.sceneType);
                session.bind(data.uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                if (!!msg.data.recover) {
                    logger.error('onEnterGame 玩家重连游戏', msg.data.recover.gameId);
                    self._reconnectGame(data, msg.data.recover.gameId, session, cb);
                } else {
                    logger.error('onEnterGame 新建游戏', data.uid);
                    self._newGame(data, session, cb);
                }

            }
        ], function (err, roomId) {
            if (err) {
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }
            utils.invokeCallback(cb, null, answer.respData({
                roomId: roomId,
                gameId: session.get('gameId')
            }, msg.enc));
            logger.error(`用户[${data.uid}]加入游戏成功`, {
                roomId: roomId,
                gameId: session.get('gameId')
            });
        });
    }

    /**
     * 离开游戏房间
     * @param {*} msg 
     * @param {*} session 
     * @param {*} cb 
     */
    onLeaveGame(msg, session, cb) {
        logger.info(`用户[${session.uid}]主动退出房间`);
        let uid = session.uid;
        pomelo.app.rpc.game.playerRemote.leave(session, {
            uid: uid,
            gameType: session.get('gameType'),
            sceneType: session.get('sceneType')
        }, function (err, result) {
            logger.info(`用户[${uid}]退出游戏服务`, session.get('gameId'));
            utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
        });
    }

    _playerOffline(session, reason) {
        if (!session || !session.uid) {
            return;
        }
        let uid = session.uid;
        pomelo.app.rpc.game.playerRemote.playerConnectState(session, {
            uid: uid,
            state: constsDef.PALYER_STATE.OFFLINE,
            sid: session.frontendId,
            gameType: session.get('gameType'),
            sceneType: session.get('sceneType')
        }, function (err, result) {
            logger.info(`用户[${uid}] 网络连接断开`, session.get('gameId'));
        });
    }

}

module.exports = new Entry();