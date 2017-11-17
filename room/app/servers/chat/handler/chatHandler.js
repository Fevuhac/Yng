const event = require('../../../logic/base/event');

class ChatHandler{
    constructor(app){
        this.app = app;
    }

    send(msg, session, next){
        if(!event.emit(msg.cmdId, msg, session, next)){
            next(null, answer.respNoData(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE))
        }
    };

}
module.exports = function (app) {
    return new ChatHandler(app);
};
