const Handler = require('../../common/hander');
const entryCmd = require('../../../cmd/entryCmd');

class EntryHandler extends Handler{
    constructor(){
        super();
    }
}

module.exports = function () {
    let req = entryCmd.request;
    for(let k of Object.keys(req)){
        EntryHandler.registe(req[k].route.split('.')[2]);
    }
    return new EntryHandler();
};
