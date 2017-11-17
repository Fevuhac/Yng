/**
 * 远程过程调用，分配连接服务器和游戏服务器
 * @param app
 * @constructor
 */

function BalanceRemote(app) {
    this.app = app;
}

BalanceRemote.prototype.allocConnector = function (cb) {
    this.app.balance.onAllocConnector(cb);
};

BalanceRemote.prototype.allocGame = function (type, cb) {
    this.app.balance.onAllocGame(type, cb);
};

module.exports = function (app) {
    return new BalanceRemote(app);
};