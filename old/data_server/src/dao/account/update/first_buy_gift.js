////////////////////////////////////////////////////////////////////////////////
// Account Update First Buy Gift
// 首充大礼包是否领取的标记
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
let AccountCommon = require('../common');
let CacheAccount = require('../../../buzz/cache/CacheAccount');
let common_const_cfg = require('../../../../cfgs/common_const_cfg');
let common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');
let item_item_cfg = require('../../../../cfgs/item_item_cfg');
let buzz_cst_itemtype = require('../../../buzz/cst/buzz_cst_itemtype');
let ErrorUtil = require('../../../buzz/ErrorUtil');
let first_charge_gift = common_const_cfg.FIRST_RECHARGE;

let dao_gold = require('../../dao_gold');
const cacheWriter = require('../../../cache/cacheWriter');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 0;
var TAG = "【update/first_buy_gift】";


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
 * 首充大礼包是否领取的标记(初始化均为false, 更新后为true且不再变回为false).
 */
async function _update(pool, data, cb, account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL first_buy_gift.update()");
    
    var uid = account['id'];
    var token = account['token'];
        
    if (_isStatusFalse(data, cb)) return;
    if (_isPlayerCharge(account, cb)) return;
    if (_isGiftGotten(account, cb)) return;
        
    var update_gold = 0;
    var update_pearl = 0;
    // 领取首充奖励
    for (var i = 0; i < first_charge_gift.length; i++) {
        var gift = first_charge_gift[i];
        var item_id = gift[0];
        var item_amount = gift[1];

        // 查找item_item_cfg表
        var item = item_item_cfg[item_id];
        // 金币
        if (item.type == buzz_cst_itemtype.GOLD) {
            update_gold = item_amount;
        }
        // 道具
        if (item.type == buzz_cst_itemtype.PEARL) {
            update_pearl = item_amount;
        }
    }
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    account.first_buy_gift = 1;
    account.gold = update_gold;
    account.pearl += update_pearl;

    //注意：首冲赠送金币，临时从奖池中扣除。新版本通过新接口实现
    update_gold > 0 && await cacheWriter.subReward(update_gold, account); 

    account.commit();
    
    let scene = common_log_const_cfg.FIRST_BUY;
    // yDONE: 金币数据记录
    if (update_gold > 0) {
        console.log(FUNC + uid + ":首充领取获得金币");
        let data = {
            account_id: uid,
            token: token,
            total: account.gold,
            duration: 0,
            group: [{
                "gain": update_gold,
                "cost": 0,
                "scene": scene,
            }],
        };
        dao_gold.addGoldLogCache(pool, data, function(err, res) {
            if (err) return console.error(FUNC + "err:", err);
        });
    }

    // yDONE: 钻石数据记录
    if (update_pearl > 0) {
        console.log(FUNC + uid + ":首充领取获得钻石");
        logDiamond.push({
            account_id: uid,
            log_at: new Date(),
            gain: update_pearl,
            cost: 0,
            total: account.pearl,
            scene: scene,
            nickname: 0,
        });
    }

    cb(null, [account]);
}


//==============================================================================
// private
//==============================================================================
// 玩家首充状态只能从false设置为true, 不能从true设置为false.
function _isStatusFalse(data, cb) {
    var first_buy_gift = data['first_buy_gift'];
    console.log("first_buy_gift: " + first_buy_gift);
    if (first_buy_gift == "false") {
        first_buy_gift = false;
    }
    return ErrorUtil.checkError(!first_buy_gift, "玩家的首充状态不能被设置为假", cb);
}

// 玩家没有充值不允许领取
function _isPlayerCharge(result_account, cb) {
    var rmb = result_account['rmb'];
    return ErrorUtil.checkError(rmb == 0, "玩家未充值不能领取首充大礼包", cb);
}

// 玩家已经领取了首充礼包则返回错误信息
function _isGiftGotten(result_account, cb) {
    var first_buy_gift_old = result_account['first_buy_gift'];
    return ErrorUtil.checkError(first_buy_gift_old, "玩家已经领取了首充大礼包，请勿重复领取", cb);
}
