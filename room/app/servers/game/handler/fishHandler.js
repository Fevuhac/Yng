const Handler = require('../../common/hander');
const fishCmd = require('../../../cmd/fishCmd');
const game = require('../../../logic/game/game');

class FishHandler extends Handler{
    constructor(){
        super();
    }
}

module.exports = function () {
    let req = fishCmd.request;
    for(let k of Object.keys(req)){
        FishHandler.registeEx(req[k].route.split('.')[2], game);
    }
    return new FishHandler();
};


