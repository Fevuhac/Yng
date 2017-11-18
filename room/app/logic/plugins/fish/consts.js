module.exports = {
    GAME_MODE: {
        SINGLE: 0, //单人模式
        MULTI: 1, //多人模式
        MATCH: 2, //比赛模式
        GODDESS: 3 //保卫女神
    },
    SKILL_ID: {
        SK_FREEZ: 1,     //冰冻技能,与表对应，可能不连续，下同
        SK_AIM: 2,      //锁定自动瞄准技能
        SK_CALL: 3,      //召唤技能
        SK_LASER: 4,     //激光
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

    FIGHTING_NOTIFY: {
        WP_SKIN: 0,      //切换武器皮肤
        WP_LEVEL: 1,     //切换武器倍率
    },

    FLUSH_EVENT: Symbol('flushFish'),
    ROOM_MAX_PLAYER: 4,

    ENTITY_TYPE: {
        PLAYER: 0,
        ANDROID: 1,
    },
    PLAYER_BASE_INFO_FIELDS: [
        dbConsts.ACCOUNTKEY.NICKNAME,
        dbConsts.ACCOUNTKEY.LEVEL,
        dbConsts.ACCOUNTKEY.WEAPON,
        dbConsts.ACCOUNTKEY.WEAPON_SKIN,
        dbConsts.ACCOUNTKEY.GOLD,
        dbConsts.ACCOUNTKEY.PEARL,
        dbConsts.ACCOUNTKEY.VIP,
        dbConsts.ACCOUNTKEY.COMEBACK,
        dbConsts.ACCOUNTKEY.WEAPON_ENERGY,
        dbConsts.ACCOUNTKEY.HEARTBEAT,
        dbConsts.ACCOUNTKEY.ROIPCT_TIME,
        dbConsts.ACCOUNTKEY.SKILL,
        dbConsts.ACCOUNTKEY.EXP,
        dbConsts.ACCOUNTKEY.FIGURE_URL,
    ],

};