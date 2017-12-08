const cache = require('./cache');

class Runner{
    constructor(){
    }

    start(){
        cache.loadData();
    }
}

module.exports = new Runner();