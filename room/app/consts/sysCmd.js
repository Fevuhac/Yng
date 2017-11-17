class SysCmd {
    constructor() {
        this.req = {};
        this.push = {};
    }

    /**
     * 初始化请求接口定义
     */
    initReq() {
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