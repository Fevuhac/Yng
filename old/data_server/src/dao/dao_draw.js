////////////////////////////////////////////////////////////
// Draw Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var utils = require('../buzz/utils');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('../buzz/ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CommonUtil = require('../buzz/CommonUtil');

var buzz_draw = require('../buzz/buzz_draw');
var buzz_cst_game = require('../buzz/cst/buzz_cst_game');
var CstError = require('../buzz/cst/buzz_cst_error');

var ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;

var DaoUtil = require('./dao_utils');
var DaoReward = require('./dao_reward');

var _ = require('underscore');

var DaoCommon = require('./dao_common');
var dao_gold = require('./dao_gold');
var DaoReward = require('./dao_reward');
var AccountCommon = require('./account/common');

const cacheReader = require('../cache/cacheReader');
const cacheWriter = require('../cache/cacheWriter');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');

var common_const_cfg = require('../../cfgs/common_const_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');

var active_draw_cfg = require('../../cfgs/active_draw_cfg');// 抽奖奖品
var active_drawcost_cfg = require('../../cfgs/active_drawcost_cfg');// 抽奖花费

var item_item_cfg = require('../../cfgs/item_item_cfg');// 物品表
var string_strings_cfg = require('../../cfgs/string_strings_cfg');// 字符串表

var ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;
var ItemType = require('../buzz/pojo/Item').ItemType;


//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 1;
var ERROR = 1;

var TAG = "【dao_draw】";

var DRAW_TYPE = buzz_draw.DRAW_TYPE;
exports.DRAW_TYPE = DRAW_TYPE;

//整理抽奖原始配置数据
let DRAW_POOL = {};
for (let i = 0; i < active_draw_cfg.length; i ++) {
    let temp = active_draw_cfg[i];
    let drawtype = temp.drawtype;
    if (!DRAW_POOL[drawtype]) {
        DRAW_POOL[drawtype] = [];
    }
    DRAW_POOL[drawtype].push(temp);
}

/**
 * 抽一次奖
 * 抽奖前遍历所有金币（道具idi001）奖项，看其数量如果大于奖池，则不参与抽奖
 */
let _drawOnce = function (rewardPool, type) {
    let tpool = DRAW_POOL[type];
    let total = 0;
    let tps = [];
    for (let i = 0; i < tpool.length; i ++) {
        let td = tpool[i];
        if (td.item_id === 'i001' && td.item_count > rewardPool) {
            continue;
        }else{
            total += td.item_probability;
            tps.push(td);
        }
    }
    let rm = Math.floor(Math.random()*total);
    total = 0;
    for (let i = 0; i < tps.length; i ++) {
        let td = tps[i];
        total += td.item_probability;
        if (total >= rm) {
            return {item: [td.item_id, td.item_count], idx: td.item};;
        }
    }
    return null;
};

var DRAW_TIME_LIMIT_1 = 1;
var DRAW_TIME_LIMIT_MULTI = 5;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getDraw = getDraw;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取抽奖获得的奖品{item:?, item_id:?, item_count:?}.
 */
function getDraw(pool, data, cb) {
    const FUNC = TAG + "getDraw() --- ";

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "get_draw");

    var token = data.token;
    DaoCommon.checkAccount(pool, token, async function (error, account) {
        if (error) {
            cb(error);
            return;
        }

        var type = data.type;
        var times = data.times;
        var draw_pool = DRAW_POOL[type];
        var platform = account.platform;

        // 需要检查玩家的金币或钻石是否足够
        var cost = _getCost(type);
        console.log(FUNC + "cost:", cost);
        if (cost) {
            switch (cost.type) {
                case ItemType.GOLD:
                    let goldTimes = buzz_draw.getActualCostTimes(account, DRAW_TYPE.GOLD, times);
                    buzz_draw.useFree(account, DRAW_TYPE.GOLD, times - goldTimes);
                    cost.num = cost.num * goldTimes;
                    console.log(FUNC + "使用金币:", cost.num);
                    if (account.gold < cost.num) {
                        console.log(FUNC + "抽奖金币不足, 需要" + cost.num + "，实际拥有" + account.gold);
                        cb(ERROR_OBJ.GOLD_NOT_ENOUGH);
                        return;
                    }
                    
                    DEBUG && console.log(FUNC + "-----------------准备抽奖，消耗贡献抽水和奖池 = ", cost.num, cacheReader.bonuspool);
                    await cacheWriter.addCost(cost.num, account);//根据消耗，贡献奖池和抽水
                break;

                case ItemType.PEARL:
                    var pearlTimes = buzz_draw.getActualCostTimes(account, DRAW_TYPE.PEARL, times);
                    buzz_draw.useFree(account, DRAW_TYPE.PEARL, times - pearlTimes);
                    cost.num = cost.num * pearlTimes;
                    console.log(FUNC + "使用钻石:", cost.num);
                    if (account.pearl < cost.num) {
                        console.log(FUNC + "抽奖钻石不足, 需要" + cost.num + "，实际拥有" + account.pearl);
                        cb(ERROR_OBJ.DIAMOND_NOT_ENOUGH);
                        return;
                    }
                break;

                case ItemType.TOKENS:
                    let weaponSkinOwn = account.weapon_skin.own;
                    let weaponDrawId = type % 100;
                    console.log(FUNC + "weaponSkinOwn:", weaponSkinOwn);
                    console.log(FUNC + "weaponDrawId:", weaponDrawId);
                    if (!ArrayUtil.contain(weaponSkinOwn, weaponDrawId)) {
                        console.log(FUNC + "玩家没有皮肤" + weaponDrawId + "，抽奖被禁止");
                        cb(ERROR_OBJ.WEAPON_SKIN_DRAW_WRONG_SKIN_ID);
                        return;
                    }

                    var tokensTimes = buzz_draw.getActualCostTimes(account, type, times);
                    console.log(FUNC + "tokensTimes:", tokensTimes);
                    buzz_draw.useFree(account, type, times - tokensTimes);
                    cost.num = cost.num * tokensTimes;
                    console.log(FUNC + "使用代币:", cost.num);
                    /** 玩家拥有的代币数量. */
                    let tokensCount = account.package[cost.type][cost.item];

                    if (tokensCount < cost.num) {
                        console.log(FUNC + "抽奖代币不足, 需要" + cost.num + "，实际拥有" + tokensCount);
                        let lessTokens = cost.num - tokensCount;
                        console.log(FUNC + "代币还差" + lessTokens);
                        let diamondNeed = lessTokens * common_const_cfg.WEAPONS_DRAW_COST;
                        console.log(FUNC + "使用钻石补充不足的代币:", diamondNeed);
                        if (account.pearl < diamondNeed) {
                            cb(ERROR_OBJ.DIAMOND_NOT_ENOUGH);
                            return;
                        }
                        account.pearl = account.pearl - diamondNeed;
                        cost.num = tokensCount;
                    }
                    console.log(FUNC + "cost.num :", cost.num);

                break;
            }

            var items = [];
            var idx = [];
            let rewardPool = cacheReader.bonuspool;
            DEBUG && console.log(FUNC + "-----------------准备抽奖，当前奖池 = ", rewardPool);
            let rewardTotal = 0;
            for (var i = 0; i < times; i++) {
                let item = _drawOnce(rewardPool, type);
                if (!item) {
                    continue;
                }
                console.log(FUNC + 'item:', item);
                items.push(item.item);
                idx.push(item.idx);
                
                //只有中了金币才从奖池中扣除
                let itemID = item.item[0];
                if (itemID === 'i001') {
                    let tReward = item.item[1];
                    rewardTotal += tReward;
                    rewardPool -= tReward;
                }
            }
            rewardTotal > 0 && await cacheWriter.subReward(rewardTotal, account);
            DEBUG && console.log(FUNC + "-----------------完毕抽奖，当前奖池 = ", rewardPool);

            console.log(FUNC + "-----------------items:", items);
            console.log(FUNC + "-----------------idx:", idx);
            // 获取物品
            DaoReward.getReward(pool, account, items, function (err_get_reward, results_get_reward) {
                // AccountCommon.getAccountByToken(pool, token, function (err1, results1) {
                // AccountCommon.getAccountByUid(pool, token, function (err1, account) {

                var cost_items = [[cost.item, cost.num]];
                console.log(FUNC + "cost_items:", cost_items);
                // 消耗金币或钻石
                DaoReward.cost(pool, account, cost_items, function (err, ret) {
                    
                    var ret_account = account;
                    ret_account.idx = idx;
                    // 在total_draw中记录抽奖的次数.
                    buzz_draw.addDrawCount(account, type, times);
                    // 新增total_draw的返回.
                    ret_account.draw = {
                        free_draw:account.free_draw,
                        total_draw:account.total_draw,
                    };

                    cb(null, ret_account);


                    var player = account.nickname;
                    if(!player || player==""){
                        player == account.channel_account_name;
                        account.nickname = player;
                    }
                    if(!player || player==""){
                        player == account.tempname;
                        account.nickname = player;
                    }
                    account.commit();
                    var txt = player + '抽中了';
                    var params = [player];
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var item_name = _getNameFromItemId(item[0]);
                        var item_num = item[1];
                        if (i > 0) {
                            txt += "，";
                        }
                        txt += item_name + 'x' + item_num;
                        params.push(item_name);
                        params.push(item_num);
                    }
                    // 如果需要抽奖显示vip则解开注释.
                    // 确认这里不需要VIP
                    // params.push(account.vip);
                    var content = {
                        txt: txt,
                        times: 1,
                        params: params,
                        platform: platform,
                    };
                    buzz_cst_game.addBroadcastDraw(content);

                    // yDONE: 金币数据记录
                    var gain = 0;
                    var cost = 0;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var item_id = item[0];
                        var item_num = item[1];
                        if ('i001' == item_id) {
                            gain += item_num;
                        }
                    }
                    console.log(FUNC + "-----------------cost_items:", cost_items);
                    for (var i = 0; i < cost_items.length; i++) {
                        var item = cost_items[i];
                        var item_id = item[0];
                        var item_num = item[1];
                        console.log(FUNC + "item_name:", item_name);
                        if ('i001' == item_id) {
                            cost += item_num;
                        }
                    }
                    console.log(FUNC + "gain:", gain);
                    console.log(FUNC + "cost:", cost);
                    if (gain > 0 || cost > 0) {
                        var data = {
                            account_id: ret_account.id,
                            token: token,
                            total: ret_account.gold,
                            duration: 0,
                            group: [{
                                "gain": gain,
                                "cost": cost,
                                "scene": common_log_const_cfg.ACTIVE_DRAW,
                            }],
                        };
                        console.log(FUNC + "插入一条金币日志:", data);
                        dao_gold.addGoldLogCache(pool, data, function(err, res) {
                            if (err) return console.error(FUNC + "err:", err);
                        });
                    }
                    

                    // yDONE: 钻石数据记录
                    var diamondGain = 0;
                    var diamondCost = 0;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var item_id = item[0];
                        var item_num = item[1];
                        if ('i002' == item_id) {
                            diamondGain += item_num;
                        }
                    }
                    for (var i = 0; i < cost_items.length; i++) {
                        var item = cost_items[i];
                        var item_id = item[0];
                        var item_num = item[1];
                        if ('i002' == item_id) {
                            diamondCost += item_num;
                        }
                    }
                    if (diamondGain > 0 || diamondCost > 0) {
                        logDiamond.push({
                            account_id: ret_account.id,
                            log_at: new Date(),
                            gain: diamondGain,
                            cost: diamondCost,
                            total: ret_account.pearl,
                            scene: common_log_const_cfg.ACTIVE_DRAW,
                            nickname: 0,
                        });
                    }
                });
            });
        }
        else {
            console.error(FUNC + "type:", type);
            console.error(FUNC + "times:", times);
            console.error(FUNC + "uid:", account.id);
        }

    });

}


//==============================================================================
// private
//==============================================================================

function _getNameFromItemId(item_id) {
    return string_strings_cfg[item_item_cfg[item_id].name].cn;
}

function _getCost(type) {
    var item = _getCostItem(type);
    if (item) {
        var cost_type = _getItemTypeByKey(item[0]);
        var cost_num = item[1];
        return {
            item: item[0],
            type: cost_type,
            num: cost_num,
        };
    }
    else {
        return null;
    }
}

// 返回物品类型(Item.ItemType中有存放).
function _getItemTypeByKey(item_key) {
    for (var idx in item_item_cfg) {
        var item = item_item_cfg[idx];
        if (idx == item_key) {
            return item.type;
        }
    }
    console.log("item_key:", item_key);
    console.log("不该走到这里");
}

// 获取抽奖一次的花费, 返回一个item : ["i001",50000]或["i002",50].
function _getCostItem(type) {
    for (var idx in active_drawcost_cfg) {
        var cost = active_drawcost_cfg[idx];
        if (cost.drawtype == type) {
            return cost.item;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

function _prepare(data, cb) {

    var token = data['token'];
    var type = data['type'];
    var times = data['times'];

    if (!CommonUtil.isParamExist("dao_draw", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("dao_draw", type, "接口调用请传参数type(抽奖类型, 1.金币抽奖; 2.钻石抽奖)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_draw", times, "接口调用请传参数times(抽奖次数，1次或10次)", cb)) return false;

    if (times != DRAW_TIME_LIMIT_1 && times != DRAW_TIME_LIMIT_MULTI) {
        cb(ERROR_OBJ.DRAW_TIMES_ERR);
        return false;
    }

    return true;
}