const Entity = require('../../../base/entity');
const matchingCmd = require('../../../../cmd/matchingCmd');
const pomelo = require('pomelo');
const Code = require('../fishCode');
const consts = require('../consts');
const RankMatching = require('./rankMatching');
class MatchingEntry extends Entity {
    constructor() {
        super({})
        this._rankMatching = new RankMatching();
    }

    start() {
        this._rankMatching.start();
        let req = matchingCmd.request;
        for (let k of Object.keys(req)) {
            pomelo.app.matching.event.on(req[k].route, this.onMessage.bind(this));
        }
    }

    stop() {
        this._rankMatching.stop();
    }

    onMessage(msg, session, cb, route) {
        msg.data.uid = session.uid;
        msg.data.sid = session.frontendId;
        this._rankMatching[route](msg.data, session, function (err, result) {
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

module.exports = MatchingEntry;