////////////////////////////////////////////////////////////////////////////////
// Account Update Function
// 账户数据库更新函数
// updateAccount
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var BuzzUtil =                           require('../../utils/BuzzUtil');
var ObjUtil =                           require('../../buzz/ObjUtil');
var CstError =                          require('../../buzz/cst/buzz_cst_error');

var AccountCommon =                     require('./common');
var AccountUpdateMissionDailyReset =    require('./update/mission_daily_reset.js');
var AccountUpdateMissionOnlyOnce =      require('./update/mission_only_once.js');
var AccountUpdateHeartBeat =            require('./update/heartbeat.js');
var AccountUpdateAchievePoint =         require('./update/achieve_point.js');
var AccountUpdateGoldShopping =         require('./update/gold_shopping.js');
var AccountUpdateWeaponSkin =           require('./update/weapon_skin.js');
var AccountUpdateBonus =                require('./update/bonus.js');
var AccountUpdateVipGift =              require('./update/vip_gift.js');
var AccountUpdateWeaponEnergy =         require('./update/weapon_energy.js');
var AccountUpdatePirate =               require('./update/pirate.js');
var AccountUpdateGetCard =              require('./update/get_card.js');
var AccountUpdateFirstBuyGift =         require('./update/first_buy_gift.js');
var AccountUpdatePackage =              require('./update/package.js');
var AccountUpdateAll =                  require('./update/all.js');
var AccountUpdateGuide =                require('./update/guide.js');
var AccountUpdateActive =               require('./update/active.js');
var AccountUpdateRoipctTime =           require('./update/roipct_time.js');
var AccountUpdateDefendGoddess =        require('./update/defend_goddess.js');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../../routes/api_map');


//==============================================================================
// constant
//==============================================================================
const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

const UPDATE_TYPE = [
    "UPDATE_TYPE_LEVEL_AND_EXP", // 更新玩家经验值和等级
    "UPDATE_TYPE_LEVEL_MISSION", // 更新玩家关卡数据
    "UPDATE_TYPE_MISSION_DAILY_RESET", // 更新每日会重置的任务完成状态
    "UPDATE_TYPE_MISSION_ONLY_ONCE", // 更新只能进行一次的任务状态
    "UPDATE_TYPE_FIRST_BUY", // 更新玩家各档次首充状态
    "UPDATE_TYPE_ACTIVITY_GIFT", // 更新活动礼包购买状态
    "UPDATE_TYPE_HEART_BEAT", // 更新心跳
    "UPDATE_TYPE_ACHIEVE_POINT", // 更新成就点
    "UPDATE_TYPE_GOLD_SHOPPING", // 每日购买金币的次数
    "UPDATE_TYPE_WEAPON_SKIN", // 武器皮肤
    "UPDATE_TYPE_BONUS", // 奖金
    "UPDATE_TYPE_DROP", // 掉落物品更新
    "UPDATE_TYPE_COMEBACK", // 翻盘基金购买
    "UPDATE_TYPE_VIP_GIFT", // VIP礼包购买情况
    "UPDATE_TYPE_WEAPON_ENERGY", // 武器充能记录
    "UPDATE_TYPE_PIRATE", // 海盗任务
    "UPDATE_TYPE_GET_CARD", // 月卡每日领取
    "UPDATE_TYPE_FIRST_BUY_GIFT", // 首充大礼包是否已经领取
    "UPDATE_TYPE_PACKAGE", // 玩家的背包数据
    "UPDATE_TYPE_ALL", // 在退出游戏场景时调用，一次更新所有必要的数据
    "UPDATE_TYPE_GUIDE", // 记录玩家是否完成了新手教学任务
    "UPDATE_TYPE_ACTIVE", // 更新玩家的活动任务数据(传差量)
    "UPDATE_TYPE_ROIPCT_TIME", // 更新玩家的ROIPCT_TIME
    "UPDATE_TYPE_DEFEND_GODDESS", // 更新玩家的守卫女神数据
];

const UPDATE_TYPE_LEVEL_AND_EXP =       0; // 更新玩家经验值和等级
const UPDATE_TYPE_LEVEL_MISSION =       1; // 更新玩家关卡数据
const UPDATE_TYPE_MISSION_DAILY_RESET = 2; // 更新每日会重置的任务完成状态
const UPDATE_TYPE_MISSION_ONLY_ONCE =   3; // 更新只能进行一次的任务状态
const UPDATE_TYPE_FIRST_BUY =           4; // 更新玩家各档次首充状态
const UPDATE_TYPE_ACTIVITY_GIFT =       5; // 更新活动礼包购买状态
const UPDATE_TYPE_HEART_BEAT =          6; // 更新心跳
const UPDATE_TYPE_ACHIEVE_POINT =       7; // 更新成就点
const UPDATE_TYPE_GOLD_SHOPPING =       8; // 每日购买金币的次数
const UPDATE_TYPE_WEAPON_SKIN =         9; // 武器皮肤
const UPDATE_TYPE_BONUS =               10;// 奖金
const UPDATE_TYPE_DROP =                11;// 掉落物品更新
const UPDATE_TYPE_COMEBACK =            12;// 翻盘基金购买
const UPDATE_TYPE_VIP_GIFT =            13;// VIP礼包购买情况
const UPDATE_TYPE_WEAPON_ENERGY =       14;// 武器充能记录
const UPDATE_TYPE_PIRATE =              15;// 海盗任务
const UPDATE_TYPE_GET_CARD =            16;// 月卡每日领取
const UPDATE_TYPE_FIRST_BUY_GIFT =      17;// 首充大礼包是否已经领取
const UPDATE_TYPE_PACKAGE =             18;// 玩家的背包数据
const UPDATE_TYPE_ALL =                 19;// 在退出游戏场景时调用，一次更新所有必要的数据
const UPDATE_TYPE_GUIDE =               20;// 记录玩家是否完成了新手教学任务
const UPDATE_TYPE_ACTIVE =              21;// 更新玩家的活动任务数据(传差量)
const UPDATE_TYPE_ROIPCT_TIME =         22;// 更新玩家的ROIPCT_TIME
const UPDATE_TYPE_DEFEND_GODDESS =      23;// 更新玩家的守卫女神数据

var TAG = "【account/update】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.updateAccount = updateAccount;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(包括经验值(exp),...).
 */
function updateAccount(pool, data, account, cb) {
    const FUNC = TAG + "updateAccount() --- ";
    // var token = data['token'];
    var type = data['type'];
    _handleUpdate(pool, data, cb, type, account);
}

//==============================================================================
// private
//==============================================================================

function _handleUpdate(pool, data, cb, type, my_account) {
    const FUNC = TAG + "_handleUpdate() --- ";

    if (DEBUG) console.log(FUNC + "(account_id:" + my_account.id + ")(type:" + type + "):", getTypeName(type));

    if (type == UPDATE_TYPE_MISSION_DAILY_RESET) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_mission_daily_reset");
        AccountUpdateMissionDailyReset.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_MISSION_ONLY_ONCE) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_mission_only_once");
        AccountUpdateMissionOnlyOnce.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_HEART_BEAT) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_heart_beat");
        AccountUpdateHeartBeat.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_ACHIEVE_POINT) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_achieve_point");
        AccountUpdateAchievePoint.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_GOLD_SHOPPING) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_gold_shopping");
        AccountUpdateGoldShopping.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_WEAPON_SKIN) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_weapon_skin");
        AccountUpdateWeaponSkin.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_BONUS) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_bonus");
        AccountUpdateBonus.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_VIP_GIFT) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_vip_gift");
        AccountUpdateVipGift.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_WEAPON_ENERGY) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_weapon_energy");
        AccountUpdateWeaponEnergy.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_PIRATE) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_pirate");
        AccountUpdatePirate.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_GET_CARD) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_get_card");
        AccountUpdateGetCard.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_FIRST_BUY_GIFT) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_first_buy_gift");
        AccountUpdateFirstBuyGift.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_PACKAGE) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_package");
        AccountUpdatePackage.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_ALL) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_all");
        AccountUpdateAll.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_GUIDE) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_guide");
        AccountUpdateGuide.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_ACTIVE) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_active");
        AccountUpdateActive.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_ROIPCT_TIME) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_poipct_time");
        AccountUpdateRoipctTime.update(pool, data, cb, my_account);
    }
    else if (type == UPDATE_TYPE_DEFEND_GODDESS) {
        BuzzUtil.cacheLinkDataApi(data, "update_account_defend_goddess");
        AccountUpdateDefendGoddess.update(pool, data, cb, my_account);
    }
    else {
        cb(new Error("不支持的更新类型: " + type + ", 请联系服务器管理员更新代码..."));
    }
}

function getTypeName(type) {
    return UPDATE_TYPE[type];
}
