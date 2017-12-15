const Handler = require('../../common/hander');
const entryCmd = require('../../../cmd/entryCmd');

class EntryHandler extends Handler{
    constructor(){
        super();
    }
}

module.exports = function(){
    EntryHandler.registe(entryCmd.request.enterGame.route.split('.')[2]);
    EntryHandler.registe(entryCmd.request.leaveGame.route.split('.')[2]);
    return new EntryHandler();
};