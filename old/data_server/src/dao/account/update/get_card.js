////////////////////////////////////////////////////////////////////////////////
// Account Update Get Card
// 每日月卡领取字段更新(每日凌晨重置为'{normal:false,senior:false}')
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var StringUtil = require('../../../utils/StringUtil');
let BuzzUtil = require('../../../utils/BuzzUtil');
let GameLog = require('../../../log/GameLog');
var ObjUtil = require('../../../buzz/ObjUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');
var shop_card_cfg = require('../../../../cfgs/shop_card_cfg');
var common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【update/get_card】";


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
 * 每日月卡领取字段更新(其中的值只能由false转为true).
 */
function _update(pool, data, cb, my_account) {
    var FUNC = TAG + "_update() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    
    var uid = data['account_id'];
    var token = data['token'];
    var get_card_new = ObjUtil.str2Data(data['get_card']);
    var get_card_old = ObjUtil.str2Data(my_account['get_card']);
    var card = ObjUtil.str2Data(my_account['card']);

    console.log(FUNC + "get_card_new: ", get_card_new);
    console.log(FUNC + "get_card_old: ", get_card_old);
    console.log(FUNC + "card: ", card);
        
    var everyday = 0;
        
    // TODO: 判断card.normal
    if (get_card_new['normal']) {// 更新的是normal
        if (card['normal']) {
            console.log(FUNC + "玩家的普通月卡有效");
            if (get_card_old['normal']) {
                var err = FUNC + '[ERROR] 玩家今天已经领取了普通月卡奖励, 请勿重复领取';
                if (ERROR) console.error(err);
                cb(err);
                return;
            }
            else {
                // 重写get_card_old
                get_card_old['normal'] = true;
                everyday = shop_card_cfg[0]['everyday'];
            }
        }
        else {
            var err = FUNC + '[ERROR] 玩家没有购买普通月卡';
            if (ERROR) console.error(err);
            cb(err);
            return;
        }
    }

    // TODO: 判断card.senior
    if (get_card_new['senior']) {// 更新的是senior
        console.log(FUNC + "更新玩家的壕月卡领取状态");
        console.log(FUNC + "card['senior']: ", card['senior']);
        if (card['senior']) {
            console.log(FUNC + "玩家的壕月卡有效");
            if (get_card_old['senior']) {
                var err = FUNC + '[ERROR] 玩家今天已经领取了壕月卡奖励, 请勿重复领取';
                if (ERROR) console.error(err);
                cb(err);
                return;
            }
            else {
                // 重写get_card_old
                console.log(FUNC + "领取壕月卡奖励，改变get_card字段的值");
                get_card_old['senior'] = true;
                everyday = shop_card_cfg[1]['everyday'];
            }
        }
        else {
            var err = FUNC + '[ERROR] 玩家没有购买壕月卡';
            if (ERROR) console.error(err);
            cb(err);
            return;
        }
    }
        
    get_card_old = JSON.stringify(get_card_old);

    //--------------------------------------------------------------------------
    // new card everyday([["i002", 100]])
    //--------------------------------------------------------------------------
    let item_list = BuzzUtil.getItemList(everyday);
    let req = {pool: mysqlPool, dao: myDao};
    BuzzUtil.putIntoPack(req, my_account, item_list, function(rewardInfo) {
        my_account.get_card = get_card_old;
        my_account.commit();
        // let change = BuzzUtil.getChange(account, rewardInfo);
        // var ret = {
        //     item_list: item_list,
        //     change: change,
        // };
        // cb(null, ret);
        GameLog.addGameLog(item_list, my_account, common_log_const_cfg.CARD_REWARD, '月卡每日领取获得');

        var ret = {
            id: my_account.id,
            pearl: my_account.pearl,
            card: my_account.card,
            get_card: my_account.get_card,
        };
        cb(null, [ret]);
    });

}


//==============================================================================
// private
//==============================================================================
