class SysCode{
    constructor(){
        this.OK = {
            code:200,
            desc:'成功'
        };

        this.Error = {
            code:201,
            desc:'失败'
        };

        this.SYSTEM_ERROR = {
            code:202,
            desc:"系统错误"
        };

        this.DB_ERROR = {
            code:203,
            desc:"数据库错误"
        };

        this.NETWORK_ERROR = {
            code:204,
            desc:"网络错误"
        };

        this.SERVER_RESOURCE_NOT_ENOUGHT = {
            code:300,
            desc:'服务器资源不足'
        };

        this.SERVER_ALLOC_ERROR = {
            code:301,
            desc:'服务器分配错误'
        };


        this.NOT_SUPPORT_SERVICE = {
            code:302,
            desc:'不支持此服务'
        };

        this.SCENE_NOT_EXIST = {
            code:303,
            desc:'场景服务器不存在'
        };


        this.NOT_SUPPORT_GAMETYPE = {
            code:304,
            desc:'不支持的游戏类型'
        };

        this.SERVER_NOT_RUNNING = {
            code:305,
            desc:'服务器未启动'
        };

        this.SERVER_OVERLOAD ={
            code:306,
            desc:'服务器繁忙'
        };

        this.SERVER_DEPLOY_ERROR ={
            code:306,
            desc:'服务器部署错误'
        };


        this.PLAYER_ILLEGAL = {
            code:350,
            desc:'玩家非法'
        };

        this.PLAYER_UID_INVALID = {
            code:351,
            desc:'玩家UID无效'
        };

        this.PLAYER_NOT_EXIST = {
            code:352,
            desc:'玩家不存在'
        };

        this.PLAYER_CREATE_FAILED = {
            code:353,
            desc:'重复登录'
        };

        this.PLAYER_NOT_LOGIN = {
            code:354,
            desc:'账号未登录'
        };

        this.PLAYER_BLOCK = {
            code:355,
            desc:'玩家已被封号'
        };

        this.AUTHENTICATION_FAILED = {
            code:356,
            desc:'实名认证失败'
        };

        this.AUTHENTICATION_END = {
            code:357,
            desc:'已经实名认证'
        };

        this.WRONG_SIGN = {
            code:358,
            desc:'验证码错误'
        };

        this.NEED_SIGN = {
            code:359,
            desc:'需要验证码'
        };

        this.NOT_MATCHED_PHONENUM = {
            code:360,
            desc:'电话号码不匹配'
        };

        this.PLAYER_AuthError = {
            code:361,
            desc:'玩家授权失败'
        };

        this.PLAYER_REWARD_NOT_EXIST ={
            code:362,
            desc:'玩家奖励信息不存在'
        }

        this.PLAYER_REWARD_RECEIVED ={
            code:363,
            desc:'玩家奖励已领取'
        };
        this.PLAYER_REWARD_RECEIVED ={
            code:363,
            desc:'玩家奖励已领取'
        };

        this.PALYER_NOT_IN_SCENE = {
            code:'364',
            desc:'玩家不在场景中'
        };

        this.ARGS_INVALID = {
            code:400,
            desc:'参数无效'
        };

        this.ARGS_VALUE_WRONG = {
            code:401,
            desc:'参数值错误'
        };

        this.ARGS_LENGTH_LIMIT = {
            code:402,
            desc:'参数长度限制'
        };

        this.GAME_TYPE_INVALID = {
            code:450,
            desc:'未登录'
        };

        this.GAME_TYPE_INVALID = {
            code:451,
            desc:'游戏类型无效'
        };

        this.GAME_SCENE_INVALID = {
            code:452,
            desc:'游戏场景无效'
        };

        this.GAME_SCENE_ADD_ERR = {
            code:453,
            desc:'加入游戏场景错误'
        };


        this.GM_LEVEL_LIMIT = {
            code:500,
            desc:'GM等级限制'
        };

        this.GM_NOT_AGENT = {
            code:501,
            desc:'GM不是代理'
        };


        this.RESOURCE_LACK = {
            code:550,
            desc:'资源锁定'
        };

        this.RESOURCE_NOT_EXIST = {
            code:551,
            desc:'资源不存在'
        };

        this.ACTIVITY_NOT_OPEN = {
            code:600,
            desc:'活动未开启'
        };

        this.ACTIVITY_NOT_REACH = {
            code:601,
            desc:'活动未达成'
        };

        this.ACTIVITY_FETCHED = {
            code:602,
            desc:'活动已领取'
        };

        this.REWARD_FETCHED = {
            code:603,
            desc:'奖励已领取'
        };
    }
}

module.exports = SysCode;