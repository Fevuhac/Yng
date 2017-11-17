const Handler = require('../../common/hander');
const fishCmd = require('../../../logic/plugins/fish/fishCmd');

class FishHandler extends Handler{
    constructor(){
        super();
    }
}

module.exports = function () {
    let req = fishCmd.request;
    for(let k of Object.keys(req)){
        FishHandler.registe(req[k].route.split('.')[2]);
    }
    return new FishHandler();
};


