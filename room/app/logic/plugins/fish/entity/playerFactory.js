const FishPlayer = require('./player');
const VietnamPlayer = require('./vietnamPlayer');

class PlayerFactory{
    constructor(){
    }

    async createPlayer(data){
    
        switch (sysConfig.PUB){
            case sysConfig.GAMEPLAY.VIETNAM:
                return await VietnamPlayer.allocPlayer(data);
            case sysConfig.GAMEPLAY.CHINA:
            return await FishPlayer.allocPlayer(data);
            default:
                break;
        }
    }
}

module.exports = new PlayerFactory();