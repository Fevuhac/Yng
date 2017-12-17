const SysCmd = require('../consts/sysCmd')

/**
 * 匹配服务器接口
 */

class MatchingCmd extends SysCmd {
    constructor() {
        super();
        this.initReq();
        this.initPush();
    }

    initReq() {
        super.initReq();

        /**
         * 报名
         */
        this._req.signup = {
            route: 'matching.matchingHandler.c_signup',
            msg: {
                enc: 'aes',
                data: {}
            },
            res: {}
        };

        /**
         * 取消报名
         */
        this._req.cancle = {
            route: 'matching.matchingHandler.c_cancle',
            msg: {
                enc: 'aes',
                data: {}

            },
            res: {}
        };
    }

    initPush() {
        super.initPush();
        /**
         * 匹配结果
         */
        this._push.matchingResult = {
            route: 's_matching_result',
            msg: {
                enc: 'aes',
                data: {
                    players: [{
                            id: 201,
                            score: 0,
                            rank: 14,
                            nickname: 'zhangsan',
                            vip: 5
                        },
                        {
                            id: 202,
                            score: 0,
                            rank: 14,
                            nickname: 'lisi',
                            vip: 1
                        },
                    ]
                }
            },
            res: {}
        };
    }
}

module.exports = new MatchingCmd();