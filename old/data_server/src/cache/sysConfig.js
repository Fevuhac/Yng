module.exports = {
    //服务数据加密KEY
    KEYS:'12345',

    //负载均衡服负载信息拉取周期
    BALANCE_PERIOD:1000, //ms

    //游戏发行版本配置
    GAMEPLAY:{
        CHINA:0, //大陆
        VIETNAM:1 //越南
    },
    PUB: 0,

    //平台数据配置
    PLATFORM_DATA_CONF:{
        PUMPWATER:{
            RANGE:[0.65, 1.5],
            DEFAULT:1
        },
        PLATFORM_CATCHRATE:{
            RANGE:[0.5, 1.2],
            DEFAULT:1
        },
        PLAYER_CATCHRATE:{
            RANGE:[0.5, 1.2],
            DEFAULT:1
        }
    }
};