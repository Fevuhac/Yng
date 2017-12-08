////////////////////////////////////////////////////////////
// 社交接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var ObjUtil = require('../buzz/ObjUtil');
var RedisUtil = require('../utils/RedisUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var buzz_cst_error = require('../buzz/cst/buzz_cst_error');
const JOIN_TYPE = require('../buzz/buzz_social').JOIN_TYPE;
const SHARE_STATUS = require('../buzz/buzz_social').SHARE_STATUS;
const REPEAT_TYPE = require('../buzz/buzz_social').REPEAT_TYPE;
const ENSHRINE_STATUS = require('../buzz/buzz_social').ENSHRINE_STATUS;
var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;
var DateUtil = require('../utils/DateUtil');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var AccountCommon = require('./account/common');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var DaoCommon = require('./dao_common');
var dao_reward = require('./dao_reward');
var dao_gold = require('./dao_gold');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('../buzz/cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var social_friend_cfg = require('../../cfgs/social_friend_cfg');
var social_friendfirst_cfg = require('../../cfgs/social_friendfirst_cfg');
var social_share_cfg = require('../../cfgs/social_share_cfg');
var common_const_cfg = require('../../cfgs/common_const_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_social】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getInviteProgress = getInviteProgress;
exports.getShareStatus = getShareStatus;
exports.getEnshrineStatus = getEnshrineStatus;
exports.inviteSuccess = inviteSuccess;
exports.shareSuccess = shareSuccess;
exports.enshrineSuccess = enshrineSuccess;
exports.getSocialReward = getSocialReward;
exports.resetWeeklyShare = resetWeeklyShare;
exports.setShareTopGold = setShareTopGold;
exports.getInviteDailyReward = getInviteDailyReward;
exports.resetDaillyShare = resetDaillyShare;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取好友邀请进度.
 */
function getInviteProgress(pool, dataObj, cb) {
    const FUNC = TAG + "getInviteProgress() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var uid = token.split("_")[0];// 受请者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        var invitor_social = result;
        var invite_friends = invitor_social.invite_friends;
        try {
            invite_friends = JSON.parse(invite_friends);
        }
        catch(err) {
            console.error(FUNC + 'err:', err);
            console.error(FUNC + 'invite_friends:', invite_friends);
            return;
        }
        //todo invite_daily_state (每日邀请好友奖励)直接在redis中取数据

        CacheAccount.getAccountById(uid,function (err, account) {
            var invite_daily_state = account.social_invite_daily_state || 0;
            // 需要计算邀请的好友是否已经达到了50倍炮的倍率.
            _getFriendsWeaponOver50(pool, invite_friends, uid, function (invite_progress) {
                var ret = {
                    invite_progress: invite_progress,
                    invite_reward: invitor_social.invite_reward,
                    //todo invite_daily_state
                    invite_daily_state: invite_daily_state
                };

                cb(null, ret);

                // 写入tbl_social
                _updateTableSocialWithInviteProgress(pool, invite_progress, uid, function (err, result) {
                    if (err) {
                        if (ERROR) console.error(FUNC + "err:", err);
                        return;
                    }
                });
            });
        });
    });

}

/**
 * 获取好友分享状态.
 */
function getShareStatus(pool, dataObj, cb) {
    const FUNC = TAG + "getShareStatus() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var uid = token.split("_")[0];// 受请者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        var invitor_social = result;

        var share_status = JSON.parse(invitor_social.share_status_0);
        share_status = ObjUtil.merge(share_status, JSON.parse(invitor_social.share_status_1));
        share_status = ObjUtil.merge(share_status, JSON.parse(invitor_social.share_status_2));

        // TODO: 增加成为世界首富且金币数大于500W的条件设置.
        // 可以在任意一个人拉取排行榜时将世界首富设置到他的对应social表中.
        var ret = {
            share_status: share_status,
            share_top_gold: invitor_social.share_top_gold,
            share_top_rank: invitor_social.share_top_rank,
        };

        cb(null, ret);
    });
}

/**
 * 获取好友收藏状态.
 */
function getEnshrineStatus(pool, dataObj, cb) {
    const FUNC = TAG + "getEnshrineStatus() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var uid = token.split("_")[0];// 受请者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        var invitor_social = result;

        var ret = {
            enshrine_status: invitor_social.enshrine_status
        };

        cb(null, ret);
    });
}

/**
 * 接收邀请好友进度记录.
 */
function inviteSuccess(pool, dataObj, cb) {
    const FUNC = TAG + "inviteSuccess() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var type = dataObj["type"];// 100(邀请) | 101(分享)
    var fuid = dataObj["fuid"];// 邀请者的uid
    var uid = token.split("_")[0];// 受请者的uid

    var queryFields = ["jointype"];

    // if (DEBUG) console.log(FUNC + "接口参数");
    // if (DEBUG) console.log(FUNC + "type:", type);
    // if (DEBUG) console.log(FUNC + "fuid:", fuid);
    // if (DEBUG) console.log(FUNC + "uid:", uid);
    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (account.jointype != 0) {
            if (DEBUG) console.log(FUNC + "已经记录了加入类型, 不做任何事直接返回");
            cb();
        }
        else {
            if (type != JOIN_TYPE.SELF) {
                _getSocialData(pool, fuid, function (err, result) {
                    if (err) {
                        if (ERROR) console.error(FUNC + "err:", err);
                        cb(err);
                        return;
                    }
                    var invitor_social = result;
                    _updateTableSocialWithUid(pool, fuid, uid, invitor_social, type, cb);
                });
            }
            else {
                cb();
            }
            // TODO: 记录加入状态
            _updateTableAccountWithJoinType(pool, fuid, uid, type);
        }
    }

    // AccountCommon.getUserByTokenField(pool, token, queryFields, function(err, account) {
    //     if (err) {
    //         if (ERROR) console.error(FUNC + "err:", err);
    //         cb(err);
    //         return;
    //     }

    //     // if (DEBUG) console.log(FUNC + "jointype:", account.jointype);

    //     if (account.jointype != 0) {
    //         if (DEBUG) console.log(FUNC + "已经记录了加入类型, 不做任何事直接返回");
    //         cb();
    //     }
    //     else {
    //         if (type != JOIN_TYPE.SELF) {
    //             _getSocialData(pool, fuid, function(err, result) {
    //                 if (err) {
    //                     if (ERROR) console.error(FUNC + "err:", err);
    //                     cb(err);
    //                     return;
    //                 }
    //                 var invitor_social = result;
    //                 _updateTableSocialWithUid(pool, fuid, uid, invitor_social, type, cb);
    //             });
    //         }
    //         else {
    //             cb();
    //         }
    //         // TODO: 记录加入状态
    //         _updateTableAccountWithJoinType(pool, fuid, uid, type);
    //     }
    // });
}

function _updateTableAccountWithJoinType(pool, fuid, uid, type) {
    const FUNC = TAG + "_updateTableAccountWithJoinType() --- ";
    //----------------------------------

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `jointype`=? ";
    if (type == JOIN_TYPE.INVITE) sql += ",`who_invite_me`=? ";
    if (type == JOIN_TYPE.SHARE) sql += ",`who_share_me`=? ";
    sql += 'WHERE `id`=? ';
    var sql_data = [type];
    if (type == JOIN_TYPE.INVITE || type == JOIN_TYPE.SHARE) {
        sql_data.push(fuid);
    }
    sql_data.push(uid);

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            return;
        }
        if (DEBUG) console.log(FUNC + "result:", result);
    });
}

/**
 * 分享成功记录.
 */
function shareSuccess(pool, dataObj, cb) {
    const FUNC = TAG + "shareSuccess() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var share_id = dataObj["share_id"];// 100(邀请) | 101(分享)
    var uid = token.split("_")[0];// 受请者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        var invitor_social = result;
        _updateTableSocialWithShare(pool, uid, invitor_social, share_id, SHARE_STATUS.REWARD, cb);
    });
}

/**
 * 快捷方式相关(创建, 领取奖励).
 */
function enshrineSuccess(pool, dataObj, cb) {
    const FUNC = TAG + "enshrineSuccess() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var uid = token.split("_")[0];// 收藏者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        var invitor_social = result;
        _updateTableSocialWithEnshrine(pool, uid, invitor_social, ENSHRINE_STATUS.REWARD, cb);
    });
}

/**
 * 社交奖励领取.
 */
function getSocialReward(pool, dataObj, cb) {
    const FUNC = TAG + "getSocialReward() --- ";
    //----------------------------------

    var token = dataObj["token"];
    var type = dataObj["type"];
    var share_id = dataObj["share_id"];
    var uid = token.split("_")[0];// 受请者的uid

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }

        var invitor_social = result;
        var reward = _getRewardObj(invitor_social, type, share_id);

        if (DEBUG) console.log(FUNC + "reward:", reward);

        if (reward.length > 0) {
            // AccountCommon.getAccountByUid(pool, uid, function(err, account) {
            // AccountCommon.getAccountByToken(pool, token, function(err, results) {
            // var account = results[0];
            CacheAccount.getAccountById(uid, function (err, account) {

                // 调用获取奖励的接口
                dao_reward.getReward(pool, account, reward, function (err, result) {
                    if (err) {
                        console.log(FUNC + "getReward err:\n", err);
                    }
                    // 领奖后根据type设置状态
                    _afterReward(pool, type, uid, invitor_social, share_id, function (err, result) {
                        if (err) {
                            console.log(FUNC + "_afterReward err:", err);
                        }
                        cb(null, account);

                        addSocialGoldLog(pool, uid, token, account, reward, type);
                        addSocialDiamondLog(uid, account, reward, type);
                    });
                });
            });
        }
        else {
            // cb(new Error("没有获得奖励!!!"));
            cb(ERROR_OBJ.ACTIVE_DISSATISFY);
        }
    });
}

/**
 * 添加钻石日志
 */
function addSocialDiamondLog(uid, account, reward, type) {
    const FUNC = TAG + "addSocialDiamondLog() --- ";
    //----------------------------------
    // yDONE: 钻石数据记录
    var gain = 0;
    // reward = [["i002",10],["i001",10000]]
    for (var i = 0; i < reward.length; i++) {
        var item = reward[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i002' == item_id) {
            gain += item_num;
        }
    }

    if (gain > 0) {
        var scene = common_log_const_cfg.SHARE_REWARD;
        if (JOIN_TYPE.INVITE == type || JOIN_TYPE.INVITE_DAILY == type) {
            scene = common_log_const_cfg.INVITE_REWARD;
        }
        else if (JOIN_TYPE.ENSHRINE == type) {
            scene = common_log_const_cfg.ENSHRINE_REWARD;
        }

        logDiamond.push({
            account_id: uid,
            log_at: new Date(),
            gain: gain,
            cost: 0,
            total: account.pearl,
            scene: scene,
            nickname: 0,
        });
    }
}

function addSocialGoldLog(pool, uid, token, account, reward, type) {
    const FUNC = TAG + "addSocialGoldLog() --- ";
    //----------------------------------
    // yDONE: 金币数据记录
    var gain = 0;
    var cost = 0;
    // reward = [["i002",10],["i001",10000]]
    for (var i = 0; i < reward.length; i++) {
        var item = reward[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i001' == item_id) {
            gain += item_num;
        }
    }

    if (gain > 0) {
        var scene = common_log_const_cfg.SHARE_REWARD;
        if (JOIN_TYPE.INVITE == type || JOIN_TYPE.INVITE_DAILY == type) {
            scene = common_log_const_cfg.INVITE_REWARD;
        }
        else if (JOIN_TYPE.ENSHRINE == type) {
            scene = common_log_const_cfg.ENSHRINE_REWARD;
        }

        var data = {
            account_id: uid,
            token: token,
            total: account.gold,
            duration: 0,
            group: [{
                "gain": gain,
                "cost": cost,
                "scene": scene,
            }],
        };

        if (JOIN_TYPE.SHARE == type) {
            console.log(FUNC + "分享插入一条金币日志:", data);
        }
        else if (JOIN_TYPE.INVITE == type || JOIN_TYPE.INVITE_DAILY == type) {
            console.log(FUNC + "邀请插入一条金币日志:", data);
        }
        else if (JOIN_TYPE.ENSHRINE == type) {
            console.log(FUNC + "收藏插入一条金币日志:", data);
        }

        dao_gold.addGoldLogCache(pool, data, function(err, res) {
            if (err) return console.error(FUNC + "err:", err);
        });
    }
}

function getInviteDailyReward(pool, dataObj, cb) {
    const FUNC = TAG + "getInviteDailyReward() --- ";
    //----------------------------------
    var token = dataObj["token"];
    var type = dataObj["type"];
    var share_id = dataObj["share_id"];
    var uid = token.split("_")[0];// 受请者的uid
    console.log(FUNC + "INVITE_DAILY call");


    CacheAccount.getAccountById(uid, function (err, account) {
        if(account.social_invite_daily_state == 1){
            var reward = _getInviteDailyReward();
            console.log("reward:", reward);
            if (reward.length > 0) {
                dao_reward.getReward(pool, account, reward, function (err, re) {
                    if (err) {
                        console.log(FUNC + "getReward err:\n", err);
                    }
                    console.log(FUNC + "INVITE_DAILY call3");
                    // 领奖后根据type设置状态
                    _afterReward(pool, type, uid, null, null);
                    cb(null, account);
                    addSocialGoldLog(pool, uid, token, account, reward, type);
                    addSocialDiamondLog(uid, account, reward, type);
                });
            } else {
                cb(ERROR_OBJ.ACTIVE_DISSATISFY);
            }
        } else {
            cb(ERROR_OBJ.ACTIVE_DISSATISFY);
        }
    })
}

/**
 * 重置每周分享数据.
 UPDATE tbl_social
 SET share_status_2='{}'
 */
function resetWeeklyShare(pool, id_list, cb) {
    const FUNC = TAG + "resetWeeklyShare() --- ";

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET share_status_2='{}' ";
    if (id_list) {
        sql += "WHERE id IN (" + id_list + ") ";
    }

    var sql_data = [];

    // 每周重置分享状态.
    RedisUtil.hdel("pair:uid:social_share_status_2");

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 重置每日分享数据.
 UPDATE tbl_social
 SET share_status_1='{}'
 */
function resetDaillyShare(pool, id_list, cb) {
    const FUNC = TAG + "resetDaillyShare() --- ";

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET share_status_1='{}' ";
    if (id_list) {
        sql += "WHERE id IN (" + id_list + ") ";
    }

    var sql_data = [];

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 成为世界首富且金币数额大于500万时设置share_top_gold
 * @param uid 需要更新字段的玩家ID.
 */
function setShareTopGold(pool, uid) {
    const FUNC = TAG + "setShareTopGold() --- ";

    _getSocialData(pool, uid, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            return;
        }
        if (result.share_top_gold == 0) {
            _didSetShareTopGold(pool, uid);
        }
    });
}

function _didSetShareTopGold(pool, uid) {
    const FUNC = TAG + "_didSetShareTopGold() --- ";

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET share_top_gold=1 ";
    sql += "WHERE id=? ";

    var sql_data = [uid];

    RedisUtil.hset('pair:uid:social_share_top_gold', uid, 1);

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + uid + "设置share_top_gold失败");
            return;
        }
        if (DEBUG) console.log(FUNC + uid + "设置share_top_gold成功");
    });
}

//==============================================================================
// private
//==============================================================================

/**
 * 获取邀请者的社交数据.
 * @param fuid 邀请者的uid.
 SELECT *
 FROM `tbl_social`
 WHERE id=2687
 */
function _getSocialData(pool, uid, cb) {
    const FUNC = TAG + "_getSocialData() --- ";

    // TODO: 从Redis中获取

    var sql = "";
    sql += "SELECT * ";
    sql += "FROM `tbl_social` ";
    sql += "WHERE id=? ";

    var sql_data = [uid];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        if (results.length == 0) {
            // 创建一条记录
            _insertTableSocial(pool, uid, function (err, result) {
                if (err) {
                    if (ERROR) console.error(FUNC + "err:", err);
                    cb(err);
                    return;
                }
                _getSocialData(pool, uid, cb);
            });
            return;
        }
        cb(null, results[0]);
    });
}


/**
 * 获取邀请好友中炮的倍率达到50倍以上的个数.
 * @param invite_friends 邀请好友的列表字符串, 直接作为参数
 * @param cb 回调函数, 传入进度的值.
 */
function _getFriendsWeaponOver50(pool, invite_friends, uid, cb) {
    const FUNC = TAG + "_getFriendsWeaponOver50() --- ";
    if (DEBUG) console.log(FUNC + "invite_friends:", invite_friends);
    if (invite_friends && invite_friends.length > 0) {
        for (let i = 0; i < invite_friends.length; i++) {
            if (invite_friends[i] == null) {
                console.error(DateUtil.getTime() + FUNC + "ERROR用户数据错误");
                if (cb) cb(0);
                return;
            }
        }
        if (!invite_friends.toString() || invite_friends.toString() == '') {
            console.error(DateUtil.getTime() + FUNC + "ERROR用户数据错误");
            if (cb) cb(0);
            return;
        }

        if (DEBUG) console.log(FUNC + "已经邀请了好友");

        console.log(FUNC + "invite_friends:", invite_friends);
        console.log(FUNC + "invite_friends.toString():", invite_friends.toString());

        var sql = "";
        sql += "SELECT COUNT(id) AS invite_progress ";
        sql += "FROM `tbl_account` ";
        sql += "WHERE id IN (" + invite_friends.toString() + ") ";
        sql += "AND `weapon`>=? ";
        var sql_data = [50];

        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                console.error(FUNC + "err:\n", err);
                console.error(FUNC + "sql:\n", sql);
                console.error(FUNC + "sql_data:\n", sql_data);
                if (cb) cb(0);
                return;
            }
            if (DEBUG) console.log(FUNC + "result:", result);
            var invite_progress = result[0].invite_progress;
            if (cb) cb(result[0].invite_progress);
        });
    }
    else {
        if (DEBUG) console.log(FUNC + "还没有邀请好友");
        if (cb) cb(0);
    }
}

/**
 * 插入一条社交数据.
 * @param fuid 邀请者的uid.
 * 执行的SQL语句如下
 INSERT INTO tbl_social
 (id, share_status)
 VALUE(1234, '{}')
 */
function _insertTableSocial(pool, fuid, cb) {
    const FUNC = TAG + "_insertTableSocial() --- ";

    var sql = "";
    sql += "INSERT INTO tbl_social ";
    sql += "(id, share_status_0, share_status_1, share_status_2) ";
    sql += "VALUE(?,?,?,?) ";
    sql += " ON DUPLICATE KEY UPDATE share_status_0=VALUES(share_status_0), share_status_1=VALUES(share_status_1), share_status_2=VALUES(share_status_2)";

    var sql_data = [fuid, '{}', '{}', '{}'];

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 更新一条社交数据.
 * @param fuid 邀请者的uid.
 * @param uid 新的受邀者的uid.
 */
function _updateTableSocialWithUid(pool, fuid, uid, invitor_social, type, cb) {
    const FUNC = TAG + "_updateTableSocialWithUid() --- ";

    // var invite_progress = invitor_social.invite_progress;
    var uids = invitor_social.invite_friends;
    if (type == JOIN_TYPE.SHARE) {
        uids = invitor_social.share_friends;
    }

    if (!uids) {
        uids = uid;
        // invite_progress = 1;
    }
    else {
        // 已经添加的uid就不能重复添加了
        var uids_json = uids.split(",");
        ArrayUtil.addOnly(uids_json, uid);
        uids = uids_json.toString();

        // // TODO: 此处仅记录邀请到的好友人数.
        // if (type == JOIN_TYPE.INVITE) {
        //     invite_progress = uids_json.length;
        // }
    }

    _updateTableSocial(pool, fuid, uids, type, cb);
}

/**
 * 更新tbl_social中的分享状态
 */
function _updateTableSocialWithShare(pool, uid, invitor_social, share_id, status, cb) {
    const FUNC = TAG + "_updateTableSocialWithShare() --- ";

    var share = getShareById(share_id);
    var repeat = REPEAT_TYPE.NONE;
    if (share) {
        repeat = share.repeat;
    }
    var share_status = _getShareStatus(invitor_social, repeat);
    console.log(FUNC + "old-share_status:", share_status);
    var share_status_json = JSON.parse(share_status);
    share_status_json["" + share_id] = status;
    share_status = JSON.stringify(share_status_json);

    // TODO: 仅更新Redis不再操作数据库
    // DONE: 先确定分享后代码会执行到这里(log)
    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "new-share_status:", share_status);
    console.log(FUNC + "repeat:", repeat);

    // 能设置值，但是无效(新老服键不同)
    // RedisUtil.hset(PAIR.UID_SOCIAL_SHARE_STAT_1, uid, share_status);

    // account.social_share_status_1 = share_status_json;
    // account.commit();

    var sql = "";
    sql += "UPDATE tbl_social ";
    if (repeat == REPEAT_TYPE.NONE) {
        sql += "SET share_status_0=? ";
        RedisUtil.hset("pair:uid:social_share_status_0", uid, share_status);
    }
    else if (repeat == REPEAT_TYPE.DAILY) {
        sql += "SET share_status_1=? ";
        RedisUtil.hset("pair:uid:social_share_status_1", uid, share_status);
    }
    else if (repeat == REPEAT_TYPE.WEEKLY) {
        sql += "SET share_status_2=? ";
        RedisUtil.hset("pair:uid:social_share_status_2", uid, share_status);
    }
    sql += "WHERE id=? ";

    var sql_data = [share_status, uid];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(FUNC + "err:", err);
            console.log(FUNC + "sql:", sql);
            console.log(FUNC + "sql_data:", sql_data);
        }
        cb(err, result);
    });
}

function _getShareStatus(invitor_social, repeat) {
    var share_status = invitor_social.share_status_0;
    if (repeat == REPEAT_TYPE.DAILY) {
        share_status = invitor_social.share_status_1;
    }
    else if (repeat == REPEAT_TYPE.WEEKLY) {
        share_status = invitor_social.share_status_2;
    }
    return share_status;
}

/**
 * 更新tbl_social中的邀请奖励领取状态.
 */
function _updateTableSocialWithInviteReward(pool, uid, invitor_social, cb) {
    const FUNC = TAG + "_updateTableSocialWithInviteReward() --- ";

    var invite_reward = invitor_social.invite_reward;

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET invite_reward=invite_reward+1 ";
    sql += "WHERE id=? ";

    var sql_data = [uid];

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 更新redis中每日邀请领奖记录
 * @param uid
 * @param cb
 * @private
 */
function _updateRedisSocialWithInviteDailyReward(uid) {
    const FUNC = TAG + "_updateRedisSocialWithInviteDailyReward() --- ";
    if (DEBUG) console.log(FUNC + "call:");

    CacheAccount.setAccountById(uid, {social_invite_daily_state:2});

    // RedisUtil.expire(PAIR.UID_SOCIAL_INVITE_DAILY, DateUtil.getNexyDayBySeconds());
}

/**
 * 更新tbl_social中的收藏状态
 */
function _updateTableSocialWithEnshrine(pool, uid, invitor_social, status, cb) {
    const FUNC = TAG + "_updateTableSocialWithEnshrine() --- ";

    var enshrine_status = invitor_social.enshrine_status;

    if (enshrine_status > status) {
        cb(new Error("玩家尝试逆反收藏状态(原状态:" + enshrine_status + ", 想设置的状态:" + status + ")"));
        return;
    }

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET enshrine_status=? ";
    sql += "WHERE id=? ";

    RedisUtil.hset('pair:uid:social_enshrine_status', uid, status);

    var sql_data = [status, uid];

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 更新tbl_social中的邀请进度.
 */
function _updateTableSocialWithInviteProgress(pool, invite_progress, uid, cb) {
    const FUNC = TAG + "_updateTableSocialWithInviteProgress() --- ";

    var sql = "";
    sql += "UPDATE tbl_social ";
    sql += "SET invite_progress=? ";
    sql += "WHERE id=? ";

    var sql_data = [invite_progress, uid];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 更新一条社交数据.
 * @param fuid 邀请者的uid.
 * @param uids 所有受邀者的uid(以逗号分隔).
 * 执行的SQL语句如下
 UPDATE tbl_social
 SET invite_friends=?
 WHERE id=?
 */
function _updateTableSocial(pool, fuid, uids, type, cb) {
    const FUNC = TAG + "_updateTableSocial() --- ";

    var sql = "";
    sql += "UPDATE tbl_social ";
    if (type == JOIN_TYPE.INVITE) {
        sql += "SET invite_friends=? ";
        // sql += ",invite_progress=? ";
        RedisUtil.hset("pair:uid:social_invite_friends", fuid, uids);
    }
    else if (type == JOIN_TYPE.SHARE) {
        sql += "SET share_friends=? ";
        RedisUtil.hset("pair:uid:social_share_friends", fuid, uids);
    }
    sql += "WHERE id=? ";

    var sql_data = [uids];
    // if (type == JOIN_TYPE.INVITE) {
    //     sql_data.push(invite_progress);
    // }
    sql_data.push(fuid);

    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);

    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

////////////////////////////////////////////////////////////////////////////////
// 获取奖励相关.

/**
 * 获得奖励对象.
 * @param invitor_social 玩家的社交数据对象.
 * @param type 奖励类型(0,1,2)
 */
function _getRewardObj(invitor_social, type, share_id) {
    var reward = [];
    switch (type) {
        case JOIN_TYPE.INVITE:
            // 计算领取奖励的id(根据邀请进度)
            reward = _getInviteReward(invitor_social);
            break;

        case JOIN_TYPE.SHARE:
            // 计算领取奖励的id(根据share_id)
            reward = _getShareReward(invitor_social, share_id);
            break;

        case JOIN_TYPE.ENSHRINE:
            // 查询common表common_const_cfg
            reward = common_const_cfg.COLLECTION;
            break;
        case JOIN_TYPE.INVITE_DAILY:
            //每日邀请奖励
            reward = _getInviteDailyReward();
            break;
    }
    return reward;
}

/**
 * 获得分享奖励.
 * @param invitor_social 玩家的社交数据对象.
 * @param share_id 分享任务ID.
 */
function _getShareReward(invitor_social, share_id) {
    const FUNC = TAG + "_getShareReward() --- ";

    if (DEBUG) console.log(FUNC + "invitor_social:", invitor_social);
    if (DEBUG) console.log(FUNC + "share_id:", share_id);

    var share = getShareById(share_id);
    if (DEBUG) console.log(FUNC + "share:", share);
    if (share) {
        var repeat = share.repeat;
        var share_status = _getShareStatus(invitor_social, repeat);
        var share_status_json = JSON.parse(share_status);
        if (DEBUG) console.log(FUNC + "share_status_json:", share_status_json);
        var status = share_status_json["" + share_id];//状态为1(未领取)时才可以领取
        if (DEBUG) console.log(FUNC + "status:", status);

        if (status == SHARE_STATUS.REWARD) {
            return share.reward;
        }
        else {
            return [];
        }
    }
    else {
        return [];
    }
}

/**
 * 获得邀请奖励对象.
 */
function _getInviteReward(invitor_social) {
    var reward_id = invitor_social.invite_reward;// 已经领取的邀请奖励ID.
    var next_reward_id = reward_id + 1;// 下一级邀请奖励ID.

    var invite = getInviteById(next_reward_id);
    var invite_number = 10000;
    if (invite) {
        invite_number = invite.number;
    }
    if (invite_number <= invitor_social.invite_progress) {
        return invite.reward;
    }
    else {
        // TODO: 做错误提示.
        return [];// 没有奖励
    }
}

/**
 * 获得每日邀请奖励INVITE_DAILY.
 */
function _getInviteDailyReward() {
    console.log("_getInviteDailyReward:");
    return social_friendfirst_cfg[0].reward;
}

/**
 * 处理领奖后的各字段设置.
 * @param type 领奖类型: JOIN_TYPE
 *
 */
function _afterReward(pool, type, uid, invitor_social, share_id, cb) {
    switch (type) {
        case JOIN_TYPE.INVITE:
            _updateTableSocialWithInviteReward(pool, uid, invitor_social, cb);
            break;

        case JOIN_TYPE.SHARE:
            _updateTableSocialWithShare(pool, uid, invitor_social, share_id, SHARE_STATUS.GOTTEN, cb)
            break;

        case JOIN_TYPE.ENSHRINE:
            _updateTableSocialWithEnshrine(pool, uid, invitor_social, ENSHRINE_STATUS.GOTTEN, cb);
            break;
        case JOIN_TYPE.INVITE_DAILY:
            //处理每日邀请领奖记录redis
            _updateRedisSocialWithInviteDailyReward(uid);
            break;
    }
}

//==============================================================================
// 需要转移
//==============================================================================

function getInviteById(id) {
    return getInfoById(social_friend_cfg, id);
}

function getShareById(id) {
    return getInfoById(social_share_cfg, id);
}

/**
 * 通过id获取数组型配置表中的信息.
 */
function getInfoById(cfg, id) {
    for (var i in cfg) {
        var info = cfg[i];
        if (info.id == id) {
            return info;
        }
    }
    return null;
}
