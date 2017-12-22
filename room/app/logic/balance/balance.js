const pomelo = require('pomelo');
const pomeloAdmin = require('pomelo-admin');
const plugins = require('../plugins');

class Balance {
    constructor() {
        this.app = pomelo.app;
        this.connectorMap = new Map();
        this.gameServerMap = new Map();
        this.rankMatchServerMap = new Map();

        this._adminClient = new pomeloAdmin.adminClient({
            username: "monitor",
            password: "monitor"
        });

        this._timerHandle = null;
    }

    remoteRpc(method, data, cb){
        if(!this[method]){
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }
        this[method](data, cb);
    }

    runTick() {
        this._timerHandle = setInterval(function () {
            //请求连接服务器负载
            this._adminClient.request('onlineUser', {}, function (err, data) {
                if (!!err || data === undefined) {
                    return;
                }
                this._updateConnectionsLoad(data);
            }.bind(this));

            //请求游戏服务器业务负载信息
            this._adminClient.request('gameInfo', {}, function (err, data) {
                if (!!err || data === undefined) {
                    return;
                }
                this._updateGameServerLoad(data);
            }.bind(this));

            this._adminClient.request('matchInfo', {}, function (err, data) {
                if (!!err || data === undefined) {
                    return;
                }
                this._updateRankMatchServerLoad(data);
            }.bind(this));

            //请求服务器系统负载信息
            // adminClient.request('systemInfo', {}, function(err,data){
            //     if(!!err || data === undefined){
            //         return;
            //     }
            //
            //     // this._updateGameSysLoad(data);
            //
            //     logger.info('--------------systemMonitor:',err, data);
            // }.bind(this));
            //

        }.bind(this), sysConfig.BALANCE_PERIOD);
    }

    start() {
        this._adminClient.connect('balance-' + Date.now(), "127.0.0.1", "3005", function (err) {
            if (err) {
                logger.error('负载均衡服务器连接master失败', err);
            } else {
                logger.info('负载均衡服务器连接master成功');
                this.runTick();
            }
        }.bind(this));
    }

    stop() {
        if (this._timerHandle) {
            clearInterval(this._timerHandle);
        }
        logger.info('网关服务已经停止');
    }

    /**
     * 分配连接服务器
     * @param token
     * @param cb
     */
    rpc_get_connector(cb) {
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_DEPLOY_ERROR);
            return;
        }

        if (this.connectorMap.size === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_NOT_RUNNING);
            return;
        }

        let conMap = new Map();
        connectors.forEach(function (item) {
            conMap.set(item.id, item);
        });

        let serverAddress = null;
        for (let [k, v] of this.connectorMap) {
            let item = conMap.get(k);
            if (!!item && v.loginedCount <= item.maxLoad) {
                serverAddress = {
                    host: item.clientHost,
                    port: item.clientPort
                };
                break;
            }
        }

        if (!serverAddress) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_RESOURCE_NOT_ENOUGHT);
            return;
        }

        utils.invokeCallback(cb, null, serverAddress);
    }

    /**
     * 分配游戏服务器
     * @param param
     * @param cb
     */
    rpc_get_game_server(cb) {
        if (!plugins[sysConfig.GAME_TYPE]) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.NOT_SUPPORT_GAMETYPE);
            return
        }

        let gameServers = this.app.getServersByType('game');
        if (!gameServers || gameServers.length === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_DEPLOY_ERROR);
            return;
        }

        if (this.gameServerMap.size === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_NOT_RUNNING);
            return;
        }

        let _cfgGameMap = new Map();
        gameServers.forEach(function (item) {
            _cfgGameMap.set(item.id, item);
        });

        let gameSid = null;
        for (let [k, v] of this.gameServerMap) {
            let item = _cfgGameMap.get(k);
            if (!!item) {
                gameSid = item.id;
                break;
            }
        }

        if (!gameSid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_RESOURCE_NOT_ENOUGHT);
            return;
        }
        utils.invokeCallback(cb, null, gameSid);
    }

    rpc_get_rankMatch_server(cb) {
        if (!plugins[sysConfig.GAME_TYPE]) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.NOT_SUPPORT_GAMETYPE);
            return
        }

        let gameServers = this.app.getServersByType('rankMatch');
        if (!gameServers || gameServers.length === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_DEPLOY_ERROR);
            return;
        }

        if (this.rankMatchServerMap.size === 0) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_NOT_RUNNING);
            return;
        }

        let _cfgGameMap = new Map();
        gameServers.forEach(function (item) {
            _cfgGameMap.set(item.id, item);
        });

        // logger.error('--------------------------_cfgGameMap',[..._cfgGameMap]);
        // logger.error('--------------------------this.gameServerMap',[...this.rankMatchServerMap]);
        let serverId = null;
        for (let [k, v] of this.rankMatchServerMap) {
            let item = _cfgGameMap.get(k);
            if (!!item) {
                serverId = item.id;
                break;
            }
        }

        if (!serverId) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.SERVER_RESOURCE_NOT_ENOUGHT);
            return;
        }
        utils.invokeCallback(cb, null, serverId);
    }


    //更新连接服务器负载信息
    _updateConnectionsLoad(data) {
        let arr = [...dataformat.objToMap(data)];
        if (arr.length === 0) {
            return;
        }
        let sorted = arr.sort(function (a, b) {
            return a[1].loginedCount > b[1].loginedCount;
        });
        this.connectorMap.clear();
        for (let i in sorted) {
            this.connectorMap.set(sorted[i][0], sorted[i][1]);
        }
    }

    //更新游戏服务器系统负载
    _updateGameSysLoad(data) {

    }

    //更新游戏服务器房间人数负载
    _updateGameServerLoad(data) {
        let arr = [...dataformat.objToMap(data)];
        if (arr.length === 0) {
            return;
        }
        let sorted = arr.sort(function (a, b) {
            if (a[1].load.roomCount != b[1].load.roomCount) {
                return a[1].load.roomCount > b[1].load.roomCount
            } else {
                return a[1].load.playerCount > b[1].load.playerCount
            }
        });
        this.gameServerMap.clear();
        for (let i in sorted) {
            this.gameServerMap.set(sorted[i][0], sorted[i][1]);
        }
    }

    //更新游戏服务器房间人数负载
    _updateRankMatchServerLoad(data) {
        let arr = [...dataformat.objToMap(data)];
        if (arr.length === 0) {
            return;
        }
        let sorted = arr.sort(function (a, b) {
            return a[1].load.roomCount > b[1].load.roomCount
        });
        this.rankMatchServerMap.clear();
        for (let i in sorted) {
            this.rankMatchServerMap.set(sorted[i][0], sorted[i][1]);
        }
    }
}

module.exports = new Balance();