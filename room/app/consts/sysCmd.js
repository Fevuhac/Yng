class SysCmd {
    constructor() {
        this._req = {};
        this._push = {};
        this._rpc = {};
    }

    /**
     * 初始化请求接口定义
     */
    initReq() {
        /**
         * 心跳协议
         * @type {{}}
         */
        this._req.heartbeat = {
            route: 'game.fishHandler.c_heartbeat',
            msg: {
                enc: 'aes',
                data: {}
            },
            res: {}
        };

    }

    /**
     * 初始化推送消息接口定义
     */
    initPush() {}

    initRemote() {}

    get request() {
        return this._req;
    }

    get remote(){
        return this._rpc;
    }
}

module.exports = SysCmd