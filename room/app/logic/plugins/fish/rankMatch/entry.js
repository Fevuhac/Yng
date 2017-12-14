const Entity = require('../../base/entity');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const event = require('../../base/event');
const pomelo = require('pomelo');
const Code = require('../fishCode');
const RankHall = require('./hall');

class RankMatchEntry extends Entity{
    constructor(){
        super({})
        this.game = pomelo.app.game;
        this._rankHall = new RankHall();

        let req = rankMatchCmd.request;
        for(let k of Object.keys(req)){
            event.on(req[k].route, this.onMessage.bind(this));
        }

        let rpc = rankMatchCmd.remote;
        for(let k of Object.keys(rpc)){
            event.on(rpc[k].route, this.onRPCMessage.bind(this));
        }
    }

    start(){
        this._rankHall.start();
    }

    stop(){
        this._rankHall.stop();
    }

    _call(data, cb, route){
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

    onRPCMessage(data, cb, route){
        this._call(data, cb, route);
    }

    //接受网络消息
    onMessage(msg, session, cb, route){
        msg.data.uid = session.uid;
        msg.data.sid = session.frontendId;
        this._call(msg.data, cb, route);
    }
}

function attach(){
    let req = rankMatchCmd.request;
    for(let k of Object.keys(req)){
        RankMatchEntry.registe(req[k].route.split('.')[2]);
    }
}

attach();


module.exports = RankMatchEntry