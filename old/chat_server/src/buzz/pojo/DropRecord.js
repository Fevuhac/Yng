////////////////////////////////////////
// 记录掉落全服限制的对象
//--------------------------------------
// 如何使用
// var Propose = require('src/buzz/pojo/Propose').Propose;
// var Propose = new Propose(id);
// Propose.func(obj, params...);
////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// Tools
//------------------------------------------------------------------------------
var BuzzUtil = require("../../utils/BuzzUtil");

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// POJO对象
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Cache
//------------------------------------------------------------------------------
// var CacheUserInfo = require('../cache/CacheUserInfo');

//------------------------------------------------------------------------------
// utils
//------------------------------------------------------------------------------
// var ArrayUtil = require('../../utils/ArrayUtil');

//------------------------------------------------------------------------------
// configs
//------------------------------------------------------------------------------
var drop_drop_cfg = require("../../../cfgs/drop_drop_cfg");

//==============================================================================
// constant
//==============================================================================
var ERROR = 1;
var DEBUG = 0;
var TAG = "【DropRecord】";


//==============================================================================
// global variable
//==============================================================================
var DropRecordList = {};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.init = init;// 初始化数据
exports.getCurrentValue = getCurrentValue;// 初始化数据
// exports.getDropRecordList = getDropRecordList;// 获取方法
exports.cutServerDrop = cutServerDrop;
exports.resetEveryHour = resetEveryHour;
exports.updateCurrentValue = updateCurrentValue;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function getDropServerLimit() {
    var ret = {};
    for (let drop_key in drop_drop_cfg) {
        var drop_info = drop_drop_cfg[drop_key];
        var limit_type = drop_info.limit_type;
        var limit_count = drop_info.limit_count;
        if (limit_count.length >= 1 && limit_count[0] > 0) {
            ret[drop_key] = drop_info;
        }
    }
    return ret;
}
/**
 * 初始化数据, 启动服务器时运行一次.
 */
function init(pool) {
    const FUNC  = TAG + "init() --- ";
    // 查询配置表中的默认数据
    var drop_list = BuzzUtil.getDropServerLimit();
    // if (DEBUG) console.log(FUNC + "drop_list:", drop_list);
    for (let drop_key in drop_list) {
        var drop_info = drop_list[drop_key];
        var limit_type = drop_info.limit_type;
        var limit_count = drop_info.limit_count;
        for (var i = 0; i < limit_count.length; i++) {
            DropRecordList[drop_key + "_" + i + "_" + 1] = new DropRecord(drop_key, i, 1, limit_type, limit_count[i]);
            DropRecordList[drop_key + "_" + i + "_" + 2] = new DropRecord(drop_key, i, 2, limit_type, limit_count[i]);
        }
    }

    // if (DEBUG) console.log(FUNC + "1-DropRecordList:", DropRecordList);

    // 使用数据库的存储值来进行重置
    dao_drop.loadAll(pool, function(err, results) {
        // if (DEBUG) console.log(FUNC + "2-DropRecordList:", DropRecordList);
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            return;
        }
        
        // if (DEBUG) console.log(FUNC + "3-DropRecordList:", DropRecordList);
        // if (DEBUG) console.log(FUNC + "results:", results);
        var list = getUnrecordList(results);
        // if (DEBUG) console.log(FUNC + "list:", list);
        if (list.length > 0) {
            dao_drop.insertMassive(pool, list, function(err, results) {
                if (err) {
                    if (ERROR) console.error(FUNC + "err:", err);
                    return;
                }
                if (DEBUG) console.log(FUNC + "results:", results);

                // TODO: 如果配置表中的limit_count值和数据库不符, 需要更新数据库的值为当前配置表的值
            });
        }
    });

    /**
     * 获取数据库中没有记录的值, 进行初始化.
     */
    function getUnrecordList(results) {
        var ret = [];
        for (var key in DropRecordList) {
            var dropRecord = DropRecordList[key];
            var unrecord = true;
            for (var i = 0; i < results.length; i++) {
                var dropInDb = results[i];
                if (dropInDb.key == key) {
                    dropRecord.current_value = dropInDb.current_value;
                    unrecord = false;
                }
            }
            if (unrecord) {
                ret.push(dropRecord);
            }
        }
        return ret;
    }
}

function getCurrentValue(key) {
    const FUNC  = TAG + "getCurrentValue() --- ";
    var dropRecord = DropRecordList[key];
    if (!dropRecord) {
        if (DEBUG) console.log(FUNC + "缓存中没有找到对应的key:", key);
        if (DEBUG) console.log(FUNC + "DropRecordList:", DropRecordList);
    }
    return dropRecord.current_value;
}

function cutServerDrop(key) {
    DropRecordList[key].current_value--;
}

function resetEveryHour() {
    for (var key in DropRecordList) {
        var dropRecord = DropRecordList[key];
        dropRecord.current_value = dropRecord.limit_count;
    }
}

/**
 * 定时更新当前值.
 */
function updateCurrentValue(key, value) {
    DropRecordList[key].current_value = value;
}

//----------------------------------------------------------
// Propose Definition
//----------------------------------------------------------
/**
 * @param uid 玩家ID.
 * @param text 玩家建议的文字.
 */
function DropRecord(drop_key, time_idx, platform, limit_type, limit_count) {
    /** 配置表中的drop_key. */
    this.drop_key = drop_key;

    /** 24小时的取值就是0~23. */
    this.time_idx = time_idx;

    /** 平台参数, 安卓和苹果分别计算. */
    this.platform = platform;

    /** 配置表中的limit_type. */
    this.limit_type = limit_type;

    /** 配置表中的limit_count. */
    this.limit_count = limit_count;

    this.current_value = this.limit_count;

    this.getCurrentValue = function() {
        return this.current_value;
    }

    /**
     * 每次都向数据库查询一次并重置当前值
     */
    this.reset = function(current_value) {
        this.current_value = current_value;
    }
}