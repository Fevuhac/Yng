const Cost = require('./cost');
const VietnamCost = require('./vietnamCost');

class GamePlay {
    constructor() {
        switch (sysConfig.PUB) {
            case sysConfig.GAMEPLAY.VIETNAM:
                this._cost = new VietnamCost();
                break;
            case sysConfig.GAMEPLAY.CHINA:
                this._cost = new Cost();
                break;
            default:
                break;
        }
    }

    get cost(){
        return this._cost;
    }
}

module.exports = new GamePlay();