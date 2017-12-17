let routeUtil = module.exports;

routeUtil.chatRoute = function(session, msg, app, cb) {
    let chatServers = app.getServersByType('chat');
    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    let res = dispatcher.dispatchEx(session.get('rid'), chatServers);
    cb(null, res.id);
};

routeUtil.gameRoute = function (session, msg, app, cb) {
    logger.error('--------------------gameRoute:', session.get('gameSid'));
    logger.error('--------------------gameRoute __route__:', msg);
    cb(null, session.get('gameSid'));
};

routeUtil.rankMatchRoute = function (session, msg, app, cb) {
    cb(null, session.get('rankMatchId'));
};

routeUtil.hallRoute = function (session, msg, app, cb) {
    let hallServers = app.getServersByType('hall');
    if(!hallServers || hallServers.length === 0) {
        cb(new Error('can not find game servers.'));
        return;
    }

    let res = dispatcher.dispatchEx(session.uid, hallServers);
    cb(null, res.id);
};

