// SDK相关常量

// 调用渠道SDK时需要传入渠道的编号，以对应的方式处理数据
exports.CHANNEL_ID = {
    EGRET   : 1001,
    WANBA : 1002,
};

// 白鹭参数
exports.EGRET_PARAMS = {
    APP_ID : 90866, //白鹭appid
    TJ_ID : "536E774F5832383D", //白鹭统计id
    APP_KEY : "wcCKDghgzbDqlPosikMnr", //白鹭app key
};

// TODO: 玩吧参数
exports.WANBA_PARAMS = {
    APP_ID : 1105938023,     //玩吧appid
    OPEN_ID : "123456",   //玩吧openid
    OPEN_KEY : "123456",  //玩吧openkey
    APP_KEY : "b5U7V8gXW2XvGz7k",  //玩吧appkey
};

exports.CHANNEL = {
    "1001": {
        PREFIX: "bl",
        NAME: "白鹭",
        APP_ID : 90866, //白鹭appid
        TJ_ID : "536E774F5832383D", //白鹭统计id
        APP_KEY : "wcCKDghgzbDqlPosikMnr", //白鹭app key
    },
    "1002": {
        PREFIX: "wb",
        NAME: "玩吧",
        APP_ID : 1105938023, //玩吧appid
        APP_KEY : "b5U7V8gXW2XvGz7k", //玩吧app key
        zoneid: {	
            android: 1,
            ios: 2,
        }
    },
};