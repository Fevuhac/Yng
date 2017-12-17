const event = require('../base/event');
const entryCmd = require('../../cmd/entryCmd');
const pomelo = require('pomelo');
const async = require('async');
const constsDef = require('../../consts/constDef');


class Entry {
    constructor() {

        let req = entryCmd.request;
        for (let k of Object.keys(req)) {
            event.on(req[k].route, this.onMessage.bind(this));
        }

        // event.on(entryCmd.request.login.route, this.onLogin.bind(this));
        // event.on(entryCmd.request.logout.route, this.onLogout.bind(this));
        // event.on(entryCmd.request.enterGame.route, this.onEnterGame.bind(this));
        // event.on(entryCmd.request.leaveGame.route, this.onLeaveGame.bind(this));
    }

    start() {
        logger.info('连接服务器启动成功');
    }

    stop() {
        logger.info('连接服务器已经停止');
    }

    //接受网络消息
    onMessage(msg, session, cb, route) {
        msg.data.uid = session.uid;
        msg.data.sid = session.frontendId;
        this[route](msg.data, session, function (err, result) {
            if (!!err) {
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }
            if (result) {
                utils.invokeCallback(cb, null, answer.respData(result, msg.enc));
            } else {
                utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
            }
        });
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
                    gameSid: session.get('gameSid'),
                    gameRoomId: session.get('gameRoomId'),
                    sceneId: session.get('sceneId')
                });
            }
        })
    }

    //重连游戏
    _reconnectGame(data, session, cb) {
        data.state = constsDef.PALYER_STATE.ONLINE;
        async.waterfall([function (cb) {
            session.set('gameSid', data.recover.gameSid);
            session.set('gameRoomId', data.recover.gameRoomId);
            session.set('sceneId', data.recover.sceneId);
            session.pushAll(cb);
        }, function (cb) {
            pomelo.app.rpc.game.playerRemote.rpc_player_connect_state(session, {
                uid: data.uid,
                state: data.state,
                sid: data.sid,
                sceneId: data.recover.sceneId
            }, cb);
        }], function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null, data.recover);
            }
        })

    }

    c_login(data, session, cb) {
        let token = data.token;
        if (!token) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
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
                        session.on('closed', self._socketClose.bind(this));
                        cb();
                    }
                });
            }
        ], function (err) {
            utils.invokeCallback(cb, err);
            logger.error(`用户[${_uid}]登陆成功`);
        });
    }

    c_logout(msg, session, cb) {
        utils.invokeCallback(cb, null);
    }

    /**
     * 加入游戏房间
     * @param {*} msg 
     * @param {*} session 
     * @param {*} cb 
     */
    c_enter_room(data, session, cb) {
        let _data = {
            gameMode: data.flag, // 详见GAME_MODE定义
            sceneId: data.scene_name,
            sid: session.frontendId,
            uid: session.uid,
            recover: data.recover
        };

        let self = this;
        async.waterfall([
            function (cb) {
                if (!!data.recover) {
                    self._reconnectGame(_data, session, cb);
                    logger.error('onEnterGame 玩家重连游戏', _data.recover);
                } else {
                    logger.error('onEnterGame 新建游戏', _data.uid);
                    self._newGame(_data, session, cb);
                }
            }
        ], function (err, result) {
            if (err) {
                utils.invokeCallback(cb, err);
                return;
            }
            utils.invokeCallback(cb, null, result);
            logger.error(`用户[${data.uid}]加入游戏成功`, result);
        });
    }

    /**
     * 离开游戏房间
     * @param {*} msg 
     * @param {*} session 
     * @param {*} cb 
     */
    c_leave_room(data, session, cb) {
        logger.error(`用户[${session.uid}]主动退出房间`);
        let uid = session.uid;
        let gameSid = session.get('gameSid');
        if (!!gameSid) {
            pomelo.app.rpc.game.playerRemote.rpc_leave_game(session, {
                uid: uid,
                sceneId: session.get('sceneId')
            }, function (err, result) {
                logger.info(`用户[${uid}]退出游戏服务`, gameSid);
                session.set('gameSid', null);
                session.push('gameSid', function (err) {
                    utils.invokeCallback(cb, null, result);
                });
            });
        } else {
            utils.invokeCallback(cb, null);
        }
    }

    _socketClose(session, reason) {
        if (!session || !session.uid) {
            return;
        }
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