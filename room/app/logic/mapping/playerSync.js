const assert = require('assert');
const cache = require('../base/cache');

module.exports = {
    updatePlayer: function (dbclient, info, cb) {
        let docs = {};
        let uid = info.uid
        let sets = cache.PlayerSetData.get(uid);
        if(!!sets){
            docs['$set'] = sets;
            cache.PlayerSetData.delete(uid);

        }
        let incs = cache.PlayerIncData.get(uid);
        if(!!incs){
            docs['$inc'] = incs;
            cache.PlayerIncData.delete(uid);
        }

        console.log('------ updatePlayer docs:', docs, 'uid:', uid)

        if(!!sets || !!incs){
            dbclient.collect('user').updateOne({_id: uid}, docs, function (err, result) {
                if (err) {
                    logger.error('Player dbclient updateOne err', err);
                    utils.invokeCallback(cb, err);
                } else {
                    utils.invokeCallback(cb, null);
                }
            });
        }
    },

    insertMany: function (dbclient, docs, cb) {

        console.log('------ insertMany')
        if(cache.PlayerInsertData.size ===0){
            utils.invokeCallback(cb, null);
            return
        }

        for (let v of cache.PlayerInsertData.values()){
            docs.push(v);
        }

        cache.PlayerInsertData.clear();
        dbclient.collect('user').insertMany(docs, {'w': 1}, function (err, result) {
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