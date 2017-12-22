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

        //排位赛正式开始：双方已就绪
        this._push.start = {
            route: 's_rank_match_start',
            msg: {
                enc: 'aes',
                data: {
                    countdown:100, //倒计时（单位:s）
                }
            }
        },
        
        //排位赛倒计时
        this._push.timer = {
            route: 's_rank_match_timer',
            msg: {
                enc: 'aes',
                data: {
                   countdown:100, //倒计时（单位:s）
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
                    uid: 12312,
                    roomId: '23423',
                    score:100, //当前得分
                    fire: 100, //剩余子弹数
                    fish_list: [
                        {key: 'fish1', point: 1},
                        {key: 'fish2', point: 2},
                    ]
                }
            },
        };

        /**
         * 武器切换通知
         */
        this._push.weaponChange = {
            route: 's_rank_match_weapon_skin_change',
            msg: {
                enc: 'aes',
                data: {
                    uid: 1001,
                    wp_skin: 1,
                }
            },
        };

        //使用核弹
        this._push.useNbomb = {
            route:'s_rank_match_use_nbomb',
            data:{
                uid:10001,
                roomId: '100202',
                score: 1212, //当前总分
                nbomb: {
                    num: 10,
                    point: 1212,
                },
            }
        }

        //取消核弹
        this._push.cancelNbomb = {
            route:'s_rank_match_cancel_nbomb',
            data:{
                uid:10001,
                roomId: '100202',
            }
        }

        /**
         * pk结算
         */
        this._push.pkResult = {
            route: 's_rank_match_pk_result',
            msg: {
                enc: 'aes',
                data: {
                    finish: true, //是否有比赛结果了
                    point_change: 1, //点数变化，不可能为0，>0 赢了，反之输了
                    box: {
                        id: 1, 
                        idx: 0, //首胜宝箱和普通宝箱索引，注意不是id 
                    }, //宝箱为null，有两种情况：输了，赢了但是该宝箱已获得
                    rank_change: 1, //段位变化，!= 0, >0 上升，反之下降
                    charm_point: 12312,
                    charm_rank: 12,
                    winning_streak: 1, //连胜次数
                    match_info: [
                        {
                            uid: 10001,
                            nickname: 'sdfs',
                            figure_url: 'sdfsd.png',
                            winning_rate: 50, 
                            rank: 1, 
                            fish_account: {
                                'fishName1': {
                                    num: 1,
                                    point: 22,
                                },
                                'fishName2': {
                                    num: 3,
                                    point: 72,
                                },
                            }, //普通开炮打死什么鱼，得多少分
                            nuclear_fish_count: 2, //核弹打死条数
                            nuclear_score: 120, //核弹打死鱼总得分
                        },
                    ],
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
                roomId: '100202'
            }
        }

        //武器皮肤切换
        this._rpc.weaponChange = {
            route:'rpc_weapon_change',
            data:{
                uid: 1001,
                wp_skin: 1,
            }
        }

        //普通开炮信息
        this._rpc.fightInfo = {
            route:'rpc_fight_info',
            data:{
                uid:10001,
                roomId: '100202',
                fire: 99, //剩余子弹数
                score: 1212, //当前总分
                fish_list: {
                    'fishName1': {
                        num: 1,
                        point: 22,
                    },
                    'fishName2': {
                        num: 1,
                        point: 22,
                    },
                } //最近打死鱼信息
            }
        }

        //使用核弹
        this._rpc.useNbomb = {
            route:'rpc_use_nbomb',
            data:{
                uid:10001,
                roomId: '100202',
                score: 1212, //当前总分
                nbomb: {
                    num: 10,
                    point: 1212,
                },
            }
        }

        //取消核弹
        this._rpc.cancelNbomb = {
            route:'rpc_cancel_nbomb',
            data:{
                uid:10001,
                roomId: '100202',
            }
        }
    }
}

module.exports = new RankMatchCmd();