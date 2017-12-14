const SysCmd = require('../consts/sysCmd')

/**
 * 登录服务器接口定义
 */

class RankMatchCmd extends SysCmd {
    constructor() {
        super();
        this.initReq();
        this.initPush();
        this.initRemote();
    }

    initReq() {
        super.initReq();
    }

    initPush() {
        super.initPush();

        //聊天
        this._push.chat = {
            route: 's_rank_match_chat',
            msg: {
                enc: 'aes',
                data: {
                   from:10001,
                   to:10002,
                   content:'厉害'
                }
            }
        },

        //排位赛倒计时
        this._push.timer = {
            route: 's_rank_match_timer',
            msg: {
                enc: 'aes',
                data: {
                   free:100, //倒计时（单位:s）
                }
            }
        },

        /**
         * 战斗信息
         */
        this._push.fightInfo = {
            route: 's_rank_match_fight_info',
            msg: {
                enc: 'aes',
                data: {
                    uid:10001,
                    score:100, //总分
                    catch:{
                        fish:[
                            {key:'fish_0_1', value:5},
                            {key:'fish_1_1', value:7},
                            {key:'fish_3_1', value:8}
                        ],
                        skill:{
                            key:'hedan_001',
                            value:50, //鱼分数
                            num:6, //鱼条数
                        }
                    }
                }
            },
        };

        /**
         * pk结算
         */
        this._push.pkResult = {
            route: 's_rank_match_pk_result',
            msg: {
                enc: 'aes',
                data: {
                    players: [{
                            id: 201,
                            score: 0,
                            rank: 14,
                            nickname: 'zhangsan'
                        },
                        {
                            id: 202,
                            score: 0,
                            rank: 14,
                            nickname: 'lisi'
                        },
                    ]
                }
            }
        };
    }

    initRemote(){
        super.initRemote();
        //加入比赛
        this._rpc.join = {
            route:'rpc_join',
            data:[] //玩家基础信息

        }

        //发送准备状态
        this._rpc.ready = {
            route:'rpc_ready',
            data:{
                uid:10001,
                room: {
                    gameId: 'game-server-1',
                    roomId: '100202'
                }
            }
        }

        this._rpc.fightInfo = {
            route:'rpc_fight_info',
            data:{
                uid:10001,
                catch:[
                    {key:'fish_0_1', value:5},
                    {key:'fish_1_1', value:7},
                    {key:'fish_3_1', value:8}
                ]
            }
        }
    }
}

module.exports = new RankMatchCmd();