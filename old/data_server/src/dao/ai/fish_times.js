////////////////////////////////////////////////////////////////////////////////
// AI calculate fish times
// AI计算: 目标(不同种类的鱼)选择
// cal
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var fish_fish_cfg = require('../../../cfgs/fish_fish_cfg');
var ArrayUtil = require('../../utils/ArrayUtil');
var _ = require('underscore');

var fish_keys = _.keys(fish_fish_cfg);

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
    if (DEBUG) console.log("CALL fish_times.cal()");

    var field_array = _.pluck(recent_logs, field_name);
    
    if (field_array.length > 0) {
        // 获取所有待统计的键
        var keys = fish_keys;
        
        // 定义一个返回值(json对象)
        var result = {};
        
        // 这是分母
        var denominator = 0;
        
        // 将字符串转为对象
        for (var field_idx = 0; field_idx < field_array.length; field_idx++) {
            field_array[field_idx] = JSON.parse(field_array[field_idx]);
        }
        
        // 把所有相同鱼出现的次数相加
        var times = {};
        for (var key_idx = 0; key_idx < keys.length; key_idx++) {
            var key = keys[key_idx];
            var fish_key_times_array = _.pluck(field_array, key);
            //console.log("fish_key_times_array: " + fish_key_times_array);

            var fish_key_sum = ArrayUtil.sum(fish_key_times_array);
            //console.log(key + " t: " + fish_key_sum);

            times[key] = fish_key_sum * fish_fish_cfg[key]["gold_point"];
            //console.log(key + " P: " + times[key]);

            denominator += times[key];
        }
        
        console.log("=======================================================");
        console.log("denominator: " + denominator);
        console.log("=======================================================");

        for (var key in times) {
            result[key] = times[key] / denominator;
            result[key] = parseFloat(result[key].toFixed(4));
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
