const RankMatchEntry = require('./entry');

class RankMatchInstance{
    constructor(){
        this._entry =new RankMatchEntry();
    }

    start(){
        this._entry.start();
    }

    stop(){
        this._entry.stop();
    }

    getLoadStatistics(){
        return this._entry.getLoadStatistics();
    }
    
}

module.exports = RankMatchInstance;

