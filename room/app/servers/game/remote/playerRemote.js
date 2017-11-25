function PlayerRemote(app) {
    this.app = app;
}

PlayerRemote.prototype.enter = function (data, cb) {
    this.app.game.onPlayerJoin(data, cb);
};

/**
 * 玩家离开
 * @param {*} data {uid,gameType,sceneType}
 * @param {*} cb 
 */
PlayerRemote.prototype.leave = function (data, cb) {
    this.app.game.onPlayerLeave(data, cb);
};

/**
 * 玩家连接状态
 * @param {*} data {uid,state, sid,gameType,sceneType}
 * @param {*} cb 
 */
PlayerRemote.prototype.playerConnectState = function (data, cb) {
    this.app.game.onPlayerConnectState(data, cb);
};

module.exports = function (app) {
    return new PlayerRemote(app);
}