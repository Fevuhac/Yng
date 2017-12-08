////////////////////////////////////////////////////////////////////////////////
// Account Update Gold Shopping
// 每日购买金币的次数(使用钻石换取)
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var AccountCommon = require('../common');
var ObjUtil = require('../../../buzz/ObjUtil');
var BuzzUtil = require('../../../utils/BuzzUtil');

var CacheAccount = require('../../../buzz/cache/CacheAccount');
var shop_gold_cfg = require('../../../../cfgs/shop_gold_cfg');
var vip_vip_cfg = require('../../../../cfgs/vip_vip_cfg');
var goddess_goddessup_cfg = require('../../../../cfgs/goddess_goddessup_cfg');
var common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');
var shop_shop_buy_type_cfg = require('../../../../cfgs/shop_shop_buy_type_cfg');

var dao_gold = require('../../dao_gold');

//==============================================================================
// const
//==============================================================================

var DEBUG = 0;
var ERROR = 1;

var TAG = "【update/gold_shopping】";

const GODDESS_PROPERTY = require('../../../buzz/buzz_goddess').GODDESS_PROPERTY;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = update;
exports.getAllGold = getAllGold;

//------------------------------------------------------------------------------
// Test Export
//------------------------------------------------------------------------------
exports.getOneGoddessAddRate = getOneGoddessAddRate;
exports.getAllGoddessAddRate = getAllGoddessAddRate;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 每日购买金币的次数(使用钻石换取).
 */
function update(pool, data, cb, account) {
    const FUNC = TAG + "update() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    let coinIdTarget = shop_shop_buy_type_cfg.BUY_GOLD_GAIN.id;
    let coinTypeTarget = shop_shop_buy_type_cfg.BUY_GOLD_GAIN.name;
    let coinIdCost = shop_shop_buy_type_cfg.BUY_GOLD_COST.id;
    let coinTypeCost = shop_shop_buy_type_cfg.BUY_GOLD_COST.name;
    
    var account_id = account['id'];
    var token = account['token'];
    var account_level = account['level'];
    var target_old = account[coinTypeTarget];
    var cost_old = account[coinTypeCost];
    var gold_shopping_old = account['gold_shopping'];

    var gold_shopping_new = data['gold_shopping'];

    // 新增字段: 表示本次购买金币的次数.
    var times = data['times'];
        
    if (DEBUG) console.log(FUNC + "gold_shopping_old: " + gold_shopping_old);
    if (DEBUG) console.log(FUNC + "gold_shopping_new: " + gold_shopping_new);
    if (DEBUG) console.log(FUNC + "times: " + times);
        
    // 数据验证1: 购买次数只能增加不能减少
    if (gold_shopping_new <= gold_shopping_old) {
        cb(new Error(FUNC + "玩家的金币购买次数只能增加，不能减少!(old:" + gold_shopping_old + ", new;" + gold_shopping_new + ")"));
        return;
    }
        
    // 数据验证2: 购买次数不能大于当前VIP等级允许的次数
    // TODO: 暂时将上限定为5
    if (gold_shopping_new > _getMaxBuyCount(account.vip)) {
        cb(new Error(FUNC + "你的VIP等级不足, 请升级VIP等级后再来购买金币!"));
        return;
    }
        
    var all_gold = getAllGold(gold_shopping_old, gold_shopping_new, times);
    if (all_gold == 0) {
        if (ERROR) {
            console.error("玩家购买金币的数额为0, OMG!!!");
            console.error("gold_shopping_old:", gold_shopping_old);
            console.error("gold_shopping_new:", gold_shopping_new);
            console.error("times:", times);
        }
    }
        
    // 计算金币增量和钻石减量
    var delta_target = 0;
    var delta_cost = 0;
    for (var i = 0; i < all_gold.length; i++) {
        var item = all_gold[i];
        //配置表有更新，现在取得的金币数量由gold_base决定
        //delta_target += item["item"];
        // 每一级获取的金币数量不同，由gold_level和account_level共同决定
        delta_target += item["gold_base"] + item["gold_level"] * account_level;
        delta_cost += item["needdiamond"];
    }

    // 根据解锁女神的属性来加成购买金币的数额
    // 策划已经确定, 需要遍历所有女神, 获取每个女神的等级并叠加金币加成属性
    var my_goddess = account["goddess"];
    var my_goddess_json = ObjUtil.str2Data(my_goddess);
    var addRate = getAllGoddessAddRate(my_goddess_json);

    delta_target = Math.round(delta_target * addRate);
    console.log(FUNC + "addRate:", addRate);
    console.log(FUNC + "delta_target:", delta_target);

    var target_new = target_old + delta_target;
    var cost_new = cost_old - delta_cost;
        
    if (DEBUG) console.log(FUNC + "cost_old: " + cost_old);
    if (DEBUG) console.log(FUNC + "delta_cost: " + delta_cost);
    if (DEBUG) console.log(FUNC + "cost_new: " + cost_new);
        
    // 数据验证2: 保证玩家有足够的钻石购买
    if (cost_new < 0) {
        cb(new Error("玩家的钻石不够，请先充值钻石再来购买金币!"));
        return;
    }
    
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------

    // account[coinTypeTarget] = delta_target;
    // account[coinTypeCost] = cost_new;

    console.log(FUNC + 'target_old:', target_old);
    console.log(FUNC + 'cost_old:', cost_old);

    BuzzUtil.addCoin(account, coinIdTarget, delta_target, function(err, res) {
        BuzzUtil.useCoin(account, coinIdCost, delta_cost, function (err, res) {

            console.log(FUNC + 'target_new:', target_new);
            console.log(FUNC + 'cost_new:', cost_new);

            account.gold_shopping = gold_shopping_old + times;
            account.commit();

            // yDONE: 金币数据记录
            // yDONE: 钻石数据记录

            let targetLog = {
                account_id: account_id,
                log_at: new Date(),
                gain: delta_target,
                cost: 0,
                total: target_new,
                scene: common_log_const_cfg.GOLD_BUY,
                nickname: 0,
            };
            switch(coinTypeTarget) {
                case "gold":
                    targetLog.duration = 0;
                    targetLog.level = account.level;
                    logGold.push(targetLog);
                break;
                case "pearl":
                    logDiamond.push(targetLog);
                break;
            }

            let costLog = {
                account_id: account_id,
                log_at: new Date(),
                gain: 0,
                cost: delta_cost,
                total: cost_new,
                scene: common_log_const_cfg.GOLD_BUY,
                nickname: 0,
            };
            switch(coinTypeCost) {
                case "gold":
                    costLog.duration = 0;
                    costLog.level = account.level;
                    account.cost = delta_cost;//其他消耗 购买钻石累加
                    account.commit();
                    logGold.push(costLog);
                break;
                case "pearl":
                    logDiamond.push(costLog);
                break;
            }

            cb(null, [account]);
            
        });
    });
}

/**
 * 获取所有女神的购买金币加成.
 * @param my_goddess_json 女神数据(json格式).
 */
function getAllGoddessAddRate(my_goddess_json) {
    var ret = 1;
    for (var idx in my_goddess_json) {
        var goddess = my_goddess_json[idx];
        // 解锁了的女神才去处理
        if (goddess.level > 0) {
            ret += getOneGoddessAddRate(goddess.id, goddess.level);
        }
    }
    // toFixed只能转换为字符串, 还需要parseFloat转换为浮点数.
    return parseFloat(ret.toFixed(1));
}

/**
 * 获取一个女神的购买金币加成.
 * @param id 女神id.
 * @param level 女神等级.
 */
function getOneGoddessAddRate(id, level) {
    for (var idx in goddess_goddessup_cfg) {
        var info = goddess_goddessup_cfg[idx];
        if (info.id == id && info.level <= level) {
            if (info.property == GODDESS_PROPERTY.GOLD_SHOPPING) {
                return info.value;
            }
        }
    }
    return 0;
}


//==============================================================================
// private
//==============================================================================

function _getMaxBuyCount(vipLevel) {
    return vip_vip_cfg[vipLevel].vip_gold_buy;
}

// 获得所有金币购买包
function getAllGold(gold_shopping_old, gold_shopping_new, times) {
    var ret = [];
    // 以服务器为准计算购买得到的金币包
    for (var i = gold_shopping_old + 1; i <= gold_shopping_old + times; i++) {
    // for (var i = gold_shopping_old + 1; i <= gold_shopping_new; i++) {
        for (var gold_idx = 0; gold_idx < shop_gold_cfg.length; gold_idx++) {
            var item = shop_gold_cfg[gold_idx];
            var id = item["id"];
            if (i == id) {
                ret.push(item);
                break;
            }
        }
        var max_item = shop_gold_cfg[shop_gold_cfg.length - 1];
        if (i > max_item.id) {
            ret.push(max_item);
        }
    }
    if (DEBUG) console.info("ret: ", ret);
    return ret;
}
