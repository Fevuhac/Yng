const Entity = require('../../../base/entity');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const event = require('../../../base/event');
const pomelo = require('pomelo');
const Code = require('../fishCode');
const RankHall = require('./hall');

class RankMatchEntry extends Entity {
    constructor() {
        super({})
        this.game = pomelo.app.game;
        this._rankHall = new RankHall();

        let req = rankMatchCmd.request;
        for (let k of Object.keys(req)) {
            event.on(req[k].route, this.onMessage.bind(this));
        }

        let rpc = rankMatchCmd.remote;
        for (let k of Object.keys(rpc)) {
            event.on(rpc[k].route, this.onRPCMessage.bind(this));
        }
    }

    getLoadStatistics() {
        return {
            roomCount: this._rankHall.roomCount
        }
    }

    start() {
        this._rankHall.start();
    }

    stop() {
        this._rankHall.stop();
    }

    onRPCMessage(data, route, cb) {
        this[route](data, function (err, result) {
            if (!!err) {
                logger.error('-------------rankMatch远程调用失败', route, data)
                return;
            }
            utils.invokeCallback(cb, err, result);
        });
    }

    //接受网络消息
    onMessage(msg, session, cb, route) {
        msg.data.uid = session.uid;
        msg.data.sid = session.frontendId;
        this._rankHall[route](data, function (err, result) {
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
}

module.exports = RankMatchEntry