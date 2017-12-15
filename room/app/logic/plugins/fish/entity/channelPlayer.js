const FishPlayer = require('./player');
const VietnamPlayer = require('./vietnamPlayer');

let ChannelPlayer = null;
switch (sysConfig.PUB){
    case sysConfig.GAMEPLAY.VIETNAM:
        ChannelPlayer = VietnamPlayer;
    case sysConfig.GAMEPLAY.CHINA:
        ChannelPlayer = FishPlayer;
    default:
        break;
}

module.exports = ChannelPlayer;