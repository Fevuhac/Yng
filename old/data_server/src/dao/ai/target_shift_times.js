////////////////////////////////////////////////////////////////////////////////
// AI calculate target shift times
// AI计算: 呆立平均概率：所有玩家转移目标时出现呆立的平均概率（30秒以上无任何操作）
// 类似字段包括:
// targetShiftTimes
// lockSkillChance
//==============================================================================
// Function
// cal
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var fish_fish_cfg = require('../../../cfgs/fish_fish_cfg');
var ArrayUtil = require('../../utils/ArrayUtil');
var _ = require('underscore');

var fish_keys = _.keys(fish_fish_cfg);


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
exports.cal = _cal;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _cal(recent_logs, field_name) {
    if (DEBUG) console.log("CALL target_shift_times.cal() - " + field_name);
    
    var field_array = _.pluck(recent_logs, field_name);
    if (DEBUG) console.log("field_array: ", field_array);
    
    if (field_array.length > 0) {
        for (var field_idx = 0; field_idx < field_array.length; field_idx++) {
            if (DEBUG) console.log(field_idx + ") ", field_array[field_idx]);
            // 客户端数据异常
            if (field_array[field_idx] == 'undefined') {
                field_array[field_idx] = {};
            }
            else {
                field_array[field_idx] = JSON.parse(field_array[field_idx]);
            }
        }
        if (DEBUG) console.log("field_array: ", field_array);
        var keys = _.keys(field_array[0]);
        if (field_name == "targetShiftTimes" || field_name == "lockSkillChance") {
            keys = fish_keys;
        }
        else if (field_name == "wpTimes") {
            if (DEBUG) console.log("weapon_keys: ", weapon_keys);//todo err
            keys = weapon_keys;
        }
        if (DEBUG) console.log("keys: ", keys);
        var result = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var numerator = 0;
            var denominator = 0;
            
            for (var arr_idx = 0; arr_idx < field_array.length; arr_idx++) {
                var one_field = field_array[arr_idx];
                // 客户端可能传入null值, 注意将null进行转换
                if (one_field == null) {
                    one_field = {};
                }
                if (one_field[key] != null) {
                    numerator += field_array[arr_idx][key];
                }
                denominator++;
            }
            //if (DEBUG) console.log("numerator: " + numerator);
            //if (DEBUG) console.log("denominator: " + denominator);
            var one_result = numerator / (denominator == 0 ? 1 : denominator);
            if (DEBUG) console.log(key + ": " + one_result);
            one_result = parseFloat(one_result.toFixed(2));
            
            result[key] = one_result;
        }
        if (DEBUG) console.log(field_name + " result: ", result);
        
        return JSON.stringify(result);
    }
    else {
        return {};
    }
}


//==============================================================================
// private
//==============================================================================
