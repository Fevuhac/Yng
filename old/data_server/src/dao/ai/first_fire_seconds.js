////////////////////////////////////////////////////////////////////////////////
// AI calculate first fire seconds
// AI计算: 进场到第一次开火的平均时间
// 说明: 客户端会传入当前玩家进入到开火的的时间, 如果传入0, 表示已经在场景中, 则需要剔除这种数据进行平均值计算.
// 类似字段包括:
// firstFireSeconds
// sameFishAverageDt
// normalStaySeconds
// brokenStaySeconds
// holdAverageSeconds
// waitAverageSeconds
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
    if (DEBUG) console.log("CALL first_fire_seconds.cal() - " + field_name);
    
    var numerator = 0;
    var denominator = 0;
    for (var i = 0; i < recent_logs.length; i++) {
        var field_value = recent_logs[i][field_name];
        if (field_value != 0) {
            numerator += recent_logs[i][field_name];
            denominator++;
        }
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
