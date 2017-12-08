const PREFIX = 'pair:uid:';
const RANK_PREFIX = ':result';
// RANK_RESULT_PREFIX:'result:',

module.exports = {
    getKey: function (field) {
        return `${PREFIX}${field}`;
    },

    getMysqlKey: function (redisKey) {
        return redisKey.split(':')[2];
    },

    getRankDataKey(field) {
        return `${field}${RANK_PREFIX}`;
    },


    PLATFORM_TYPE: {
        ANDROID: 1,
        IOS: 2
    },
    
    DATA_EVENT_SYNC:{
        PLATFORM_CATCHRATE:'data_event_sync_platform_catchrate', //平台捕获率
        PLAYER_CATCH_RATE:'data_event_sync_player_catchRate', //玩家捕获率变化
        PLAYER_GAIN_LOSS_LIMIT:'data_event_sync_player_gain_loss_limit', //玩家盈亏限制
        PLATFORM_EARLY_WARNING:'platform_early_warning' //平台预警
    },

    PLATFORM_DATA: {
        PUMPWATER: 'fishjoy:room:pumpwater', //系统收益率平衡，默认为1
        PLATFORM_CATCHRATE: 'fishjoy:room:platformCatchRate', //捕鱼捕获率平台控制，默认为1
        BONUS_POOL: 'fishjoy:platform:bonusPool', //奖池
        PUMP_POOL: 'fishjoy:platform:pumpPool', //抽水池
        PLATFORM_RECHARGE: 'fishjoy:platform:recharge', //平台充值总金额
        PLATFORM_CASH: 'fishjoy:platform:cash', //平台兑现总额度
        PLATFORM_GIVE: 'fishjoy:platform:give', //平台赠送金币总量
        TOTALGOLD: 'fishjoy:platform:totalGold', // 玩家金币总额
        TOTALDRAW: 'fishjoy:platform:totalDraw', // 幸运大奖总消耗
        TOTALNUCLEAR: 'fishjoy:platform:totalNuclear', // 核弹总消耗
        TOTALOTHERS: 'fishjoy:platform:totalOthers', // 其他总消耗
        TODAY_PLATFORM_CASH: "fishjoy:platform:today_cash", //平台玩家今日兑现总额度
        G_GPCT_OUT: "fishjoy:platform:g_gpct_out", //全服命中率过期时间
        G_GPCT_OUT_TIMESTAMP: "fishjoy:platform:g_gpct_out_timestamp", //全服命中率过期时间戳
    },

    WARNING_COEFFICIENCY:{
        COEFFICIENCY:'warning_coefficiency',//平台预警相关信息
    },

    SWITCH: {
        CIK: "global:switch:cik",//实物兑换开关
    },

    RANK: {
        // GOLD: "rank:gold", //金币排行
        // ACHIEVE: "rank:achieve", //成就排行
        GODDESS: "rank:goddess", //女神波数排行(每周重置、每天奖励、周奖励)
        BP: "rank:bp", //捕鱼积分（每周重置、天奖励）
        FLOWER: "rank:flower", //人气王排行（每周重置、天奖励）
        MATCH: "rank:match", //排位赛胜点（每月重置，月、天奖励、并继承上赛季的一些战绩：Math.floor(740 + Math.max(points - 800, 100) * 0.6)）
        AQUARIUM: "rank:aquarium", //宠物鱼总等级排行（10000名以内天奖励）
        CHARM: "rank:charm", //魅力值排行{10000名以内天奖励}
        GAIN:"rank:gain",//盈排行榜
        LOSS:"rank:loss",//亏排行榜
    },

    UPDATED_UIDS: 'fishjoy:updated_uids',
    FLOWER_RECEIVE_WEEKLY: 'flower_receive_weekly',

    RANK_DAILY_AWARD: PREFIX + 'rank_daily_award',
    RANK_WEEK_AWARD: PREFIX + 'rank_week_award',


    "GAIN_LOSS_LIMIT": PREFIX + "gain_loss_limit", //玩家捕获率修正过期参数
    "GAIN_LOSS_SNAPSHOT":PREFIX + "gain_loss_snapshot", //盈亏值快照
    "PLAYER_CATCH_RATE": PREFIX + "player_catch_rate", //玩家捕获率
    "RECHARGE": PREFIX + "recharge", //玩家充值总额度
    "CASH": PREFIX + "cash", //玩家兑现总额度

    "COST": PREFIX + "cost", //玩家金币消耗
    "BONUS_POOL": PREFIX + "bonus_pool", //玩家金币奖池
    "PUMP_POOL": PREFIX + "pump_pool", //玩家金币抽水

    "GAIN_LOSS":PREFIX + "gain_loss", //个人盈亏

    //auto build base on keyTypeDef.js
    "ID": PREFIX + "id",
    "JOINTYPE": PREFIX + "jointype",
    "WHO_INVITE_ME": PREFIX + "who_invite_me",
    "WHO_SHARE_ME": PREFIX + "who_share_me",
    "TEMPNAME": PREFIX + "tempname",
    "NICKNAME": PREFIX + "nickname",
    "PASSWORD": PREFIX + "password",
    "PWD_HISTORY": PREFIX + "pwd_history",
    "VIP": PREFIX + "vip",
    "LOGIN_COUNT": PREFIX + "login_count",
    "LOGOUT_COUNT": PREFIX + "logout_count",
    "CREATED_AT": PREFIX + "created_at",
    "UPDATED_AT": PREFIX + "updated_at",
    "LAST_ONLINE_TIME": PREFIX + "last_online_time",
    "SALT": PREFIX + "salt",
    "TOKEN": PREFIX + "token",
    "GOLD": PREFIX + "gold",
    "PEARL": PREFIX + "pearl",
    "WEAPON": PREFIX + "weapon",
    "SKILL": PREFIX + "skill",
    "BROKE_TIMES": PREFIX + "broke_times",
    "FIRST_LOGIN": PREFIX + "first_login",
    "DAY_REWARD": PREFIX + "day_reward",
    "DAY_REWARD_ADV": PREFIX + "day_reward_adv",
    "NEW_REWARD_ADV": PREFIX + "new_reward_adv",
    "DAY_REWARD_WEEKLY": PREFIX + "day_reward_weekly",
    "VIP_DAILY_FILL": PREFIX + "vip_daily_fill",
    "RMB": PREFIX + "rmb",
    "CHANNEL": PREFIX + "channel",
    "CHANNEL_ACCOUNT_ID": PREFIX + "channel_account_id",
    "PLATFORM": PREFIX + "platform",
    "VIP_WEAPON_ID": PREFIX + "vip_weapon_id",
    "PFFT_AT": PREFIX + "pfft_at",
    "CHANNEL_ACCOUNT_NAME": PREFIX + "channel_account_name",
    "CHANNEL_ACCOUNT_INFO": PREFIX + "channel_account_info",
    "EXP": PREFIX + "exp",
    "LEVEL": PREFIX + "level",
    "LEVEL_MISSION": PREFIX + "level_mission",
    "MISSION_DAILY_RESET": PREFIX + "mission_daily_reset",
    "MISSION_ONLY_ONCE": PREFIX + "mission_only_once",
    "FIRST_BUY": PREFIX + "first_buy",
    "ACTIVITY_GIFT": PREFIX + "activity_gift",
    "HEARTBEAT": PREFIX + "heartbeat",
    "HEARTBEAT_MIN_COST": PREFIX + "heartbeat_min_cost",
    "ACHIEVE_POINT": PREFIX + "achieve_point",
    "GOLD_SHOPPING": PREFIX + "gold_shopping",
    "WEAPON_SKIN": PREFIX + "weapon_skin",
    "BONUS": PREFIX + "bonus",
    "DROP_RESET": PREFIX + "drop_reset",
    "DROP_ONCE": PREFIX + "drop_once",
    "COMEBACK": PREFIX + "comeback",
    "VIP_GIFT": PREFIX + "vip_gift",
    "WEAPON_ENERGY": PREFIX + "weapon_energy",
    "PIRATE": PREFIX + "pirate",
    "CARD": PREFIX + "card",
    "GET_CARD": PREFIX + "get_card",
    "FIRST_BUY_GIFT": PREFIX + "first_buy_gift",
    "PACKAGE": PREFIX + "package",
    "GUIDE": PREFIX + "guide",
    "GUIDE_WEAK": PREFIX + "guide_weak",
    "ACTIVE": PREFIX + "active",
    "ACTIVE_DAILY_RESET": PREFIX + "active_daily_reset",
    "ACTIVE_STAT_ONCE": PREFIX + "active_stat_once",
    "ACTIVE_STAT_RESET": PREFIX + "active_stat_reset",
    "MAIL_BOX": PREFIX + "mail_box",
    "FREE_DRAW": PREFIX + "free_draw",
    "TOTAL_DRAW": PREFIX + "total_draw",
    "ROIPCT_TIME": PREFIX + "roipct_time",
    "AQUARIUM": PREFIX + "aquarium",
    "GODDESS": PREFIX + "goddess",
    "FREE_GODDESS": PREFIX + "free_goddess",
    "GODDESS_FREE": PREFIX + "goddess_free",
    "GODDESS_CTIMES": PREFIX + "goddess_ctimes",
    "GODDESS_CROSSOVER": PREFIX + "goddess_crossover",
    "GODDESS_ONGOING": PREFIX + "goddess_ongoing",
    "REDRESS_NO": PREFIX + "redress_no",
    "TEST": PREFIX + "test",
    "RANK_IN_FRIENDS": PREFIX + "rank_in_friends",
    "OVER_ME_FRIENDS": PREFIX + "over_me_friends",
    "CHARM_RANK": PREFIX + "charm_rank",
    "CHARM_POINT": PREFIX + "charm_point",
    "SEX": PREFIX + "sex",
    "CITY": PREFIX + "city",
    "GAME_FRIEND": PREFIX + "game_friend",
    "MONTH_SIGN": PREFIX + "month_sign",
    "SID": PREFIX + "sid",
    "MATCH_ON": PREFIX + "match_on",
    "CIK_ON": PREFIX + "cik_on",
    "CDKEY_ON": PREFIX + "cdkey_on",
    "MSGBOARD_MGMT": PREFIX + "msgboard_mgmt",
    "MAX_WAVE": PREFIX + "max_wave",
    "GODDESS_BALANCE_TIME": PREFIX + "goddess_balance_time",
    "WEEK_REWARD": PREFIX + "week_reward",
    "WEEK_RANK": PREFIX + "week_rank",
    "PETFISH_RECENT_TIME": PREFIX + "petfish_recent_time",
    "PETFISH_TOTAL_LEVEL": PREFIX + "petfish_total_level",
    "MATCH_RECENT_TIME": PREFIX + "match_recent_time",
    "MATCH_WIN": PREFIX + "match_win",
    "MATCH_FAIL": PREFIX + "match_fail",
    "MATCH_POINTS": PREFIX + "match_points",
    "MATCH_RANK": PREFIX + "match_rank",
    "MATCH_UNFINISH": PREFIX + "match_unfinish",
    "MATCH_BOX_LIST": PREFIX + "match_box_list",
    "MATCH_BOX_TIMESTAMP": PREFIX + "match_box_timestamp",
    "MATCH_1ST_BOX": PREFIX + "match_1st_box",
    "MATCH_SEASON_COUNT": PREFIX + "match_season_count",
    "MATCH_SEASON_WIN": PREFIX + "match_season_win",
    "MATCH_SEASON_BOX": PREFIX + "match_season_box",
    "MATCH_SEASON_1ST_WIN": PREFIX + "match_season_1st_win",
    "MATCH_GOT_SEASON_REWARD": PREFIX + "match_got_season_reward",
    "MATCH_WINNING_STREAK": PREFIX + "match_winning_streak",
    "GOLD_TOTAL_GAIN": PREFIX + "gold_total_gain",
    "GOLD_TOTAL_COST": PREFIX + "gold_total_cost",
    "GOLD_SHOP_COUNT": PREFIX + "gold_shop_count",
    "GOLD_SHOP_AMOUNT": PREFIX + "gold_shop_amount",
    "DIAMOND_TOTAL_GAIN": PREFIX + "diamond_total_gain",
    "DIAMOND_TOTAL_COST": PREFIX + "diamond_total_cost",
    "DIAMOND_SHOP_COUNT": PREFIX + "diamond_shop_count",
    "DIAMOND_SHOP_AMOUNT": PREFIX + "diamond_shop_amount",
    "HAS_SOCIAL": PREFIX + "has_social",
    "SOCIAL_INVITE_FRIENDS": PREFIX + "social_invite_friends",
    "SOCIAL_SHARE_FRIENDS": PREFIX + "social_share_friends",
    "SOCIAL_INVITE_PROGRESS": PREFIX + "social_invite_progress",
    "SOCIAL_INVITE_DAILY_STATE": PREFIX + "social_invite_daily_state",
    "SOCIAL_INVITE_REWARD": PREFIX + "social_invite_reward",
    "SOCIAL_SHARE_STATUS_0": PREFIX + "social_share_status_0",
    "SOCIAL_SHARE_STATUS_1": PREFIX + "social_share_status_1",
    "SOCIAL_SHARE_STATUS_2": PREFIX + "social_share_status_2",
    "SOCIAL_ENSHRINE_STATUS": PREFIX + "social_enshrine_status",
    "SOCIAL_SHARE_TOP_GOLD": PREFIX + "social_share_top_gold",
    "SOCIAL_SHARE_TOP_RANK": PREFIX + "social_share_top_rank",
    "FIGURE_URL": PREFIX + "figure_url",
    "NEW_PLAYER": PREFIX + "new_player",
    "NEED_INSERT": PREFIX + "need_insert",
    "NEED_UPDATE": PREFIX + "need_update",
    "ONLINE_TIME": PREFIX + "online_time",
    "VIP_FILL_THIS_TIME": PREFIX + "vip_fill_this_time"
};