const balanceCmd = require('../../../cmd/balanceCmd');
const RemoteHandler = require('../../common/remoteHandler');
const balance = require('../../../logic/balance/balance');


function BalanceRemote(app) {
    this.app = app;
}

let remote = balanceCmd.remote;
for(let k of Object.keys(remote)){
    RemoteHandler.registe(remote[k].route, BalanceRemote.prototype, balance);
}

module.exports = function (app) {
    return new BalanceRemote(app);
};