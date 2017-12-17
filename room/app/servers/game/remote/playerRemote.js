const fishCmd = require('../../../logic/plugins/fish/fishCmd');

function PlayerRemote(app) {
    this.app = app;
}

function registe(route){
    let prototype = PlayerRemote.prototype;
    prototype[route] = function (data, cb) {
        this.app.game.remoteRpc(route, data, cb);
    };
}

let remote = fishCmd.remote;
for(let k of Object.keys(remote)){
    registe(remote[k].route);
}

module.exports = function (app) {
    return new PlayerRemote(app);
}