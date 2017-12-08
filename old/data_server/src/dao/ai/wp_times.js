////////////////////////////////////////////////////////////////////////////////
// AI calculate wp times
// AI计算: 炮使用平均概率： 所有玩家在不同场景使用各种倍率炮的平均概率
// 类似字段包括:
// wpTimes
//==============================================================================
// Function
// cal
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
// [修改] 原有的weapon_weapons_cfg已经被newweapon_upgrade_cfg替代，原有的数组被对象替代
//var weapon_weapons_cfg = require('../../../cfgs/weapon_weapons_cfg');
var weapon_weapons_cfg = require('../../../cfgs/newweapon_upgrade_cfg');
var ArrayUtil = require('../../utils/ArrayUtil');
var _ = require('underscore');

//var weapon_keys = _.pluck(weapon_weapons_cfg, 'id');
//for (var i = 0; i < weapon_keys.length; i++) {
//    weapon_keys[i] = "" + weapon_keys[i];
//}
var weapon_keys = _.keys(weapon_weapons_cfg);

var DEBUG = 0;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.cal = _cal;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _cal(recent_logs, field_name) {
    if (DEBUG) console.log("CALL wp_times.cal() - " + field_name);
    
    var field_array = _.pluck(recent_logs, field_name);
    
    if (field_array.length > 0) {
        // 获取所有待统计的键
        var keys = _.keys(field_array[0]);
        if (field_name == "wpTimes") {
            keys = weapon_keys;
        }
        
        // 定义一个返回值(json对象)
        var result = {};
        
        // 这是分母
        var denominator = 0;
        
        // 将字符串转为对象
        for (var field_idx = 0; field_idx < field_array.length; field_idx++) {
            field_array[field_idx] = JSON.parse(field_array[field_idx]);
        }
        
        // 获取分母(每一个值都相加并且带权值)
        for (var field_idx = 0; field_idx < field_array.length; field_idx++) {
            var field = field_array[field_idx];
            var value_array = _.values(field);
            var one_sum = ArrayUtil.sum(value_array);
            denominator += one_sum;
        }
        
        if (DEBUG) console.log("=======================================================");
        if (DEBUG) console.log("denominator: " + denominator);
        if (DEBUG) console.log("=======================================================");
        
        for (var key_idx = 0; key_idx < keys.length; key_idx++) {
            var key = keys[key_idx];
            var this_fish = _.pluck(field_array, key);
            //if (DEBUG) console.log(key + " this_fish: ", this_fish);
            
            // 处理undefined
            for (var this_fish_idx = 0; this_fish_idx < this_fish.length; this_fish_idx++) {
                if (!this_fish[this_fish_idx]) {
                    this_fish[this_fish_idx] = 0;
                }
            }
            //if (DEBUG) console.log(key + " this_fish: ", this_fish);
            
            var this_sum = ArrayUtil.sum(this_fish);
            if (DEBUG) console.log(key + " sum: " + this_sum);
            var chance = this_sum / denominator;
            if (DEBUG) console.log(key + " chance: " + chance);
            result[key] = parseFloat(chance.toFixed(4));
        }
        return JSON.stringify(result);
    }
    else {
        return '{}';
    }
}


//==============================================================================
// private
//==============================================================================
