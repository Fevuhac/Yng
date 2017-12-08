class SysCmd {
    constructor() {
        this.req = {};
        this.push = {};
    }

    /**
     * 初始化请求接口定义
     */
    initReq() {
        /**
         * 心跳协议
         * @type {{}}
         */
        this.req.heartbeat = {
            route: 'game.fishHandler.c_heartbeat',
            msg: {
                enc: 'aes',
                data: {
                }
            },
            res: {}
        };

    }

    /**
     * 初始化推送消息接口定义
     */
    initPush() {
    }

    get request(){
        return this.req;
    }
}

module.exports = SysCmd