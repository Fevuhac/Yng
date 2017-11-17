const Handler = require('../../common/hander');
const gateCmd = require('../../../cmd/gateCmd');

class GateHandler extends Handler{
    constructor() {
        super();
    }
}

module.exports = function () {
    GateHandler.registe(gateCmd.req.queryEntry.route.split('.')[2]);
    return  new GateHandler();
};