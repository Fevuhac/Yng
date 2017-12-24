////////////////////////////////////////////////////////////////////////////////
// Weapon Level Related
// 武器等级
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var utils = require('../buzz/utils');
var ObjUtil = require('../buzz/ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('../buzz/cst/buzz_cst_error');
var buzz_cst_game = require('../buzz/cst/buzz_cst_game');
//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheWeapon = require('../buzz/cache/CacheWeapon');
var CacheAccount = require('../buzz/cache/CacheAccount');

var DaoUtil = require('./dao_utils');
var AccountCommon = require('./account/common');
var _ = require('underscore');


//==============================================================================
// constant
//==============================================================================
var WEAPON_TYPE = {
    EXP: 0,
    Weapon: 1,
    VIP: 2
};

var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;
var GAME_EVENT_TYPE = buzz_cst_game.GAME_EVENT_TYPE;

var ERROR = 1;
var DEBUG = 0;
var TAG = "【dao_weapon】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.addWeaponLog = addWeaponLog;

// 缓存武器日志相关
exports.check = check;
exports.flush = flush;
exports.timing = timing;
exports.cache = cache;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 检测gWeaponLogCache长度, 超过11000条数据时将前面的10000条写入数据库中
 */
function check(pool) {
    if (CacheWeapon.length() > 20000) {
        insertMassive(pool, CacheWeapon.cache(), 20000);
    }
}

/**
 * 将gWeaponLogCache全部写入数据库中
 */
function flush(pool, cb) {
    insertMassive(pool, CacheWeapon.cache(), CacheWeapon.length(), cb);
}

/**
 * 定时将金币日志写入数据库(1分钟).
 */
function timing(pool, cb) {
    var count = CacheWeapon.length();
    if (count > 0) {
        insertMassive(pool, CacheWeapon.cache(), count, cb);
    }
    else {
        if (cb != null) cb(ERROR_OBJ.CACHE_EMPTY);
    }
}

/**
 * 将gWeaponLogCache全部写入数据库中
 */
function cache() {
    return CacheWeapon.cache();
}

/**
 * 插入大量的日志数据.
 * @param arr 插入数据的来源(队列)
 * @param num 插入数据的数目
 */
function insertMassive(pool, group, num, cb) {
    const FUNC = TAG + "insertMassive() --- ";
    
    if (group.length > 0) {
        
        var sql = '';
        sql += 'INSERT INTO `tbl_weapon_log` ';
        sql += '(`account_id`,`log_at`,`level`,`type`,`level_up`,`nickname`) ';
        sql += 'VALUES ';
        for (var i = 0; i < group.length; i++) {
            if (i > 0) sql += ',';
            sql += '(?,?,?,?,?,?)';
        }
        
        var sql_data = [];
        for (var i = 0; i < num; i++) {
            var record = group.shift();
            
            sql_data.push(record.account_id);
            sql_data.push(record.log_at);
            sql_data.push(record.level);
            sql_data.push(record.type);
            sql_data.push(record.level_up);
            sql_data.push(record.nickname);
        }
        
        if (DEBUG) console.log(FUNC + 'sql(' + sql.length + '):\n', sql);
        if (DEBUG) console.log(FUNC + 'sql_data(' + sql_data.length + '):\n', sql_data);
        
        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                console.error(FUNC + 'err:\n', err);
                console.error(FUNC + 'sql:\n', sql);
                console.error(FUNC + 'sql_data:\n', sql_data);
                if (cb) cb(err);
            }
            else {
                if (cb) cb(null, result);
            }
        });

    }
    else {
        console.log(FUNC + '缓存中的武器日志为空');
        if (cb != null) cb(ERROR_OBJ.CACHE_EMPTY);
    }
}

/**
 * desperated(客户端调用接口, 目前不再使用)
 * 增加一条武器升级流水记录
 * 需要珍珠表中的数据计算后进行验证
 */
function addWeaponLog(pool, data, cb) {
    const FUNC = TAG + "addWeaponLog() --- ";

    var account_id = data['account_id'];
    var token = data['token'];
    var level = data['level'];
    var type = data['type'];
    var vip_weapon_id = data['vip_weapon_id'];
    
    if (!_prepare(data, cb)) return;
    
    // 玩家token验证
    AccountCommon.getAccountByToken(pool, token, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + '[ERROR] err:', err);
            cb(err);
        } else {
            if (DEBUG) console.log('results: ', results);
            if (results.length == 0) {
                if (ERROR) console.error('-----------------------------------------------------');
                if (ERROR) console.error(FUNC + 'TOKEN_INVALID');
                if (ERROR) console.error('-----------------------------------------------------');
                cb(CstError.ERROR_OBJ.TOKEN_INVALID);
                return;
            }
            var account_result = results[0];
            var nickname = (account_result.nickname != null);

            if (type == WEAPON_TYPE.VIP) {
                var old_vip_weapon = account_result.vip_weapon_id;
                    
                // handle param vip_weapon_id
                var vip_weapon_id = _getWeaponVipIds(data);
                _didAddWeaponLog(pool, account_result, data, cb, nickname, old_vip_weapon, vip_weapon_id);
            }
            else {
                var current_weapon_level = account_result.weapon;
                if (DEBUG) console.log(FUNC + 'current_weapon_level:', current_weapon_level);

                current_weapon_level = parseInt(current_weapon_level);
                if (DEBUG) console.log(FUNC + 'level:', level);

                if (current_weapon_level >= level) {
                    var err_info = '请输入大于当前等级的数值';
                    if (ERROR) console.error(FUNC + '[ERROR] err_info:', err_info);
                    cb(new Error(err_info));
                }
                else {
                    data['level_up'] = level - current_weapon_level;
                    _didAddWeaponLog(pool, account_result, data, cb, nickname);
                }
            }
        }
    });
};

//==============================================================================
// private
//==============================================================================


/**
 * 准备工作, 准备好了返回true, 出现任何问题返回false.
 */
function _prepare(data, cb) {
    var account_id = data['account_id'];
    var token = data['token'];
    var level = data['level'];
    var type = data['type'];
    var vip_weapon_id = data['vip_weapon_id'];

    if (!_isParamExist(account_id, '接口调用请传参数account_id(玩家ID)', cb)) return false;
    if (!_isParamExist(token, "接口调用请传参数token", cb)) return false;
    if (!_isParamExist(level, '接口调用请传参数account_id(玩家ID)', cb)) return false;
    if (!_isParamExist(type, '接口调用请传参数account_id(玩家ID)', cb)) return false;

    if (parseInt(type) == 2 && vip_weapon_id == null) {
        cb(new Error('接口调用请传参数vip_weapon_id(type=2时此参数必传)'));
        return false;
    }
    
    return true;
}

/**
 * 检测客户端传入的参数, 如果参数不存在，返回false, 如果通过检测, 返回true.
 * @param param 待检测的参数.
 * @param err_info 如果检测失败，回调需要传回的信息.
 */
function _isParamExist(param, err_info, cb) {
    const FUNC = TAG + "_isParamExist() --- ";

    if (param == null) {
        if (ERROR) console.error(FUNC + "err_info:", err_info);
        var extraErrInfo = { debug_info: "dao_weapon.addWeaponLog()-" + err_info };
        cb && cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.PARAM_MISSING));
        return false;
    }
    return true;
}

// [INSERT] 验证结束，确定要插入一条武器的记录
function _didAddWeaponLog(pool, account, data, cb, nickname, old_vip_weapon, vip_weapon_id) {
    const FUNC = TAG + "_didAddWeaponLog() --- ";

    var account_id = data['account_id'];
    var level = data['level'];
    var level_up = data['level_up'];
    var type = data['type'];
    
    var sql = '';
    sql += 'INSERT INTO `tbl_weapon_log` ';
    sql += '(`account_id`,`level_up`,`level`, `type`, `nickname`';
    if (type == WEAPON_TYPE.VIP) {
        sql += ',`vip_weapon_id`';
    }
    sql += ') ';
    sql += 'VALUES';
    sql += ' (?,?,?,?,?';
    if (type == WEAPON_TYPE.VIP) {
        sql += ',?';
    }
    sql += ')';
    
    var sql_data = [account_id, level_up, level, type, nickname];
    if (type == WEAPON_TYPE.VIP) {
        sql_data.push(vip_weapon_id);
    }

    if (DEBUG) console.log(FUNC + 'sql:\n', sql);
    if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + '[ERROR] err:\n', err);
            if (ERROR) console.error(FUNC + '[ERROR] sql:\n', sql);
            if (ERROR) console.error(FUNC + '[ERROR] sql_data:\n', sql_data);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
            _updateWeaponTable(pool, account, data, cb, old_vip_weapon, vip_weapon_id);
        }
    });
}

// [UPDATE] 更新tbl_account中的武器数据
function _updateWeaponTable(pool, account, data, cb, old_vip_weapon, vip_weapon_id) {
    var account_id = data['account_id'];
    var new_weapon_level = data['level'];
    var type = data['type'];
    
    var old_weapon_level = account['weapon'];
    
    // weapon字段的含义是玩家拥有的最大等级的炮台倍率, 不会将这个值改小
    if (old_weapon_level > new_weapon_level) {
        console.log('客户端传入了错误的武器等级数据: old(' + old_weapon_level + '), new(' + new_weapon_level + ')');
        cb(null);
        return;
    }
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setWeapon(account_id, new_weapon_level);
    //--------------------------------------------------------------------------
    
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `weapon`=? ';
    if (type == WEAPON_TYPE.VIP) {
        sql += ', `vip_weapon_id`=? ';
    }
    sql += 'WHERE `id`=?';
    console.log('sql: ', sql);
    
    var sql_data = [new_weapon_level];
    if (type == WEAPON_TYPE.VIP) {
        sql_data.push(_getNewWeaponVipIds(old_vip_weapon, vip_weapon_id));
    }
    sql_data.push(account_id);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log('[ERROR] dao_weapon._updateWeaponTable(): ', err);
            cb(err);
            return;
        }
        console.log('result: ', result);
        cb(null);
        _setBroadcast(account, new_weapon_level);
    });
}

function _setBroadcast(account, level) {
    const FUNC = TAG + "_setBroadcast() --- ";
    if (level >= 2000) {
        var player = ObjUtil.getPlayerName(account);
        var charm = account.charm_rank && parseInt(account.charm_rank) || 0;
        if (DEBUG) console.log(FUNC + "**********************************");
        if (DEBUG) console.log(FUNC + "charm_rank:", account.charm_rank);
        var content = {
            txt: player + ' 升级了' + level + '倍炮',
            times: 1,
            type: GAME_EVENT_TYPE.WEAPON_UPGRADE,
            params : [player, level, account.vip, charm],
            platform: account.platform,
            uid:account.id
        };
        buzz_cst_game.addBroadcastGameEvent(content);
    }
}

// 合并原有的数据和新上传的数据
function _getNewWeaponVipIds(old_ids, new_ids) {
    if (old_ids != null && old_ids != "") {
        console.log("old_vip_weapon: ", old_ids);
        old_ids = JSON.parse(old_ids);
        new_ids = JSON.parse(new_ids);
        return JSON.stringify(_.union(old_ids, new_ids));
    }
    else {
        return new_ids;
    }
}

// 从data中获取vip_weapon_id的字符串形式(最终会以数组样式的字符串进行存储)
function _getWeaponVipIds(data) {
    var vip_weapon_id = data['vip_weapon_id'];
    console.log("vip_weapon_id: ", vip_weapon_id);
    
    if (ArrayUtil.isArray(vip_weapon_id)) {
        console.log("传入武器参数为数组");
        try {
            vip_weapon_id = JSON.stringify(vip_weapon_id);
        }
        catch (err_parse) {
            console.log("[dao_weapon] _getWeaponVipIds()", err_parse);
        }
    }
    else {
        console.log("传入武器参数为字符串");
        vip_weapon_id = "" + vip_weapon_id;
        // 如果不是"[xxx]"格式, 添加前后括号
        if (!StringUtil.startsWith(vip_weapon_id, "[")) {
            vip_weapon_id = "[" + vip_weapon_id;
        }
        if (!StringUtil.endsWith(vip_weapon_id, "]")) {
            vip_weapon_id = vip_weapon_id + "]";
        }
    }
    return vip_weapon_id;
}