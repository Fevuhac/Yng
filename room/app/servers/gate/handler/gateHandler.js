const Handler = require('../../common/hander');
const gateCmd = require('../../../cmd/gateCmd');

class GateHandler extends Handler{
    constructor() {
        super();
    }
}

module.exports = function () {
    GateHandler.registe(gateCmd.request.queryEntry.route.split('.')[2]);
    return  new GateHandler();
};