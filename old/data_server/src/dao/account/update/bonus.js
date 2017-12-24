////////////////////////////////////////////////////////////////////////////////
// Account Update Bonus
// 奖金数据的更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var ObjUtil = require('../../../buzz/ObjUtil');
var StringUtil = require('../../../utils/StringUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');
var DaoGold = require('../../dao_gold');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;


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
 * 奖金数据的更新.
 * bonus字段数据结构: {"fish_count":1, "gold_count":1, "got":true|false}
 * 此字段每日凌晨需要重置为{}
 * 有效性验证:
 * 1. fish_count字段只能增加不能减少
 * 2. gold_count字段只能增加不能减少
 * 3. got字段只能由false变为true
 */
function _update(pool, data, cb, my_account) {
    if (DEBUG) console.log("CALL bonus.update()");
    
    var account_id = my_account['id'];
    var token = my_account['token'];
        
    var nickname = my_account['nickname'];
    var bonus_old = my_account['bonus'];
    var bonus_new = data['bonus'];

        
    // 玩家获取的奖金金币数量
    var gold_count_new = 0;
    var gold_old = my_account['gold'];// 玩家原来持有的金币数量
    var gold_new = gold_old;
        
    // 标记是否领取的标志
    var got_old = false;
    var got_new = false;
        
    // 数据有效性验证
    try {
        if (bonus_new != null && bonus_new != "") {
            var json_bonus_new = bonus_new;
            if (StringUtil.isString(bonus_new)) {
                if (DEBUG) console.log('StringUtil.isString(bonus_new)');
                json_bonus_new = ObjUtil.str2Data(bonus_new);
            }
            var fish_count_new = json_bonus_new["fish_count"];
            gold_count_new = json_bonus_new["gold_count"];
            got_new = json_bonus_new["got"];
                
            if (DEBUG) console.log('bonus_new: ', bonus_new);
            if (DEBUG) console.log('json_bonus_new: ', json_bonus_new);
            if (DEBUG) console.log('---got_new: ', got_new);
        }
    }
    catch (err_parse) {
        if (ERROR) console.error(err_parse);
        if (ERROR) console.error(JSON.stringify(err_parse));
    }
        
    // 领取奖金，重置数据
    var gold_gain = 0;
    if (DEBUG) console.log('got_new: ', got_new);
    if (got_new) {
        gold_new = gold_old + gold_count_new;
        gold_gain = gold_count_new;
        // 注意: 存储的是字符串
        bonus_new = '{"fish_count":0, "gold_count":0, "got":false}';
    }
    if (DEBUG) console.log('bonus_new: ', bonus_new);
    
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    let bonusClient = ObjUtil.str2Data(bonus_new);
    bonusClient.wintimes = bonus_old.wintimes;
    CacheAccount.setBonus(account_id, bonusClient);
    CacheAccount.setGold(account_id, gold_new);
    CacheAccount.setAccountGoldCurrentTotal(account_id, gold_new);
    CacheAccount.addAccountGoldTotalGain(account_id, gold_gain);
    // CacheAccount.addAccountGoldTotalCost(account_id, gold_new);
    //--------------------------------------------------------------------------

    // TODO: tbl_gold&tbl_pearl数据入缓存
    cb(null, "success");
}


//==============================================================================
// private
//==============================================================================

