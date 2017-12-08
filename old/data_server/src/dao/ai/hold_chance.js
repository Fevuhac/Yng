////////////////////////////////////////////////////////////////////////////////
// AI calculate hold chance
// AI计算: 呆立平均概率：所有玩家转移目标时出现呆立的平均概率（30秒以上无任何操作）
// 类似字段包括:
// holdChance
// holdingQuitChance
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
    if (DEBUG) console.log("CALL hold_chance.cal() - " + field_name);
    
    var numerator = 0;
    var denominator = 0;
    for (var i = 0; i < recent_logs.length; i++) {
        var field_value = recent_logs[i][field_name];
        numerator += field_value;
        denominator++;
    }
    if (DEBUG) console.log("numerator: " + numerator);
    if (DEBUG) console.log("denominator: " + denominator);
    var result = numerator / (denominator == 0 ? 1 : denominator);
    if (DEBUG) console.log("result: " + result);
    if (DEBUG) console.log("----------------------------------------------");
    return result.toFixed(2);
}


//==============================================================================
// private
//==============================================================================
