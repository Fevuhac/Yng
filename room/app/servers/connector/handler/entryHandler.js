const Handler = require('../../common/hander');
const entryCmd = require('../../../cmd/entryCmd');
const connector = require('../../../logic/connector/entry');
class EntryHandler extends Handler{
    constructor(){
        super();
    }
}

module.exports = function () {
    let req = entryCmd.request;
    for(let k of Object.keys(req)){
        EntryHandler.registeEx(req[k].route.split('.')[2], connector);
    }
    return new EntryHandler();
};
