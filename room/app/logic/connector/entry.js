const event = require('../base/event');
const entryCmd = require('../../cmd/entryCmd');
const pomelo = require('pomelo');
const async = require('async');


class Entry {
    constructor() {
        event.on(entryCmd.req.enterGame.route, this.onEnterGame.bind(this));
        event.on(entryCmd.req.leaveGame.route, this.onLeaveGame.bind(this));
    }

    start() {
        logger.info('连接服务器启动成功');
    }

    stop() {
        logger.info('连接服务器已经停止');
    }

    onEnterGame(msg, session, cb) {
        console.log(msg);
        let token = msg.data.token;
        delete msg.data.token;
        let data = {
            gameType:'fish',
            gameMode:msg.data.flag, // 详见GAME_MODE定义
            sceneType:msg.data.scene_name,
            sid:session.frontendId
        };

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
                    }
                    else {
                        cb();
                    }
                });
            }, function (cb) {
                session.bind(data.uid, function (err) {
                    if (err) {
                        cb(CONSTS.SYS_CODE.SYSTEM_ERROR)
                    }
                    else {
                        session.on('closed', self._leave.bind(this));
                        cb();
                    }
                });
            }, function (cb) {
                pomelo.app.rpc.balance.balanceRemote.allocGame(session, data.gameType, cb);
            }, function (gameSid, cb) {
                session.set('gameSid', gameSid);
                session.pushAll(cb);
            },function (cb) {
                pomelo.app.rpc.game.playerRemote.enter(session, data, cb);
            }
        ], function (err, roomInfo) {
            if (err) {
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }

            utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
            logger.info(`用户[${data.uid}]加入游戏成功`);
        });
    }

    onLeaveGame(msg, session, cb) {
        logger.info(`用户[${session.uid}]主动退出房间`);
        this._leave(session, '用户主动退出房间');
        utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
    }

    _leave(session, reason) {
        if (!session || !session.uid) {
            return;
        }
        let uid = session.uid;
        pomelo.app.rpc.game.playerRemote.leave(session, uid, function (err,result) {
            logger.info(`用户[${uid}]离线 OK`, session.get('gameSid'));
        });
        logger.info(`用户[${uid}]离线`, session.get('gameSid'));
    }

}

module.exports = new Entry();