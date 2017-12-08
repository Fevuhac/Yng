////////////////////////////////////////////////////////////////////////////////
// Account Update Defend Goddess
// 心跳更新(每日凌晨重置为0)
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ObjUtil = require('../../../buzz/ObjUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var RedisUtil = require('../../../utils/RedisUtil');
var REDIS_KEYS = require('../../../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR,
    RANK = REDIS_KEYS.RANK;

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var goddess_goddessup_cfg = require('../../../../cfgs/goddess_goddessup_cfg');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【update.defend_goddess】";


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
 * 保卫女神数据存储.
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
/**
data:
{ account_id: 2528,
  token: '2528_4cf509cd4915d9d73c466e5a37a99ee9d1552c99c924181f',
  gods:
   [ { id: 1,
       level: 0,
       hp: 100,
       startWaveIdx: 2,
       free: 1,
       ctimes: 0,
       unlock: [Object],
       isPauseAway: true,
       interactReward: [Object] },
     { },
     { },
     { },
     { } ],
  pass: false,
  pass_idx: 0,
  type: 23,
  platform: 1
}
 */
    // if (DEBUG) console.log(FUNC + "data:", data);

    var token = my_account['token'];
    var gods = data['gods'];
    var pass = data['pass'];// 是否结算(结算更新max_wave和max_wave_time, 否则不更新)
    var account_id = token.split("_")[0];

    if (DEBUG) console.log(FUNC + "pass:", pass);
    if (DEBUG) console.log(FUNC + "gods:", gods);

    var obj_goddess = ObjUtil.str2Data(gods);

    var isOnGoing = _getOnGoing(obj_goddess);

    if (DEBUG) console.log(FUNC + 'pass:', pass);
    if (pass) {
        if (DEBUG) console.log(FUNC + '保卫女神结算!!!!!!');
    }
    // 更新tbl_goddess中的数据, 供排名使用
    _updateTableGoddess(pool, account_id, my_account, gods, pass, function() {
        // 需要先更新女神记录(数据库), 再重置数据
        if (pass) {
            var pass_idx = data['pass_idx'];
            var goddess_tobe_change = obj_goddess[pass_idx];
            goddess_tobe_change.hp = _getGoddessHp(goddess_tobe_change.id, goddess_tobe_change.level);
            goddess_tobe_change.startWaveIdx = 0;
        }

        ////--------------------------------------------------------------------------
        //// 更新缓存中的数据(重要:数据库操作将会被删除)
        ////--------------------------------------------------------------------------
        CacheAccount.setGoddess(account_id, ObjUtil.str2Data(obj_goddess));
        CacheAccount.setGoddessOngoing(account_id, isOnGoing);
        if (pass) {
            if (DEBUG) console.log(FUNC + '重置缓存goddess_crossover');
            CacheAccount.setGoddessCrossover(account_id, 0);
        }
        ////--------------------------------------------------------------------------

        cb(null, "success");
    });
}

/**
 * 获取当前保卫女神的状态, 1为有正在进行的游戏, 0表示没有正在进行的游戏.
 */
function _getOnGoing(goddess) {
    for (var i = 0; i < goddess.length; i++) {
        if (goddess[i].isPauseAway) {
            return 1;
        }
    }
    return 0;
}


//==============================================================================
// private
//==============================================================================

function _getGoddessHp(id, level) {
    var goddess = getGoddessFromId(id, level);
    return goddess.hp;
}

function getGoddessFromId(id, level) {
    for (var idx in goddess_goddessup_cfg) {
        var goddess = goddess_goddessup_cfg[idx];
        if (goddess.id == id && goddess.level == level) {
            return goddess;
        }
    }
    return 
}

function _updateTableGoddess(pool, uid, my_account, goddess, pass, cb) {
    const FUNC = TAG + "_updateTableGoddess() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    /**
goddess:
[ { id: 1,
    level: 0,
    hp: 100,
    startWaveIdx: 1,
    free: 1,
    ctimes: 0,
    unlock: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    isPauseAway: true,
    interactReward: [ 0, 0, 0, 0 ] },
  { },
  { },
  { },
  { } ]  
     */
    // if (DEBUG) console.log(FUNC + "goddess:", goddess);

    var sql = "";
    sql += "SELECT id, max_wave ";
    sql += "FROM `tbl_goddess` ";
    sql += "WHERE `id`=?";
    var sql_data = [uid];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + 'err:\n', err);
            return;
        }
        if (result.length == 0) {
            // 创建数据
            _insertGoddess(pool, uid, function (err, result) {
                // 更新数据
                _didUpdateGoddess(pool, goddess, {id: uid, max_wave:0, platform: my_account.platform}, pass, cb);
            });
        }
        else {
            var goddess_data = result[0];
            goddess_data.platform = my_account.platform;
            if (DEBUG) console.log(FUNC + "goddess_data:", goddess_data);
            // 更新数据
            _didUpdateGoddess(pool, goddess, goddess_data, pass, cb);
        }
    });
}

function _insertGoddess(pool, uid, cb) {
    const FUNC = TAG + "_insertGoddess() --- ";
    
    var sql = "";
    sql += "INSERT INTO `tbl_goddess` ";
    sql += "(id, max_wave) ";
    sql += "VALUES (?,?)";
    var sql_data = [uid, 0];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + '[ERROR] err:', err);
            cb(err);
            return;
        }
        cb(null, result);
    });
}

/**
 * old_goddess为
 */
function _didUpdateGoddess(pool, goddess_list, old_goddess, pass, cb) {
    const FUNC = TAG + "_didUpdateGoddess() --- ";

    if (DEBUG) console.log(FUNC + "pass:", pass);
    if (pass) {
        // 获取Redis中的最大波数进行比较
        RedisUtil.hget(PAIR.UID_GODDESS_MAX_WAVE, old_goddess.id, function(err, res) {
            console.log(FUNC + "----------------res:", res);
            if (res) {
                res = parseInt(res);
                old_goddess.max_wave = res;
            }

            // yTODO: 获取Redis中女神排行榜中的值, 避免max_wave清零后数据被冲掉
            var member = old_goddess.id;
            var platform = old_goddess.platform;
            RedisUtil.zscore(RANK.GODDESS + ":" + platform, member, function(err, res) {
                if (err) {
                    console.error(FUNC + "err:", err);
                    opGoddess();
                }
                else {
                    console.log(FUNC + "================res:", res);
                    if (res) {
                        res = parseInt(res);
                        old_goddess.max_wave = res;
                    }
                    else {
                        old_goddess.max_wave = 0;
                    }
                    opGoddess();
                }
            });

            function opGoddess() {
                var needUpdate = false;
                for (var idx in goddess_list) {
                    var startWaveIdx = goddess_list[idx].startWaveIdx;
                    if (old_goddess.max_wave < startWaveIdx) {
                        old_goddess.max_wave = startWaveIdx;
                        needUpdate = true;
                    }
                }
                if (needUpdate) {
                    // 更新缓存
                    CacheAccount.setMaxWave(old_goddess.id, old_goddess.max_wave);
                    // 更新数据库
                    var sql = "";
                    sql += "UPDATE `tbl_goddess` ";
                    sql += "SET max_wave=? ";
                    sql += "WHERE id=?";
                    var sql_data = [old_goddess.max_wave, old_goddess.id];

                    if (DEBUG) console.log(FUNC + "sql:\n", sql);
                    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);
                    
                    pool.query(sql, sql_data, function (err, result) {
                        if (err) {
                            if (ERROR) console.error(FUNC + '[ERROR] err:', err);
                            return;
                        }
                        if (cb) cb();
                    });
                }
                else {
                    if (cb) cb();
                }
            }
        });
    }
    else {
        if (cb) cb();
    }
}