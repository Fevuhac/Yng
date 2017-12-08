////////////////////////////////////////////////////////////
// Ai Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// POJO对象
//------------------------------------------------------------------------------
var Reward = require('../buzz/pojo/Reward');

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var utils = require('../buzz/utils');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('../buzz/ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('../buzz/cst/buzz_cst_error');
var ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;

var DaoUtil = require('./dao_utils');
var DaoReward = require('./dao_reward');

var _ = require('underscore');

var AccountCommon = require('./account/common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');
var active_cdkey_cfg = require('../../cfgs/active_cdkey_cfg');
var item_item_cfg = require('../../cfgs/item_item_cfg');


//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.generate = generate;
exports.use = use;
exports.list = list;
exports.detail = detail;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 更新AI数据(在ai_log中新增一条数据, 并返回上一个周期计算的AI结果(暂定为10分钟一个周期)).
 */
function generate(pool, data, cb) {
    if (DEBUG) console.log('CALL dao_cdkey.generate');
    
    var action_id = data.action_id;
    var prefix = data.prefix;
    var num = data.num;
    // TODO: generateCdKeyList内部进行重复性校验
    var cdKeyList = utils.generateCdKeyList(prefix, num);

    // 插入数据库
    var sql = "";
    sql += "INSERT INTO tbl_cd_key (cd_key, action_id) VALUES ";
    for (var i = 0; i < cdKeyList.length; i++) {
        if (i > 0) {
            sql += ", ";
        }
        sql += "('" + cdKeyList[i] + "', " + action_id + ")";
    }
    if (DEBUG) console.log('sql:', sql);
    if (DEBUG) console.log('sql.length:', sql.length);
    
    // 此为本地数据库限制
    if (sql.length > 4194304) {
        cb(new Error("数据查询字段过长: " + sql.length));
        return;
    }
    
    // 此为租赁服云数据库限制
    if (sql.length > 16777216) {
        cb(new Error("数据查询字段过长: " + sql.length));
        return;
    }

    pool.query(sql, [], function (err, results) {
        if (err) {
            if (ERROR) console.error("数据插入错误: ", err);
            cb(err);
            return;
        }
        // 返回生成的兑换码列表
        cb(err, cdKeyList);
    });
}

/**
 * 更新AI数据(在ai_log中新增一条数据, 并返回上一个周期计算的AI结果(暂定为10分钟一个周期)).
 */
function list(pool, data, cb) {
    console.log('CALL dao_cdkey.list');
    
    var action_id = data.action_id;
    
    // 插入数据库
    var sql = "";
    sql += "SELECT * FROM tbl_cd_key ";
    sql += "WHERE action_id=?";
    var sql_data = [action_id];
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error("数据查询错误: ", err);
            cb(err);
            return;
        }
        cb(null, results);
    });
}

function use(pool, data, cb) {
    BuzzUtil.cacheLinkDataApi(data, "use_cdkey");

    var token = data.token;

    AccountCommon.getAccountByToken(pool, token, function (err, results) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
            return;
        }
        if (results.length == 0) {
            console.error('-----------------------------------------------------');
            console.error('TOKEN_INVALID: dao_cdkey.use()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        var result = results[0];
        var account_id = result.id;
        // DONE: 消耗CD-KEY
        var cdkey = data.cdkey;
        _checkCdkey(pool, cdkey, account_id, function (err_check_cdkey, results_check_cdkey) {
            if (err_check_cdkey) { cb(err_check_cdkey); return; }
            var action_id = results_check_cdkey.action_id;
            
            _useCdKey(pool, account_id, cdkey, function (err_use_cdkey, results_use_cdkey) {
                if (err_use_cdkey) { cb(err_use_cdkey); return; }
                    
                var reward = _getRewardByActionId(action_id);
                
                DaoReward.getReward(pool, result, reward, function (err_get_reward, results_get_reward) {
                    if (err_get_reward) {
                        console.log(JSON.stringify(err_get_reward));
                        return;
                    }
                    AccountCommon.getAccountById(pool, account_id, function (err_, accounts_) {
                        var account_ = accounts_[0];
                        account_.action_id = action_id;
                        cb(err_, account_);
                    });

                });
            });
        });
    });
}

function detail(pool, data, cb) {
    console.log('CALL dao_cdkey.detail');
    
    var cdkey = data.cdkey;

    var sql = "";
    sql += "SELECT ";
    sql += "action_id";
    sql += ",cd_key ";
    sql += ",DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%S') AS created_at ";
    sql += ",account_id ";
    sql += ",use_time ";
    sql += "FROM tbl_cd_key ";
    sql += "WHERE cd_key=?";
    var sql_data = [cdkey];
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error("数据查询错误: ", err);
            cb(err);
            return;
        }
        cb(null, results);
    });
}


//==============================================================================
// private
//==============================================================================

/**
 * 检查兑换码是否存在, 是否使用过.
 */
function _checkCdkey(pool, cdkey, account_id, cb) {
    var sql = "";
    sql += "SELECT * ";
    sql += "FROM tbl_cd_key ";
    sql += "WHERE cd_key=?";
    var sql_data = [cdkey];
    
    if (DEBUG) console.log('sql:', sql);
    if (DEBUG) console.log('sql_data:', sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error("数据查询错误: ", err);
            cb(ERROR_OBJ.DB_ERR);
            return;
        }
        if (results.length == 0) {
            console.error('-----------------------------------------------------');
            console.error('没有找到对应的兑换码, 兑换码无效: dao_cdkey._checkCdkey()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_INVALID);
            return;
        }
        if (results.length > 1) {
            console.error('-----------------------------------------------------');
            console.error('同样的兑换码多余一条, 兑换码无效: dao_cdkey._checkCdkey()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_INVALID);
            return;
        }
        var cdkeyInfo = results[0];
        if (cdkeyInfo.use_time != null && cdkeyInfo.account_id != null) {
            console.error('-----------------------------------------------------');
            console.error('兑换码已经使用过, 兑换码无效: dao_cdkey._checkCdkey()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_USED);
            return;
        }
        var endtime = _getEndtimeByActionId(cdkeyInfo.action_id);
        if (expired(endtime)) {
            console.error('-----------------------------------------------------');
            console.error('兑换码已过期: dao_cdkey._checkCdkey()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_EXPIRED);
            return;
        }
        _checkRepeatGet(pool, cdkeyInfo.action_id, account_id, function (err1, results1) {
            if (err1) { cb(err1); return; }
            cb(null, cdkeyInfo);
        });
    });
}

// 检测重复领取同一活动
function _checkRepeatGet(pool, action_id, account_id, cb) {
    var sql = "";
    sql += "SELECT * ";
    sql += "FROM tbl_cd_key ";
    sql += "WHERE action_id=? AND account_id=?";
    var sql_data = [action_id, account_id];
    
    if (DEBUG) console.log('sql:', sql);
    if (DEBUG) console.log('sql_data:', sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error("数据查询错误: ", err);
            cb(ERROR_OBJ.DB_ERR);
            return;
        }
        if (results.length > 0) {
            console.error('-----------------------------------------------------');
            console.error('玩家已经领取过同一类型的奖励: dao_cdkey._checkRepeatGet()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_REPEAT);
            return;
        }
        cb(null, results);
    });
}

function diff(endtime) {
    var curtime = new Date();
    var endtime = new Date(endtime);
    if (DEBUG) console.log("curtime: ", curtime);
    if (DEBUG) console.log("endtime: ", endtime);
    return curtime.getTime() - endtime.getTime();
}

function expired(endtime) {
    return diff(endtime) > 0;
}

function _useCdKey(pool, account_id, cdkey, cb) {
    var sql = "";
    sql += "UPDATE tbl_cd_key ";
    sql += "SET account_id=?, use_time=? ";
    sql += "WHERE cd_key=?";
    var sql_data = [account_id, DateUtil.format(new Date(), "yyyy-MM-dd hh:mm:ss"), cdkey];

    if (DEBUG) console.log('sql:', sql);
    if (DEBUG) console.log('sql_data:', sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error("数据更新错误: ", err);
            cb(ERROR_OBJ.DB_ERR);
            return;
        }
        if (results.affectedRows == 0) {
            console.error('-----------------------------------------------------');
            console.error('更新操作影响数据条数为0, 兑换码无效: dao_cdkey._useCdKey()');
            console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.CDKEY_INVALID);
            return;
        }
        cb(null, results);
    });
}

function _getActionByActionId(id) {
    if (DEBUG) console.log('active_cdkey_cfg: ', active_cdkey_cfg);
    if (DEBUG) console.log('id: ', id);
    for (var i = 0; i < active_cdkey_cfg.length; i++) {
        var action = active_cdkey_cfg[i];
        if (action.id == id) {
            return action;
        }
    }
}

function _getRewardByActionId(id) {
    return _getActionByActionId(id).reward;
}

function _getEndtimeByActionId(id) {
    return _getActionByActionId(id).endtime;
}