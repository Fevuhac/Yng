var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);


var exp = module.exports;

exp.broadcast = function (route, msg, uids) {
	pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, function(err, fails) {
        if(err){
            logger.error('Push Message route=%s msg=%j err=%j', route, msg, err.stack);
        }
    });
};

exp.send = function (route, msg, uid) {
  exp.broadcast(route, msg, [uid]);
};