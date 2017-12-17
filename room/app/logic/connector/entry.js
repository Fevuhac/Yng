const event = require('../base/event');
const entryCmd = require('../../cmd/entryCmd');
const pomelo = require('pomelo');
const async = require('async');
const constsDef = require('../../consts/constDef');


class Entry {
    constructor() {
        event.on(entryCmd.request.login.route, this.onLogin.bind(this));
        event.on(entryCmd.request.logout.route, this.onLogout.bind(this));
        event.on(entryCmd.request.enterGame.route, this.onEnterGame.bind(this));
        event.on(entryCmd.request.leaveGame.route, this.onLeaveGame.bind(this));
    }

    start() {
        logger.info('连接服务器启动成功');
    }

    stop() {
        logger.info('连接服务器已经停止');
    }

    //新建游戏
    _newGame(data, session, cb) {
        async.waterfall([
            function (cb) {
                pomelo.app.rpc.balance.balanceRemote.getGame(session, cb);
            },
            function (serverId, cb) {
                session.set('gameSid', serverId);
                session.push('gameSid', cb);
            },
            function (cb) {
                pomelo.app.rpc.game.playerRemote.rpc_enter_game(session, data, cb);
            },
            function (roomId, cb) {
                session.set('gameRoomId', roomId);
                session.set('sceneId', data.sceneId);
                session.pushAll(cb);
            }
        ], function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null, {
                    serverId: session.get('serverId'),
                    roomId: session.get('roomId')
                });
            }
        })
    }

    //重连游戏
    _reconnectGame(data, session, cb) {
        data.state = constsDef.PALYER_STATE.ONLINE;
        async.waterfall([function (cb) {
            session.set('serverId', data.serverId);
            session.set('roomId', data.roomId);
            session.set('sceneId', data.sceneId);
            session.pushAll(cb);
        }, function (cb) {
            pomelo.app.rpc.game.playerRemote.rpc_player_connect_state(session, {
                uid: data.uid,
                state: data.state,
                sid: data.sid,
                sceneId: data.game.sceneId
            }, cb);
        }], function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null, {
                    serverId: data.serverId,
                    roomId: data.roomId
                });
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
        let _uid = null;
        let sessionService = pomelo.app.get('sessionService');
        async.waterfall([
            function (cb) {
                pomelo.app.rpc.auth.authRemote.authenticate(session, token, cb);
            },
            function (result, cb) {
                _uid = result.uid;
                sessionService.kick(_uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    } else {
                        cb();
                    }
                });
            },
            function (cb) {
                session.bind(_uid, function (err) {
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
            logger.error(`用户[${_uid}]登陆成功`);
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
            gameMode: msg.data.flag, // 详见GAME_MODE定义
            sceneId: msg.data.scene_name,
            sid: session.frontendId,
            uid: session.uid
        };

        let self = this;
        async.waterfall([
            function (cb) {
                if (!!msg.data.recover) {
                    self._reconnectGame(data, session, cb);
                    logger.error('onEnterGame 玩家重连游戏', msg.data.game);
                } else {
                    logger.error('onEnterGame 新建游戏', data.uid);
                    self._newGame(data, session, cb);
                }
            }
        ], function (err, result) {
            if (err) {
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }
            utils.invokeCallback(cb, null, answer.respData(result, msg.enc));
            logger.error(`用户[${data.uid}]加入游戏成功 roomId`, session.get('roomId'));
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
        let gameSid = session.get('gameSid');
        if (!!gameSid) {
            pomelo.app.rpc.game.playerRemote.rpc_leave_game(session, {
                uid: uid,
                sceneId: session.get('sceneId')
            }, function (err, result) {
                logger.info(`用户[${uid}]退出游戏服务`, gameSid);
                session.set('gameSid', null);
                utils.invokeCallback(cb, null, answer.respData(result, msg.enc));
            });
        } else {
            utils.invokeCallback(cb, null);
        }
    }

    _playerOffline(session, reason) {
        logger.error('--------------------- _playerOffline  网络断开 11111111111');
        if (!session || !session.uid) {
            return;
        }
        logger.error('--------------------- _playerOffline  网络断开 22222222222');
        let uid = session.uid;
        let gameSid = session.get('gameSid');
        if (!!gameSid) {
            pomelo.app.rpc.game.playerRemote.rpc_player_connect_state(session, {
                uid: uid,
                state: constsDef.PALYER_STATE.OFFLINE,
                sid: session.frontendId,
                sceneId: session.get('sceneId')
            }, function (err, result) {
                logger.info(`用户[${uid}] 网络连接断开`, gameSid);
            });
        }
    }

}

module.exports = new Entry();