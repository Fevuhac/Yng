const Handler = require('../../common/hander');
const matchingCmd = require('../../../cmd/matchingCmd');
const matching = require('../../../logic/matching/matching');

class MatchingHandler extends Handler {
    constructor() {
        super();
    }
}

module.exports = function () {
    let req = matchingCmd.request;
    for (let k of Object.keys(req)) {
        MatchingHandler.registeEx(req[k].route.split('.')[2], matching);
    }
    return new MatchingHandler();
};