const ACCOUNTKEY = require('../../../utils/import_def').ACCOUNTKEY;

module.exports = {
    GAME_MODE: {
        SINGLE: 0, //单人模式
        MULTI: 1, //多人模式
        MATCH: 2, //比赛模式
        GODDESS: 3 //保卫女神
    },

    SKILL_ID: {
        SK_FREEZ: 1, //冰冻技能,与表对应，可能不连续，下同
        SK_AIM: 2, //锁定自动瞄准技能
        SK_CALL: 3, //召唤技能
        SK_LASER: 4, //激光
        SK_NBOMB0: 8, //青铜弹头
        SK_NBOMB1: 9, //白银弹头
        SK_NBOMB2: 10, //黄金弹头
    },

    GOD_PROPERTY_ID: {
        lv1: 1, //水族馆养鱼上限+ x
        lv2: 2, //解锁微笑表情
        lv3: 3, //解锁害羞表情
        lv4: 4, //解锁卖萌表情
        lv5: 5, //解锁缠绵表情
        lv6: 6, //同系鱼产出间隔降低x%秒
        lv7: 7, //同系鱼产出量增加x次
        lv8: 8, //锁定技能持续时长提高x%
        lv9: 9, //冰冻技能持续时长提高x%
        lv10: 10, //捕鱼获得升级经验提高x%
        lv11: 11, //激光累积速度提高x%
        lv12: 12, //钻石购买金币量提高x%
    },

    WP_SKIN_ID: {
        HUOPAO: 1,// 火炮
        EMO: 2,// 恶魔之血
        TIANSHI: 3,// 天使之眼
        DIANCHIPAO: 4,// GX770电磁炮
        RONGYAN: 5,// 熔岩巨炮
        HAMA: 6,// 蛤蟆文太
        LIMING: 7,// 星舰·黎明
        PAOPAOTANG: 8,// 泡泡膛
        JIATELIN: 9,// 黄金加特林
        GULANG: 10,// 星舰·孤狼
        DIANWAN: 11,// 电玩精英
        SHUANG: 12,// 霜之哀伤
        CHIYANNVSHEN: 13,// 赤炎女神的诅咒
        YUELIANGTU: 14,// 月亮兔
        JIAN20: 15,// 歼20战机
    },

    FIGHTING_NOTIFY: {
        WP_SKIN: 0, //切换武器皮肤
        WP_LEVEL: 1, //切换武器倍率
        MINI_GAME: 2, //小游戏
        TURN_DRAW: 3, //奖金鱼抽奖
        RMATCH: 4, //排位赛
        DROP: 5, //战斗内掉落
        RMATCH_NB: 6, //排位赛核弹与否，0取消 1使用
    },

    FIRE_FLAG: {
        NORMAL: 0, //普通命中
        LIGHTING: 1, //鱼闪电技能命中
        BOMB: 2, //鱼炸弹技能命中
        NBOMB: 3, //被核弹打中
        LASER: 4, //被激光打中
    },

    RMATCH_STATE: {
        READY: 0, //准备中,3秒倒计时
        START: 1, //开始比赛 
        FIRE100: 2,//一百炮开完 
        NB_USED: 3,//使用核弹 
        NB_CANCEL: 4,//取消核弹 
        END: 5, //比赛结束
    },

    FLUSH_EVENT: Symbol('flushFish'),
    RMATCH_EVENT: Symbol('rmatchEvt'),

    ROOM_MAX_PLAYER: 4,
    RMATH_FIRE_MAX: 100, //排位赛100炮

    ENTITY_TYPE: {
        PLAYER: 0, //玩家
        ROBOT: 1, //普通机器人
        MATCH_ROBOT:2, //比赛机器人
    },

    MATCH_TYPE:{
        RANK:1,
        OTHER:2
    }

};