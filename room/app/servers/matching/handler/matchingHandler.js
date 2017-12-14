const Handler = require('../../common/hander');
const matchingCmd = require('../../../cmd/matchingCmd');

class MatchingHandler extends Handler {
    constructor() {
        super();
    }
}

module.exports = function () {
    let req = matchingCmd.request;
    for (let k of Object.keys(req)) {
        MatchingHandler.registe(req[k].route.split('.')[2]);
    }
    return new MatchingHandler();
};