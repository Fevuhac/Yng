const Entity = require('../../../base/entity');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const pomelo = require('pomelo');
const Code = require('../fishCode');
const RankHall = require('./hall');

class RankMatchEntry extends Entity {
    constructor() {
        super({})
        this._rankHall = new RankHall();
    }

    getLoadStatistics() {
        return {
            roomCount: this._rankHall.roomCount
        }
    }

    start() {
        this._rankHall.start();
        let req = rankMatchCmd.request;
        for (let k of Object.keys(req)) {
            pomelo.app.rankMatch.event.on(req[k].route, this.onMessage.bind(this));
        }
    }

    stop() {
        this._rankHall.stop();
    }

    remoteRpc(method, data, cb){
        this._rankHall.remoteRpc(method, data, cb);
    }

    //接受网络消息
    onMessage(msg, session, cb, route) {
        msg.data.uid = session.uid;
        msg.data.sid = session.frontendId;
        this._rankHall[route](msg.data, function (err, result) {
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