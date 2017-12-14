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
    prototype[route] = function (route, data, cb) {
        this.app.rankMatch.remoteRpc(route, data, cb);
    };
}

function attach(){
    let remote = rankMatchCmd.remote;
    for(let k of Object.keys(remote)){
        registe(remote[k].route);
    }
}

// //加入排位赛
// RankMatchRemote.prototype.join = function (data, cb) {
//     this.app.rankMatch.remoteRpc(rankMatchCmd.remote.join.method, data, cb);
// }

// //终端排位赛
// RankMatchRemote.prototype.ready = function (data, cb) {
//     this.app.rankMatch.remoteRpc(rankMatchCmd.remote.ready.method, data, cb);
// }

// RankMatchRemote.prototype.fightInfo = function (data, cb) {
//     this.app.rankMatch.fightInfo(data, cb);
// };

module.exports = function (app) {
    return new RankMatchRemote(app);
};