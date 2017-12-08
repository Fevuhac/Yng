let i18n = require('../../../cfgs/string_strings_cfg');
let lan = 'cn';
//==============================================================================
// const
//==============================================================================
var _errorCode = {
    // 通用连接错误(从1001开始)
    TOKEN_INVALID:      1001,//token失效
    DB_ERR:             1002,//数据库读写错误
    PARAM_MISSING:      1003,//客户端参数缺失
    PARAM_WRONG_TYPE:   1004,//传入参数类型错误
    CACHE_EMPTY:        1005,//flush的缓存为空, 无需操作
    FAIL_DOWNLOAD_IMG:  1006,//图片下载失败
    FAIL_OPEN_FILE:     1007,//文件打开失败
    TOKEN_NULL:         1008,//token为空
    TOKEN_FORMAT_ERR:   1009,//token格式错误(正确格式为id_sault)
    NEGATIVE_GOLD_ERR:  1010,//金币负数错误(客户端更新金币数量时传入total为负数)
    NEGATIVE_DIAMOND_ERR:  1011,//钻石负数错误(客户端更新钻石数量时传入total为负数)
    SERVER_UPDATE:      1012,//服务器更新退出游戏
    DAILY_RESET:        1013,//服务器每日重置数据
    UID_INVALID:        1014,//客户端传入的用户uid在数据库中没有找到
    UID_CANNOT_FIND:    1015,//用户ID无法找到
    PLAYER_CHEAT:       1016,//账号因为作弊行为被封禁，有疑问请联系客服微信：gamekefu01
    
    // 游戏逻辑错误(从1101开始)
    REPEAT_OPERATION:   1101,//重复操作(重复购买，重复领取)
    VIP_NOT_ENOUFH:     1102,//玩家VIP等级不足
    DIAMOND_NOT_ENOUGH: 1103,//玩家钻石不足
    GOLD_NOT_ENOUGH:    1104,//玩家金币不足
    DIAMOND_MISSMATCH:  1105,//玩家钻石数量不匹配
    GOLD_MISSMATCH:     1106,//玩家金币数量不匹配
    ACTIVE_DISSATISFY:  1107,//活动奖励领取条件不满足
    DRAW_TIMES_ERR:     1108,//抽奖次数错误
    CHIP_NOT_ENOUGH:    1109,//玩家碎片不足
    ACTIVE_EXCHANGE_OVER:  1110,//活动中的交换次数已经用完

    PETFISH_LOCKED:     1111,//宠物鱼尚未解锁(即水族馆中没有对应宠物鱼ID)
    PETFISH_PLACED:     1112,//宠物鱼已经处于放养状态
    PETFISH_STATE_ERR:  1113,//宠物鱼状态错误
    PETFISH_REWARD_ERR_NOTPLACED:   1114,//宠物鱼领取错误: 宠物鱼没有放养
    PETFISH_REWARD_ERR_TIME_NOT_UP: 1115,//宠物鱼领取错误: 收取时间未到
    GODDESS_LOCKED:     1121,//放置的女神没有解锁
    GODDESS_PLACED:     1122,//女神已经处于放置状态，请勿重复放置
    GODDESS_STATE_ERR:  1123,//女神状态错误
    GIFT_ADV_GOTTEN:    1124,//今日礼包已经领取
    
    RANK_COUNT_TOO_LARGE:    1131,//请求的最大排名数超过了100

    RANKGAME_WRONG_LOG_ID: 1141,//请求的排位赛ID不存在
    RANKGAME_UNLOCKING: 1142,//已有宝箱正在解锁中, 请耐心等待
    RANKGAME_EMPTY_BOX: 1143,//当前位置的宝箱是空的
    RANKGAME_LOCKED: 1144,//当前位置的宝箱还没有解锁
    RANKGAME_NO_1ST_WIN_BOX: 1145,//玩家没有首胜宝箱

    //转盘抽奖错误码
    BONUS_GOLDLEVEL_WRONG: 1151,//客户端传入的奖金鱼抽奖等级错误
    BONUS_FISH_NOT_ENOUGH: 1152,//玩家抽奖时奖金鱼数量不够
    BONUS_GOLD_NOT_ENOUGH: 1153,//玩家抽奖时奖金数量不够

    //背包合成错误码
    MIX_WRONG_ITEM: 1161,//客户端上传的物品不是可合成物品
    MIX_RAW_NOT_ENOUGH: 1162,//合成材料不足
    MIX_GOLD_NOT_ENOUGH: 1163,//合成所需金币不足

    //实物兑换错误码
    CIK_TOKEN_NOT_ENOUGH: 1171,//兑换券不足
    CIK_TOTAL_NOT_ENOUGH: 1172,//实物兑换总量不足
    CIK_COUNT_NOT_ENOUGH: 1173,//实物兑换当日量不足
    CIK_WRONG_CHANGE_ID: 1174,//兑换ID错误
    CIK_WRONG_ITEM: 1175,//实物兑换错误物品
    CIK_CANCEL_FAIL: 1176,//玩家取消实物兑换订单失败

    //签到错误码(月签)
    SIGN_REPEAT: 1181,//请勿重复签到
    SIGN_FORBIDDEN1: 1182,//请勿在注册日期前签到
    SIGN_FORBIDDEN2: 1183,//请勿签到今天以后
    SIGN_DIAMOND_NOT_ENOUGH: 1184,//补签钻石不够
    SIGN_DAY_OUT_OF_RANGE: 1185,//签到日期超出范围

    //领奖错误码
    MISSION_WRONG_QUEST_ID: 1191,//错误的任务码
    MISSION_NULL: 1192,//任务进度为空
    MISSION_NULL_RECORD: 1193,//任务记录为空
    MISSION_DISATISFY: 1194,//任务条件不满足
    MISSION_GOTTON: 1195,//请勿重复领取任务奖励
    MISSION_WRONG_ACTIVE_IDX: 1196,//活跃值领取传入的索引错误
    MISSION_ACTIVE_DISATISFY: 1197,//活跃值领取条件不满足
    MISSION_WRONG_TYPE: 1198,//一键领取类型错误(0:成就,1:日常)
    
    // 兑换码错误(从1201开始)
    CDKEY_INVALID:  1201,//兑换码无效
    CDKEY_USED:     1202,//兑换码已经使用过
    CDKEY_REPEAT:   1203,//同组奖励已经领取过
    CDKEY_EXPIRED:  1204,//兑换码已过期
    
    // 邮件错误(从1211开始)
    MAIL_WRONG_JSON_FORMAT:  1211,//邮件奖励字段(reward)不是一个标准的JSON字符串
    MAIL_REWARD_NOT_ARRAY:   1212,//邮件奖励字段(reward)解析后不是一个JSON数组
    MAIL_REWARD_INVALID:     1213,//邮件奖励中有物品表中不存在的物品

    // 女神错误码
    GODDESS_ID_ERROR: 1221,// 女神ID错误, 无法获取女神信息
    GODDESS_UNLOCK_IDX_ERROR: 1222,// 女神解锁索引错误, 请确保idx值为0~8
    GODDESS_UNLOCK_NO_STONE: 1223,// 女神解锁魂石不足
    GODDESS_ALREADY_UNLOCKED: 1224,// 女神已经解锁
    GODDESS_UP_DATA_WRONG: 1225,// 女神升级数据未找到
    GODDESS_UP_LACK_GOLD: 1226,// 女神升级金币不够
    GODDESS_UP_LACK_DEBRIS: 1226,// 女神升级魂石不够
    GODDESS_WEEKREWARD_WRONG_STATUS: 1227,// 保卫女神周奖励状态错误
    GODDESS_WEEKREWARD_UNABLE: 1228,// 保卫女神上周奖励不可领取
    GODDESS_WEEKREWARD_ALREADY: 1229,// 保卫女神上周奖励已经领取
    GODDESS_WEEKREWARD_OUT_OF_RANKS: 1230,// 保卫女神未进入排名, 不可领取

    // 武器错误码
    WEAPON_INFO_NULL: 1241,// 查询的武器升级信息为空
    WEAPON_UNLOCK_DIAMOND_NOT_ENOUGH: 1242,// 玩家解锁武器需要的钻石不足
    WEAPON_UNLOCK_MATERIAL_NOT_ENOUGH: 1243,// 玩家解锁武器需要的材料不足
    WEAPON_LEVELUP_YUNSHI_NOT_ENOUGH: 1244,// 玩家锻造选取了陨石精华但数量不够
    WEAPON_SKIN_DRAW_WRONG_SKIN_ID: 1246,// 玩家抽取了没有拥有的皮肤碎片
    
    // 玩家升级
    LEVELUP_EXP_NOT_ENOUGH: 1251,// 玩家解锁武器需要的材料不足
    LEVELUP_EXP_TOO_MUCH: 1252,// 玩家的经验值不可能涨到下一级
    LEVELUP_MAX_LEVEL: 1253,// 玩家已经是最大等级
    
    // 商品购买
    BUY_WRONG_SHOP_ID: 1261,// 调用购买接口时传入了错误的商品ID
    BUY_WRONG_GIFT_TIME: 1262,// 购买的礼包不在开放时间内
    BUY_GIFT_COUNT_MAX: 1263,// 购买的礼包已经达到最大购买次数
    BUY_FUND_ALREADY: 1264,// 翻盘基金已经购买, 请勿重复购买
    BUY_GIFT_CFG_ERR: 1265,// 购买的礼包配置有误

    // 订单相关
    ORDER_CREATE_FAIL: 1271,// 订单生成失败

    // 排行榜相关
    CHART_REWARD_FAIL: 1281,// 排行榜奖励领取失败

    // 活动奖励领取
    ACTIVE_CLICK_TOO_QUICK: 1301,// 你点击得太快了

    // 激光
    LASER_CHEAT: 1481,// 激光能量数据异常, 无法发射

    // VIP
    VIP_DAILY_REWARD_GOTTEN: 1491,// 玩家今日已经领取了VIP每日奖励

    DATA_NULL_ERROR: 4001,// 数据为空错误

    //聊天
    CHAT_COST_ERROR:5001,//钻石喇叭不足
    CHAT_FRIEND_ERROR:5002,//好友请求错误
    CHAT_REWARD_ERROR:5003,//打赏过了
    CHAT_REWARD_LESS_ERROR:5004,//物品不足
    CHAT_FRIEND_ALREADY_ERROR:5005,//已经是好友了
    CHAT_FRIEND_GAME_ERROR:5006,//只能删除游戏好友
};

var _errorObj = {
    //
    // TOKEN_INVALID: { code: _errorCode.TOKEN_INVALID, msg: "用户Token失效,请重新登录!"},
    TOKEN_INVALID: { code: _errorCode.TOKEN_INVALID, msg: i18n.TOKEN_INVALID[lan]},
    DB_ERR: { code: _errorCode.DB_ERR, msg: i18n.DB_ERR[lan] },
    PARAM_MISSING: { code: _errorCode.PARAM_MISSING, msg: i18n.PARAM_MISSING[lan] },
    PARAM_WRONG_TYPE: { code: _errorCode.PARAM_WRONG_TYPE, msg: i18n.PARAM_WRONG_TYPE[lan] },
    CACHE_EMPTY: { code: _errorCode.CACHE_EMPTY, msg: i18n.CACHE_EMPTY[lan] },
    FAIL_DOWNLOAD_IMG: { code: _errorCode.FAIL_DOWNLOAD_IMG, msg: i18n.FAIL_DOWNLOAD_IMG[lan] },
    FAIL_OPEN_FILE: { code: _errorCode.FAIL_OPEN_FILE, msg: i18n.FAIL_OPEN_FILE[lan] },
    TOKEN_NULL: { code: _errorCode.TOKEN_NULL, msg: i18n.TOKEN_NULL[lan] },
    TOKEN_FORMAT_ERR: { code: _errorCode.TOKEN_FORMAT_ERR, msg: i18n.TOKEN_FORMAT_ERR[lan] },//正确格式为id_sault
    NEGATIVE_GOLD_ERR: { code: _errorCode.NEGATIVE_GOLD_ERR, msg: i18n.NEGATIVE_GOLD_ERR[lan] },//客户端更新金币数量时传入total为负数
    NEGATIVE_DIAMOND_ERR: { code: _errorCode.TOKEN_FORMAT_ERR, msg: i18n.NEGATIVE_DIAMOND_ERR[lan] },//客户端更新钻石数量时传入total为负数
    SERVER_UPDATE: { code: _errorCode.SERVER_UPDATE, msg: i18n.SERVER_UPDATE[lan] },
    DAILY_RESET: { code: _errorCode.DAILY_RESET, msg: i18n.DAILY_RESET[lan] },
    UID_INVALID: { code: _errorCode.UID_INVALID, msg: i18n.UID_INVALID[lan] },
    UID_CANNOT_FIND: { code: _errorCode.UID_CANNOT_FIND, msg: i18n.UID_CANNOT_FIND[lan] },
    PLAYER_CHEAT: { code: _errorCode.PLAYER_CHEAT, msg: i18n.PLAYER_CHEAT[lan] },

    //
    REPEAT_OPERATION: { code: _errorCode.REPEAT_OPERATION, msg: i18n.REPEAT_OPERATION[lan] },
    VIP_NOT_ENOUFH: { code: _errorCode.VIP_NOT_ENOUFH, msg: i18n.VIP_NOT_ENOUFH[lan] },
    DIAMOND_NOT_ENOUGH: { code: _errorCode.DIAMOND_NOT_ENOUGH, msg: i18n.DIAMOND_NOT_ENOUGH[lan] },
    GOLD_NOT_ENOUGH: { code: _errorCode.GOLD_NOT_ENOUGH, msg: i18n.GOLD_NOT_ENOUGH[lan] },
    DIAMOND_MISSMATCH: { code: _errorCode.DIAMOND_MISSMATCH, msg: i18n.DIAMOND_MISSMATCH[lan] },
    GOLD_MISSMATCH: { code: _errorCode.GOLD_MISSMATCH, msg: i18n.GOLD_MISSMATCH[lan] },
    ACTIVE_DISSATISFY: { code: _errorCode.ACTIVE_DISSATISFY, msg: i18n.ACTIVE_DISSATISFY[lan] },
    DRAW_TIMES_ERR: { code: _errorCode.DRAW_TIMES_ERR, msg: i18n.DRAW_TIMES_ERR[lan] },
    CHIP_NOT_ENOUGH: { code: _errorCode.CHIP_NOT_ENOUGH, msg: i18n.CHIP_NOT_ENOUGH[lan] },
    ACTIVE_EXCHANGE_OVER: { code: _errorCode.ACTIVE_EXCHANGE_OVER, msg: i18n.ACTIVE_EXCHANGE_OVER[lan] },

    PETFISH_LOCKED: { code: _errorCode.PETFISH_LOCKED, msg: i18n.PETFISH_LOCKED[lan] },//水族馆中没有对应宠物鱼ID
    PETFISH_PLACED: { code: _errorCode.PETFISH_PLACED, msg: i18n.PETFISH_PLACED[lan] },
    PETFISH_STATE_ERR: { code: _errorCode.PETFISH_STATE_ERR, msg: i18n.PETFISH_STATE_ERR[lan] },
    PETFISH_REWARD_ERR_NOTPLACED: { code: _errorCode.PETFISH_REWARD_ERR_NOTPLACED, msg: i18n.PETFISH_REWARD_ERR_NOTPLACED[lan] },
    PETFISH_REWARD_ERR_TIME_NOT_UP: { code: _errorCode.PETFISH_REWARD_ERR_TIME_NOT_UP, msg: i18n.PETFISH_REWARD_ERR_TIME_NOT_UP[lan] },
    GODDESS_LOCKED: { code: _errorCode.GODDESS_LOCKED, msg: i18n.GODDESS_LOCKED[lan] },
    GODDESS_PLACED: { code: _errorCode.GODDESS_PLACED, msg: i18n.GODDESS_PLACED[lan] },
    GODDESS_STATE_ERR: { code: _errorCode.GODDESS_STATE_ERR, msg: i18n.GODDESS_STATE_ERR[lan] },
    GIFT_ADV_GOTTEN: { code: _errorCode.GIFT_ADV_GOTTEN, msg: i18n.GIFT_ADV_GOTTEN[lan] },
    
    RANK_COUNT_TOO_LARGE: { code: _errorCode.RANK_COUNT_TOO_LARGE, msg: i18n.RANK_COUNT_TOO_LARGE[lan] },
    
    //
    RANKGAME_WRONG_LOG_ID: { code: _errorCode.RANKGAME_WRONG_LOG_ID, msg: i18n.RANKGAME_WRONG_LOG_ID[lan] },
    RANKGAME_UNLOCKING: { code: _errorCode.RANKGAME_UNLOCKING, msg: i18n.RANKGAME_UNLOCKING[lan] },
    RANKGAME_EMPTY_BOX: { code: _errorCode.RANKGAME_EMPTY_BOX, msg: i18n.RANKGAME_EMPTY_BOX[lan] },
    RANKGAME_LOCKED: { code: _errorCode.RANKGAME_LOCKED, msg: i18n.RANKGAME_LOCKED[lan] },
    RANKGAME_NO_1ST_WIN_BOX: { code: _errorCode.RANKGAME_NO_1ST_WIN_BOX, msg: i18n.RANKGAME_NO_1ST_WIN_BOX[lan] },
    
    //
    BONUS_GOLDLEVEL_WRONG: { code: _errorCode.BONUS_GOLDLEVEL_WRONG, msg: i18n.BONUS_GOLDLEVEL_WRONG[lan] },
    BONUS_FISH_NOT_ENOUGH: { code: _errorCode.BONUS_FISH_NOT_ENOUGH, msg: i18n.BONUS_FISH_NOT_ENOUGH[lan] },
    BONUS_GOLD_NOT_ENOUGH: { code: _errorCode.BONUS_GOLD_NOT_ENOUGH, msg: i18n.BONUS_GOLD_NOT_ENOUGH[lan] },
    
    //
    MIX_WRONG_ITEM: { code: _errorCode.MIX_WRONG_ITEM, msg: i18n.MIX_WRONG_ITEM[lan] },
    MIX_RAW_NOT_ENOUGH: { code: _errorCode.MIX_RAW_NOT_ENOUGH, msg: i18n.MIX_RAW_NOT_ENOUGH[lan] },
    MIX_GOLD_NOT_ENOUGH: { code: _errorCode.MIX_GOLD_NOT_ENOUGH, msg: i18n.MIX_GOLD_NOT_ENOUGH[lan] },
    
    //
    CIK_GOLD_NOT_ENOUGH: { code: _errorCode.CIK_TOKEN_NOT_ENOUGH, msg: i18n.CIK_TOKEN_NOT_ENOUGH[lan] },
    CIK_TOKEN_NOT_ENOUGH: { code: _errorCode.CIK_TOKEN_NOT_ENOUGH, msg: i18n.CIK_TOKEN_NOT_ENOUGH[lan] },
    CIK_TOTAL_NOT_ENOUGH: { code: _errorCode.CIK_TOTAL_NOT_ENOUGH, msg: i18n.CIK_TOTAL_NOT_ENOUGH[lan] },
    CIK_COUNT_NOT_ENOUGH: { code: _errorCode.CIK_COUNT_NOT_ENOUGH, msg: i18n.CIK_COUNT_NOT_ENOUGH[lan] },
    CIK_WRONG_CHANGE_ID: { code: _errorCode.CIK_WRONG_CHANGE_ID, msg: i18n.CIK_WRONG_CHANGE_ID[lan] },
    CIK_WRONG_ITEM: { code: _errorCode.CIK_WRONG_ITEM, msg: i18n.CIK_WRONG_ITEM[lan] },
    CIK_CANCEL_FAIL: { code: _errorCode.CIK_CANCEL_FAIL, msg: i18n.CIK_CANCEL_FAIL[lan] },
    
    //签到错误码(月签)
    SIGN_REPEAT: { code: _errorCode.SIGN_REPEAT, msg: i18n.SIGN_REPEAT[lan] },
    SIGN_FORBIDDEN1: { code: _errorCode.SIGN_FORBIDDEN1, msg: i18n.SIGN_FORBIDDEN1[lan] },
    SIGN_FORBIDDEN2: { code: _errorCode.SIGN_FORBIDDEN2, msg: i18n.SIGN_FORBIDDEN2[lan] },
    SIGN_DIAMOND_NOT_ENOUGH: { code: _errorCode.SIGN_DIAMOND_NOT_ENOUGH, msg: i18n.SIGN_DIAMOND_NOT_ENOUGH[lan] },
    SIGN_DAY_OUT_OF_RANGE: { code: _errorCode.SIGN_DAY_OUT_OF_RANGE, msg: i18n.SIGN_DAY_OUT_OF_RANGE[lan] },
    
    //领奖错误码
    MISSION_WRONG_QUEST_ID: { code: _errorCode.MISSION_WRONG_QUEST_ID, msg: i18n.MISSION_WRONG_QUEST_ID[lan] },
    MISSION_NULL: { code: _errorCode.MISSION_NULL, msg: i18n.MISSION_NULL[lan] },
    MISSION_NULL_RECORD: { code: _errorCode.MISSION_NULL_RECORD, msg: i18n.MISSION_NULL_RECORD[lan] },
    MISSION_DISATISFY: { code: _errorCode.MISSION_DISATISFY, msg: i18n.MISSION_DISATISFY[lan] },
    MISSION_GOTTON: { code: _errorCode.MISSION_GOTTON, msg: i18n.MISSION_GOTTON[lan] },
    MISSION_WRONG_ACTIVE_IDX: { code: _errorCode.MISSION_WRONG_ACTIVE_IDX, msg: i18n.MISSION_WRONG_ACTIVE_IDX[lan] },
    MISSION_ACTIVE_DISATISFY: { code: _errorCode.MISSION_ACTIVE_DISATISFY, msg: i18n.MISSION_ACTIVE_DISATISFY[lan] },
    MISSION_WRONG_TYPE: { code: _errorCode.MISSION_WRONG_TYPE, msg: i18n.MISSION_WRONG_TYPE[lan] },//0:成就，1:日常

    // 兑换码错误(从1201开始)
    CDKEY_INVALID: { code: _errorCode.CDKEY_INVALID, msg: i18n.CDKEY_INVALID[lan] },
    CDKEY_USED: { code: _errorCode.CDKEY_USED, msg: i18n.CDKEY_USED[lan] },
    CDKEY_REPEAT: { code: _errorCode.CDKEY_REPEAT, msg: i18n.CDKEY_REPEAT[lan] },
    CDKEY_EXPIRED: { code: _errorCode.CDKEY_EXPIRED, msg: i18n.CDKEY_EXPIRED[lan] },
    
    // 邮件错误(从1211开始)
    MAIL_WRONG_JSON_FORMAT: { code: _errorCode.MAIL_WRONG_JSON_FORMAT, msg: i18n.MAIL_WRONG_JSON_FORMAT[lan] },//邮件奖励字段reward不是一个标准的JSON字符串
    MAIL_REWARD_NOT_ARRAY: { code: _errorCode.MAIL_REWARD_NOT_ARRAY, msg: i18n.MAIL_REWARD_NOT_ARRAY[lan] },//邮件奖励字段reward解析后不是一个JSON数组
    MAIL_REWARD_INVALID: { code: _errorCode.MAIL_REWARD_INVALID, msg: i18n.MAIL_REWARD_INVALID[lan] },//邮件奖励中有物品表中不存在的物品
    
    // 女神错误码
    GODDESS_ID_ERROR: { code: _errorCode.GODDESS_ID_ERROR, msg: i18n.GODDESS_ID_ERROR[lan] },
    GODDESS_UNLOCK_IDX_ERROR: { code: _errorCode.GODDESS_UNLOCK_IDX_ERROR, msg: i18n.GODDESS_UNLOCK_IDX_ERROR[lan] },
    GODDESS_UNLOCK_NO_STONE: { code: _errorCode.GODDESS_UNLOCK_NO_STONE, msg: i18n.GODDESS_UNLOCK_NO_STONE[lan] },
    GODDESS_ALREADY_UNLOCKED: { code: _errorCode.GODDESS_ALREADY_UNLOCKED, msg: i18n.GODDESS_ALREADY_UNLOCKED[lan] },
    GODDESS_UP_DATA_WRONG: { code: _errorCode.GODDESS_UP_DATA_WRONG, msg: i18n.GODDESS_UP_DATA_WRONG[lan] },
    GODDESS_UP_LACK_GOLD: { code: _errorCode.GODDESS_UP_LACK_GOLD, msg: i18n.GODDESS_UP_LACK_GOLD[lan] },
    GODDESS_UP_LACK_DEBRIS: { code: _errorCode.GODDESS_UP_LACK_DEBRIS, msg: i18n.GODDESS_UP_LACK_DEBRIS[lan] },
    GODDESS_WEEKREWARD_WRONG_STATUS: { code: _errorCode.GODDESS_WEEKREWARD_WRONG_STATUS, msg: i18n.GODDESS_WEEKREWARD_WRONG_STATUS[lan] },
    GODDESS_WEEKREWARD_UNABLE: { code: _errorCode.GODDESS_WEEKREWARD_UNABLE, msg: i18n.GODDESS_WEEKREWARD_UNABLE[lan] },
    GODDESS_WEEKREWARD_ALREADY: { code: _errorCode.GODDESS_WEEKREWARD_ALREADY, msg: i18n.GODDESS_WEEKREWARD_ALREADY[lan] },
    GODDESS_WEEKREWARD_OUT_OF_RANKS: { code: _errorCode.GODDESS_WEEKREWARD_OUT_OF_RANKS, msg: i18n.GODDESS_WEEKREWARD_OUT_OF_RANKS[lan] },

    // 武器错误码
    WEAPON_INFO_NULL: { code: _errorCode.WEAPON_INFO_NULL, msg: i18n.WEAPON_INFO_NULL[lan] },
    WEAPON_UNLOCK_DIAMOND_NOT_ENOUGH: { code: _errorCode.WEAPON_UNLOCK_DIAMOND_NOT_ENOUGH, msg: i18n.WEAPON_UNLOCK_DIAMOND_NOT_ENOUGH[lan] },
    WEAPON_UNLOCK_MATERIAL_NOT_ENOUGH: { code: _errorCode.WEAPON_UNLOCK_MATERIAL_NOT_ENOUGH, msg: i18n.WEAPON_UNLOCK_MATERIAL_NOT_ENOUGH[lan] },
    WEAPON_LEVELUP_YUNSHI_NOT_ENOUGH: { code: _errorCode.WEAPON_LEVELUP_YUNSHI_NOT_ENOUGH, msg: i18n.WEAPON_LEVELUP_YUNSHI_NOT_ENOUGH[lan] },
    WEAPON_SKIN_DRAW_WRONG_SKIN_ID: { code: _errorCode.WEAPON_SKIN_DRAW_WRONG_SKIN_ID, msg: i18n.WEAPON_SKIN_DRAW_WRONG_SKIN_ID[lan] },
    
    // 玩家升级
    LEVELUP_EXP_NOT_ENOUGH: { code: _errorCode.LEVELUP_EXP_NOT_ENOUGH, msg: i18n.LEVELUP_EXP_NOT_ENOUGH[lan] },
    LEVELUP_EXP_TOO_MUCH: { code: _errorCode.LEVELUP_EXP_TOO_MUCH, msg: i18n.LEVELUP_EXP_TOO_MUCH[lan] },
    LEVELUP_MAX_LEVEL: { code: _errorCode.LEVELUP_MAX_LEVEL, msg: i18n.LEVELUP_MAX_LEVEL[lan] },
    
    // 商品购买
    BUY_WRONG_SHOP_ID: { code: _errorCode.BUY_WRONG_SHOP_ID, msg: i18n.BUY_WRONG_SHOP_ID[lan] },
    BUY_WRONG_GIFT_TIME: { code: _errorCode.BUY_WRONG_GIFT_TIME, msg: i18n.BUY_WRONG_GIFT_TIME[lan] },
    BUY_GIFT_COUNT_MAX: { code: _errorCode.BUY_GIFT_COUNT_MAX, msg: i18n.BUY_GIFT_COUNT_MAX[lan] },
    BUY_FUND_ALREADY: { code: _errorCode.BUY_FUND_ALREADY, msg: i18n.BUY_FUND_ALREADY[lan] },
    BUY_GIFT_CFG_ERR: { code: _errorCode.BUY_GIFT_CFG_ERR, msg: i18n.BUY_GIFT_CFG_ERR[lan] },
    
    // 订单相关
    ORDER_CREATE_FAIL: { code: _errorCode.ORDER_CREATE_FAIL, msg: i18n.ORDER_CREATE_FAIL[lan] },
    
    // 订单相关
    CHART_REWARD_FAIL: { code: _errorCode.CHART_REWARD_FAIL, msg: i18n.CHART_REWARD_FAIL[lan] },

    // 活动相关
    ACTIVE_CLICK_TOO_QUICK: { code: _errorCode.ACTIVE_CLICK_TOO_QUICK, msg: i18n.ACTIVE_CLICK_TOO_QUICK[lan] },

    // 激光
    LASER_CHEAT: { code: _errorCode.LASER_CHEAT, msg: i18n.LASER_CHEAT[lan] },

    // VIP
    VIP_DAILY_REWARD_GOTTEN: { code: _errorCode.VIP_DAILY_REWARD_GOTTEN, msg: "玩家今日已经领取了VIP每日奖励" },


    DATA_NULL_ERROR: { code: _errorCode.DATA_NULL_ERROR, msg: i18n.DATA_NULL_ERROR[lan] },

    //聊天
    CHAT_COST_ERROR: { code: _errorCode.CHAT_COST_ERROR, msg: i18n.CHAT_COST_ERROR[lan] },
    CHAT_FRIEND_ERROR: { code: _errorCode.CHAT_FRIEND_ERROR, msg: i18n.CHAT_FRIEND_ERROR[lan] },
    CHAT_REWARD_ERROR: { code: _errorCode.CHAT_REWARD_ERROR, msg: i18n.CHAT_REWARD_ERROR[lan] },
    CHAT_REWARD_LESS_ERROR: { code: _errorCode.CHAT_REWARD_LESS_ERROR, msg: i18n.CHAT_REWARD_LESS_ERROR[lan] },
    CHAT_FRIEND_ALREADY_ERROR: { code: _errorCode.CHAT_FRIEND_ALREADY_ERROR, msg: i18n.CHAT_FRIEND_ALREADY_ERROR[lan] },
    CHAT_FRIEND_GAME_ERROR: { code: _errorCode.CHAT_FRIEND_GAME_ERROR, msg: i18n.CHAT_FRIEND_GAME_ERROR[lan] },
};

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.ERROR_CODE = _errorCode;
exports.ERROR_OBJ = _errorObj;