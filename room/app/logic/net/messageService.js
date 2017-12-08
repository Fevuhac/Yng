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

/**
 * 点对点或者一对多通信
 * @param {*} route 
 * @param {*} msg 
 * @param {*} uid 
 * {
 * uid:100,
 * sid:'connector-server-1'
 * }
 * or 
 * [
 * {
 * uid:200,
 * sid:'connector-server-1'
 * }
 * ]
 */
exp.send = function (route, msg, uids) {
  if(uids instanceof Array){
    exp.broadcast(route, msg, uids);
  }
  else{
    exp.broadcast(route, msg, [uids]);
  }

};