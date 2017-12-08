////////////////////////////////////////////////////////////
// Drop related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 对象(POJO)
//------------------------------------------------------------------------------
var DropRecord = require('./pojo/DropRecord');

//------------------------------------------------------------------------------
// 数据库访问(DAO)
//------------------------------------------------------------------------------
var dao_drop = require('../dao/dao_drop');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

// 预处理(整个程序只会执行一次，重启生效)
var init_drop_once = {};
var init_drop_reset = {};

var strInitDropOnce = JSON.stringify(init_drop_once);
var strInitDropReset = JSON.stringify(init_drop_reset);

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

const TAG = "【buzz_drop】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.initDropOnce = initDropOnce;
exports.initDropReset = initDropReset;
exports.updateLeftDropCount = updateLeftDropCount;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取初始化的不可重置掉落数据
 */
function initDropOnce() {
    const FUNC = TAG + "initDropOnce() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    return strInitDropOnce;
}

/**
 * 获取初始化的可重置掉落数据
 */
function initDropReset() {
    const FUNC = TAG + "initDropReset() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    return strInitDropReset;
}

/**
 * 获取初始化的可重置掉落数据
 */
function updateLeftDropCount(pool, cb) {
    const FUNC = TAG + "updateLeftDropCount() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var hourIdx = DateUtil.getHourIdx();

    var key_android = 'hf_' + hourIdx + '_1';
    var key_ios = 'hf_' + hourIdx + '_2';
    var value_android = DropRecord.getCurrentValue(key_android);
    var value_ios = DropRecord.getCurrentValue(key_ios);

    var params = {
        hourIdx: hourIdx,
        keys:[],
    };
    if (value_android > 0) {
        params.keys.push(key_android);
    }
    if (value_ios > 0) {
        params.keys.push(key_ios);
    }

    if (params.keys.length > 0) {
        dao_drop.getDropLeft(pool, params, function(err, results) {
            if (err) {
                return;
            }
            // DEBUG = 0;
            if (DEBUG) console.log(FUNC + 'results:\n', results);
            // 更新DropRecord中的数据
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                DropRecord.updateCurrentValue(result.key, result.current_value);
            }
            DEBUG = 0;
            cb("更新全服限制数量完成");
        });
    }
    else {
        cb("全服发放已经领完, 无需读取数据库");
    }
}


//==============================================================================
// private
//==============================================================================
