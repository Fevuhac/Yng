const rankMatchCmd = require('../../../cmd/rankMatchCmd')

/**
 * 排位赛远程调用接口
 * @param app
 * @constructor
 */

function RankMatchRemote(app) {
    this.app = app;
}

function registe(route){
    let prototype = RankMatchRemote.prototype;
    prototype[route] = function (data, cb) {
        this.app.rankMatch.remoteRpc(route, data, cb);
    };
}

let remote = rankMatchCmd.remote;
for(let k of Object.keys(remote)){
    registe(remote[k].route);
}

module.exports = function (app) {
    return new RankMatchRemote(app);
};