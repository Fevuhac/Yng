const cache = require('./cache');
const subscribe = require('./subscribe');

class Runner{
    constructor(){
    }

    start(){
        cache.loadData();
        subscribe.listen();
    }
}

module.exports = new Runner();