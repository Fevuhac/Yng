function RemoteHandler(){
}

RemoteHandler.registe = function(method, prototype, server){
    prototype[method] = function (data, cb) {
        if(typeof data === 'function') cb = data;
        server.remoteRpc(method, data, cb); 
    };
}

module.exports = RemoteHandler;