const SysCmd = require('../consts/sysCmd')

/**
 * 登录服务器接口定义
 */

class BalanceCmd extends SysCmd {
    constructor() {
        super();
        this.initRemote();
    }

    initRemote(){
        super.initRemote();
        //分配连接服务器
        this._rpc.getConnector = {
            route:'rpc_get_connector',
            data:{}

        }

        //分配游戏服务器
        this._rpc.getGameServer = {
            route:'rpc_get_game_server',
            data:{}
        }

        //分配排位赛服务器
        this._rpc.getRankMatchServer = {
            route:'rpc_get_rankMatch_server',
            data:{}
        }
    }
}

module.exports = new BalanceCmd();