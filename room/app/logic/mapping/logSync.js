const assert = require('assert');

module.exports = {
    insertMany: function (dbclient, docs, cb) {
        for (let v of cache.LogData.values()){
            docs.push(v);
        }
        if(docs.length < 1){
            utils.invokeCallback(cb, null);
            return;
        }
        cache.LogData.clear();
        dbclient.collect('log').insertMany(docs, {'w': 1}, function (err, result) {
            assert.equal(null, err);
            assert.equal(docs.size, result.n);
            docs = [];
            if (err) {
                logger.error('Players dbclient insertMany err', err);
                utils.invokeCallback(cb, err);
            } else {
                utils.invokeCallback(cb, null);
            }
        });
    }
};