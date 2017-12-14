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
            route: 'matching.rankMatchHandler.c_signup',
            msg: {
                enc: 'aes',
                data: {
                    token: '52_03458cd087cb11e7ba758392291a4bfa',
                    num: 2 //双人模式
                }
            },
            res: {}
        };

        /**
         * 取消报名
         */
        this._req.cancle = {
            route: 'connector.rankMatchHandler.c_cancle',
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