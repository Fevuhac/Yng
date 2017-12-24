
////////////////////////////////////////////////////////////
// Account Related
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var RedisUtil = require('../utils/RedisUtil');
var CacheAccount = require('../buzz/cache/CacheAccount');
var DaoUtil = require('./dao_utils');
var DaoGold = require('./dao_gold');
var DaoGoddess = require('./dao_goddess');
var DaoSocial = require('./dao_social');
var DaoCommon = require('./dao_common');
var Cfg = require('../buzz/cfg');
var buzz_goddess = require('../buzz/buzz_goddess');
var buzz_cst_sdk = require('../buzz/cst/buzz_cst_sdk');
var CstError = require('../buzz/cst/buzz_cst_error');

var AccountUpdate = require('./account/update');
var AccountChannel = require('./account/channel');
var AccountRanking = require('./account/ranking');
var AccountCommon = require('./account/common');

// 配置文件
var player_users_cfg = require('../../cfgs/player_users_cfg');
var player_level_cfg = require('../../cfgs/player_level_cfg');
var vip_vip_cfg = require('../../cfgs/vip_vip_cfg');
var init_gold = player_users_cfg[0]['gold'];
var init_pearl = player_users_cfg[0]['pearl'];

var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
const account_def = require('./account/account_def');
const cacheWriter = require('../cache/cacheWriter');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao_account】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.channelLogin = channelLogin;
exports.checkChannelAccountSignupStatus = checkChannelAccountSignupStatus;
exports.createChannelAccount = _createChannelAccount;
exports.loginChannelAccount = _loginChannelAccount;
exports.createSessionToken = _createSessionToken;
exports.logout = _logout;
exports.getDayReward = _getDayReward;
exports.resetDayInfoForAll = _resetDayInfoForAll;
exports.resetDayInfoForDailyRewardAdv = resetDayInfoForDailyRewardAdv;
exports.resetWeeklyInfoForAll = resetWeeklyInfoForAll;
exports.getBankruptcyCompensation = _getBankruptcyCompensation;
exports.updateAccount = _updateAccount;
exports.getCharts = getCharts;
exports.getFriendsCharts = getFriendsCharts;
exports.token4DailyReset = token4DailyReset;

exports.flush = flush;
exports.updateDb = updateDb;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 更新token, 返回玩家数据
 */
function token4DailyReset(pool, data, cb) {
    const FUNC = TAG + "token4DailyReset() --- ";

    var uid = data['uid'];
    if (uid == null || uid == "") {
        cb(new Error("用户id(uid)不能为空!"));
        return;
    }

    _createSessionToken(pool, uid, function(err, results) {
        cb(err, results);
        // 更新缓存中的first_login
        if (CacheAccount.contains(uid)) {
            CacheAccount.setFirstLogin(uid, 0);
        }
        // 数据库中的first_login也需要重置
        setFirstLogin(pool, uid, 0, function(err, result) {
            // DO NOTHING
        });
    });
}

function setFirstLogin(pool, uid, first_login, cb) {
    const FUNC = TAG + "setFirstLogin() --- ";
    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `first_login`=? ";
    sql += "WHERE `id`=? ";

    var sql_data = [first_login, uid];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error("err:", err);
            cb(err);
            return;
        }
        if (cb) cb();
    });
}

//------------------------------------------------------------------------------
// 用于统计玩家点击按钮次数.
/**
 * 渠道点击按钮记录.
 */
function channelLogin(pool, data, cb) {
    const FUNC = TAG + "channelLogin() --- ";

    var channel_uid = data.channel_uid;

    var sql = "";
    sql += "SELECT * ";
    sql += "FROM tbl_channel_create ";
    sql += "WHERE channel_uid=? ";
    var sql_data = [channel_uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            if (ERROR) console.error("查询渠道点击信息出错====err:", err);
            cb(err);
            return;
        }
        if (rows.length == 0) {
            if (DEBUG) console.log("需要创建一条tbl_account_create数据并返回insertId");
            _insertChannelCreate(pool, channel_uid, function (err, insertId) {
                _insertChannelLogin(pool, insertId, cb);
            });
        }
        else {
            if (DEBUG) console.log("直接使用id进行插入");
            let channel_user = rows[0];
            _insertChannelLogin(pool, channel_user.id, cb);
        }
    });
}

/**
 * 插入一条数据到tbl_channel_create
 */
function _insertChannelCreate(pool, channel_uid, cb) {
    const FUNC = TAG + "_insertChannelCreate() --- ";

    var sql = "";
    sql += "INSERT INTO tbl_channel_create ";
    sql += "(channel_uid) ";
    sql += "VALUE (?)";
    var sql_data = [channel_uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "插入渠道用户首次点击记录失败====err:", err);
            cb(err);
            return;
        }
        cb(null, rows.insertId);
    });
}

/**
 * 插入一条数据到tbl_channel_login
 */
function _insertChannelLogin(pool, channel_create_id, cb) {
    const FUNC = TAG + "_insertChannelLogin() --- ";

    var sql = "";
    sql += "INSERT INTO tbl_channel_login ";
    sql += "(channel_create_id) ";
    sql += "VALUE (?)";
    var sql_data = [channel_create_id];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "插入渠道用户点击记录失败====err:", err);
            cb(err);
            return;
        }
        console.log("insertId:", rows.insertId);
        _updateChannelCreate(pool, channel_create_id, function(err, result) {
            cb(err, result);
        });
    });
}

/**
 * 更新渠道用户总点击次数.
 */
function _updateChannelCreate(pool, channel_create_id, cb) {
    const FUNC = TAG + "_insertChannelLogin() --- ";

    var sql = "";
    sql += "UPDATE `tbl_channel_create` ";
    sql += "SET `count`=`count`+1 ";
    sql += "WHERE `id`=? ";
    var sql_data = [channel_create_id];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "更新渠道用户总点击次数失败====err:", err);
            cb(err);
            return;
        }
        cb(null, "success");
    });
}
//------------------------------------------------------------------------------

/**
 * 将gAccountCache全部写入数据库中
 */
function flush(pool, cb) {
    // CacheAccount.empty(function (err, list) {
    //     if (list.length > 0) {
    //         AccountCommon.updateMassive(pool, list, cb);
    //     }
    //     else {
    //         cb();
    //     }
    // });
    cb && cb();
}

/**
 * 将gAccountCache全部更新到数据库中
 */
function updateDb(pool, cb) {
    // CacheAccount.onlySave(function (err, list) {
    //     if (list.length > 0) {
    //         AccountCommon.updateMassive(pool, list, cb);
    //     }
    //     else {
    //         cb();
    //     }
    // });
    cb && cb();
}


/**
 * zoneId(1-android, 2-ios)
 */
function checkChannelAccountSignupStatus(pool, channel, chunk, cb) {
    const FUNC = TAG + "checkChannelAccountSignupStatus() --- ";

    var channel_account_id = chunk.data.id;
    if (chunk.zoneId != null) channel_account_id += "_" + chunk.zoneId;

    RedisUtil.hget(PAIR.OPENID_UID, channel_account_id, function(err, value) {
        if (value) {
            chunk["already_signup"] = true;
            console.log("渠道账户存在:", chunk["already_signup"]);
            //设置性别，城市
            chunk.gender && RedisUtil.hset(PAIR.UID_SEX, value, chunk.gender == '男' ? 0 : 1);
            chunk.province && RedisUtil.hset(PAIR.UID_CITY, value, chunk.province);

            chunk.figureurl && RedisUtil.hset("pair:uid:figure_url", value, chunk.figureurl);

            cb(null, chunk);
        }
        else {
            queryChannelAcccountFromDb();
        }
    })

    function queryChannelAcccountFromDb() {
        AccountChannel.getUserInfoByChannelId(pool, "id", channel, channel_account_id, function(err, row) {
            if (err) return cb && cb(err);
            // chunk中加入是否已经注册的信息
            chunk["already_signup"] = !!row;
            console.log("渠道账户存在:", chunk["already_signup"]);
            if (!!row) {
                var id = row.id;
                // RedisUtil.hset(REDIS_KEYS.PAIR.OPENID_UID, channel_account_id, id);
                //设置性别，城市
                chunk.gender && RedisUtil.hset(PAIR.UID_SEX, id, chunk.gender == '男' ? 0 : 1);
                chunk.province && RedisUtil.hset(PAIR.UID_CITY, id, chunk.province);
                chunk.figureurl && RedisUtil.hset("pair:uid:figure_url", id, chunk.figureurl);
            }
            cb(null, chunk);
        });
    }
}

function _createChannelAccount(pool, data, cb) {
    AccountChannel.create(pool, data, cb);
};


/**
 * data: {channel:?, channel_account_id:?}
 */
function _loginChannelAccount(pool, data, cb) {
    AccountChannel.login(pool, data, cb);
}

/**
 * TODO: 记录登出日志, 需要使用缓存机制
 */
function _addLogoutLog(pool, id, nickname) {
    
    var sql = '';
    sql += 'INSERT INTO `tbl_logout_log` ';
    sql += 'SET `account_id`=?, `nickname`=? ';
    
    var sql_data = [id, nickname];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            // Do nothing but log the error
            console.log('call function _addLogoutLog');
            console.log(err);
            return;
        }
    });
}


function _createSessionToken(pool, uid, cb) {
    var token = utils.generateSessionToken(uid);
    CacheAccount.getAccountFieldById(uid, [account_def.AccountDef.token.name], function (err, account) {
        account.token = token;
        cb(null, [account.toJSON()]);
    });
};

function _getAccountByToken(pool, token, cb) {
    var sql = 'SELECT `id`, `tempname`, `token`, `vip_level` FROM `tbl_account` WHERE `token`=?';
    pool.query(sql, [token], cb);
};

function _logout(pool, data, cb) {
    var id = data.account_id;
    var token = data.token;
    cb(null, { status: 1, msg: "成功退出" });
    return;
};

/**
 * 获取每日登录奖励, 需要主动获取(点击"领取"按钮).
 */
function _getDayReward(pool, data, cb) {
    const FUNC = TAG + "_getDayReward() --- ";
    var id = data['account_id'];
    var token = data['token'];
    
    // 需要验证当前字段day_reward是否为0, 为0应该提示"不能重复领取每日签到奖励"

    var sql = '';
    sql += 'SELECT `id`, `day_reward`, `day_reward_weekly` ';
    sql += 'FROM `tbl_account` ';
    sql += 'WHERE `id`=? AND `token`=?';
    console.log('sql: ' + sql);

    var sql_data = [id, token];

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            console.error(FUNC + "err:\n", err);
    	    console.error(FUNC + "sql:\n", sql);
    	    console.error(FUNC + "sql_data:\n", sql_data);
            cb(err);
            return;
        }
        var err_info = null;
        if (results == null) {
            err_info = '查询结果为空';
            cb(new Error(err_info));
            return;
        }
        if (results.length == 0) {
            console.error('-----------------------------------------------------');
            console.error('TOKEN_INVALID: dao_account._getDayReward()');
            console.error('-----------------------------------------------------');
            cb(CstError.ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        var record = results[0];
        if (record.day_reward == 0) {
            err_info = '今日已领，不能重复领取每日签到奖励';
            cb(new Error(err_info));
            return;
        }
        _didGetDayReward(pool, data, cb);
    });
};

function _didGetDayReward(pool, data, cb) {
    const FUNC = TAG + "_didGetDayReward() --- ";
    var account_id = data['account_id'];
    var token = data['token'];
    
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setDayReward(account_id, 0);
    CacheAccount.addDayRewardWeekly(account_id, 1);
    //--------------------------------------------------------------------------
    
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `day_reward`=0, `day_reward_weekly`=`day_reward_weekly`+1 ';
    sql += 'WHERE `id`=? AND `token`=?';
    console.log('sql: ' + sql);
    
    var sql_data = [account_id, token];
    
    pool.query(sql, sql_data, function (err) {
        if (err) {
            console.error(FUNC + "err:\n", err);
    	    console.error(FUNC + "sql:\n", sql);
    	    console.error(FUNC + "sql_data:\n", sql_data);
            cb(err);
            return;
        }
        cb(null, { status: 1, msg: '领取成功', data: 1 });
    });
};

function _resetDayInfoForAll(pool, id_list, cb) {
    const FUNC = TAG + "_resetDayInfoForAll() --- ";
    console.log(FUNC + "cb:", cb);

    //==========================================================================
    var buzz_draw = require("../buzz/buzz_draw");
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `day_reward`=1';
    sql += ',`first_login`=1';
    sql += ',`vip_daily_fill`=1';
    sql += ',`broke_times`=0';
    sql += ",`level_mission`='{}'";
    sql += ",`mission_daily_reset`='{}'";
    sql += ",`heartbeat`=1";
    sql += ",`heartbeat_min_cost`=0";
    sql += ",`gold_shopping`=0";
    sql += ",`drop_reset`='{}'";
    sql += ",`comeback`='{}'";
    sql += ",`active_daily_reset`='{}'";// 每日重置任务
    sql += ",`active_stat_reset`='{}'";
    sql += ",`free_draw`=?";
    sql += ",`total_draw`=?";
    sql += ",`get_card`=?";
    // sql += ",`goddess_free`=1";
    sql += ",`goddess_ctimes`=0";
    sql += ",`goddess_crossover`=`goddess_crossover`+1";
    sql += ",`goddess_free`=(";
    sql += "CASE WHEN `goddess_ongoing`=0 THEN 1 ELSE `goddess_free` END";
    sql += ")";
    if (id_list) {
        console.log(FUNC + "重置指定ID的账户:", id_list);
        sql += " WHERE id IN (" + id_list + ")";
    }
    var sql_data = [
        buzz_draw.getFreeDrawResetString(),
        buzz_draw.getTotalDrawResetString(),
        '{"normal":false,"senior":false}',
    ];

    console.log(FUNC + "sql:\n", sql);
    console.log(FUNC + "sql_data:\n", sql_data);
    
    pool.query(sql, sql_data, function (err) {
        if (err) {
            if (cb) cb(err);
            return;
        }
        // TODO: 修改token为daily_reset
        _tokenDailyReset(pool, id_list, function() {
            if (cb) cb(null, { status: 1, msg: '重置成功', data: 1 });
        });
    });
};

function _resetGoddess(pool, id_list, cb) {
    const FUNC = TAG + "_resetGoddess() --- ";
    
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `goddess_free`=(';
    sql += "CASE WHEN `goddess_ongoing`=0 THEN 1 ELSE goddess_free END";
    sql += ')';
    if (id_list) {
        console.log(FUNC + "重置指定ID的账户:", id_list);
        sql += " WHERE id IN (" + id_list + ")";
    }
    var sql_data = [];

    console.log(FUNC + "sql:\n", sql);
    console.log(FUNC + "sql_data:\n", sql_data);
    
    pool.query(sql, sql_data, function (err) {

    });
}

/**
 * 跨天操作完毕时重置token提示玩家需要同步更新服务器数据.
 * @param uid_list 可指定需要跨天的玩家列表, 方便测试.
 */
function _tokenDailyReset(pool, uid_list, cb) {
    const FUNC = TAG + "_tokenDailyReset() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (DEBUG) console.log(FUNC + "uid_list:", uid_list);
    // 是否踢出指定玩家
    var kick_specific_user = uid_list != null && uid_list.length > 0;

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`='daily_reset' ";
    if (kick_specific_user) {
        sql += "WHERE id IN (?)";
    }

    var sql_data = [];
    if (kick_specific_user) {
        sql_data.push(uid_list);
    }

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            if (DEBUG) console.log(FUNC + "跨天重置token成功");
        }
        if (cb) cb();
    });
 
}


function resetDayInfoForDailyRewardAdv(pool, cb) {
    // 重置缓存中的数据
    CacheAccount.resetAdvGift4Day();
    //==========================================================================
    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `day_reward_adv`=0";
    var sql_data = [];

    console.log('sql:\n', sql);
    console.log('sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, { status: 1, msg: '重置成功', data: 1 });
    });
}

function resetWeeklyInfoForAll(pool, id_list, cb) {
    const FUNC = TAG + "resetWeeklyInfoForAll() --- ";
    console.log(FUNC + "id_list:\n" , id_list);
    console.log(FUNC + "cb:\n" , cb);
    // 1. 重置女神排行榜数据
    DaoGoddess.resetMaxWaveForAll(pool, id_list, function(err, results) {
        // 2. 重置每周分享的数据
        DaoSocial.resetWeeklyShare(pool, id_list, function(err, results) {
            if (cb) cb(err, results);
        });
    });
};

function _getVipInfo(vip_level) {
    for (var idx in vip_vip_cfg) {
        console.log('vip_level: ', vip_level);
        console.log('cfg::vip_level: ', vip_vip_cfg[idx].vip_level);
        if (vip_vip_cfg[idx].vip_level == vip_level) {
            return vip_vip_cfg[idx];
        }
    }
}

/**
 * 破产领取，领取后将tbl_account中的broke_times加1并返回当前数据(破产获取的金币由_addGoldLog进行更新).
 * 先验证再更新.
 */
function _getBankruptcyCompensation(pool, data, cb) {
    const FUNC = TAG + "_getBankruptcyCompensation() --- ";
    var uid = data.account_id;
    var token = data.token;

    if (uid == null || uid == "") {
        cb(new Error("account_id字段不能为空!"));
        return;
    }
    if (token == null || token == "") {
        cb(new Error("token字段不能为空!"));
        return;
    }

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    async function doNextWithAccount(account) {
        // var record = results_account[0];
        // 修改: 不同VIP等级每日补偿领取的次数不同, 需要计数领取次数, 然后和配置中的数据对比进行判断
        // vip_vip_cfg[vip].vip_alms_times
        var vip = account.vip;
        var vipInfo = _getVipInfo(vip);
        var vip_alms_value = 0;
        if (DEBUG) console.log(FUNC + 'vipInfo: ', vipInfo);
        if (vipInfo) {
            var vip_alms_times = vipInfo.vip_alms_times;
            var vip_alms_value = vipInfo.vip_alms_value;

            if (DEBUG) console.log(FUNC + 'account.broke_times: ', account.broke_times);
            if (DEBUG) console.log(FUNC + 'vip_alms_times: ', vip_alms_times);

            if (account.broke_times >= vip_alms_times) {
                if (ERROR) console.log(FUNC + '【ERROR】今日的破产补偿已经领取完毕，明天再来吧');
                cb(new Error('今日的破产补偿已经领取完毕，明天再来吧'));
                return;
            }
        }
        else {
            // TODO: 没有查找到VIP玩家信息的处理
        }
        
        // 玩家领取救济金数量获取
        
        //--------------------------------------------------------------------------
        // 更新缓存中的数据(重要:数据库操作将会被删除)
        //--------------------------------------------------------------------------
        CacheAccount.costBrokeTimes(uid);
        CacheAccount.setGold(uid, vip_alms_value);

        vip_alms_value > 0 && await cacheWriter.subReward(vip_alms_value, account); //破产领取从奖池中扣除
        
        //--------------------------------------------------------------------------
        cb(null, [{gold: vip_alms_value}]);
    }
}

/**
 * 账户数据更新(包括经验值(exp),...).
 */
function _updateAccount(pool, data, account, cb) {
    AccountUpdate.updateAccount(pool, data, account, cb);
}

/**
 * 获取排行榜(根据用户的某些数据段进行排位返回)
 */
function getCharts(pool, data, cb) {
    AccountRanking.getCharts(pool, data, cb);
}

/**
 * 获取好友排行榜.
 */
function getFriendsCharts(pool, data, cb) {
    AccountRanking.getFriendsCharts(pool, data, cb);
}
