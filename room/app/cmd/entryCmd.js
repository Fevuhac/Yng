const SysCmd = require('../consts/sysCmd')

/**
 * 登录服务器接口定义
 */

class EntryCmd extends SysCmd{
    constructor(){
        super();
        this.initReq();
        this.initPush();
    }

    initReq(){
        super.initReq();

        /**
         * 登录
         * @type {{route: string, msg: {enc: string, data: {token: string, flag: boolean, scene_name: string}}, res: {}}}
         */
        this._req.login = {
            route:'connector.entryHandler.c_login',
            msg:{
                enc:'aes',
                data:{
                    token:'52_03458cd087cb11e7ba758392291a4bfa'
                }
            },
            res:{}
        };

         /**
         * 注销
         * @type {{route: string, msg: {enc: string, data: {token: string, flag: boolean, scene_name: string}}, res: {}}}
         */
        this._req.logout = {
            route:'connector.entryHandler.c_logout',
            msg:{},
            res:{}
        };

        /**
         * 加入游戏房间
         * @type {{route: string, msg: {enc: string, data: {token: string, flag: boolean, scene_name: string}}, res: {}}}
         */
        this._req.enterGame = {
            route:'connector.entryHandler.c_enter_room',
            msg:{
                enc:'aes',
                data:{
                    token:'52_03458cd087cb11e7ba758392291a4bfa',
                    flag:0, // 0单人房 1多人房 2排位赛
                    scene_name:'scene_mutiple_1', //准备进入的场景名,
                    recover:{
                        gameId:'game-server-1',
                        roomId:'100202'
                    }
                }
            },
            res:{}
        };


        /**
         * 离开游戏房间
         * @type {{route: string, msg: {enc: string, data: {}}, res: {}}}
         */
        this._req.leaveGame = {
            route:'connector.entryHandler.c_leave_room',
            msg:{
                enc:'aes',
                data:{}

            },
            res:{}
        };

    }

    initPush(){
        super.initPush()
    }
}

module.exports = new EntryCmd();