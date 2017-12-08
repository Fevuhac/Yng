////////////////////////////////////////
// BuzzUtil
// 业务处理工具集
//--------------------------------------
// 如何使用
// var BuzzUtil = require('src/utils/BuzzUtil');
// BuzzUtil.func(str, params...);
////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var CommonUtil = require('../buzz/CommonUtil');
var ObjUtil = require('../buzz/ObjUtil');
var DateUtil = require('./DateUtil');
var RandomUtil = require('./RandomUtil');
var StringUtil = require('./StringUtil');

var RedisUtil = require('./RedisUtil');
var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
//------------------------------------------------------------------------------
// 对象(POJO)
//------------------------------------------------------------------------------
var Reward = require('../buzz/pojo/Reward');
var ItemType = require('../buzz/pojo/Item').ItemType;
var ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;
var DropRecord = require('../buzz/pojo/DropRecord');

//------------------------------------------------------------------------------
// 业务(BUZZ)
//------------------------------------------------------------------------------
// var buzz_pearl = require('../buzz/buzz_pearl');

//------------------------------------------------------------------------------
// 数据库访问(DAO)
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
// var CachePearl = require('../buzz/cache/CachePearl');



//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

var item_item_cfg = require('../../cfgs/item_item_cfg');

var daily_quest_cfg = require('../../cfgs/daily_quest_cfg');
var daily_vitality_cfg = require('../../cfgs/daily_vitality_cfg');

var newweapon_weapons_cfg = require('../../cfgs/newweapon_weapons_cfg');
var newweapon_upgrade_cfg = require('../../cfgs/newweapon_upgrade_cfg');

var change_change_cfg = require('../../cfgs/change_change_cfg');

var goddess_goddess_cfg = require('../../cfgs/goddess_goddess_cfg');
var goddess_goddessup_cfg = require('../../cfgs/goddess_goddessup_cfg');
var goddess_rankreward_cfg = require('../../cfgs/goddess_rankreward_cfg');
var goddess_defend_cfg = require('../../cfgs/goddess_defend_cfg');

var treasure_treasure_cfg = require('../../cfgs/treasure_treasure_cfg');

var drop_droplist_cfg = require('../../cfgs/drop_droplist_cfg');
var drop_drop_cfg = require('../../cfgs/drop_drop_cfg');

var aquarium_petfish_cfg = require('../../cfgs/aquarium_petfish_cfg');
var aquarium_petup_cfg = require('../../cfgs/aquarium_petup_cfg');

var player_level_cfg = require('../../cfgs/player_level_cfg');

var shop_pearl_cfg = require('../../cfgs/shop_pearl_cfg');
var shop_card_cfg = require('../../cfgs/shop_card_cfg');
var shop_fund_cfg = require('../../cfgs/shop_fund_cfg');
var shop_gift_cfg = require('../../cfgs/shop_gift_cfg');
var vip_vip_cfg = require('../../cfgs/vip_vip_cfg');
var string_strings_cfg = require('../../cfgs/string_strings_cfg');
var social_guerdon_cfg = require('../../cfgs/social_guerdon_cfg');

var DEBUG = 0;
var ERROR = 1;
var TAG = "【BuzzUtil】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.checkParams = checkParams;
exports.cacheLinkDataApi = cacheLinkDataApi;
exports.cacheLinkAccountApi = cacheLinkAccountApi;
exports.cacheLinkAdminApi = cacheLinkAdminApi;
exports.getUidFromToken = getUidFromToken;

exports.putIntoPack = putIntoPack;
exports.removeFromPack = removeFromPack;
exports.getChange = getChange;
exports.getItemList = getItemList;
exports.getItemNum = getItemNum;
exports.getItemListByTid = getItemListByTid;
exports.getItemListFromDroplistId = getItemListFromDroplistId;

exports.getItemById = getItemById;
exports.getItemTypeById = getItemTypeById;
exports.getQuestById = getQuestById;
exports.getQuestListByConditionAndValue1 = getQuestListByConditionAndValue1;
exports.getVitalityByIdx = getVitalityByIdx;

exports.getGoddessById = getGoddessById;
exports.getGoddessUpByIdAndLevel = getGoddessUpByIdAndLevel;
exports.getRankrewardByRank = getRankrewardByRank;
exports.getTidByGidxAndWave = getTidByGidxAndWave;

exports.getWeaponByLevel = getWeaponByLevel;
exports.getWeaponUpgradeByLevel = getWeaponUpgradeByLevel;

exports.getOrderId = getOrderId;
exports.getChangeById = getChangeById;

exports.getPetfishFromId = getPetfishFromId;
exports.getPetupFromLevel = getPetupFromLevel;
exports.getRewardTimes4Petfish = getRewardTimes4Petfish;
exports.getDroplistIdFromTid = getDroplistIdFromTid;
exports.getDropInfoFromDropKey = getDropInfoFromDropKey;
exports.getDropServerLimit = getDropServerLimit;

exports.getPlayerLevelByLevel = getPlayerLevelByLevel;

exports.getShopPearlById = getShopPearlById;
exports.getShopCardById = getShopCardById;
exports.getShopFundById = getShopFundById;
exports.getShopGiftById = getShopGiftById;

exports.makeRewardList = _makeRewardList;
exports.getChangeFromItemList = getChangeFromItemList;

exports.getAchieveQuestIdByMission = getAchieveQuestIdByMission;
exports.getGoldQuestIdByMission = getGoldQuestIdByMission;
exports.getWeaponLevelQuestIdByMission = getWeaponLevelQuestIdByMission;
exports.getWeaponSkinQuestIdByMission = getWeaponSkinQuestIdByMission;

exports.getGoldRewardFromItemList = getGoldRewardFromItemList;
exports.getAchieveRewardFromItemList = getAchieveRewardFromItemList;

exports.checkDrop = _checkDrop;

exports.getVipGiveItem = getVipGiveItem;
exports.getCNName = getCNName;
exports.isCanGiveItem = isCanGiveItem;
exports.isNotice = isNotice;
exports.rewardPeopleCostByDiamonds = rewardPeopleCostByDiamonds;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function checkParams(input, params, hint, cb) {
    for (var i = 0; i < params.length; i++) {
        var param_name = params[i];
        var param = input[params[i]];
        if (!CommonUtil.isParamExist(hint, param, "接口调用请传参数" + param_name, cb)) return false;
    }
    return true;
}

/**
 * 记录连接状态到缓存中(data_api).
 */
function cacheLinkDataApi(data, api_name) {
    if (!data.uid && data.token) {
        data.uid = getUidFromToken(data.token);
    }
    // if (data.uid) {
    //     _cacheLink(data, api_name, api_map.DATA_API);
    // }
}

/**
 * 记录连接状态到缓存中(account_api).
 */
function cacheLinkAccountApi(data, api_name) {
    if (!data.uid && data.token) {
        data.uid = getUidFromToken(data.token);
    }
    if (data.uid) {
        _cacheLink(data, api_name, api_map.ACCOUNT_API);
    }
}

/**
 * 暂未使用
 * 记录连接状态到缓存中(admin_api).
 */
function cacheLinkAdminApi(data, api_name) {
    _cacheLink(data, api_name, api_map.ADMIN_API);
}

/**
 * 从token获取uid.
 */
function getUidFromToken(token) {
    return parseInt(token.split("_")[0]);
}

/**
 * 将物品放到背包中.
 * @param account
 * @param item_list 结构为[{item_id:?, item_num:?},{},...]
 */
function putIntoPack(req, account, item_list, cb) {
    var reward_list = _makeRewardList(item_list);

    buzz_reward.getReward(req, account, reward_list, function() {
        var reward = ObjUtil.str2Data(reward_list);
        cb(new Reward(reward));
    });
}

/**
 * 从背包中移除物品.
 * @param account
 * @param item_list 结构为[{item_id:?, item_num:?},{},...]
 */
function removeFromPack(req, account, item_list, cb) {
    var reward_list = _makeRewardList(item_list);

    buzz_reward.cost(req, account, reward_list, function() {
        var reward = ObjUtil.str2Data(reward_list);
        cb(new Reward(reward));
    });
};

/**
 * 获取改变量.
 * @param account 缓存中的用户信息.
 * @param item_list 玩家新获取的物品信息.
 */
function getChange(account, rewardInfo) {
    const FUNC = TAG + "getChange() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var change = {};

    var gold = rewardInfo.gold;
    var pearl = rewardInfo.pearl;
    var active_point = rewardInfo.active_point;
    var achieve_point = rewardInfo.achieve_point;
    var skill_inc = rewardInfo.skill;
    var debris_inc = rewardInfo.debris;
    var gift_inc = rewardInfo.gift;
    var tokens_inc = rewardInfo.tokens;
    var mix_inc = rewardInfo.mix;

    // DEBUG = 0;
    if (DEBUG) {
        console.log(FUNC + "gold:", gold);
        console.log(FUNC + "pearl:", pearl);
        console.log(FUNC + "active_point:", active_point);
        console.log(FUNC + "achieve_point:", achieve_point);
        console.log(FUNC + "skill_inc:", skill_inc);
        console.log(FUNC + "debris_inc:", debris_inc);
        console.log(FUNC + "gift_inc:", gift_inc);
        console.log(FUNC + "tokens_inc:", tokens_inc);
        console.log(FUNC + "mix_inc:", mix_inc);
    }

    // gold: 40000
    if (gold > 0) {
        change.gold = account.gold;
    }
    if (pearl > 0) {
        change.pearl = account.pearl;
    }
    if (active_point > 0) {
        change.active_point = account.mission_daily_reset.dailyTotal;
    }
    if (achieve_point > 0) {
        change.achieve_point = account.achieve_point;
    }
    // skill_inc: { '1': 3, '3': 3 }
    if (skill_inc && _.keys(skill_inc).length > 0) {
        change.skill = {};
        for (var idx in skill_inc) {
            change.skill[idx] = account.skill[idx];
            CacheAccount.addSkill(account.id, [{sid:idx, num:skill_inc[idx]}]);
        }
    }
    // debris_inc: { i603: 8, i702: 4, i623: 4 }
    if (debris_inc && _.keys(debris_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.DEBRIS]) change.package[ItemTypeC.DEBRIS] = {};
        for (var idx in debris_inc) {
            if (change.package && change.package[ItemTypeC.DEBRIS]
                && account.package && account.package[ItemTypeC.DEBRIS]) {
                change.package[ItemTypeC.DEBRIS][idx] = account.package[ItemTypeC.DEBRIS][idx];
            }
        }
    }
    if (gift_inc && _.keys(gift_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.GIFT]) change.package[ItemTypeC.GIFT] = {};
        for (var idx in gift_inc) {
            if (change.package && change.package[ItemTypeC.GIFT]
                && account.package && account.package[ItemTypeC.GIFT]) {
                change.package[ItemTypeC.GIFT][idx] = account.package[ItemTypeC.GIFT][idx];
            }
        }
    }
    if (tokens_inc && _.keys(tokens_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.TOKENS]) change.package[ItemTypeC.TOKENS] = {};
        for (var idx in tokens_inc) {
            if (change.package && change.package[ItemTypeC.TOKENS]
                && account.package && account.package[ItemTypeC.TOKENS]) {
                change.package[ItemTypeC.TOKENS][idx] = account.package[ItemTypeC.TOKENS][idx];
            }
        }
    }
    if (mix_inc && _.keys(mix_inc).length > 0) {
        if (!change.package) change.package = {};
        if (!change.package[ItemTypeC.MIX]) change.package[ItemTypeC.MIX] = {};
        for (var idx in mix_inc) {
            if (change.package && change.package[ItemTypeC.MIX]
                && account.package && account.package[ItemTypeC.MIX]) {
                change.package[ItemTypeC.MIX][idx] = account.package[ItemTypeC.MIX][idx];
            }
        }
    }
    if (DEBUG) console.log(FUNC + "change:", change);
    DEBUG = 0;

    return change;
}

/**
 * 获取物品列表
 * @param items 配置表中的物品数组 [["i016",1],...]
 * @return [{item_id:"i106", item_num:1},...]
 */
function getItemList(items) {
    var item_list = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item_list.push({
            item_id: item[0],
            item_num: item[1],
        });
    }
    return item_list;
}

/**
 * 从treasure_id返回item_list.
 */
function getItemListByTid(account, tid) {
    var drop_list = _getDropListFromTreasureId(account, tid);
    var item_list = _getItemList(drop_list);
    return item_list;
}

/**
 * 从droplist_key返回item_list.
 */
function getItemListFromDroplistId(account, droplist_key, dropcount, pool) {
    var drop_list = _getDropListFromDroplistId(account, droplist_key, dropcount, pool);
    var item_list = _getItemList(drop_list);
    return item_list;
}

/**
 * 获取玩家背包中某物品拥有数量.
 * @param account 玩家数据.
 * @param type 物品类型.
 * @param id 物品ID.
 */
function getItemNum(account, type, id) {
    const FUNC = TAG + "getItemNum() --- ";
    if (DEBUG)console.log(FUNC + "type:", type);
    if (DEBUG)console.log(FUNC + "id:", id);
    if (ItemType.SKILL == type) {
        if (DEBUG)console.log(FUNC + "技能物品");
        var skill_id = getItemById(id).id;
        if (null == account.skill) {
            if (DEBUG)console.log(FUNC + "null == account.skill");
            return 0;
        }
        if (null == account.skill[skill_id]) {
            if (DEBUG)console.log(FUNC + "null == account.skill[skill_id]");
            return 0;
        }
        if (DEBUG)console.log(FUNC + "account.skill[skill_id]:", account.skill[skill_id]);
        return account.skill[skill_id];
    }
    else {
        if (null == account.package) {
            return 0;
        }
        if (null == account.package[type]) {
            return 0;
        }
        if (null == account.package[type][id]) {
            return 0;
        }
        return account.package[type][id];
    }
}

function getItemById(item_key) {
    return item_item_cfg[item_key];
}

function getItemTypeById(item_key) {
    return item_item_cfg[item_key].type;
}

function getQuestById(quest_id) {
    for (var idx in daily_quest_cfg) {
        var quest = daily_quest_cfg[idx];
        if (quest_id == quest.id) {
            return quest;
        }
    }
    return null;
}

/**
 * 由两个条件决定一组相同的任务
 */
function getQuestListByConditionAndValue1(condition, value1) {
    var ret = [];
    for (var idx in daily_quest_cfg) {
        var quest = daily_quest_cfg[idx];
        if (condition == quest.condition && value1 == quest.value1) {
            ret.push(quest.id);
        }
    }
    return ret;
}

/**
 * 根据索引获取活跃值领奖数据.
 */
function getVitalityByIdx(idx) {
    if (idx < 0 || idx >= daily_vitality_cfg.length) {
        return null;
    }
    return daily_vitality_cfg[idx];
}

/**
 * 从女神ID获取女神的数据
 */
function getGoddessById(id) {
    for (var idx in goddess_goddess_cfg) {
        var goddess = goddess_goddess_cfg[idx];
        if (id == goddess.id) {
            return goddess;
        }
    }
    return null;
}

/**
 * 从女神ID和等级获取女神的升级数据.
 */
function getGoddessUpByIdAndLevel(id, level) {
    for (var idx in goddess_goddessup_cfg) {
        var goddessup = goddess_goddessup_cfg[idx];
        if (id == goddessup.id && level == goddessup.level) {
            return goddessup;
        }
    }
    return null;
}

/**
 * 从保卫女神的排名获取奖励数组.
 * @param rank 玩家的排名
 */
function getRankrewardByRank(rank, max_wave) {
    for (var i = 0; i < goddess_rankreward_cfg.length; i++) {
        var rankreward_info = goddess_rankreward_cfg[i];
        var interval = rankreward_info.interval;
        // interval为INT
        if (i > 0) {
            var rankreward_info_last = goddess_rankreward_cfg[i - 1];
            var interval_last = rankreward_info_last.interval;
            if (rank >= interval_last && rank <= interval) {
                // var weekreward = rankreward_info.weekreward;
                return getWeekRewardByMaxWave(rankreward_info, i, max_wave);
            }
        }
        else {
            if (rank <= interval) {
                return getWeekRewardByMaxWave(rankreward_info, i, max_wave);
            }
        }
        // // interval为数组
        // if (rank >= interval[0] && rank <= interval[1]) {
        //     var weekreward = rankreward_info.weekreward;
        //     return weekreward;
        // }
    }
    return [];

    function getWeekRewardByMaxWave(rankreward_info, i, max_wave) {
        var limit = rankreward_info.limit;
        if (max_wave < limit) {
            if (i >= goddess_rankreward_cfg.length - 1) {
                return [];
            }
            else {
                rankreward_info = goddess_rankreward_cfg[i + 1];
                return getWeekRewardByMaxWave(rankreward_info, i + 1, max_wave);
            }
        }
        return rankreward_info.weekreward;
    }
}

/**
 * 从波数和女神索引获取宝箱ID.
 */
function getTidByGidxAndWave(gidx, wave) {
    var defend = getDefendByWave(wave);
    if (null != defend) {
        return defend.treasure[gidx];
    }
    return null;
}

function getDefendByWave(wave) {
    for (var idx in goddess_defend_cfg) {
        var defend = goddess_defend_cfg[idx];
        if (defend.id == wave) {
            return defend;
        }
    }
    return null;
}

var weaponLevelList = [];
if (weaponLevelList.length == 0) {
    for (var idx in newweapon_upgrade_cfg) {
        var weapon = newweapon_upgrade_cfg[idx];
        weaponLevelList.push(weapon.weaponlevel);
    }
}

/**
 * 根据炮的倍率(等级)返回对应炮的信息.
 */
function getWeaponByLevel(level) {
    for (var idx in newweapon_upgrade_cfg) {
        var weapon = newweapon_upgrade_cfg[idx];
        if (weapon.weaponlevel == level) {
            return newweapon_upgrade_cfg[idx];
        }
    }
    return null;
}

/**
 * 获得武器升级到下一级的武器数据.
 */
function getWeaponUpgradeByLevel(level) {
    var next_level = level;
    for (var i = 0; i < weaponLevelList.length; i++) {
        if (weaponLevelList[i] == level) {
            if (i + 1 < weaponLevelList.length) {
                next_level = weaponLevelList[i + 1];
            }
            else {
                // 已经升级到最大等级, 不能再升级了
                return null;
            }
        }
    }
    return getWeaponByLevel(next_level);
}

function getOrderId(sn) {
    return DateUtil.format(new Date(), "yyyyMMdd") + fillNumber(sn, '0', 10);
}

function getChangeById(cid) {
    for (var idx in change_change_cfg) {
        var change = change_change_cfg[idx];
        if (cid == change.id) {
            return change;
        }
    }
    return null;
}

/**
 * 获取宠物鱼数据.
 */
function getPetfishFromId(id) {
    for (var idx in aquarium_petfish_cfg) {
        var petfish = aquarium_petfish_cfg[idx];
        if (id == petfish.id) {
            return petfish;
        }
    }
    return null;
}

/**
 * 获取宠物鱼升级数据.
 */
function getPetupFromLevel(lv) {
    for (var idx in aquarium_petup_cfg) {
        var petup = aquarium_petup_cfg[idx];
        if (lv == petup.level) {
            return petup;
        }
    }
    return null;
}

/**
 * petfish:
 * id
 * lefttime
 * level
 * starttime
 * state
 * time
 */
function getRewardTimes4Petfish(petfish, goddess_id, goddess_lv) {
    var petfish_id = petfish.id;
    var petfish_lv = petfish.level;
    var petfish = getPetfishFromId(petfish_id);
    var petup = getPetupFromLevel(petfish_lv);
    var ret = 0;
    if (petfish != null && petup != null) {
        var probase = petfish.probase;
        var progoldadd = petup.progoldadd;
        var progoddess = 0;
        // 女神加成(等级和阵营判断)
        if (goddess_lv >= 9) {
            var goddess = getGoddessById(goddess_id);
            var goddess_camp = goddess.camp;
            var petfish_camp = petfish.camp;
            if (goddess_camp == petfish_camp) {
                var goddessup = getGoddessUpByIdAndLevel(goddess_id, 9);
                progoddess = goddessup.value;
            }
        }
        ret = probase + progoldadd + progoddess;
    }
    return ret;
}

/**
 * 获取掉落列表(通过treasure_id查询).
 */
function getDroplistIdFromTid(tid) {
    for (var idx in treasure_treasure_cfg) {
        var treasure_info = treasure_treasure_cfg[idx];
        if (treasure_info.id == tid) {
            return treasure_info.dropid;
        }
    }
    return null;
}

function getDropInfoFromDropKey(drop_key) {
    return drop_drop_cfg[drop_key];
}

/**
 * 遍历drop_drop_cfg, 筛选出需要全服限制的数据(count_limit != [0])
 */
function getDropServerLimit() {
    const FUNC = TAG + "getDropServerLimit() --- ";
    var ret = {};
    for (drop_key in drop_drop_cfg) {
        var drop_info = drop_drop_cfg[drop_key];
        var limit_type = drop_info.limit_type;
        var limit_count = drop_info.limit_count;
        // console.log(FUNC + "limit_count:", limit_count);
        if (limit_count.length >= 1 && limit_count[0] > 0) {
            ret[drop_key] = drop_info;
        }
    }
    return ret;
}

function getChangeFromItemList(account, item_list) {
    var reward_list = _makeRewardList(item_list);
    var reward = ObjUtil.str2Data(reward_list);
    var reward_info = new Reward(reward);
    var change = getChange(account, reward_info);
    return change;
}

//==============================================================================
// private
//==============================================================================
function _cacheLink(data, api_name, api_type) {
    var api_info = api_type[api_name];
    var uid = data.uid;
    var time = new Date().getTime();
    if (api_info.record) {
        CacheLink.push({
            uid: uid,
            linked_at: time,
            api: api_info.flag,
        });
        RedisUtil.hset(PAIR.UID_LAST_ONLINE_TIME, data.uid,time);
    }
}

function _makeRewardList(item_list) {
    var reward_list = [];
    for (var i = 0; i < item_list.length; i++) {
        var item = item_list[i];
        var reward = [item.item_id, item.item_num];
        reward_list.push(reward);
    }
    return reward_list;
}

function fillNumber(input, fill_char, total_length) {
    var cur_length = StringUtil.strLen("" + input);
    if (DEBUG)console.log('total_length: ' + total_length);
    if (DEBUG)console.log('cur_length: ' + cur_length);
    for (var i = 0; i < total_length - cur_length; i++) {
        input = fill_char + input;
    }
    if (DEBUG)console.log('input: ' + input);
    return input;
}

/**
 * 获取掉落表(通过treasure_id查询).
 */
function _getDropListFromTreasureId(account, bid) {
    var drop_list = [];
    for (var idx in treasure_treasure_cfg) {
        var treasure_info = treasure_treasure_cfg[idx];
        if (treasure_info.id == bid) {
            var droplist_key = treasure_info.dropid;
            var dropcount = treasure_info.dropcount;
            drop_list = _getDropListFromDroplistId(account, droplist_key, dropcount);
        }
    }
    return drop_list;
}

/**
 * 获取掉落表(通过droplist_key查询).
 */
function _getDropListFromDroplistId(account, droplist_key, dropcount, pool) {
    const FUNC = TAG + "_getDropListFromDroplistId() --- ";
    var drop_list = [];
    var drop_info = drop_droplist_cfg[droplist_key];
    if (drop_info) {
        for (var i = 0; i < dropcount; i++) {
            drop_list.push(RandomUtil.randomDrop(drop_info));
        }
        drop_list = _checkDrop(account, drop_list, pool);
        return drop_list;
    }
    else {
        console.error(FUNC + "drop_info为空, droplist_key:", droplist_key);
        return null;
    }
}

/**
 * 验证掉落是否成功.
 */
function _checkDrop(account, drop_list, pool) {
    var ret = [];
    // 验证drop_list中的每一项是否掉落成功
    for (var i = 0; i < drop_list.length; i++) {
        var drop_arr = drop_list[i];
        var new_drop_arr = [];
        for (var j = 0; j < drop_arr.length; j++) {
            var drop_key = drop_arr[j];
            var drop_info = drop_drop_cfg[drop_key];
            drop_info.drop_key = drop_key;
            if (account) {
                // 在drop_reset和drop_once中增加掉落进度
                var account_drop = _getAccountDrop(account, drop_info);
                // 没有记录则初始化
                if (!account_drop[drop_key]) {
                    account_drop[drop_key] = 0;
                }

                // TODO: 先判断全服掉落限制
                if (canServerDrop(drop_info, account.platform)) {
                    var probability = _getProbability(drop_info, account_drop, drop_key);
                    var random = RandomUtil.randomInt(100000);
                    if (random < probability) {
                        new_drop_arr.push(drop_arr[j]);
                        cutServerDrop(drop_info, account.platform, pool);
                    }
                }
                account_drop[drop_key]++;
            }
        }
        if (new_drop_arr.length > 0) {
            ret.push(new_drop_arr);
        }
    }
    return ret;
}

const LIMIT_TYPE = {
    DAILY: 1,
    HOUR: 2,
};

/**
 * 服务器是否还能掉落，需要负载服来进行统一数据支持
 */
function canServerDrop(drop_info, platform) {
    const FUNC = TAG + "canServerDrop() --- ";
    if (isDropServerLimit(drop_info)) {
        // console.log(FUNC + "drop_info:", drop_info);
        if (DEBUG)console.log(FUNC + "platform:", platform);
        var key = makeDropKey(drop_info, platform);
        var current_value = DropRecord.getCurrentValue(key);
        return current_value > 0;
    }
    else {
        return true;
    }
}

function makeDropKey(drop_info, platform) {
    return drop_info.drop_key + "_" + DateUtil.getHourIdx() + "_" + platform;
}

function isDropServerLimit(drop_info) {
    const FUNC = TAG + "isDropServerLimit() --- ";
    var limit_count = drop_info.limit_count;
    var limit_type = drop_info.limit_type;
    if (limit_type == LIMIT_TYPE.DAILY) {
        if (DEBUG) console.log(FUNC + "全服限制按天算");
    }
    else if (limit_type == LIMIT_TYPE.HOUR) {
        if (DEBUG) console.log(FUNC + "全服限制按小时算");
    }
    return !(limit_count.length == 1 && limit_count[0] == 0);
}

function cutServerDrop(drop_info, platform, pool) {
    const FUNC = TAG + "cutServerDrop() --- ";
    if (isDropServerLimit(drop_info)) {
        if (ERROR) console.log(FUNC + "是全服限制的掉落"); 
        var key = makeDropKey(drop_info, platform);
        DropRecord.cutServerDrop(key);
        // 更新数据库的值并将返回值用于重置DropRecord的值
        if (pool) {
            if (DEBUG) console.log(FUNC + "更新数据库的值并将返回值用于重置DropRecord的值"); 
            dao_drop.cutServerDrop(pool, key, function(err, results) {

            });
        }
        else {
            if (ERROR) console.log(FUNC + "pool == null, 无法更新数据库的全服掉落限制值"); 
        }
    }
    else {
        if (ERROR) console.log(FUNC + "不是全服限制的掉落"); 
    }
}

/**
 * 获取账号掉落记录(重置或不重置).
 */
function _getAccountDrop(account, drop) {
    // 不重置
    if (0 == drop.reset) {
        return account.drop_once;
    }
    // 重置
    if (1 == drop.reset) {
        return account.drop_reset;
    }
}

/**
 * 获取当前掉落的概率(100000为分母).
 */
function _getProbability(drop, account_drop, drop_key) {
    var drop_idx = account_drop[drop_key];
    var item_probability = drop.item_probability;
    if (drop_idx < item_probability.length) {
        return item_probability[drop_idx];
    }
    else {
        return item_probability[item_probability.length - 1];
    }
}

/**
 * 获取物品表.
 */
function _getItemList(drop_list) {
    var item_list = [];
    for (var i = 0; i < drop_list.length; i++) {
        var drop_arr = drop_list[i];
        for (var j = 0; j < drop_arr.length; j++) {
            var drop_key = drop_arr[j];
            var drop_info = drop_drop_cfg[drop_key];
            item_list.push({
                item_id: drop_info.item_id,
                item_num: drop_info.item_num,
                drop_count: drop_info.drop_count,
            });
        }
    }
    return item_list;
}

/**
 * 根据等级获得相应的玩家信息.
 */
function getPlayerLevelByLevel(level) {
    for (var i = 0; i < player_level_cfg.length; i++) {
        var player_level = player_level_cfg[i];
        if (player_level.level == level) {
            return player_level;
        }
    }
    return null;
}

/**
 * 获取购买钻石的相关信息.
 */
function getShopPearlById(id) {
    for (var idx in shop_pearl_cfg) {
        var shop_pearl = shop_pearl_cfg[idx];
        if (shop_pearl.id == id) {
            return shop_pearl;
        }
    }
    return null;
}

/**
 * 获取购买月卡的相关信息.
 */
function getShopCardById(id) {
    for (var idx in shop_card_cfg) {
        var shop_card = shop_card_cfg[idx];
        if (shop_card.id == id) {
            return shop_card;
        }
    }
    return null;
}

/**
 * 获取购买翻盘基金的相关信息.
 */
function getShopFundById(id) {
    for (var idx in shop_fund_cfg) {
        var shop_fund = shop_fund_cfg[idx];
        if (shop_fund.id == id) {
            return shop_fund;
        }
    }
    return null;
}

/**
 * 获取商城礼包相关信息.
 */
function getShopGiftById(id) {
    for (var idx in shop_gift_cfg) {
        var shop_gift = shop_gift_cfg[idx];
        if (shop_gift.id == id) {
            return shop_gift;
        }
    }
    return null;
}

/** 成就任务类型 */
const MISSON_TYPE = {
    ACHIEVE: 2170,
    GOLD: 2090,
    WEAPON_LEVEL: 2040,
    WEAPON_SKIN: 2060,
};

/**
 * 从任务进度中获取指定类型的任务ID
 * @param mission 任务对象
 * @param type 类型
 */
function getQuestIdByMission(mission, type) {
    for (var id in mission) {
        if (Math.floor(id / 100) == type) {
            return id;
        }
    }
    // 不能返回null, 如果mission中没有则需要初始化
    var init_mission_id = type + "00";
    mission[init_mission_id] = 0;
    return init_mission_id;
}

/** 从任务进度中获取成就点累加任务的任务ID. */
function getAchieveQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.ACHIEVE);
}

/** 从任务进度中获取金币累加任务的任务ID. */
function getGoldQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.GOLD);
}

/** 从任务进度中获取武器升级任务的任务ID. */
function getWeaponLevelQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.WEAPON_LEVEL);
}

/** 从任务进度中获取武器皮肤任务的任务ID. */
function getWeaponSkinQuestIdByMission(mission) {
    return getQuestIdByMission(mission, MISSON_TYPE.WEAPON_SKIN);
}

/**
 * 获取金币奖励数
 */
function getGoldRewardFromItemList(item_list) {
    for (var i in item_list) {
        var item_id = item_list[i].item_id;
        if (item_id == "i001") {
            return item_list[i].item_num;
        }
    }
    return 0;
}

/**
 * 获取成就点奖励数
 */
function getAchieveRewardFromItemList(item_list) {
    for (var i in item_list) {
        var item_id = item_list[i].item_id;
        if (item_id == "i103") {
            return item_list[i].item_num;
        }
    }
    return 0;
}

/**
 * 查看是否拥有送礼物权限
 */
function getVipGiveItem(vip) {
    const FUNC = TAG + "getVipGiveItem() --- ";
    if(!vip) {
        return 0;
    }
    return vip_vip_cfg[vip].vip_giveItem;
}

/**
 * 查看string对应的中文名称
 */
function getCNName(item_name_string_id) {
    const FUNC = TAG + "getCNName() --- ";
    if(!item_name_string_id)return;
    return string_strings_cfg[item_name_string_id].cn;
}

/**
 * 查看物品是否可以打赏
 * @param item
 */
function isCanGiveItem(item) {
    if (!item)return;
    for (var i = 0; i < social_guerdon_cfg.length; i++) {
        for (var j = 0; j < social_guerdon_cfg[i].reward.length; j++) {
            var itemid = social_guerdon_cfg[i].reward[j][0];
            var num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 打赏物品是否需要公告
 * @param item
 */
function isNotice(item) {
    if (!item)return;
    for (var i = 0; i < social_guerdon_cfg.length; i++) {
        for (var j = 0; j < social_guerdon_cfg[i].notice.length; j++) {
            var itemid = social_guerdon_cfg[i].reward[j][0];
            var num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return social_guerdon_cfg[i].notice[j]==1;
            }
        }
    }
    return false;
}

/**
 * 打赏物品消耗钻石
 * @param item
 */
function rewardPeopleCostByDiamonds(item) {
    if (!item)return;
    for (var i = 0; i < social_guerdon_cfg.length; i++) {
        for (var j = 0; j < social_guerdon_cfg[i].notice.length; j++) {
            var itemid = social_guerdon_cfg[i].reward[j][0];
            var num = social_guerdon_cfg[i].reward[j][1];
            if (item[0][0] == itemid && item[0][1] == num) {
                return social_guerdon_cfg[i].price[j];
            }
        }
    }
    return false;
}