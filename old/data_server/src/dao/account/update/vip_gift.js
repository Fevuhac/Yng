////////////////////////////////////////////////////////////////////////////////
// Account Update Vip Gift
// 更新VIP礼包购买状态
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var StringUtil = require('../../../utils/StringUtil');
var ArrayUtil = require('../../../utils/ArrayUtil');
var BuzzUtil = require('../../../utils/BuzzUtil');
var ObjUtil = require('../../../buzz/ObjUtil');
var CstError = require('../../../buzz/cst/buzz_cst_error');

var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var vip_vip_cfg = require('../../../../cfgs/vip_vip_cfg');
var item_item_cfg = require('../../../../cfgs/item_item_cfg');
var common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');
var shop_shop_buy_type_cfg = require('../../../../cfgs/shop_shop_buy_type_cfg');

var DaoGold = require('../../dao_gold');
var DaoPearl = require('../../dao_pearl');
var DaoSkill = require('../../dao_skill');


//==============================================================================
// const
//==============================================================================
const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;
var TAG = "【update/vip_gift】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL vip_gift.update()");

    let coinId = shop_shop_buy_type_cfg.BUY_VIPGIFT.id;
    let coinType = shop_shop_buy_type_cfg.BUY_VIPGIFT.name;
    
    var account_id = my_account['id'];
    let uid = account_id;
    var token = my_account['token'];
    
    var vip_gift = ObjUtil.str2Data(data['vip_gift']);

    var vip_level = vip_gift['vip'];
    if (vip_level < 1) {
        cb(new Error("VIP等级必须大于0"));
        return;
    }
    if (DEBUG) console.log("vip_level: " + vip_level);

    var vip_info = vip_vip_cfg[vip_level];
    if (DEBUG) console.log("vip_info: ", vip_info);

    var gift_price = vip_info['gift_price2'];// 消耗钻石，更新数据库
    var gift_item = vip_info['gift_item'];
    if (DEBUG) console.log(gift_item);

    for (var i = 0; i < gift_item.length; i++) {
        var item_name = gift_item[i][0];
        var item_amount = gift_item[i][1];
        if (DEBUG) console.log(i + ")item_name: " + item_name);
        if (DEBUG) console.log("  item_amount: " + item_amount);
    }

    var vip_level_old = my_account['vip'];
    var coin_old = my_account[coinType];
    var vip_gift_old = my_account['vip_gift'];
    var vip_gift_old_json = [];
    if (vip_gift_old != null && vip_gift_old != "") {
        if (vip_gift_old == "[object Object]") {
            vip_gift_old_json = [];
        }
        else {
            var vip_gift_old = StringUtil.trim(vip_gift_old, ",");
            vip_gift_old_json = ObjUtil.str2Data("[" + vip_gift_old + "]");//数组
        }
    }
    console.log('vip_gift_old: ', vip_gift_old);
    console.log('vip_gift_old_json: ', vip_gift_old_json);
            
    // 数据有效性验证
    if (ArrayUtil.contain(vip_gift_old_json, vip_level)) {
        var extraErrInfo = {debug_info: 'vip_gift.update()-玩家已经购买了此等级VIP的礼包，请勿重复购买!'};
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.REPEAT_OPERATION));
        return;
    }
            
    if (vip_level_old < vip_level) {
        var extraErrInfo = { debug_info: 'vip_gift.update()-不允许购买高于玩家VIP等级的物品，如需购买，请先升级VIP!' };
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.VIP_NOT_ENOUFH));
        return;
    }
            
    if (coin_old < gift_price) {
        var extraErrInfo = { debug_info: 'vip_gift.update()-钻石数量不足，请先充值钻石!' };
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DIAMOND_NOT_ENOUGH));
        return;
    }
            
    vip_gift_old_json.push(vip_level);

    var vip_gift_new = vip_gift_old_json.toString();
    vip_gift_new = StringUtil.trim(vip_gift_new, ',');

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    my_account.vip_gift = vip_gift_old_json;

    BuzzUtil.useCoin(my_account, coinId, gift_price, function(err, res) {
        _updateItem1(pool, my_account, gift_item, function(err, res) {
            my_account.commit();
            cb(err, res);

            // 增加金币或钻石的消耗日志
            let logInfo = {
                account_id: uid,
                log_at: new Date(),
                gain: 0,
                cost: gift_price,
                total: my_account[coinType],
                scene: common_log_const_cfg.VIPGIFT_BUY,
                nickname: 0,
            };
            switch(coinType) {
                case "pearl":
                    console.log(FUNC + uid + "购买VIP礼包消耗钻石");
                    logDiamond.push(logInfo);
                break;
                case "gold":
                    console.log(FUNC + uid + "购买VIP礼包消耗金币");
                    logInfo.duration = 0;
                    logInfo.level = my_account.level;
                    my_account.cost = gift_price;//其他消耗 购买VIP礼包累加
                    my_account.commit();
                    logGold.push(logInfo);
                break;
            }
        });
    });
}


//==============================================================================
// private
//==============================================================================

// 更新礼包第一个物品
function _updateItem1(pool, account, gift_item, cb) {
    const FUNC = TAG + "_updateItem1() --- ";
    var item = gift_item[0];
    _updateItem(pool, account, item, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "更新物品1（" + item[0] + "）出现问题");
            var extraErrInfo = { debug_info: 'vip_gift._updateItem1()-更新物品1（' + item[0] + '）出现问题', err_obj: err };
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
            return;
        }
        _updateItem2(pool, account, gift_item, cb);
    });
}

// 更新礼包第二个物品
function _updateItem2(pool, account, gift_item, cb) {
    const FUNC = TAG + "_updateItem2() --- ";
    if (DEBUG) console.log("[_updateItem2()] gift_item: ", gift_item);
    var item = gift_item[1];
    _updateItem(pool, account, item, function (err, results) {
        if (err) {
            if (ERROR) console.error("更新物品2（" + item[0] + "）出现问题");
            var extraErrInfo = { debug_info: 'vip_gift._updateItem2()-更新物品2（' + item[0] + '）出现问题', err_obj: err };
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
            return;
        }
        console.log(FUNC + "购买VIP礼包成功, 返回玩家数据");
        cb(err, [account]);
    });
}

var ITEM_TYPE = {
    gold : 1,
    pearl : 2,
    skill : 3,
};

/**
 * 通用的物品更新方法.
 */
function _updateItem(pool, account, item, cb) {
    console.log("-------item: ", item);
    var item_name = item[0];    // 物品名
    var item_amount = item[1];  // 物品数量
    // 查表item_item_cfg
    var item_info = item_item_cfg[item_name];
    var item_type = item_info['type'];
    var item_id = item_info['id']; // 如果是技能就是对应的技能ID，需要更新技能字段
    var data = null;//接口调用时需要传输的参数
    
    var account_id = account['id'];
    var token = account['token'];
    var gold = account['gold'];
    var pearl = account['pearl'];
    var skill = account['skill'];
    
    // 处理skill
    if (skill == null) {
        skill = {};
    }
    else {
        try {
            skill = ObjUtil.str2Data(skill);
        }
        catch (err) {
            console.error("------------------------错误信息打印-------------------------");
            console.error("account_id:", account_id);
            console.error("skill:", skill);
            throw err;//仍然抛出
        }
    }
    var skill_total = item_amount;
    if (skill["" + item_id]) {
        skill_total += skill["" + item_id];
    }

    switch (item_type) {
        case ITEM_TYPE.gold:
            // yDONE: 金币数据记录
            data = {
                account_id: account_id,
                token: token,
                total: gold + item_amount,
                duration: 0,
                group: [{
                    "gain": item_amount,
                    "cost": 0,
                    "scene": common_log_const_cfg.VIPGIFT_BUY }],
            };
            DaoGold.addGoldLogEx(account, data, function (err_gold, results_gold) {
                if (err_gold) {
                    if (ERROR) console.error("更新金币数据出现错误");
                    var extraErrInfo = { debug_info: 'vip_gift._updateItem()-更新金币数据出现错误', err_obj: err_gold };
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        case ITEM_TYPE.pearl:
            data = {
                account_id: account_id,
                token: token,
                total: pearl + item_amount,
                group: [{ "gain": item_amount, "cost": 0, "scene": 4 }],
            };
            DaoPearl.addPearlLogEx(account, data, function (err_pearl, results_pearl) {
                if (err_pearl) {
                    if (ERROR) console.error("更新钻石数据出现错误");
                    var extraErrInfo = { debug_info: 'vip_gift._updateItem()-更新钻石数据出现错误', err_obj: err_pearl };
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        case ITEM_TYPE.skill:
            data = {
                account_id: account_id,
                token: token,
                skill_data: [{ "id": item_id, "gain": item_amount, "cost": 0, "total": skill_total }],
            };
            DaoSkill.addSkillLogEx(account, data, function (err_skill, results_skill) {
                if (err_skill) {
                    if (ERROR) console.error("更新技能数据出现错误");
                    var extraErrInfo = { debug_info: 'vip_gift._updateItem()-更新技能数据出现错误', err_obj: err_skill };
                    cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
                    return;
                }
                cb(null);
            });
            break;
        default:
            if (DEBUG) console.log("不支持的物品类型，请检查配置");//此处跳过
            cb(null);
            break;
    }
}