const MatchingEntry = require('./entry');

class MatchingInstance{
    constructor(){
        this._entry =new MatchingEntry();
    }

    start(){
        this._entry.start();
    }

    stop(){
        this._entry.stop();
    }
    
}

module.exports = MatchingInstance;

