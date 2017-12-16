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
        let _serverId = null;
        async.waterfall([function (cb) {
            pomelo.app.rpc.balance.balanceRemote.getGame(session, cb);
        }, function (serverId, cb) {
            _serverId = serverId;
            pomelo.app.rpc.game.playerRemote.enterGame(session, data, cb);
        }], function (err, roomId) {
            if (err) {
                cb(err);
            } else {
                session.set('game', { serverId: _serverId, roomId: roomId, scene: data.scene });
                cb(null);
            }
        })
    }

    //重连游戏
    _reconnectGame(data, session, cb) {
        data.state = constsDef.PALYER_STATE.ONLINE;
        pomelo.app.rpc.game.playerRemote.playerConnectState(session, {
            uid: data.uid,
            state: data.state,
            sid: data.sid,
            scene: data.game.scene
        }, function (err) {
            if (err) {
                cb(err);
            } else {
                session.set('game', data.game);
                cb(null);
            }
        });
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
            gameMode: msg.data.flag, // 详见GAME_MODE定义
            scene: msg.data.scene_name,
            sid: session.frontendId
        };

        let self = this;
        async.waterfall([
            function (cb) {
                if (!!msg.data.game) {
                    session.set('game', msg.data.game);
                    self._reconnectGame(data, session, cb);
                    logger.error('onEnterGame 玩家重连游戏', msg.data.game);
                } else {
                    logger.error('onEnterGame 新建游戏', data.uid);
                    self._newGame(data, session, cb);
                }
            },
            function (cb) {
                session.pushAll(cb);
            }
        ], function (err) {
            if (err) {
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }

            utils.invokeCallback(cb, null, answer.respData(session.get('game'), msg.enc));
            logger.error(`用户[${data.uid}]加入游戏成功`, session.get('game'));
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
        let game = session.get('game');
        if (!!game) {
            pomelo.app.rpc.game.playerRemote.leave(session, {
                uid: uid,
                sceneType: game.scene
            }, function (err, result) {
                logger.info(`用户[${uid}]退出游戏服务`, game.serverId);
                session.set('game', null);
                utils.invokeCallback(cb, null, answer.respData(result, msg.enc));
            });
        }
        else {
            utils.invokeCallback(cb, null);
        }
    }

    _leaveFight(game, cb) {

    }

    _playerOffline(session, reason) {
        if (!session || !session.uid) {
            return;
        }
        let uid = session.uid;
        let game = session.get('game');
        if(!!game){
            pomelo.app.rpc.game.playerRemote.playerConnectState(session, {
                uid: uid,
                state: constsDef.PALYER_STATE.OFFLINE,
                sid: session.frontendId,
                scene: game.scene
            }, function (err, result) {
                logger.info(`用户[${uid}] 网络连接断开`, game.serverId);
            });
        }
    }

}

module.exports = new Entry();