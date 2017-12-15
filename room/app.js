const pomelo = require('pomelo');
const path = require('path');
// const sync = require('pomelo-sync-plugin');
// const globalChannel = require('pomelo-globalchannel-plugin');
global.logger = require('pomelo-logger').getLogger('default');
require('./app/utils/globals');
const routeUtil = require('./app/utils/routeUtil');
const decryptFilter = require('./app/servers/common/decryptFilter');
const unLoginFilter = require('./app/servers/common/unLoginFilter');
const playerFilter = require('./app/servers/game/filter/playerFilter');
const redisClient = require('./app/utils/import_db').redisClient;


/**
 * 异常监听
 */
process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});


/**
 * 初始化应用配置.
 */
const app = pomelo.createApp();

const configure = function () {
    app.set('name', 'fish room');
    // require('pomelo-logger').configure(path.join(app.getBase(), '/config/log4js.js'), {base: app.getBase()});

    app.loadConfig('redis', path.join(app.getBase(), '../database/config/database/redis.json'));
    app.loadConfig('mysql', path.join(app.getBase(), '../database/config/database/mysql.json'));
    
    app.set('errorHandler', function (err, msg, resp, session, next) {
        logger.error('-------errorHandler happend ---->', err);
        session.__session__.__socket__.socket.close();
        next();
    });

    // configure for global
    app.configure('production|development', function () {
        app.enable('systemMonitor');
        // filter configures
        app.before(pomelo.filters.toobusy()); // 服务器繁忙
        // app.filter(pomelo.filters.serial()); //主要负责保证所有从客户端到服务端的请求能够按顺序地处理
        // app.filter(pomelo.filters.time()); //主要负责记录请求的相应时间
        app.filter(pomelo.filters.timeout()); //主要负责监控请求响应时间，如果超时就给出警告
        app.before(decryptFilter);
        app.before(unLoginFilter);

        var onlineUser = require('./app/modules/onlineUser');
        var gameInfo = require('./app/modules/gameInfo');
        if (typeof app.registerAdmin === 'function') {
            app.registerAdmin(onlineUser, {app: app});
            app.registerAdmin(gameInfo, {app: app});
        }

        let redis_config = app.get('redis');
        // app.use(globalChannel, {
        //     globalChannel: {
        //         prefix: 'globalChannel',
        //         host: redis_config.server.host,
        //         port: redis_config.server.port,
        //         cleanOnStartUp: true
        //     }
        // });

        // proxy configures
        app.set('proxyConfig', {
            cacheMsg: true,
            interval: 30,
            lazyConnection: true
            // enableRpcLog: true
        });

        // remote configures
        app.set('remoteConfig', {
            cacheMsg: true,
            interval: 30
        });

        /*
        // master high availability
        app.use(masterhaPlugin, {
            zookeeper: {
                server: '127.0.0.1:2181',
                path: '/pomelo/master'
            }
        });
        */

        // route configures
        // app.route('chat', routeUtil.chatRoute);
        app.route('game', routeUtil.gameRoute);
    });

    // gate configuration
    app.configure('production|development', 'gate', function () {
        global.logger = require('pomelo-logger').getLogger('gate');
        app.set('connectorConfig',
            {
                connector: pomelo.connectors.hybridconnector,
                useDict: true,
                useProtobuf: true
            });

        app.gate = require('./app/logic/gate/gate');
        app.gate.start();
        // todo deprecated
        app.beforeStopHook(function () {
            app.gate.stop();
        });
    })

    // connector configuration
    app.configure('production|development', 'connector', function () {
        global.logger = require('pomelo-logger').getLogger('connector');
        app.set('connectorConfig',
            {
                connector: pomelo.connectors.hybridconnector,
                heartbeat: 10,
                useDict: true,
                useProtobuf: true
            });
        app.entry = require('./app/logic/connector/entry');
        app.entry.start();
        // todo deprecated
        app.beforeStopHook(function () {
            app.entry.stop();
        });
    });

    // auth configuration
    app.configure('production|development', 'auth', function () {
        global.logger = require('pomelo-logger').getLogger('auth');
        app.auth = require('./app/logic/auth/auth');
        app.auth.start();
        // todo deprecated
        app.beforeStopHook(function () {
            app.auth.stop();
        });
    });

    // game configuration
    app.configure('production|development', 'game', function () {
        global.logger = require('pomelo-logger').getLogger('game');
        app.set('redisClient', redisClient);
        // app.use(sync, {sync: {path: __dirname + '/app/logic/mapping', dbclient: redisClient, interval: 500}});
        app.filter(playerFilter);
        app.game = require('./app/logic/game/game');
        app.game.start();
        app.beforeStopHook(function () {
            app.game.stop();
        });
    });

    // 负载均衡服务器配置
    app.configure('production|development', 'balance', function () {
        global.logger = require('pomelo-logger').getLogger('balance');

        app.balance = require('./app/logic/balance/loadManager');
        app.balance.start();

        // todo deprecated
        app.beforeStopHook(function () {
            app.balance.stop();
        });
    });

    // 负载均衡服务器配置
    app.configure('production|development', 'dataSync', function () {
        global.logger = require('pomelo-logger').getLogger('dataSync');

        app.dataSync = require('./app/logic/dataSync/dataSync');
        app.dataSync.start();

        // todo deprecated
        app.beforeStopHook(function () {
            app.dataCenter.stop();
        });
    });
};


configure();

// start app
app.start();
