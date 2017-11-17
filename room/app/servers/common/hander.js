const event = require('../../logic/base/event');

class Handler{
    constructor(){
    }

    static registe(name){
        let prototype = Handler.prototype;
        prototype[name] = function (msg, session, next) {
            if(!event.emit(msg.__route__, msg, session, next, name)){
                next(null, answer.respNoData(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE));
            }
        };
    }
}

module.exports = Handler;