const pomelo = require('pomelo');

class Rpc{
    constructor(){

    }

    request(serverType, moduleName, rpcMethod, session, data, cb){
       pomelo.app.rpc[serverType][moduleName][rpcMethod](session, data, cb);
    }
}

module.exports = new Rpc();
// let lpr = new Rpc();
// setInterval(function(){
//     lpr.test('balance', 'balanceRemote', 'rpc_get_rankMatch_server', {}, function(err, result){
//         logger.error('------------------------rpc', err, result);
//     });
// }, 15000)