/**
 * 远程过程调用，分配连接服务器和游戏服务器
 * @param app
 * @constructor
 */

function BalanceRemote(app) {
    this.app = app;
}

BalanceRemote.prototype.getConnector = function (cb) {
    this.app.balance.getConnectorServer(cb);
};

BalanceRemote.prototype.getGame = function (cb) {
    this.app.balance.getGameServer(cb);
};
BalanceRemote.prototype.getRankMatch = function (cb) {
    this.app.balance.getRankMatchServer(cb);
};

module.exports = function (app) {
    return new BalanceRemote(app);
};