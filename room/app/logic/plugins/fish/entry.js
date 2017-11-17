const Entity = require('../../base/entity');
const fishCmd = require('./fishCmd');
const event = require('../../base/event');
const pomelo = require('pomelo');
const Code = require('./fishCode');

class Entry extends Entity{
    constructor(){
        super({})
        this.game = pomelo.app.game;

        let req = fishCmd.request;
        for(let k of Object.keys(req)){
            event.on(req[k].route, this.onMessage.bind(this));
        }
    }

    onMessage(msg, session, cb, route){
        msg.scene[route](route, session.uid, msg.data, function (err, result) {
            if(!!err){
                utils.invokeCallback(cb, null, answer.respNoData(err));
                return;
            }

            if(result){
                utils.invokeCallback(cb, null, answer.respData(result));
            }
            else {
                utils.invokeCallback(cb, null, answer.respNoData(CONSTS.SYS_CODE.OK));
            }

        });
    }
}

module.exports = Entry