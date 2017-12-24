////////////////////////////////////////////////////////////////////////////////
// Account Common Function
// 账户数据库读取通用函数
// init
// login
// getAccountById
// getAccountByToken
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var utils = require('../../buzz/utils');
var DaoGold = require('../dao_gold');
var ObjUtil = require('../../buzz/ObjUtil');
var ErrorUtil = require('../../buzz/ErrorUtil');
var ArrayUtil = require('../../utils/ArrayUtil');
var StringUtil = require('../../utils/StringUtil');
var DateUtil = require('../../utils/DateUtil');
var HttpUtil = require('../../utils/HttpUtil');
var RedisUtil = require('../../utils/RedisUtil');
var CharmUtil = require('../../utils/CharmUtil');
var BuzzUtil = require('../../utils/BuzzUtil');
var CacheCharts = require('../../buzz/cache/CacheCharts');
var RANK_TYPE = CacheCharts.RANK_TYPE;
var account_def = require('./account_def'),
    AccountDefault = account_def.AccountDef,
    AccountOtherDef = account_def.OtherDef;
var redisSync = require('../../buzz/redisSync');
var DBMysqlHelper = require('../../buzz/mysqlSync');

var ranking = require('./ranking');
var buzz_cst_game = require('../../buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../buzz/cst/buzz_cst_error');
var buzz_draw = require('../../buzz/buzz_draw');
var buzz_goddess = require('../../buzz/buzz_goddess');
var buzz_drop = require('../../buzz/buzz_drop');
var buzz_skill = require('../../buzz/buzz_skill');
var buzz_reward = require('../../buzz/buzz_reward');
var buzz_initdata = require('../../buzz/buzz_initdata');
var buzz_redis = require('../../buzz/buzz_redis');
var sql_pojo = require('../../buzz/pojo/sql_pojo');

//------------------------------------------------------------------------------
// 配置文件
//------------------------------------------------------------------------------
var active_activequest_cfg = require('../../../cfgs/active_activequest_cfg');
var vip_vip_cfg = require("../../../cfgs/vip_vip_cfg");

var player_users_cfg = require('../../../cfgs/player_users_cfg');
var init_gold = player_users_cfg[0]['gold'];
var init_pearl = player_users_cfg[0]['pearl'];
var init_level = player_users_cfg[0]['level'];
var init_exp = player_users_cfg[0]['exp'];

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../buzz/cache/CacheLink');
var CacheAccountServer = require('../../buzz/cache/CacheAccountServer');
var CacheAccount = require('../../buzz/cache/CacheAccount');

const async = require('async');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../../routes/api_map');

var SERVER_CFG = require("../../cfgs/server_cfg").SERVER_CFG;

var REDIS_KEYS = require("../../buzz/cst/buzz_cst_redis_keys").REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;


//==============================================================================
// constant
//==============================================================================
const FAMOUS_ONLINE_TYPE = buzz_cst_game.FAMOUS_ONLINE_TYPE;


var DEBUG = 0;
var ERROR = 1;

var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

var TAG = "【dao/account/common】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.init = init;
exports.createNewPlayer = createNewPlayer;
exports.login = login;


exports.getAccountById = getAccountById;
exports.getAccountByUid = getAccountByUid;
exports.getAccountByToken = getAccountByToken;
exports.checkNickname = checkNickname;
exports.isCardValid = isCardValid;

exports.updateMassive = updateMassive;
exports.getGuideWeakInit = getGuideWeakInit;

exports.getTokenByUid = getTokenByUid;

exports.modifySessionToken = modifySessionToken;
exports.updateCardData = updateCardData;
exports.updateVipGold = _updateVipGold;//TODO
exports.updateLoginCount = updateLoginCount;//TODO
exports.accountCharmOpt = accountCharmOpt;
exports.syncUser = syncUser;
exports.checkCheat = checkCheat;//TODO
exports.addFamousOnlineBroadcast = _addFamousOnlineBroadcast;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 创建账号后对账号的相关信息进行初始化(金币，钻石，临时用户名...)
 * @param pool 数据库池
 * @param id 用户ID
 * @param cb 回调函数, 用于处理获取的数据
 */
function init(pool, id, cb) {
    if (DEBUG) console.log('init() - id: ' + id);
    _addRecordToGoldTable(pool, id, cb);
};


/**
 * 检测玩家是否为作弊被封号的玩家
 */
function checkCheat(account, cb) {
    const FUNC = TAG + "checkCheat() --- ";
    console.error(FUNC + "account.test:", account.test);
    if (account.test == -1) {
        if (ERROR) console.error(FUNC + "玩家作弊被封号");
        cb && cb(ERROR_OBJ.PLAYER_CHEAT);
        return false;
    }
    return true;
}

/**
 * 登录账号后对账号的相关信息进行更新
 * @param pool 数据库池
 * @param id 用户ID
 * @param cb 回调函数, 用于处理获取的数据
 */
function login(pool, account, api_name, cb) {
    const FUNC = TAG + "login() --- ";
    if (DEBUG) console.log(FUNC + 'CALL...');

    var id = account.id;
    // TODO: 登录API调用记录
    BuzzUtil.cacheLinkAccountApi({uid: id}, api_name);
    // 每次登录都重新生成token
    _modifySessionToken(pool, id, function (err, token) {
        if (err) {
            console.error(FUNC + "修改用户token失败:", err);
            cb(err);
            return;
        }
        if (DEBUG) console.log(FUNC + 'token:' + token);
        if (DEBUG) console.log(FUNC + 'id: ' + id);
        account.token = token;// 重设登录用户的token.

        // 记录玩家登录数据到CacheAccountServer中(登录服务器id, 登录时间)
        var data = {
            uid: id,
            sid: SERVER_CFG.SID,
            login_time: new Date().getTime(),
        };
        CacheAccountServer.push(data);

        // 更新玩家的月卡信息
        _updateCardData(pool, account, cb);
    });
};


function _getFieldList(fields) {
    var sql = "";
    sql += "SELECT ";
    for (var i = 0; i < fields.length; i++) {
        if (i > 0) sql += ",";
        sql += "`" + fields[i] + "` ";
    }
    return sql;
}

/**
 * 根据用户的ID获取用户信息
 * @param pool 数据库池
 * @param id 用户ID
 * @param cb 回调函数, 用于处理获取的数据
 */
function getAccountById(pool, id, cb) {
    const FUNC = TAG + "getAccountById() --- ";
    if (DEBUG) console.log(FUNC + "CAll...");
    if (DEBUG) console.log(FUNC + 'id: ' + id);
    var sql = _resultList();
    sql += 'WHERE a.`id`=? ';
    var sql_data = [id];
    async.waterfall(
        [
            function (cb) {
                _queryAccount(pool, sql, sql_data, cb);
            }
            , function (account, cb) {
                console.log(FUNC + "1.account.id:", account.id);
                cb(null, transformSql2Redis(account));
            }
            , function (account, cb) {
                if (!account.nickname || account.nickname == "") {
                    account.nickname = account.channel_account_name;
                }
                if (!account.nickname || account.nickname == "") {
                    account.nickname = account.tempname;
                }
                console.log(FUNC + "2.account.id:", account.id);
                redisSync.setAccountById(id, account, cb);
            }
            , function (res, cb) {
                redisSync.getAccountById(id, cb);
            }
        ], function (err, account) {
            if (err) console.log(FUNC + 'err: ', err);
            console.log(FUNC + '3.account.id: ', account.id);
            cb && cb(err, account);
        }
    );
}

/**
 * 仅返回一个用户数据.
 */
function getAccountByUid(pool, id, cb) {
    const FUNC = TAG + "getAccountByUid() --- ";
    if (DEBUG) console.log(FUNC + "CAll...");
    getAccountById(pool, id, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            cb(ERROR_OBJ.DATA_NULL_ERROR);
            return;
        }
        if (!results) {
            if (ERROR) console.error(FUNC + "results为空");
            cb(ERROR_OBJ.DATA_NULL_ERROR);
            return;
        }
        if (results.length > 0) {
            var data = results[0];
            if (data.id == 21) {
                // console.log(FUNC + "__DEBUG__figure_url:", account.figure_url);
                console.log(FUNC + "__DEBUG__account:\n", JSON.stringify(data));
            }
            async.waterfall([function (cb) {
                CacheAccount.setAccountById(data.id, data, cb);
            }, function (result, cb) {
                CacheAccount.getAccountById(data.id, cb);
            }, function (account, _cb) {
                cb(err, account);
                _cb();
            }]);
        }
        else {
            cb(err, null);
        }
    });
}

/**
 * 根据用户的Token获取用户信息
 * @param pool 数据库池
 * @param token 用户Token
 * @param cb 回调函数, 用于处理获取的数据
 */
function getAccountByToken(pool, token, cb) {
    const FUNC = TAG + "getAccountByToken() --- ";
    if (DEBUG) console.log(FUNC + "CAll...");
    //DEBUG = 0;
    //------------------------------------------------------

    if (DEBUG) console.log(FUNC + 'token: ' + token);
    if (token == "daily_reset") {
        if (ERROR) console.error(FUNC + "服务器跨天更新token");
        cb(ERROR_OBJ.DAILY_RESET);// 1013
        DEBUG = 0;
        return;
    }
    else if (token == "server_update") {
        if (ERROR) console.error(FUNC + "服务器更新重启");
        cb(ERROR_OBJ.SERVER_UPDATE);// 1012
        DEBUG = 0;
        return;
    }


    // 从token获取到uid, 从uid获取当前token
    var uid = token.split("_")[0];
    if (DEBUG) console.log(FUNC + 'uid: ' + uid);
    getTokenByUid(uid, function (err, db_token) {
        if (err) {
            cb(err);
            return;
        }
        if (DEBUG) console.log(FUNC + 'db_token: ' + db_token);
        if (token == db_token) {
            redisSync.getAccountById(uid, function (err, account) {
                if (account) {
                    cb(null, [account]);
                }
                else {
                    var sql = _resultList();
                    // sql += 'WHERE a.`token`=? ';
                    // var sql_data = [token];
                    sql += 'WHERE a.`id`=? ';
                    var sql_data = [uid];
                    _queryAccount(pool, sql, sql_data, cb);
                    DEBUG = 0;
                }
            });
        }
        else {
            if (ERROR) console.log(FUNC + "token与客户端不匹配");
            if (db_token == "daily_reset") {
                if (ERROR) console.error(FUNC + "服务器跨天更新token");
                cb(ERROR_OBJ.DAILY_RESET);// 1013
                DEBUG = 0;
                return;
            }
            else if (db_token == "server_update") {
                if (ERROR) console.error(FUNC + "服务器更新重启");
                cb(ERROR_OBJ.SERVER_UPDATE);// 1012
                DEBUG = 0;
                return;
            }
            else {
                if (ERROR) console.error(FUNC + "玩家账号在其他地方登录");
                cb(ERROR_OBJ.TOKEN_INVALID);//1011
                DEBUG = 0;
                return;
            }
        }
    });
};

/**
 * 根据用户ID获取token.
 */
function getTokenByUid(uid, cb) {
    const FUNC = TAG + "getTokenByUid() ---";
    redisSync.getAccountById(uid, ['token'], function (err, account) {
        if (account) {
            cb && cb(null, account.token);
        }
        else {
            var sql = "";
            sql += "SELECT id, token ";
            sql += "FROM tbl_account ";
            sql += "WHERE `id`=? ";
            var sql_data = [uid];

            mysqlPool.query(sql, sql_data, function (err, results) {
                if (err) {
                    cb(err);
                    return;
                }
                if (results.length == 0) {
                    if (ERROR) console.error(FUNC + "没有查找到对应的用户, uid:", uid);
                    var ret_error_obj = {
                        code: ERROR_OBJ.UID_CANNOT_FIND.code,
                        msg: ERROR_OBJ.UID_CANNOT_FIND.msg + " uid:" + uid,
                    };
                    cb(ret_error_obj);
                    return;
                }
                cb(err, results[0].token);
            });
        }

    })
}

function _queryAccount(pool, sql, sql_data, cb) {
    const FUNC = TAG + "_queryAccount() --- ";
    if (DEBUG) console.log(FUNC + "CAll...");
    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "uid:", sql_data);
    // let sql1 = 'SELECT * FROM tbl_account WHERE id=?'
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            console.log(FUNC + "err:\n", err);
            console.log(FUNC + "results:\n", results);
            cb && cb(err);
            return;
        }

        if (results != null && results.length > 0) {
            var account = results[0];
            console.log('---goddess_free:', account.goddess_free);
            cb(null, account);
        } else {
            cb('账号未注册')
        }
    });
}

//从缓存中取出魅力参数,注意老玩家的好友数量
function accountCharmOpt(account_in_cache, cb) {
    CacheAccount.resetCharmPoint(account_in_cache, function (cps) {
        if (cps && cps.length == 2) {
            account_in_cache.charm_point = cps[0];
            account_in_cache.charm_rank = cps[1];
        }
        cb && cb(null, [account_in_cache]);
    });
}


/**
 * 合并active_daily_reset的数据到active中
 * 只读操作不改变Redis数据
 */
function _mergeActive(result) {
    const FUNC = TAG + "_mergeActive() --- ";
    var uid = result.id;
    if (CacheAccount.contains(uid)) {
        var account = CacheAccount.getAccountById(uid);
        // console.log(FUNC + "1.account.active_daily_reset:", account.active_daily_reset);
        // console.log(FUNC + "1.account.active:", account.active["19"]);
        var active = account.active;

        if (!_.has(account, "active_daily_reset")) {
            account.active_daily_reset = {};
        }
        if (account.active_daily_reset == null) {
            account.active_daily_reset = {};
        }
        var active_daily_reset = account.active_daily_reset;
        // 遍历active_daily_reset将数值设置到active
        for (var condition in active) {
            var condition_data = active[condition];
            for (var val1 in condition_data) {
                var repeat = getRepeatFromActiveQuest(condition, val1);
                if (repeat) {
                    if (!_.has(active_daily_reset, condition)) {
                        // console.log(FUNC + "!_.has(active_daily_reset, condition)");
                        // console.log(FUNC + "active_daily_reset:", active_daily_reset);
                        // console.log(FUNC + "condition:", condition);
                        active_daily_reset[condition] = {};
                        active[condition][val1] = 0;
                    }
                    else {
                        if (!_.has(active_daily_reset[condition], val1)) {
                            active[condition][val1] = 0;
                        }
                    }
                    // console.log(FUNC + "2.account.active_daily_reset:", account.active_daily_reset);
                    // console.log(FUNC + "2.account.active:", account.active["19"]);
                    if (active_daily_reset && active_daily_reset[condition]
                        && active && active[condition]) {
                        active_daily_reset[condition][val1] = active[condition][val1];
                    }
                }
            }
        }
        // console.log(FUNC + "3.account.active_daily_reset:", account.active_daily_reset);
        // console.log(FUNC + "3.account.active:", account.active["19"]);

        // 遍历active将数值设置到active_daily_reset(repeat为1)
        for (var condition in active) {
            var condition_data = active[condition];
            for (var val1 in condition_data) {
                var repeat = getRepeatFromActiveQuest(condition, val1);
                if (repeat) {
                    var val1_value = condition_data[val1];
                    if (!_.has(active_daily_reset, condition)) {
                        active_daily_reset[condition] = {};
                    }
                    // if (condition == "19" && val1 == "1") {
                    //     console.log(FUNC + "active_daily_reset[19][1]:", active_daily_reset[condition][val1]);
                    // }
                    if (active_daily_reset && active_daily_reset[condition]) {
                        active_daily_reset[condition][val1] = val1_value;
                    }
                }
            }
        }
    }
}

/**
 * 返回活动是否重复, 默认返回不重复.
 * @param condition 判断条件1.
 * @param val1 判断条件2.
 */
function getRepeatFromActiveQuest(condition, val1) {
    for (var id in active_activequest_cfg) {
        var activequest = active_activequest_cfg[id];
        if (activequest.condition == condition && activequest.value1 == val1) {
            return activequest.repeat;
        }
    }
    return 0;// 默认返回不重复
}


/**
 * 优化返回值.
 */
function _optimize(result) {
    const FUNC = TAG + "_optimize() --- ";

    // 邮箱处理
    var mail_box = result.mail_box;
    if (DEBUG) console.log(FUNC + "mail_box:", mail_box);
    if (mail_box == null || mail_box == "" || mail_box == []) {
        //console.log("!!!!!!!!!!!!!!玩家没有邮件");
        result.mail_box = [];
        result.has_new_mail = false;
    }
    else {
        // mail_box = ObjUtil.data2String(mail_box);
        if (StringUtil.isString(mail_box)) {
            mail_box = StringUtil.trim(mail_box, ',');
            result.mail_box = ObjUtil.str2Data("[" + mail_box + "]");
        }
        result.has_new_mail = true;
    }

    // VIP礼包处理
    var vip_gift = result.vip_gift;
    if (DEBUG) console.log(FUNC + "vip_gift:", vip_gift);
    result.vip_gift = ArrayUtil.makeArrayString(vip_gift);

    // 女神数据处理
    var goddess = ObjUtil.str2Data(result.goddess);
    if (goddess == null) {
        console.error(FUNC + "uid:", result.id);
    }
    result.goddess = goddess;

    // 新手强制教学未完成时，玩家退出再登录，此时玩家金币需要恢复为默认初始值。
    // 08月17日.txt(任务1)
    if (!result.guide && result.gold != 1000) {
        result.gold = 1000;
    }

    result.month_sign = ArrayUtil.getIntArr(result.month_sign);

}

/**
 * 检测昵称是否存在
 * @param pool 数据库池
 * @param nickname 待检测的昵称
 * @param cb 回调函数, 用于处理获取的数据
 */
function checkNickname(pool, nickname, cb) {
    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_account`';
    sql += ' WHERE `nickname`=?';
    var sql_data = [nickname];

    if (DEBUG) console.log('sql:', sql);
    if (DEBUG) console.log('sql_data:', sql_data);

    pool.query(sql, sql_data, function (err, results) {
        cb(err, results);
    });
}

/**
 * 当前月卡是否有效
 * @param card_type 月卡类型，取值为normal
 */
function isCardValid(card, card_type) {
    if (card[card_type]) {
        var buy_date = card[card_type]['start_date'];
        var cur_date = DateUtil.format(new Date(), "yyyy-MM-dd");
        var offDate = DateUtil.dateDiff(cur_date, buy_date);

        if (DEBUG) console.log("购买日期: " + buy_date);
        if (DEBUG) console.log("当前日期: " + cur_date);
        if (DEBUG) console.log("距离购买日过去天数: " + offDate);

        return offDate < 30;
    }
}

/**
 * 获取弱引导初始值.
 */
function getGuideWeakInit() {
    var init = {
        "laser": false,
        "achieve": false,
        "reward": false,
        "petfish": false,
        "goddess": false,
        "laserTimes": 3,
        "specials": {}
    };
    return ObjUtil.data2String(init);
}


//==============================================================================
// private
//==============================================================================
// 获取返回值列表
function _resultList() {
    var sql = '';
    sql += 'SELECT ';
    sql += 'a.`id`, ';
    sql += 'a.`jointype`, ';
    sql += 'a.`who_invite_me`, ';
    sql += 'a.`who_share_me`, ';
    sql += 'a.`updated_at`, ';
    sql += 'a.`tempname`, ';
    sql += 'a.`nickname`, ';
    sql += 'a.`channel`, ';
    sql += 'a.`channel_account_name`, ';
    sql += 'a.`channel_account_id`, ';
    sql += 'a.`channel_account_info`, ';
    sql += 'a.`created_at`, ';
    sql += 'a.`pfft_at`, ';
    sql += 'a.`login_count`, ';
    sql += 'a.`logout_count`, ';
    sql += 'a.`salt`, ';
    sql += 'a.`token`, ';
    sql += 'a.`password`, ';
    sql += 'a.`charm_rank`, ';
    sql += 'a.`charm_point`, ';
    sql += 'a.`vip`, ';
    sql += 'a.`rmb`, ';
    sql += 'a.`exp`, ';
    sql += 'a.`level`, ';
    sql += 'a.`gold`, ';
    sql += 'a.`pearl`, ';
    sql += 'a.`weapon`, ';
    sql += 'a.`weapon_energy`, ';
    sql += 'a.`vip_weapon_id`, ';
    sql += 'a.`skill`, ';
    sql += 'a.`broke_times`, ';
    sql += 'a.`day_reward`, ';
    sql += 'a.`day_reward_adv`, ';
    sql += 'a.`new_reward_adv`, ';
    sql += 'a.`day_reward_weekly`, ';
    sql += 'a.`vip_daily_fill`, ';
    sql += 'a.`level_mission`, ';
    sql += 'a.`mission_daily_reset`, ';
    sql += 'a.`mission_only_once`, ';
    sql += 'a.`first_buy`, ';
    sql += 'a.`first_buy_gift`, ';
    sql += 'a.`activity_gift`, ';
    sql += 'a.`heartbeat`, ';
    sql += 'a.`heartbeat_min_cost`, ';
    sql += 'a.`achieve_point`, ';
    sql += 'a.`gold_shopping`, ';
    sql += 'a.`weapon_skin`, ';
    sql += 'a.`bonus`, ';
    sql += 'a.`drop_reset`, ';
    sql += 'a.`drop_once`, ';
    sql += 'a.`comeback`, ';
    sql += 'a.`vip_gift`, ';
    sql += 'a.`pirate`, ';
    sql += 'a.`card`, ';
    sql += 'a.`get_card`, ';
    sql += 'a.`package`, ';
    sql += 'a.`guide`, ';
    sql += 'a.`guide_weak`, ';
    sql += 'a.`active`, ';
    sql += 'a.`active_daily_reset`, ';
    sql += 'a.`active_stat_once`, ';
    sql += 'a.`active_stat_reset`, ';
    sql += 'a.`free_draw`, ';
    sql += 'a.`total_draw`, ';
    sql += 'a.`mail_box`, ';
    sql += 'a.`roipct_time`, ';
    sql += 'a.`goddess`, ';
    sql += 'a.`free_goddess`, ';
    sql += 'a.`goddess_free`, ';
    sql += 'a.`goddess_ctimes`, ';
    sql += 'a.`goddess_crossover`, ';
    sql += 'a.`goddess_ongoing`, ';
    sql += 'a.`redress_no`, ';
    sql += 'a.`first_login`, ';
    sql += 'a.`aquarium`, ';
    sql += 'a.`platform`, ';
    sql += 'a.`test`, ';
    sql += 'a.`figure`, ';
    sql += 'a.`rank_in_friends`, ';
    sql += 'a.`over_me_friends`, ';
    sql += 'a.`last_online_time`, ';
    sql += 'a.`sex`, ';
    sql += 'a.`city`, ';

    // sql += 'i.`web_url` AS figure_url, ';
    sql += "i.`web_url` AS figure_url, ";

    sql += 'asign.`month_sign` AS month_sign, ';
    sql += 'server.`sid` AS sid, ';

    sql += 's.`match_on` AS match_on, ';
    sql += 's.`cik_on` AS cik_on, ';
    sql += 's.`cdkey_on` AS cdkey_on, ';
    sql += 's.`msgboard_mgmt` AS msgboard_mgmt, ';

    sql += 'g.`max_wave` AS max_wave, ';
    sql += 'g.`updated_at` AS goddess_balance_time, ';
    sql += 'g.`week_reward` AS week_reward, ';
    sql += 'g.`week_rank` AS week_rank ';

    sql += ',aq.`updated_at` AS petfish_recent_time ';
    sql += ',aq.`total_level` AS petfish_total_level ';

    sql += ',r.`updated_at` AS match_recent_time ';
    sql += ',r.`win` AS match_win ';
    sql += ',r.`fail` AS match_fail ';
    sql += ',r.`points` AS match_points ';
    sql += ',r.`rank` AS match_rank ';
    sql += ',r.`unfinish` AS match_unfinish ';
    sql += ',r.`box` AS match_box_list ';
    sql += ',r.`box_timestamp` AS match_box_timestamp ';
    sql += ',r.`first_box` AS match_1st_box ';
    sql += ',r.`season_count` AS match_season_count ';
    sql += ',r.`season_win` AS match_season_win ';
    sql += ',r.`season_box` AS match_season_box ';
    sql += ',r.`season_first_win` AS match_season_1st_win ';
    sql += ',r.`is_season_reward` AS match_got_season_reward ';
    sql += ',r.`winning_streak` AS match_winning_streak ';

    sql += ',gold.`total_gain` AS gold_total_gain ';
    sql += ',gold.`total_cost` AS gold_total_cost ';
    sql += ',gold.`shop_count` AS gold_shop_count ';
    sql += ',gold.`shop_amount` AS gold_shop_amount ';

    sql += ',diamond.`total_gain` AS diamond_total_gain ';
    sql += ',diamond.`total_cost` AS diamond_total_cost ';
    sql += ',diamond.`shop_count` AS diamond_shop_count ';
    sql += ',diamond.`shop_amount` AS diamond_shop_amount ';

    sql += ',social.`id` AS has_social ';
    sql += ',social.`invite_friends` AS social_invite_friends ';
    sql += ',social.`share_friends` AS social_share_friends ';
    sql += ',social.`invite_progress` AS social_invite_progress ';
    sql += ',social.`invite_reward` AS social_invite_reward ';
    sql += ',social.`share_status_0` AS social_share_status_0 ';
    sql += ',social.`share_status_1` AS social_share_status_1 ';
    sql += ',social.`share_status_2` AS social_share_status_2 ';
    sql += ',social.`enshrine_status` AS social_enshrine_status';
    sql += ',social.`share_top_gold` AS social_share_top_gold ';
    sql += ',social.`share_top_rank` AS social_share_top_rank ';

    // 左连接查询
    sql += 'FROM `tbl_account` a ';
    sql += 'LEFT JOIN `tbl_account_sign` asign ON a.id=asign.id ';
    sql += 'LEFT JOIN `tbl_account_server` server ON a.id=server.uid ';
    sql += 'LEFT JOIN `tbl_img` i ON a.figure=i.id ';
    sql += 'LEFT JOIN `tbl_switch` s ON a.id=s.id ';
    sql += 'LEFT JOIN `tbl_goddess` g ON a.id=g.id ';
    sql += 'LEFT JOIN `tbl_aquarium` aq ON a.id=aq.id ';
    sql += 'LEFT JOIN `tbl_rankgame` r ON a.id=r.id ';
    sql += 'LEFT JOIN `tbl_gold` gold ON a.id=gold.account_id ';
    sql += 'LEFT JOIN `tbl_pearl` diamond ON a.id=diamond.account_id ';
    sql += 'LEFT JOIN `tbl_social` social ON a.id=social.id ';
    return sql;
}

/**
 * 创建一个新用户.
 * @param pool 数据库连接池
 * @param cb 创建用户后调用的回调函数
 * @param channel_fields 渠道需要初始化的字段列表(数组形式)
 */
function createNewPlayer(pool, channel_fields, cb) {
    const FUNC = TAG + "createNewPlayer() --- ";
    //注意：对象要克隆，否则其他玩家使用的是同一数据,直接赋值则为引用;且重新赋值创建日期
    var newAccount = {};
    for (var k in AccountDefault) {
        newAccount[k] = ObjUtil.clone(AccountDefault[k].def);
    }
    newAccount.created_at = (new Date()).format("yyyy-MM-dd hh:mm:ss");

    var basic_fields = [];
    var chDone = {};
    if (channel_fields) {
        for (var i = 0; i < channel_fields.length; i++) {
            var ch = channel_fields[i];
            var name = StringUtil.replaceAll(ch.name, '`', '');
            chDone[name] = true;
            newAccount[name] = ObjUtil.clone(ch.value); //注意使用渠道字段附带的值，而不是直接使用默认值
            basic_fields.push(ch);
        }
    }

    //将各个字段连接、写入数据库
    for (var k in newAccount) {
        if (chDone[k]) {
            continue;
        }
        var val = newAccount[k];
        var field = {};
        field.name = "`" + k + "`";
        if (val instanceof Object || val instanceof Array) {
            field.value = JSON.stringify(val);
        } else {
            field.value = val;
        }
        basic_fields.push(field);
    }

    var fields = basic_fields;
    var field_names = _.pluck(fields, "name");
    var field_values = _.pluck(fields, "value");
    var strFiledNames = field_names.toString();
    var strPlaceHolder = StringUtil.repeatJoin("?", ",", field_values.length);

    if (DEBUG) console.log(FUNC + 'CALL...');

    var sql = "";
    sql += "INSERT INTO `tbl_account` (";
    sql += strFiledNames;
    sql += ")";
    sql += "VALUES (";
    sql += strPlaceHolder;
    sql += ")";

    var sql_data = field_values;

    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
            var id = result.insertId;
            DEBUG = 1;
            if (DEBUG) console.log(FUNC + '创建账户: ', id);
            DEBUG = 0;

            // 存入缓存, 再批量导入数据库
            _createCache(pool, id, cb, newAccount);
        }
    });
}

var init_user_field = [
    // tbl_account_sign
    {name: "month_sign", value: ArrayUtil.getIntArr(buzz_initdata.initMonthSign())},

    // tbl_switch
    {name: "match_on", value: 1},
    {name: "msgboard_mgmt", value: 0},
    {name: "cik_on", value: 1},
    {name: "cdkey_on", value: 0},

    // tbl_goddess
    {name: "max_wave", value: 0},
    // {name: "update_at", value: 1},
    {name: "week_reward", value: 0},
    {name: "week_rank", value: 0},

    // 操作说明
    /** 需要插入数据 */
    {name: "new_player", value: 1},
    /** 需要插入数据 */
    {name: "need_insert", value: 1},
    /** 需要更新数据 */
    {name: "need_update", value: 1},
    /** 需要更新数据 */
    {name: "sid", value: SERVER_CFG.SID},
];

function _createCache(pool, id, cb, newAccount) {
    const FUNC = TAG + "_createCache() --- ";
    newAccount.id = id;
    newAccount.tempname = 'fj_' + id;

    //其他表的字段，一起放入cache
    for (var i = 0; i < init_user_field.length; i++) {
        var obj = init_user_field[i];
        newAccount[obj.name] = obj.value;
    }
    if (newAccount.figure && newAccount.figure == 1) {
        newAccount["figure_url"] = "http://p3.wmpic.me/article/2015/05/18/1431913649_GWJqwtVU.jpeg"
    }
    CacheAccount.create(newAccount);

    // 向负载服发送玩家的SID
    var server_data = {
        uid: id,
        sid: SERVER_CFG.SID,
    };
    console.log(FUNC + "通知负载服");
    HttpUtil.postBalance('/server_api/sign_user_sid', server_data, function (ret) {
        console.log(FUNC + "通知负载服返回结果");
        HttpUtil.handleReturn(ret, function (err, values) {
            // console.log(FUNC + "err:", err);
            // console.log(FUNC + "values:", values);
            var msg = "通知负载服新玩家所在服务器(uid-" + server_data.uid + ", sid-" + server_data.sid + ")";
            if (err) {
                if (ERROR) console.error(FUNC + "失败!" + msg);
                return;
            }
            if (DEBUG) console.log(FUNC + "成功!" + msg);
        });
    });

    console.log(FUNC + "初始化缓存账户account:", newAccount);

    init(pool, id, cb);
}


function insertTableAccountSign(pool, list, id_collection, cb) {

    const FUNC = TAG + "insertTableAccountSign() --- ";

    var sql = "";
    sql += "INSERT INTO `tbl_account_sign` (";
    sql += "`id`, `month_sign`";
    sql += ")";
    sql += " VALUES ";
    for (var i = 0; i < list.length; i++) {
        if (i > 0) sql += ",";
        var account = list[i];
        if (account) {
            sql += "(";
            sql += account.id + ",";
            sql += "'" + account.month_sign.toString() + "'";
            sql += ")";
        }
    }
    sql += " ON DUPLICATE KEY UPDATE month_sign=VALUES(month_sign)";

    var sql_data = [];

    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
            if (ERROR) console.log(FUNC + "sql:", sql);
            if (ERROR) console.log(FUNC + "sql_data:", sql_data);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
            cb();
        }
    });
}

function insertTableSwitch(pool, list, id_collection, cb) {
    const FUNC = TAG + "insertTableSwitch() --- ";

    var sql = "";
    sql += "INSERT INTO `tbl_switch` (";
    sql += "`id`, `match_on`, `msgboard_mgmt`, `cik_on`, `cdkey_on`";
    sql += ")";
    sql += " VALUES ";
    for (var i = 0; i < list.length; i++) {
        if (i > 0) sql += ",";
        var account = list[i];
        // yTODO: 这里老账号相关字段为undefined或null(老账号在批量导入时没有加载相关字段)
        if (!account.match_on) account.match_on = 1;
        if (!account.msgboard_mgmt) account.msgboard_mgmt = 0;
        if (!account.cik_on) account.cik_on = 1;
        if (!account.cdkey_on) account.cdkey_on = 0;
        //-------------------------------------------------------------------- 
        if (account) {
            sql += "(";
            sql += account.id + ",";
            sql += account.match_on + ",";
            sql += account.msgboard_mgmt + ",";
            sql += account.cik_on + ",";
            sql += account.cdkey_on;
            sql += ")";
        }
    }
    sql += " ON DUPLICATE KEY UPDATE match_on=VALUES(match_on), msgboard_mgmt=VALUES(msgboard_mgmt), cik_on=VALUES(cik_on), cdkey_on=VALUES(cdkey_on)";

    var sql_data = [];

    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
            if (ERROR) console.log(FUNC + "sql:", sql);
            if (ERROR) console.log(FUNC + "sql_data:", sql_data);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
            cb();
        }
    });
}

function insertTableGoddess(pool, list, id_collection, cb) {
    const FUNC = TAG + "insertTableGoddess() --- ";

    var sql = "";
    sql += "INSERT INTO `tbl_goddess` (";
    sql += "`id`, `max_wave`, `week_reward`, `week_rank`";
    sql += ")";
    sql += " VALUES ";
    for (var i = 0; i < list.length; i++) {
        if (i > 0) sql += ",";
        var account = list[i];
        if (account) {
            // yTODO: max_wave不能为空
            if (!account.max_wave) account.max_wave = 0;
            if (!account.week_reward) account.week_reward = 0;
            if (!account.week_rank) account.week_rank = 0;
            sql += "(";
            sql += account.id + ",";
            sql += account.max_wave + ",";
            sql += account.week_reward + ",";
            sql += account.week_rank;
            sql += ")";
        }
    }
    sql += " ON DUPLICATE KEY UPDATE max_wave=VALUES(max_wave), week_reward=VALUES(week_reward), week_rank=VALUES(week_rank)";

    var sql_data = [];

    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
            if (ERROR) console.log(FUNC + "sql:", sql);
            if (ERROR) console.log(FUNC + "sql_data:", sql_data);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
            cb();
        }
    });
}

function updateCardData(account, cb) {
    const FUNC = TAG + "updateCardData() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var id = account.id;
    var card_old = account.card;
    var card = account.card;
    // card不为空才会进行月卡有效性检测
    if (!card) card = {};
    if (card) {
        var oldCard = {
            normal: card.normal,
            senior: card.senior,
        };
        // 普通月卡有效期检测
        if (card.normal) {
            if (!isCardValid(card, "normal")) {
                if (ERROR) console.error(FUNC + "普通月卡已过期");
                delete card["normal"];
            }
        }
        // 壕月卡有效期检测
        if (card.senior) {
            if (!isCardValid(card, "senior")) {
                if (ERROR) console.error(FUNC + "壕月卡已过期");
                delete card["senior"];
            }
        }
    }
    cb();
}

// 正式登陆前需要更新月卡信息: 取出card字段, 检查card.normal和card.senior的start_date域是否已经超过了30天
// 调用isCardValid函数
function _updateCardData(pool, account, cb) {
    const FUNC = TAG + "_updateCardData() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var id = account.id;
    var card_old = account.card;
    var card = account.card;
    // card不为空才会进行月卡有效性检测
    if (card == "null") card = "{}";
    if (card != null && card != undefined && card != "null") {
        if (StringUtil.isString(card)) {
            try {
                card = JSON.parse(card);
            }
            catch (parse_err) {
                var err_msg = FUNC + '[ERROR]数据库中的月卡数据解析错误:' + parse_err;
                if (ERROR) console.error(err_msg);
                cb(err_msg);
                return;
            }
        }
        if (card) {
            // 普通月卡有效期检测
            if (card["normal"]) {
                if (!isCardValid(card, "normal")) {
                    if (ERROR) console.error(FUNC + "普通月卡已过期");
                    delete card["normal"];
                }
            }
            // 壕月卡有效期检测
            if (card["senior"]) {
                if (!isCardValid(card, "senior")) {
                    if (ERROR) console.error(FUNC + "壕月卡已过期");
                    delete card["senior"];
                }
            }
            // card变回字符串
            card = JSON.stringify(card);
        }
    }

    // 更新数据
    if (ObjUtil.data2String(card_old) != ObjUtil.data2String(card)) {
        var sql = '';
        sql += 'UPDATE `tbl_account` ';
        sql += 'SET `card`=? ';
        sql += 'WHERE `id`=?';
        var sql_data = [card, id];

        if (DEBUG) console.log(FUNC + 'sql:\n', sql);
        if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);

        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                if (ERROR) console.error(FUNC + "更新月卡信息出错:", err);
                cb(err);
            } else {
                _updateVipGold(pool, account, cb);
            }
        });
    }
    else {
        _updateVipGold(pool, account, cb);
    }
}


//------------------------------------------------------------------------------
// init相关操作
//------------------------------------------------------------------------------
// 增加一条记录到tbl_gold表中
function _addRecordToGoldTable(pool, id, cb) {
    const FUNC = TAG + "_addRecordToGoldTable() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    // 缓存中加入table_gold的结构
    var account_gold = {
        account_id: id,
        current_total: 1000,
        total_gain: 0,
        total_cost: 0,
        shop_count: 0,
        shop_amount: 0,
    };

    CacheAccount.setAccountGold(id, account_gold);
    CacheAccount.setNeedInsert(id);// 可以不加, 初始化数据时已经有了
    _addRecordToPearlTable(pool, id, cb);
}

// 增加一条记录到tbl_pearl表中
function _addRecordToPearlTable(pool, id, cb) {
    const FUNC = TAG + "_addRecordToPearlTable() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var sql = 'INSERT INTO `tbl_pearl` (`account_id`, `current_total`) VALUES (?,?)';
    var sql_data = [id, init_pearl];

    if (DEBUG) console.log('sql: ', sql);
    if (DEBUG) console.log('sql_data: ', sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            cb(err);
        } else {
            _updateTempname(pool, id, cb);
        }
    });
}

// 更新临时用户名
function _updateTempname(pool, id, cb) {
    const FUNC = TAG + "_updateTempname() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var sql = 'UPDATE `tbl_account` SET `tempname`=concat(`tempname`, ' + id + ') WHERE `id`=?';
    var sql_data = [id];
    pool.query(sql, sql_data, function (err) {
        if (err) {
            cb(err);
        } else {
            _createSessionToken(pool, id, cb);
        }
    });
};

// 创建会话Token
function _createSessionToken(pool, id, cb) {
    const FUNC = TAG + "_createSessionToken() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var token = utils.generateSessionToken(id);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`=? ";
    sql += "WHERE `id`=?";
    var sql_data = [token, id];

    pool.query(sql, sql_data, function (err) {
        if (err) {
            cb(err);
        } else {
            // getAccountById(pool, id, cb);
            var ret = {
                id: id,
                tempname: "fj_" + id,
            };
            cb(null, [ret]);
        }
    });
};

function modifySessionToken(account) {
    var uid = account.id;
    account.token = utils.generateSessionToken(uid);
    var data = {
        uid: uid,
        sid: SERVER_CFG.SID,
        login_time: new Date().getTime(),
    };
    CacheAccountServer.push(data);
}

// 创建会话Token
function _modifySessionToken(pool, id, cb) {
    const FUNC = TAG + "_modifySessionToken() --- ";

    var token = utils.generateSessionToken(id);

    if (DEBUG) console.log(FUNC + "new token:", token);
    if (DEBUG) console.log(FUNC + "account_id:", id);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`=? ";
    sql += "WHERE `id`=?";
    var sql_data = [token, id];

    pool.query(sql, sql_data, function (err) {
        if (err) {
            cb(err);
        } else {
            cb(null, token);
        }
    });
};


//------------------------------------------------------------------------------
// 登录相关操作
//------------------------------------------------------------------------------

function getVipInfoByVipLevel(vip_level) {
    if (ArrayUtil.isArray(vip_vip_cfg)) {
        // 新vip_vip_cfg表(下标就是vip等级)
        // return vip_vip_cfg[parseInt(vip_level)];//此方法有风险
        for (var i in vip_vip_cfg) {
            if (vip_vip_cfg[i].vip_level == vip_level) {
                return vip_vip_cfg[i];
            }
        }
        return null;
    }
    else {
        return vip_vip_cfg["VIP" + vip_level];
    }
}

/**
 * 只操作缓存
 */
function updateVipGold(account, cb) {
    const FUNC = TAG + "updateVipGold() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var uid = account.id;

    if (DEBUG) console.log("account.vip: " + account.vip);
    if (DEBUG) console.log("account.vip_daily_fill: " + account.vip_daily_fill);

    if (parseInt(account.vip) > 0 && parseInt(account.vip_daily_fill) == 1) {
        if (DEBUG) console.log("[VIP FILL] 用户为VIP" + account.vip + ", 且今日未领取");
        // 需要先补足VIP的金币
        // (1) 获取VIP相应等级需要补足的金币和钻石金额(cfgs/vip_vip_cfg)
        var vip_info = getVipInfoByVipLevel(account.vip);
        var gold_fill = null;
        var pearl_fill = null;

        if (vip_info == null) {
            cb(new Error("无法查询到VIP_INFO"));
            return;
        }
        var gold_fill = vip_info.vip_dailyGold;
        var pearl_fill = vip_info.vip_dailyDiamond;

        if (DEBUG) console.log("gold_fill: " + gold_fill);
        if (DEBUG) console.log("pearl_fill: " + pearl_fill);
        if (DEBUG) console.log("account.gold: " + account.gold);
        if (DEBUG) console.log("account.pearl: " + account.pearl);

        // (2) 金币和钻石至少有一种少于需要补足的额度就需要更新数据
        if (account.gold < gold_fill || account.pearl < pearl_fill) {

            // 现有数量和补足额度取最大值
            gold_fill = Math.max(account.gold, gold_fill);
            pearl_fill = Math.max(account.pearl, pearl_fill);
            if (DEBUG) console.log("update gold_fill: " + gold_fill);
            if (DEBUG) console.log("update pearl_fill: " + pearl_fill);

            CacheAccount.setGold(uid, gold_fill);
            CacheAccount.setPearl(uid, pearl_fill);
            updateLoginCount(account, cb, true);

            account.commit();
        }
        else {
            if (DEBUG) console.log("[VIP FILL] 用户的金币和钻石都已满");
            updateLoginCount(account, cb, false);
        }
    }
    else {
        if (DEBUG) console.log("[VIP FILL] 用户不是VIP, 或今日已领取");
        updateLoginCount(account, cb, false);
    }
}

/**
 * VIP每日自动补足(自动补足VIP的金币和钻石).
 */
function _updateVipGold(pool, account, cb) {
    const FUNC = TAG + "_updateVipGold() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var id = account.id;
    // var record = result[0];

    if (DEBUG) console.log("account.vip: " + account.vip);
    if (DEBUG) console.log("account.vip_daily_fill: " + account.vip_daily_fill);

    if (parseInt(account.vip) > 0 && parseInt(account.vip_daily_fill) == 1) {
        if (DEBUG) console.log("[VIP FILL] 用户为VIP" + account.vip + ", 且今日未领取");
        // 需要先补足VIP的金币
        // (1) 获取VIP相应等级需要补足的金币和钻石金额(cfgs/vip_vip_cfg)
        var vip_info = getVipInfoByVipLevel(account.vip);
        var gold_fill = null;
        var pearl_fill = null;

        if (vip_info == null) {
            cb(new Error("无法查询到VIP_INFO"));
            return;
        }
        var gold_fill = vip_info.vip_dailyGold;
        var pearl_fill = vip_info.vip_dailyDiamond;

        if (DEBUG) console.log("gold_fill: " + gold_fill);
        if (DEBUG) console.log("pearl_fill: " + pearl_fill);
        if (DEBUG) console.log("account.gold: " + account.gold);
        if (DEBUG) console.log("account.pearl: " + account.pearl);

        // (2) 金币和钻石至少有一种少于需要补足的额度就需要更新数据
        if (account.gold < gold_fill || account.pearl < pearl_fill) {

            // 现有数量和补足额度取最大值
            gold_fill = Math.max(account.gold, gold_fill);
            pearl_fill = Math.max(account.pearl, pearl_fill);
            if (DEBUG) console.log("update gold_fill: " + gold_fill);
            if (DEBUG) console.log("update pearl_fill: " + pearl_fill);

            //--------------------------------------------------------------------------
            // 更新缓存中的数据(重要:数据库操作将会被删除)
            //--------------------------------------------------------------------------
            CacheAccount.setGold(id, gold_fill);
            CacheAccount.setPearl(id, pearl_fill);
            //--------------------------------------------------------------------------

            var sql = '';
            sql += 'UPDATE `tbl_account` ';
            sql += 'SET `gold`=?, `pearl`=? ';
            sql += 'WHERE `id`=?';

            var sql_data = [gold_fill, pearl_fill, id];

            pool.query(sql, sql_data, function (err, rows) {
                if (err) {
                    if (ERROR) console.error("更新VIP金币钻石出现异常:", err);
                    cb(err);
                    return;
                }
                _updateLoginCount(pool, account, cb, true);
            });
        }
        else {
            if (DEBUG) console.log("[VIP FILL] 用户的金币和钻石都已满");
            _updateLoginCount(pool, account, cb, false);
        }
    }
    else {
        if (DEBUG) console.log("[VIP FILL] 用户不是VIP, 或今日已领取");
        _updateLoginCount(pool, account, cb, false);
    }
}

function updateLoginCount(account, cb, vip_fill_this_time) {
    const FUNC = TAG + "updateLoginCount() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    // 用户的登录信息写在缓存中去
    var uid = account.id;
    CacheAccount.addLoginCount(uid, 1);
    CacheAccount.setFirstLogin(uid, 0);
    CacheAccount.setVipDailyFill(uid, 0);
    account.vip_fill_this_time = vip_fill_this_time;

    // TODO: 获取用户当日在线时间总长
    var data = {
        account_id: uid,
        token: account.token,
    };
    account.online_time = 100000;
    cb();
}

function _updateLoginCount(pool, account, cb, vip_fill_this_time) {

    const FUNC = TAG + "_updateLoginCount() --- ";
    console.log(FUNC + "CALL...");

    // 用户的登录信息写在缓存中去
    var id = account.id;
    /* CacheAccount.addLoginCount(id, 1);
     CacheAccount.setFirstLogin(id, 0);
     CacheAccount.setVipDailyFill(id, 0);
     */
    // var sql = '';
    // sql += 'UPDATE `tbl_account` ';
    // sql += 'SET `login_count`=`login_count`+1, `first_login`=0, `vip_daily_fill`=0 ';
    // sql += 'WHERE `id`=?';
    // pool.query(sql, [id], function (err, rows) {
    //     if (err) {
    //         cb(err);
    //         return;
    //     }

    // TODO: 获取用户当日在线时间总长
    var data = {
        account_id: id,
        token: account.token
    };
    DaoGold.getOnlineTime(pool, data, function (err_ot, rows_ot) {
        if (err_ot) {
            if (ERROR) console.error("获取玩家在线时间异常:", err_ot);
            cb(err_ot);
            return;
        }

        // 用于向客户端提供一个online_time消息
        //console.log("rows_ot: ", rows_ot);
        //console.log("account: ", account);
        if (rows_ot != null && rows_ot.length > 0) {
            account['online_time'] = rows_ot[0]['online_time'];
        }

        // 用于向客户端提示一个VIP补足的消息
        account['vip_fill_this_time'] = vip_fill_this_time;
        if (DEBUG) console.log(FUNC + 'account:', account);

        // 缓存操作结束后返回
        _operateCache(pool, account);

        if (DEBUG) console.log(FUNC + "操作缓存结束...");
        // 登录操作在这里最后返回给客户端用户数据
        if (account.id == 21) {
            console.log(FUNC + "__DEBUG__figure_url:", account.figure_url);
        }
        cb(null, [account]);
        _resetCacheAccount(account);
        // 在tbl_login_log中记录登录时间信息
        var nickname = (account['nickname'] != null);
        var platform = account['platform'];
        var test = account['test'];
        _addLoginLog(pool, id, nickname, platform, test, account);
    });
    // });
}

function _resetCacheAccount(result) {
    var uid = result.id;
    // 登录时缓存中可能没有用户, 这个时候需要预先设置才能进行后面的缓存操作, 否则无效.
    if (!CacheAccount.getAccountById(uid)) {
        CacheAccount.push(result);
    }

    CacheAccount.addLoginCount(uid, 1);
    CacheAccount.setFirstLogin(uid, 0);
    CacheAccount.setVipDailyFill(uid, 0);
}

function _addLoginLog(pool, id, nickname, platform, test, account) {

    console.log('玩家登录记录登录日志:', id);

    // if (DEBUG) console.log("_addLoginLog()----登录表中增加数据(TODO: 加入缓存, 定期更新)...");

    // var sql = '';
    // sql += 'INSERT INTO `tbl_login_log` ';
    // sql += 'SET `account_id`=?, `nickname`=? ';
    // var sql_data = [id, nickname];
    // pool.query(sql, sql_data, function (err, result) {
    //     if (err) {
    //         // Do nothing but log the error
    //         if (DEBUG) console.log('call function _addLoginLog');
    //         if (DEBUG) console.log(err);
    //         return;
    //     }
    //     // 临时处理, 不再查排行榜
    //     //_addBroadcast(pool, id, platform);
    //     //名人上线广播FAMOUS_ONLINE_TYPE
    //     _addFamousOnlineBroadcast(account, platform);
    // });
}

// 检测是否排行榜第一名, 如果是, 则增加一条名人上线公告
function _addBroadcast(pool, id, platform, test) {
    const FUNC = TAG + "_addBroadcast() --- ";
    var data = {
        account_id: id,
        platform: platform,
    };
    // TODO： 从id查找vip.
    ranking.getAllMyRanking(pool, data, test, function (err, result) {
        if (err) {
            if (ERROR) console.error('call function _addBroadcast: ', err);
            return;
        }
        // console.log(FUNC + 'result:', result);
        var gold = result.gold;
        var achieve_point = result.achieve_point;
        var match = result.match;
        if (DEBUG) console.log(FUNC + 'gold:', gold);
        if (DEBUG) console.log(FUNC + 'achieve_point:', achieve_point);
        if (DEBUG) console.log(FUNC + 'match:', match);
        // console.log(FUNC + 'match:', match);

        if (gold == null) {
            if (ERROR) console.error(FUNC + '[ERROR]null gold, result:', result);
        }
        if (achieve_point == null) {
            if (ERROR) console.error(FUNC + '[ERROR]null achieve_point, result:', result);
        }

        if (gold && gold.my_rank == 1) {
            var player = ObjUtil.getPlayerName(gold);
            var content = {
                txt: '世界首富 ' + player + ' 上线啦，土豪我们做个朋友吧！',
                times: 1,
                type: FAMOUS_ONLINE_TYPE.GOLD,
                params: [player, gold.vip],
                platform: platform,
            };
            buzz_cst_game.addBroadcastFamousOnline(content);
        }
        if (achieve_point && achieve_point.my_rank == 1) {
            var player = ObjUtil.getPlayerName(achieve_point);
            var content = {
                txt: '牛人 ' + player + ' 上线啦，如此高成就点我服了！',
                times: 1,
                type: FAMOUS_ONLINE_TYPE.ACHIEVE,
                params: [player, achieve_point.vip],
                platform: platform,
            }
            buzz_cst_game.addBroadcastFamousOnline(content);
        }
        if (match && match.my_rank == 1) {
            var player = ObjUtil.getPlayerName(match);
            var content = {
                txt: '最强王者 ' + player + ' 上线啦，真是厉害得不要不要呀！',
                times: 1,
                type: FAMOUS_ONLINE_TYPE.COMPETITION,
                params: [player, achieve_point.vip],
                platform: platform,
            }
            buzz_cst_game.addBroadcastFamousOnline(content);
        }
    });
}

//万人迷上线公告
function _addFamousOnlineBroadcast(account, platform) {
    const FUNC = TAG + "_addBroadcast() --- ";
    console.log(FUNC + "call:");
    var id = account.id;
    var nickname = account.channel_account_name;
    if (!nickname) nickname = account.nickname;
    if (!nickname) nickname = account.tempname;
    var vip = account.vip;
    var charm = account.charm_rank && parseInt(account.charm_rank) || 0;
    var Charmaccount = CacheCharts.getChart(platform, RANK_TYPE.CHARM, 0, 1);
    if (Charmaccount && Charmaccount.length > 0 && id == Charmaccount[0].uid) {
        var content = {
            txt: "",
            times: 1,
            type: FAMOUS_ONLINE_TYPE.CHARM,
            params: [nickname, vip, charm],
            platform: platform
        };
        buzz_cst_game.addBroadcastFamousOnline(content);
    }
    var Matchaccount = CacheCharts.getChart(platform, RANK_TYPE.MATCH, 0, 1);
    if (Matchaccount && Matchaccount.length > 0 && id == Matchaccount[0].uid) {
        var content = {
            txt: "",
            times: 1,
            type: FAMOUS_ONLINE_TYPE.COMPETITION,
            params: [nickname, vip, charm],
            platform: platform
        };
        buzz_cst_game.addBroadcastFamousOnline(content);
    }
}

////////////////////////////////////////////////////////////
// 账户缓存操作

function _whichNew(uid, account) {
    const FUNC = TAG + '_whichNew() --- ';
    var isAccountInCache = CacheAccount.contains(uid);
    var useCacheData = 0; //0不用cache 1用cache
    if (isAccountInCache) {
        var cacheAccount = CacheAccount.getAccountById(uid);

        var cacheLevel = cacheAccount.level;
        var cacheExp = cacheAccount.exp;
        var cacheAchievePoint = cacheAccount.achieve_point;
        var cacheWeapon = cacheAccount.weapon;
        var cacheVip = cacheAccount.vip;
        var cacheRmb = cacheAccount.rmb;

        var dbLevel = account.level;
        var dbExp = account.exp;
        var dbAchievePoint = account.achieve_point;
        var dbWeapon = account.weapon;
        var dbVip = account.vip;
        var dbRmb = account.rmb;

        if (DEBUG) {
            console.log(FUNC + "====缓存和数据库比较=================================");
            console.log(FUNC + "uid:", uid);
            console.log(FUNC + "account.id:", account.id);
            console.log(FUNC + "cacheLevel:", cacheLevel);
            console.log(FUNC + "dbLevel:", dbLevel);
            console.log(FUNC + "cacheExp:", cacheExp);
            console.log(FUNC + "dbExp:", dbExp);
            console.log(FUNC + "cacheAchievePoint:", cacheAchievePoint);
            console.log(FUNC + "dbAchievePoint:", dbAchievePoint);
            console.log(FUNC + "cacheWeapon:", cacheWeapon);
            console.log(FUNC + "dbWeapon:", dbWeapon);
            console.log(FUNC + "cacheVip:", cacheVip);
            console.log(FUNC + "dbVip:", dbVip);
            console.log(FUNC + "cacheRmb:", cacheRmb);
            console.log(FUNC + "dbRmb:", dbRmb);
            console.log(FUNC + "=====================================================");
        }

        if (dbLevel > cacheLevel) {
            useCacheData = 0;
        }
        else if (dbLevel == cacheLevel && dbExp > cacheExp) {
            useCacheData = 0;
        }
        else if (dbAchievePoint > cacheAchievePoint) {
            useCacheData = 0;
        }
        else if (dbWeapon > cacheWeapon) {
            useCacheData = 0;
        }
        else if (dbVip > cacheVip) {
            useCacheData = 0;
        }
        else if (dbRmb > cacheRmb) {
            useCacheData = 0;
        }
        else {
            useCacheData = 1;
        }
    }
    return useCacheData;
}

// 账户缓存操作: CacheAccount
// account 用户的数据库数据(注意将字符串转换为对象)
function _operateCache(pool, account) {
    const FUNC = TAG + "_operateCache() --- ";

    var uid = account.id;

    // 用户不在缓存中，从数据库中读取的active字段进行值的设定
    var token = null;
    var salt = "";
    var password = "";
    var charm_rank = 0;
    var charm_point = 0;
    var tempname = null;
    var nickname = null;
    var channel = "";
    var channel_account_name = null;
    var channel_account_id = null;
    var channel_account_info = null;
    var created_at = 0;
    var pfft_at = 0;
    var gold = 0;
    var pearl = 0;
    var skill = {};
    var pack = {};
    var active = {};
    var active_daily_reset = {};
    var active_stat_once = {};
    var active_stat_reset = {};
    var free_draw = buzz_draw.getFreeDrawDefault();
    var total_draw = buzz_draw.getTotalDrawDefault();
    var mail_box = [];
    var roipct_time = 0;
    var aquarium = {};
    var broke_times = 0;
    var vip = 0;
    var rmb = 0;
    var exp = 0;
    var level = 0;
    var card = {};
    var drop_once = {};
    var drop_reset = {};
    var bonus = {};
    var activity_gift = {};
    var comeback = {};
    var goddess = [];
    var goddess_free = 1;
    var goddess_ctimes = 0;
    var goddess_crossover = 0;
    var goddess_ongoing = 0;
    var weapon_energy = {};
    var weapon_skin = {};
    var vip_weapon_id = {};
    var vip_gift = [];
    var level_mission = {};
    var mission_daily_reset = {};
    var mission_only_once = {};
    var pirate = {};
    var guide_weak = {};
    var get_card = {};
    var first_buy = {};
    var achieve_point = 0;
    var weapon = 0;
    var heartbeat = 0;
    var heartbeat_min_cost = 0;
    var guide = 0;
    var first_buy_gift = 0;
    var login_count = 0;
    var day_reward_weekly = 0;
    var day_reward = 0;
    var day_reward_adv = 0;
    var new_reward_adv = 0;
    var first_login = 0;
    var vip_daily_fill = 0;
    var gold_shopping = 0;
    var test = 0;
    var figure_url = "";
    var updated_at = account.updated_at;
    var platform = account.platform;
    var sid = 1;
    var last_online_time = null;
    if (account.last_online_time) {
        last_online_time = new Date(account.last_online_time).getTime();
    }
    else {
        last_online_time = new Date().getTime();
    }
    if (DEBUG) console.log(FUNC + "last_online_time:", last_online_time);

    var jointype = 0;
    var who_invite_me = 0;
    var who_share_me = 0;
    var rank_in_friends = 0;
    var over_me_friends = [];
    var redress_no = 0;
    //----------------------------------------------------
    // 其他表
    var month_sign = [];
    var max_wave = 0;
    var goddess_balance_time = new Date().getTime();
    if (account.goddess_balance_time) {
        goddess_balance_time = new Date(account.goddess_balance_time).getTime();
    }
    var week_reward = 0;
    var week_rank = 0;
    var cik_on = 1;
    var cdkey_on = 0;
    var match_on = 1;
    var msgboard_mgmt = 0;

    var petfish_recent_time = null;
    var petfish_total_level = null;

    var match_recent_time = null;
    var match_win = null;
    var match_fail = null;
    var match_points = null;
    var match_rank = null;
    var match_unfinish = null;
    var match_box_list = null;
    var match_box_timestamp = null;
    var match_1st_box = null;
    var match_season_count = null;
    var match_season_win = null;
    var match_season_box = null;
    var match_season_1st_win = null;
    var match_got_season_reward = null;
    var match_winning_streak = null;

    var gold_total_gain = 0;
    var gold_total_cost = 0;
    var gold_shop_count = 0;
    var gold_shop_amount = 0;

    var diamond_total_gain = 0;
    var diamond_total_cost = 0;
    var diamond_shop_count = 0;
    var diamond_shop_amount = 0;

    var has_social = null;
    var social_invite_friends = null;
    var social_share_friends = null;
    var social_invite_progress = null;
    var social_invite_reward = null;
    var social_share_status_0 = null;
    var social_share_status_1 = null;
    var social_share_status_2 = null;
    var social_enshrine_status = null;
    var social_share_top_gold = null;
    var social_share_top_rank = null;
    //----------------------------------------------------
    // 缓存控制
    var new_player = 0;
    var need_insert = 0;
    var need_update = 0;

    for (var i in tbl_account_fields) {
        var field = tbl_account_fields[i].name;
        if (DEBUG) console.log("数据库中的" + field + ": ", account[field]);
    }

    // 玩家数据从数据库到缓存中时, 缓存中已经存在数据, 需要进行等级和经验判定(数据库等级高刷新, 等级相同经验高刷新)
    var useCacheData = _whichNew(uid, account);

    // 数据库中的值永远不会变
    salt = account.salt;
    password = account.password;
    channel = account.channel;
    channel_account_info = account.channel_account_info;
    redress_no = account.redress_no;

    if (!useCacheData) {
        console.log(FUNC + uid + "玩家数据在数据库中的更新, 使用数据库数据");
        token = account.token;
        // salt = account.salt;
        // password = account.password;
        charm_rank = account.charm_rank;
        charm_point = account.charm_point;
        tempname = account.tempname;
        nickname = account.nickname;
        channel_account_name = account.channel_account_name;
        channel_account_id = account.channel_account_id;
        created_at = account.created_at;
        pfft_at = account.pfft_at;
        gold = account.gold;
        pearl = account.pearl;
        skill = ObjUtil.str2Data(account.skill);
        pack = _safeLoadObj("package", account.package);//ObjUtil.str2Data(account.package);
        active = ObjUtil.str2Data(account.active);
        active_daily_reset = _safeLoadObj("active_daily_reset", account.active_daily_reset);//ObjUtil.str2Data(account.active_daily_reset);
        active_stat_once = _safeLoadObj("active_stat_once", account.active_stat_once);//ObjUtil.str2Data(account.active_stat_once);
        active_stat_reset = _safeLoadObj("active_stat_reset", account.active_stat_reset);//ObjUtil.str2Data(account.active_stat_reset);
        if (account.free_draw != null) {
            free_draw = _safeLoadObj("free_draw", account.free_draw);//ObjUtil.str2Data(account.free_draw);
        }
        if (account.total_draw != null) {
            total_draw = _safeLoadObj("total_draw", account.total_draw);
        }
        if (account.mail_box != null) {
            account.mail_box = StringUtil.trim(account.mail_box, ',');
            mail_box = ObjUtil.str2Data("[" + account.mail_box + "]");
        }
        roipct_time = account.roipct_time;
        aquarium = _safeLoadObj("aquarium", account.aquarium);//ObjUtil.str2Data(account.aquarium);
        broke_times = account.broke_times;
        vip = account.vip;
        rmb = account.rmb;
        exp = account.exp;
        level = account.level;
        card = _safeLoadObj("card", account.card);//ObjUtil.str2Data(account.card);
        drop_once = _safeLoadObj("drop_once", account.drop_once);//ObjUtil.str2Data(account.drop_once);
        drop_reset = _safeLoadObj("drop_reset", account.drop_reset);//ObjUtil.str2Data(account.drop_reset);
        bonus = _safeLoadObj("bonus", account.bonus);//ObjUtil.str2Data(account.bonus);
        activity_gift = _safeLoadObj("activity_gift", account.activity_gift);//ObjUtil.str2Data(account.activity_gift);
        comeback = _safeLoadObj("comeback", account.comeback);//ObjUtil.str2Data(account.comeback);
        goddess = _safeLoadObj("goddess", account.goddess);//ObjUtil.str2Data(account.goddess);
        goddess_free = account.goddess_free;
        goddess_ctimes = account.goddess_ctimes;
        goddess_crossover = account.goddess_crossover;
        goddess_ongoing = account.goddess_ongoing;
        //----------------------------------------------------
        weapon_energy = _safeLoadObj("weapon_energy", account.weapon_energy);//ObjUtil.str2Data(account.weapon_energy);
        weapon_skin = _safeLoadObj("weapon_skin", account.weapon_skin);//ObjUtil.str2Data(account.weapon_skin);
        vip_weapon_id = ObjUtil.str2Data(account.vip_weapon_id);

        if (account.vip_gift == null) account.vip_gift = "";

        if (DEBUG) console.log(FUNC + "1.account.vip_gift:", account.vip_gift);
        account.vip_gift = StringUtil.trim(account.vip_gift, ",");
        if (DEBUG) console.log(FUNC + "2.account.vip_gift:", account.vip_gift);
        vip_gift = _safeLoadObj("vip_gift", account.vip_gift);//ObjUtil.str2Data("[" + account.vip_gift + "]");

        level_mission = ObjUtil.str2Data(account.level_mission);
        mission_daily_reset = _safeLoadObj("mission_daily_reset", account.mission_daily_reset);//ObjUtil.str2Data(account.mission_daily_reset);
        mission_only_once = _safeLoadObj("mission_only_once", account.mission_only_once);
        ObjUtil.str2Data(account.mission_only_once);
        pirate = _safeLoadObj("pirate", account.pirate);//ObjUtil.str2Data(account.pirate);
        guide_weak = _safeLoadObj("guide_weak", account.guide_weak);//ObjUtil.str2Data(account.guide_weak);
        get_card = ObjUtil.str2Data(account.get_card);
        first_buy = _safeLoadObj("first_buy", account.first_buy);//ObjUtil.str2Data(account.first_buy);
        achieve_point = account.achieve_point;
        weapon = account.weapon;
        heartbeat = account.heartbeat;
        heartbeat_min_cost = account.heartbeat_min_cost;
        guide = account.guide;
        first_buy_gift = account.first_buy_gift;
        login_count = account.login_count;
        day_reward_weekly = account.day_reward_weekly;
        day_reward = account.day_reward;
        day_reward_adv = account.day_reward_adv;
        new_reward_adv = account.new_reward_adv;
        first_login = account.first_login;
        vip_daily_fill = account.vip_daily_fill;
        gold_shopping = account.gold_shopping;
        test = account.test;
        figure_url = account.figure_url;
        platform = account.platform;
        sid = account.sid;

        jointype = account.jointype;
        who_invite_me = account.who_invite_me;
        who_share_me = account.who_share_me;
        rank_in_friends = account.rank_in_friends;
        over_me_friends = account.over_me_friends;
        //----------------------------------------------------
        // 其他表
        month_sign = _safeLoadArray("month_sign", account.month_sign);
        max_wave = account.max_wave;
        week_reward = account.week_reward;
        week_rank = account.week_rank;
        cik_on = account.cik_on;
        cdkey_on = account.cdkey_on;
        match_on = account.match_on || 1;
        msgboard_mgmt = account.msgboard_mgmt || 0;
        if (account.petfish_recent_time) {
            petfish_recent_time = account.petfish_recent_time;
            petfish_total_level = account.petfish_total_level;
        }

        if (account.match_recent_time) {
            match_recent_time = account.match_recent_time;
            match_win = account.match_win;
            match_fail = account.match_fail;
            match_points = account.match_points;
            match_rank = account.match_rank;
            match_unfinish = account.match_unfinish;
            match_box_list = account.match_box_list;
            match_box_timestamp = account.match_box_timestamp;
            match_1st_box = account.match_1st_box;
            match_season_count = account.match_season_count;
            match_season_win = account.match_season_win;
            match_season_box = account.match_season_box;
            match_season_1st_win = account.match_season_1st_win;
            match_got_season_reward = account.match_got_season_reward;
            match_winning_streak = account.match_winning_streak;
        }

        gold_total_gain = account.gold_total_gain;
        gold_total_cost = account.gold_total_cost;
        gold_shop_count = account.gold_shop_count;
        gold_shop_amount = account.gold_shop_amount;

        diamond_total_gain = account.diamond_total_gain;
        diamond_total_cost = account.diamond_total_cost;
        diamond_shop_count = account.diamond_shop_count;
        diamond_shop_amount = account.diamond_shop_amount;

        if (account.has_social) {
            has_social = account.has_social;
            social_invite_friends = JSON.parse("[" + account.social_invite_friends + "]");
            social_share_friends = JSON.parse("[" + account.social_share_friends + "]");
            social_invite_progress = account.social_invite_progress;
            social_invite_reward = account.social_invite_reward;
            social_share_status_0 = _safeLoadObj("social_share_status_0", account.social_share_status_0);
            social_share_status_1 = _safeLoadObj("social_share_status_1", account.social_share_status_1);
            social_share_status_2 = _safeLoadObj("social_share_status_2", account.social_share_status_2);
            social_enshrine_status = account.social_enshrine_status;
            social_share_top_gold = account.social_share_top_gold;
            social_share_top_rank = account.social_share_top_rank;
        }
        //----------------------------------------------------
        // 缓存控制
        // new_player = account.new_player || 0;
        need_insert = account.new_player || 0;
        need_update = account.new_player || 0;
    }
    else {
        if (DEBUG) console.log(FUNC + uid + "玩家数据在缓存中的更新, 使用缓存数据");

        var account_in_cache = CacheAccount.getAccountById(uid);
        token = account_in_cache.token;
        // salt = account_in_cache.salt;
        // password = account_in_cache.password;
        charm_rank = account_in_cache.charm_rank;
        charm_point = account_in_cache.charm_point;
        tempname = account_in_cache.tempname;
        nickname = account_in_cache.nickname;
        channel_account_name = account_in_cache.channel_account_name;
        channel_account_id = account_in_cache.channel_account_id;
        created_at = account_in_cache.created_at;
        pfft_at = account_in_cache.pfft_at;
        gold = account_in_cache.gold;
        pearl = account_in_cache.pearl;
        skill = account_in_cache.skill;
        pack = account_in_cache.package;
        active = account_in_cache.active;
        active_daily_reset = account_in_cache.active_daily_reset;
        active_stat_once = account_in_cache.active_stat_once;
        active_stat_reset = account_in_cache.active_stat_reset;
        free_draw = account_in_cache.free_draw;
        total_draw = account_in_cache.total_draw;
        mail_box = account_in_cache.mail_box;
        roipct_time = account_in_cache.roipct_time;
        aquarium = account_in_cache.aquarium;
        broke_times = account_in_cache.broke_times;
        vip = account_in_cache.vip;
        rmb = account_in_cache.rmb;
        exp = account_in_cache.exp;
        level = account_in_cache.level;
        card = account_in_cache.card;
        drop_once = account_in_cache.drop_once;
        drop_reset = account_in_cache.drop_reset;
        bonus = account_in_cache.bonus;
        activity_gift = account_in_cache.activity_gift;
        comeback = account_in_cache.comeback;
        goddess = account_in_cache.goddess;
        goddess_free = account_in_cache.goddess_free;
        goddess_ctimes = account_in_cache.goddess_ctimes;
        goddess_crossover = account_in_cache.goddess_crossover;
        goddess_ongoing = account_in_cache.goddess_ongoing;
        //----------------------------------------------------
        weapon_energy = account_in_cache.weapon_energy;
        weapon_skin = account_in_cache.weapon_skin;
        vip_weapon_id = account_in_cache.vip_weapon_id;
        vip_gift = account_in_cache.vip_gift;
        level_mission = account_in_cache.level_mission;
        mission_daily_reset = account_in_cache.mission_daily_reset;
        mission_only_once = account_in_cache.mission_only_once;
        pirate = account_in_cache.pirate;
        guide_weak = account_in_cache.guide_weak;
        get_card = account_in_cache.get_card;
        first_buy = account_in_cache.first_buy;
        achieve_point = account_in_cache.achieve_point;
        weapon = account_in_cache.weapon;
        heartbeat = account_in_cache.heartbeat;
        heartbeat_min_cost = account_in_cache.heartbeat_min_cost;
        guide = account_in_cache.guide;
        first_buy_gift = account_in_cache.first_buy_gift;
        login_count = account_in_cache.login_count;
        day_reward_weekly = account_in_cache.day_reward_weekly;
        day_reward = account_in_cache.day_reward;
        day_reward_adv = account_in_cache.day_reward_adv;
        new_reward_adv = account_in_cache.new_reward_adv;
        first_login = account_in_cache.first_login;
        vip_daily_fill = account_in_cache.vip_daily_fill;
        gold_shopping = account_in_cache.gold_shopping;
        test = account_in_cache.test;
        figure_url = account_in_cache.figure_url;
        platform = account_in_cache.platform;
        sid = account_in_cache.sid;

        jointype = account_in_cache.jointype;
        who_invite_me = account_in_cache.who_invite_me;
        who_share_me = account_in_cache.who_share_me;
        rank_in_friends = account_in_cache.rank_in_friends;
        over_me_friends = account_in_cache.over_me_friends;
        //----------------------------------------------------
        // 其他表
        month_sign = account_in_cache.month_sign;
        max_wave = account_in_cache.max_wave;
        if (account_in_cache.goddess_balance_time) goddess_balance_time = account_in_cache.goddess_balance_time;
        week_reward = account_in_cache.week_reward;
        week_rank = account_in_cache.week_rank;
        cik_on = account_in_cache.cik_on;
        cdkey_on = account_in_cache.cdkey_on;
        match_on = account_in_cache.match_on;
        msgboard_mgmt = account_in_cache.msgboard_mgmt;
        if (account_in_cache.petfish_recent_time) {
            petfish_recent_time = account_in_cache.petfish_recent_time;
            petfish_total_level = account_in_cache.petfish_total_level;
        }

        if (account_in_cache.match_recent_time) {
            match_recent_time = account_in_cache.match_recent_time;
            match_win = account_in_cache.match_win;
            match_fail = account_in_cache.match_fail;
            match_points = account_in_cache.match_points;
            match_rank = account_in_cache.match_rank;
            match_unfinish = account_in_cache.match_unfinish;
            match_box_list = account_in_cache.match_box_list;
            match_box_timestamp = account_in_cache.match_box_timestamp;
            match_1st_box = account_in_cache.match_1st_box;
            match_season_count = account_in_cache.match_season_count;
            match_season_win = account_in_cache.match_season_win;
            match_season_box = account_in_cache.match_season_box;
            match_season_1st_win = account_in_cache.match_season_1st_win;
            match_got_season_reward = account_in_cache.match_got_season_reward;
            match_winning_streak = account_in_cache.match_winning_streak;
        }

        gold_total_gain = account_in_cache.gold_total_gain;
        gold_total_cost = account_in_cache.gold_total_cost;
        gold_shop_count = account_in_cache.gold_shop_count;
        gold_shop_amount = account_in_cache.gold_shop_amount;

        diamond_total_gain = account_in_cache.diamond_total_gain;
        diamond_total_cost = account_in_cache.diamond_total_cost;
        diamond_shop_count = account_in_cache.diamond_shop_count;
        diamond_shop_amount = account_in_cache.diamond_shop_amount;

        if (account_in_cache.has_social) {
            has_social = account_in_cache.has_social;
            social_invite_friends = account_in_cache.social_invite_friends;
            social_share_friends = account_in_cache.social_share_friends;
            social_invite_progress = account_in_cache.social_invite_progress;
            social_invite_reward = account_in_cache.social_invite_reward;
            social_share_status_0 = account_in_cache.social_share_status_0;
            social_share_status_1 = account_in_cache.social_share_status_1;
            social_share_status_2 = account_in_cache.social_share_status_2;
            social_enshrine_status = account_in_cache.social_enshrine_status;
            social_share_top_gold = account_in_cache.social_share_top_gold;
            social_share_top_rank = account_in_cache.social_share_top_rank;
        }
        //----------------------------------------------------
        // 缓存控制
        new_player = account_in_cache.new_player;
        need_insert = account_in_cache.need_insert;
        need_update = account_in_cache.need_update;
    }

    if (updated_at == null || updated_at == undefined) {
        updated_at = new Date().getTime();
    }
    updated_at = new Date(updated_at).getTime();

    var account_data = {
        id: uid,
        token: account.token,
        salt: salt,
        password: password,
        charm_rank: charm_rank,
        charm_point: charm_point,
        updated_at: updated_at,
        tempname: tempname,
        nickname: nickname,
        channel: channel,
        channel_account_name: channel_account_name,
        channel_account_id: channel_account_id,
        channel_account_info: channel_account_info,
        created_at: created_at,
        pfft_at: pfft_at,
        gold: gold,
        pearl: pearl,
        skill: skill,
        package: pack,
        active: active,
        active_daily_reset: active_daily_reset,
        active_stat_once: active_stat_once,
        active_stat_reset: active_stat_reset,
        free_draw: free_draw,
        total_draw: total_draw,
        mail_box: mail_box,
        roipct_time: roipct_time,
        aquarium: aquarium,
        broke_times: broke_times,
        vip: vip,
        rmb: rmb,
        exp: exp,
        level: level,
        card: card,
        drop_once: drop_once,
        drop_reset: drop_reset,
        bonus: bonus,
        activity_gift: activity_gift,
        comeback: comeback,
        goddess: goddess,
        goddess_free: goddess_free,
        goddess_ctimes: goddess_ctimes,
        goddess_crossover: goddess_crossover,
        goddess_ongoing: goddess_ongoing,
        //--------------------------------------------------
        weapon_energy: weapon_energy,
        weapon_skin: weapon_skin,
        vip_weapon_id: vip_weapon_id,
        vip_gift: vip_gift,
        level_mission: level_mission,
        mission_daily_reset: mission_daily_reset,
        mission_only_once: mission_only_once,
        pirate: pirate,
        guide_weak: guide_weak,
        get_card: get_card,
        first_buy: first_buy,
        achieve_point: achieve_point,
        weapon: weapon,
        heartbeat: heartbeat,
        heartbeat_min_cost: heartbeat_min_cost,
        guide: guide,
        first_buy_gift: first_buy_gift,
        login_count: login_count,
        day_reward_weekly: day_reward_weekly,
        day_reward: day_reward,
        day_reward_adv: day_reward_adv,
        new_reward_adv: new_reward_adv,
        first_login: first_login,
        vip_daily_fill: vip_daily_fill,
        gold_shopping: gold_shopping,
        test: test,
        figure_url: figure_url,
        platform: platform,
        sid: sid,
        match_on: match_on,
        msgboard_mgmt: msgboard_mgmt,
        last_online_time: last_online_time,

        jointype: jointype,
        who_invite_me: who_invite_me,
        who_share_me: who_share_me,
        rank_in_friends: rank_in_friends,
        over_me_friends: over_me_friends,
        redress_no: redress_no,
        //----------------------------------------------------
        // 其他表
        month_sign: month_sign,
        max_wave: max_wave,
        goddess_balance_time: goddess_balance_time,
        week_reward: week_reward,
        week_rank: week_rank,
        cik_on: cik_on,
        cdkey_on: cdkey_on,
        petfish_recent_time: petfish_recent_time,
        petfish_total_level: petfish_total_level,
        match_recent_time: match_recent_time,
        match_win: match_win,
        match_fail: match_fail,
        match_points: match_points,
        match_rank: match_rank,
        match_unfinish: match_unfinish,
        match_box_list: match_box_list,
        match_box_timestamp: match_box_timestamp,
        match_1st_box: match_1st_box,
        match_season_count: match_season_count,
        match_season_win: match_season_win,
        match_season_box: match_season_box,
        match_season_1st_win: match_season_1st_win,
        match_got_season_reward: match_got_season_reward,
        match_winning_streak: match_winning_streak,

        gold_total_gain: gold_total_gain,
        gold_total_cost: gold_total_cost,
        gold_shop_count: gold_shop_count,
        gold_shop_amount: gold_shop_amount,

        diamond_total_gain: diamond_total_gain,
        diamond_total_cost: diamond_total_cost,
        diamond_shop_count: diamond_shop_count,
        diamond_shop_amount: diamond_shop_amount,

        has_social: has_social,
        social_invite_friends: social_invite_friends,
        social_share_friends: social_share_friends,
        social_invite_progress: social_invite_progress,
        social_invite_reward: social_invite_reward,
        social_share_status_0: social_share_status_0,
        social_share_status_1: social_share_status_1,
        social_share_status_2: social_share_status_2,
        social_enshrine_status: social_enshrine_status,
        social_share_top_gold: social_share_top_gold,
        social_share_top_rank: social_share_top_rank,
        //----------------------------------------------------
        // 缓存控制
        new_player: new_player,
        need_insert: need_insert,
        need_update: need_update,
    };
    if (DEBUG) console.log("将玩家数据放入缓存...");
    CacheAccount.push(account_data);

    CacheAccount.prepare(function (err, list) {
        if (list.length > 0) {
            // 批量更新数据库
            if (ERROR) console.log(FUNC + "【" + DateUtil.getTime() + "】缓存长度超出限制, 批量更新数据库...");
            updateMassive(pool, list);
        }
    });

}

function _safeLoadObj(field, value) {
    const FUNC = TAG + "_safeLoadObj() --- ";
    if (value == "null") {
        console.error(FUNC + "[Error]" + field + "数据库为null字符串:", value);
        return {};
    }
    if (value == "") {
        return [];
    }
    return ObjUtil.str2Data(value);
}

function _safeLoadArray(field, value) {
    const FUNC = TAG + "_safeLoadArray() --- ";
    if (value == "null") {
        console.error(FUNC + "[Error]" + field + "数据库为null字符串:", value);
        return [];
    }
    // 已经是数组则不再解析
    if (ArrayUtil.isArray(value)) {
        return value;
    }
    return value.split(",");
}

const MAX_EVERY_UPDATE_COUNT = 1;//每次更新的最大记录条数
const MAX_EVERY_INSERT_COUNT = 1;//每次插入的最大记录条数

/**
 * 批量更新数据.
 *
 UPDATE categories
 SET display_order = CASE id
 WHEN 1 THEN 3
 WHEN 2 THEN 4
 WHEN 3 THEN 5
 END,
 title = CASE id
 WHEN 1 THEN 'New Title 1'
 WHEN 2 THEN 'New Title 2'
 WHEN 3 THEN 'New Title 3'
 END
 WHERE id IN (1,2,3)
 */
function updateMassive(pool, list, cb) {
    insertBefore(pool, list, function () {

        didUpdateMassive(pool, list, cb);

        function didUpdateMassive(pool, list, cb) {

            const FUNC = TAG + "didUpdateMassive() --- ";

            // 每次更新MAX_EVERY_UPDATE_COUNT条数据
            var dataTobeUpdated = [];
            // 可适当增加每次写入数据的长度.
            var updateNum = MAX_EVERY_UPDATE_COUNT;
            if (list.length < MAX_EVERY_UPDATE_COUNT) {
                updateNum = list.length;
            }
            for (var i = 0; i < updateNum; i++) {
                dataTobeUpdated.push(list.shift());
            }
            updateMassiveParts(pool, dataTobeUpdated, function (err, rows) {
                if (err) {
                    if (ERROR) console.error(FUNC + "【" + DateUtil.getTime() + "】更新错误, 不影响后面流程继续。");
                    if (ERROR) console.error(FUNC + "出现问题的玩家ID:", getIds(dataTobeUpdated));
                }

                if (list.length > 0) {
                    // 继续更新
                    console.log(FUNC + "继续更新");
                    didUpdateMassive(pool, list, cb);
                }
                else {
                    // cb回调.
                    if (cb != null) cb(err, rows);
                }
            });
        }
    });
}

/**
 * 选出需要插入的数据, 执行分批插入操作
 */
function insertBefore(pool, list, cb) {
    const FUNC = TAG + "insertBefore() --- ";
    var insert_list = [];
    for (var i = 0; i < list.length; i++) {
        var account = list[i];
        // if (account.need_insert) {
        //新账号没有插入数据原因查找
        insert_list.push(account);
        // }
    }

    if (insert_list.length > 0) {
        console.log(FUNC + "insert_list.length:", insert_list.length);
        insertMassive(pool, insert_list, cb);
    }
    else {
        cb();
    }
}

function insertMassive(pool, list, cb) {
    const FUNC = TAG + "insertMassive() --- ";

    // 每次更新MAX_EVERY_UPDATE_COUNT条数据
    var dataTobeUpdated = [];
    // 可适当增加每次写入数据的长度.
    var updateNum = MAX_EVERY_INSERT_COUNT;
    if (list.length < MAX_EVERY_INSERT_COUNT) {
        updateNum = list.length;
    }
    for (var i = 0; i < updateNum; i++) {
        dataTobeUpdated.push(list.shift());
    }
    console.log(FUNC + "1.insert_list.length:", list.length);
    insertMassiveParts(pool, dataTobeUpdated, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "【" + DateUtil.getTime() + "】插入错误, 不影响后面流程继续。");
            if (ERROR) console.error(FUNC + "出现问题的玩家ID:", getIds(dataTobeUpdated));
        }

        // 完成插入后重设标志
        for (var i = 0; i < dataTobeUpdated.length; i++) {
            var account_inserted = dataTobeUpdated[i];
            account_inserted.need_insert = 0;
        }

        console.log(FUNC + "2.insert_list.length:", list.length);
        if (list.length > 0) {
            // 继续更新
            console.log(FUNC + "继续插入");
            insertMassive(pool, list, cb);
        }
        else {
            // cb回调.
            if (cb != null) cb(err, rows);
        }
    });
}

function insertMassiveParts(pool, list, cb) {
    const FUNC = TAG + "insertMassiveParts() --- ";

    // 条件"id IN (1,2,3)"中的ID集合
    var id_collection = "";
    for (var i = 0; i < list.length; i++) {
        if (list[i]) {
            if (i > 0) id_collection += ",";
            id_collection += list[i].id;
        }
    }

    insertTableAccountSign(pool, list, id_collection, function () {
        insertTableSwitch(pool, list, id_collection, function () {
            insertTableGoddess(pool, list, id_collection, function () {
                cb();
            });
        });
    });
}

function getIds(dataTobeUpdated) {
    var id_list = [];
    for (var i = 0; i < dataTobeUpdated.length; i++) {
        id_list[i] = dataTobeUpdated[i].id;
    }
    return id_list;
}

function updateMassiveParts(pool, list, cb) {
    const FUNC = TAG + "updateMassiveParts() --- ";
    // 条件"id IN (1,2,3)"中的ID集合
    var id_collection = "";
    for (var i = 0; i < list.length; i++) {
        if (list[i]) {
            if (i > 0) id_collection += ",";
            id_collection += list[i].id;
        }
    }

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    for (var i = 0; i < tbl_account_fields.length; i++) {
        var field = tbl_account_fields[i];
        if (field.save) {
            sql += _case(list, field.name, field.type, i == 0, i == tbl_account_fields.length - 1);
        }
    }
    sql += "WHERE id IN (" + id_collection + ")";

    var sql_data = [];

    pool.query(sql, sql_data, function (err, rows) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        updateTableAccountSign(pool, list, id_collection, function (err, rows) {
            updateTableGoddess(pool, list, id_collection, function (err, rows) {
                cb && cb(err, rows);
            });
        });
    });

}

function updateTableAccountSign(pool, list, id_collection, cb) {
    const FUNC = TAG + "updateTableAccountSign() --- ";

    if (DEBUG) console.log(FUNC + "id_collection:\n", id_collection);

    var sql = "";
    sql += "UPDATE `tbl_account_sign` ";
    for (var i = 0; i < tbl_account_sign_fields.length; i++) {
        var field = tbl_account_sign_fields[i];
        if (field.save) {
            sql += _case(list, field.name, field.type, i == 0, i == tbl_account_sign_fields.length - 1);
        }
    }
    sql += "WHERE id IN (" + id_collection + ")";

    var sql_data = [];

    pool.query(sql, sql_data, function (err, rows) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        cb && cb(err, rows);
    });
}

// BUG: 没有存table_goddess的数据到数据库
function updateTableGoddess(pool, list, id_collection, cb) {
    const FUNC = TAG + "updateTableGoddess() --- ";

    if (DEBUG) console.log(FUNC + "id_collection:\n", id_collection);

    var sql = "";
    sql += "UPDATE `tbl_goddess` ";
    for (var i = 0; i < tbl_goddess_fields.length; i++) {
        var field = tbl_goddess_fields[i];
        if (field.save) {
            sql += _case(list, field.name, field.type, i == 0, i == tbl_goddess_fields.length - 1);
        }
    }
    sql += "WHERE id IN (" + id_collection + ")";

    var sql_data = [];

    pool.query(sql, sql_data, function (err, rows) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        console.log(FUNC + "存女神数据成功");
        cb && cb(err, rows);
    });
}

/**
 * 返回一个SET...END条件.
 * @param field 需要更新的字段名名(string类型).
 * @param isLast 是否最后一个SET...END子句(bool类型).
 * @param type 更新的数据类型，取值string, number, bool.
 */
function _case(list, field, type, isFirst, isLast) {
    const FUNC = TAG + "_case() --- ";
    var sql = "";
    if (isFirst) {
        sql += "SET ";
    }
    sql += field + " = CASE id ";
    for (var i = 0; i < list.length; i++) {
        var id = list[i].id;
        var field_value = list[i][field];
        sql += "WHEN " + id + " THEN ";
        switch (type) {
            case "string":
                sql += "'" + ObjUtil.data2String(field_value) + "' ";
                break;
            case "object":
                sql += "'" + _safeObj(field_value, field) + "' ";
                break;
            case "array":
                if (!field_value) {
                    field_value = [];
                }
                sql += "'" + StringUtil.trim(field_value.toString(), ',') + "' ";
                break;
            case "number":
                sql += _safeInt(field_value, field, id) + " ";
                break;
            case "timestamp":
                // console.log(FUNC + field + ":", field_value);
                var formatdate = DateUtil.format(new Date(field_value), "yyyy-MM-dd hh:mm:ss");
                if (formatdate == "NaN-aN-aN aN:aN:aN") {
                    console.error(FUNC + "时间戳错误——field_value:", field_value);
                    formatdate = DateUtil.format(new Date(), "yyyy-MM-dd hh:mm:ss");
                }
                sql += "'" + formatdate + "' ";
                break;
        }
    }
    if (isLast) {
        sql += "END ";
    }
    else {
        sql += "END, ";
    }
    return sql;
}

function _safeObj(field_value, field) {
    const FUNC = TAG + "_safeObj() --- ";
    if (field_value == null || field_value == undefined || field_value == "null") {
        // console.error(FUNC + "[Error]" + field + "字段为null则转为{}: ", field_value);
        return "{}";
    }
    return ObjUtil.data2String(field_value);
}

// 打印非数字的原始数据.
function _safeInt(field_value, field, id) {
    const FUNC = TAG + "_safeInt() --- ";
    var temp = 0;
    if (typeof field_value == "boolean") {
        temp = field_value ? 1 : 0;
    }
    else {
        temp = parseInt(field_value);
        // if (field == "first_login") {
        //     console.log(FUNC + "field:", field);
        //     console.log(FUNC + "field_value:", field_value);
        //     console.log(FUNC + "id:", id);
        // }
        if (isNaN(temp)) {
            // console.error(FUNC + "[Error]<" + id + ">" + field + "字段非数值错误:", field_value);
            temp = 0;
        }
    }
    return temp;
}

var tbl_account_fields = [
    {name: "token", type: "string", save: 1},
    {name: "salt", type: "string", save: 0},
    {name: "password", type: "string", save: 0},
    {name: "charm_rank", type: "number", save: 1},
    {name: "charm_point", type: "number", save: 1},
    {name: "tempname", type: "string", save: 0},
    {name: "nickname", type: "string", save: 0},
    {name: "channel", type: "string", save: 0},
    {name: "channel_account_name", type: "string", save: 0},
    {name: "channel_account_id", type: "string", save: 0},
    {name: "channel_account_info", type: "string", save: 0},
    {name: "gold", type: "number", save: 1},
    {name: "pearl", type: "number", save: 1},
    {name: "test", type: "number", save: 1},
    {name: "skill", type: "object", save: 1},
    {name: "package", type: "object", save: 1},
    {name: "active", type: "object", save: 1},
    {name: "active_daily_reset", type: "object", save: 1},
    {name: "active_stat_once", type: "object", save: 1},
    {name: "active_stat_reset", type: "object", save: 1},
    {name: "free_draw", type: "object", save: 1},
    {name: "total_draw", type: "object", save: 1},
    {name: "mail_box", type: "array", save: 1},
    {name: "roipct_time", type: "number", save: 1},
    {name: "aquarium", type: "object", save: 1},
    // TODO(20170328)
    {name: "card", type: "object", save: 1},
    {name: "broke_times", type: "number", save: 1},
    {name: "drop_once", type: "object", save: 1},
    {name: "drop_reset", type: "object", save: 1},
    {name: "bonus", type: "object", save: 1},
    {name: "activity_gift", type: "object", save: 1},
    {name: "comeback", type: "object", save: 1},
    {name: "vip", type: "number", save: 1},
    {name: "rmb", type: "number", save: 1},
    {name: "exp", type: "number", save: 1},
    {name: "level", type: "number", save: 1},
    {name: "goddess", type: "object", save: 1},
    {name: "goddess_free", type: "number", save: 1},
    {name: "goddess_ctimes", type: "number", save: 1},
    {name: "goddess_crossover", type: "number", save: 1},
    {name: "goddess_ongoing", type: "number", save: 1},
    // TODO(20170331)
    {name: "achieve_point", type: "number", save: 1},
    {name: "weapon_energy", type: "object", save: 1},
    {name: "weapon_skin", type: "object", save: 1},
    {name: "weapon", type: "number", save: 1},
    {name: "vip_weapon_id", type: "object", save: 0},
    {name: "vip_gift", type: "array", save: 1},
    {name: "heartbeat", type: "number", save: 1},
    {name: "heartbeat_min_cost", type: "number", save: 1},
    {name: "level_mission", type: "object", save: 1},
    {name: "mission_daily_reset", type: "object", save: 1},
    {name: "mission_only_once", type: "object", save: 1},
    {name: "pirate", type: "object", save: 1},
    {name: "guide", type: "number", save: 1},
    {name: "guide_weak", type: "object", save: 1},
    {name: "get_card", type: "object", save: 1},
    {name: "first_buy", type: "object", save: 1},
    {name: "first_buy_gift", type: "number", save: 1},
    {name: "login_count", type: "number", save: 1},
    {name: "day_reward_weekly", type: "number", save: 1},
    {name: "day_reward", type: "number", save: 1},
    {name: "day_reward_adv", type: "number", save: 1},
    {name: "new_reward_adv", type: "number", save: 1},
    {name: "first_login", type: "number", save: 1},
    {name: "vip_daily_fill", type: "number", save: 1},
    {name: "gold_shopping", type: "number", save: 1},
    {name: "last_online_time", type: "timestamp", save: 1},
    {name: "charm_point", type: "number", save: 1},
    {name: "charm_rank", type: "number", save: 1},
];

var tbl_account_sign_fields = [
    {name: "month_sign", type: "array", save: 1},
];

var tbl_goddess_fields = [
    {name: "week_reward", type: "number", save: 1},
    {name: "week_rank", type: "number", save: 1},
];

function transformSql2Redis(account) {
    var result = {};
    const FUNC = TAG + "transformSql2Redis() --- ";

    for (var i in AccountDefault) {
        if (account[i] == null) {
            result[i] = AccountDefault[i].def;
        }
        else if (AccountDefault[i].type == 'object') {
            // if (account[i] == undefined || account[i] == null) {
            //     console.error(FUNC + "err-iiiiiiiiiiiiiiii:", i);
            //     continue;
            // }
            try {
                if (account[i].substring(0, 1) != '{' && account[i].substring(0, 1) != '[') {
                    if (i == 'over_me_friends') {
                        var arr = account[i].split(',');
                        account[i] = JSON.stringify(arr);
                    }
                    else {
                        account[i] = "[" + account[i] + "]";
                    }
                }
            }
            catch(err) {
                console.error(FUNC + "err:", err);
                console.error(FUNC + "i:", i);
                console.error(FUNC + "account[i]:", account[i]);
            }

            try {
                result[i] = JSON.parse(account[i]);
            }
            catch (err) {
                console.error(FUNC + "err:", err);
                console.error(FUNC + "i:", i);
                console.error(FUNC + "account[i]:", account[i]);
            }
        } else {
            result[i] = account[i];
        }
    }

    for (var i in AccountOtherDef) {
        if (account[i] == null) {
            result[i] = AccountOtherDef[i].def;
        }
        else if (AccountOtherDef[i].type == 'object') {
            if (account[i].substring(0, 1) != '{' && account[i].substring(0, 1) != '[') {
                account[i] = "[" + account[i] + "]";
            }
            try {
                result[i] = JSON.parse(account[i]);
            }
            catch(err) {
                console.error(FUNC + "err:", err);
                console.error(FUNC + "account[i]:", account[i]);
            }
        } else {
            result[i] = account[i];
        }
    }
    return result;
}

function transformRedis2Sql(account) {
    const FUNC = TAG + "transformRedis2Sql() --- ";
    let result = {};
    for (let i in AccountDefault) {
        if (account[i]!=null) {
            if (AccountDefault[i].type == 'object') {
                result[i] = JSON.stringify(account[i]);
                for (let field in sql_pojo.need_update_fields) {
                    if (field == i) {
                        result[i] = result[i].replace("[", "").replace("]", "");
                    }
                }
            }
            else {
                result[i] = account[i];
            }
        }

    }

    for (let i in AccountOtherDef) {
        if (account[i]!=null) {
            if (AccountOtherDef[i].type == 'object') {
                result[i] = JSON.stringify(account[i]);
                for (let field in sql_pojo.need_update_fields) {
                    if (field == i) {
                        result[i] = result[i].replace("[", "").replace("]", "");
                    }
                }
            }
            else {
                result[i] = account[i];
            }
        }

    }
    return result;
}

/**
 * 插入更新sql语句模版
 * @param table
 * @param fields
 */
function sql_templet(table, fields) {
    let sql = "INSERT INTO " + table + " (";
    for (let i in fields) {
        if (i == 0) {
            sql += fields[i];
        }
        else {
            sql += "," + fields[i];
        }
    }
    sql += ") VALUES(";
    for (let i in fields) {
        if (i == 0) {
            sql += "?";
        }
        else {
            sql += ",?";
        }
    }
    sql += ") ON DUPLICATE KEY UPDATE ";
    let k = 0;
    for (let i in fields) {
        // BUG解决: tbl_gold和tbl_pearl中插入重复account_id的数据导致数据查询量过大
        // tbl_gold和tbl_pearl需要设置account_id为UNIQUE
        // ALTER TABLE tbl_gold ADD UNIQUE(`account_id`);
        // ALTER TABLE tbl_pearl ADD UNIQUE(`account_id`);
        if (k == 0 && fields[i] != 'id' && fields[i] != 'account_id') {
            sql += fields[i] + "=VALUES(" + fields[i] + ")";
            k++;
        }
        else if (k > 0 && fields[i] != 'id' && fields[i] != 'account_id') {
            sql += "," + fields[i] + "=VALUES(" + fields[i] + ")";
        }
    }

    return sql;
}

/**
 * 写入mysql
 * @param  account
 * @constructor
 */
function syncUser(account, cb) {
    const FUNC = TAG + "SyncUser() --- ";
    if (!account || !account.id) {
        console.log(FUNC + "传入数据异常");
        cb && cb("传入数据异常");
        return;
    }
    var mysqlHelper = new DBMysqlHelper();

    if (DEBUG) console.log(FUNC + "CALL---");
    if (DEBUG) console.log(FUNC + "account:", account);

    var result = transformRedis2Sql(account);
    var sqlParams = [];
    for (let table in sql_pojo.tables) {
        let temp_key = [];
        let temp_value = [];
        if (table == 'tbl_social' && result["has_social"] == 0) {
            continue;
        }
        for (let field in sql_pojo[table]) {
            if (result[field] != null) {
                temp_key.push(sql_pojo[table][field].name);
                if (sql_pojo[table][field].type == 'timestamp') {
                    let value = result[field];
                    let re = /^[0-9]+.?[0-9]*$/;
                    var rrr = /(中国标准时间)/;
                    if (re.test(value)) {
                        if (value == 0 || value == '0') {
                            temp_value.push("0000-00-00 00:00:00");
                        } else {
                            let d = new Date();
                            d.setTime(value);
                            d = DateUtil.format(d, "yyyy-MM-dd hh:mm:ss");
                            temp_value.push(d);
                        }
                    } else if (rrr.test(value)) {
                        let d = DateUtil.format(new Date(value), "yyyy-MM-dd hh:mm:ss");
                        temp_value.push(d);
                    } else {
                        temp_value.push(result[field]);
                    }
                } else {
                    temp_value.push(result[field]);
                }
            }

        }
        if (temp_key.length < 2) {
            continue;
        }

        let sql = sql_templet(table, temp_key);
        sqlParams.push({
            sql: sql,
            params: temp_value
        });
    }


    // for (var table in sql_pojo.tables) {
    //     var temp_key = [];
    //     var temp_value = [];
    //     if (table == 'tbl_social' && result["has_social"] == 0) {
    //         continue;
    //     }
    //     for (var field in sql_pojo[table]) {
    //         if (result[field] == null) {
    //             continue;
    //         }
    //         // DEBUG = 0;
    //         // if (DEBUG) console.log("1", field);
    //         // if (DEBUG) console.log("2", result[field]);
    //         // if (DEBUG) console.log("3", sql_pojo[table][field].name);
    //         // DEBUG = 0;
    //         // temp_key.push(sql_pojo[table][field].name);
    //         // temp_value.push(result[field]);
    //     }

    //     var sql = sql_templet(table, temp_key);
    //     if (temp_key.length < 2) {
    //         continue;
    //     }
    //     sqlParams.push({
    //         sql: sql,
    //         params: temp_value
    //     });
    // }
    DEBUG = 1;
    if (DEBUG) console.log(FUNC + "sqlParams", sqlParams);
    DEBUG = 0;
    if (sqlParams.length == 0) {
        console.log(FUNC + "数据异常");
        cb && cb("数据异常");
        return;
    }
    mysqlHelper.execTrans(mysqlPool, sqlParams, function (err, res) {
        cb && cb(err, res);
    })
}