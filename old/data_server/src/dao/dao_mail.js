////////////////////////////////////////////////////////////////////////////////
// 邮件数据库访问
// sendMail
// readMail
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var BuzzUtil = require('../utils/BuzzUtil');
var CommonUtil = require('../buzz/CommonUtil');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var ErrorUtil = require('../buzz/ErrorUtil');
var buzz_vip = require('../buzz/buzz_vip');
var ObjUtil = require('../buzz/ObjUtil');
var ArrayUtil = require('../utils/ArrayUtil');

var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL;


var ERROR_OBJ = require('../buzz/cst/buzz_cst_error').ERROR_OBJ;

var DaoCommon = require('./dao_common');
var DaoReward = require('./dao_reward');

var AccountCommon = require('./account/common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../buzz/cache/CacheLink');
var CacheAccount = require('../buzz/cache/CacheAccount');
var CacheMail = require('../buzz/cache/CacheMail');
var CacheLogMailReward = require('../buzz/cache/CacheLogMailReward');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');
var item_item_cfg = require('../../cfgs/item_item_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');

//==============================================================================
// const
//==============================================================================
var TAG = "【dao_mail】";

var ERROR = 1;
var DEBUG = 0;

// 邮件类型
const MAIL_TYPE = {
    SYS :   1,// 系统
    RANK :  2,// 排行榜
    SPECIFY : 3,// 补偿邮件(指定玩家发送)
}

// 邮件状态
const MAIL_STAT = {
    UNREAD :    1,// 未读
    READ :      2,// 已读
    GOT :       3,// 已领取
}

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.sendMail = sendMail;
exports.sendMails = sendMails;
exports.mailList = mailList;
exports.readMail = readMail;
exports.clearMail = clearMail;
exports.loadMail = loadMail;
exports.updateMailBox = updateMailBox;
exports.flush = flush;
exports.addMails = addMails;
exports.addMailsIn = addMailsIn;
exports.addMailsNotIn = addMailsNotIn;

exports.addMailForAll = addMailForAll;
exports.addMailForPlayer = addMailForPlayer;

exports.writeLogMailReward = writeLogMailReward;

exports.MAIL_TYPE = MAIL_TYPE;
exports.MAIL_STAT = MAIL_STAT;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 批量发邮件(排行榜等)
 */
function sendMails(pool, data, cb) {
    // 数据验证
    if (!_prepareSendMails(data, cb)) return;
    _didSendMails(pool, data, cb);
}

/**
 * 发邮件(后台调用)
 */
function sendMail(pool, data, cb){
    // 数据验证
    if (!_prepareSendMail(data, cb)) return;
    _didSendMail(pool, data, cb);
}

/**
 * 获取邮件列表(前端调用).
 * 玩家点击邮箱时会调用接口mail_list, 其数据库层面的操作就是查询对应token的玩家的邮箱并返回邮箱全部内容.
 */
function mailList(pool, data, cb) {
    console.log("【CALL】mailList");
    // 1. 数据验证
    if (!_prepareMailList(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "mail_list");
    _didMailList(pool, data, cb);
}

/**
 * 阅读邮件，有奖励就发奖(前端调用)
 * 玩家点击一封未读邮件时调用接口read_mail, 服务器需要根据邮件id查询tbl_mail获取详细邮件信息.
 * 如果tbl_mail.reward字段不为空, 则将相应的奖励发放给玩家.
 */
function readMail(pool, data, cb) {
    // 数据验证
    _prepareReadMail(data, function (err, ret) {
        if(!!ret){
            BuzzUtil.cacheLinkDataApi(data, "read_mail");
            _didReadMail(pool, data, cb);
        }
    });
}

/**
 * 清理邮件中的错误奖励
 */
function clearMail(pool, cb) {
    const FUNC = TAG + "clearMail() --- ";

    readMailDb(pool, "id,reward", function(err, mails) {
        if (err) {
            console.err(FUNC + "err:", err);
            return;
        }
        var data = clearMailRewards(mails);
        writeMailDb(pool, data, cb);
    });
}

/**
 * 清除邮件中的错误奖励.
 */
function clearMailRewards(mails) {
    const FUNC = TAG + "clearMailRewards() --- ";

    var data = {
        field: "reward",
        db_case: "id",
        keyvalue_list: [],
        key_list: [],
    };
    for (var i = 0; i < mails.length; i++) {
        var id = mails[i].id;
        var reward = mails[i].reward;
        var reward_json = ObjUtil.str2Data(reward);

        var has_wrong_reward = false;
        for (var idx in reward_json) {
            var item_key = reward_json[idx][0];
            // 不存在的物品全部替换为一枚金币.
            if (!item_item_cfg[item_key]) {
                reward_json[idx][0] = "i001";
                reward_json[idx][1] = 1;
                has_wrong_reward = true;
            }
        }
        if (has_wrong_reward) {
            var str_reward = ObjUtil.data2String(reward_json);
            console.log(FUNC + "此行有错误:", id);
            console.log(FUNC + "修正前:", reward);
            console.log(FUNC + "修正后:", str_reward);
            data.keyvalue_list.push({
                key: id,
                value: str_reward,
            });
            data.key_list.push(id);
        }
    }
    return [data];
}

/**
 * 读取数据库邮件.
 */
function readMailDb(pool, fields, cb) {
    const FUNC = TAG + "readMailDb() --- ";

    var sql = "";
    sql += "SELECT " + fields + " ";
    sql += "FROM tbl_mail ";
    
    var sql_data = [];
    
    console.log(FUNC + "sql: ", sql);
    console.log(FUNC + "sql_data: ", sql_data);
    
    pool.query(sql, sql_data, cb);
}

/**
 * 写数据库邮件.
 */
function writeMailDb(pool, data_list, cb) {
    const FUNC = TAG + "writeMailDb() --- ";

    var key_list = data_list[0].key_list.toString();
    for (var i = 0; i < data_list.length; i++) {
        if (data_list[i].key_list.length == 0) {
            console.log(FUNC + "没有错误奖励, 不做任何修改返回");
            cb(null, "success");
            return;
        }
    }

    var sql = "";
    sql += "UPDATE tbl_mail ";
    for (var i = 0; i < data_list.length; i++) {
        var data = data_list[i];
        if (i > 0) sql += ",";
        var field = data.field;
        var db_case = data.db_case;
        var keyvalue_list = data.keyvalue_list;
        sql += "SET " + field + " = CASE " + db_case + " ";
        for (var j = 0; j < keyvalue_list.length; j++) {
            var keyvalue = keyvalue_list[j];
            var key = keyvalue.key;
            var value = keyvalue.value;
            sql += "WHEN " + key + " THEN '" + value + "' ";
        }
        sql += "END ";
    }
    sql += "WHERE " + db_case + " IN (" + key_list + ")";
    
    var sql_data = [];
    
    console.log(FUNC + "sql: ", sql);
    console.log(FUNC + "sql_data: ", sql_data);
    
    pool.query(sql, sql_data, cb);
}

const SHELF_LIFE = 10;//单位: 天
/**
 * 加载数据库中所有有效期(默认为3)内的邮件到内存中
 */
function loadMail(pool, cb) {
    var sql = "SELECT * ";
    sql += "FROM tbl_mail ";
    sql += "WHERE DATEDIFF(NOW(), sendtime) < ? ";
    
    var sql_data = [SHELF_LIFE];
    
    pool.query(sql, sql_data, function (err, mails) {
        for (var i in mails) {
            CacheMail.push(mails[i]);
        }
        cb(err, mails);
    });
}

/**
 * 更新缓存中的mail_box到数据库
 */
function updateMailBox(pool, cb) {
    const FUNC = TAG + "updateMailBox() --- ";

    var all_mail_box = CacheAccount.getAllMailBox();
    var all_ids = _.pluck(all_mail_box, "id");
    
    if (DEBUG) console.log(FUNC + "all_mail_box: ", all_mail_box);
    if (DEBUG) console.log(FUNC + "all_ids: ", all_ids);

    // 制作一个更新语句
    var sql = "";
    sql += "UPDATE tbl_account ";
    sql += "SET mail_box = CASE id ";
    for (var i = 0; i < all_mail_box.length; i++) {
        sql += "WHEN " + all_mail_box[i].id + " THEN '" + all_mail_box[i].mail_box + "' ";
    }
    sql += "END ";
    sql += "WHERE id IN (" + all_ids.toString() + ")";
    
    var sql_data = [];

    if (DEBUG) console.log(FUNC + "sql: ", sql);
    if (DEBUG) console.log(FUNC + "sql_data: ", sql_data);
    if (DEBUG) console.log(FUNC + "sql.length: ", sql.length);
    
    pool.query(sql, sql_data, function (err, rows) {
        if (DEBUG) console.log(FUNC + "err: ", err);
        if (DEBUG) console.log(FUNC + "rows: ", rows);
        if (cb != null) cb(err, rows);
    })
}

/**
 * TODO: 将缓存中的数据更新到数据库.
 * 注意: 目前的发送邮件是直接修改数据库, 此方法不用做任何事.
 */
function flush(pool, cb) {
    cb();
}

/**
 * @param mail_id 邮件id.
 * @param account_list 排除账号列表.
 * @param type 排行榜类型.
 */
function addMailsIn(pool, mail_id, account_list, type, platform, next) {
    getCommonSql(pool, "", account_list.toString(), type, mail_id, platform, next);
}

/**
 * @param mail_id 邮件id.
 * @param account_list 排除账号列表.
 * @param type 排行榜类型.
 */
function addMailsNotIn(pool, mail_id, account_list, type, platform, next) {
    getCommonSql(pool, "NOT ", account_list.toString(), type, mail_id, platform, next);
}

function getCondition(type) {
    switch (type) {
        case "achieve_point":
            return "AND achieve_point > 0";

        default:
            return "";
    }
}

function getCommonSql(pool, str, ids, type, mail_id, platform, next) {
    const FUNC = TAG + "getCommonSql() --- ";

        if (ids.length > 0) {
            console.log(FUNC + '需要给' + ids.split(",").length + '个玩家发奖励');
            var sql = "";
            sql += "UPDATE tbl_account ";
            sql += "SET mail_box = CASE ";
            sql += "WHEN mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) > 0 THEN ";
            sql += "    CONCAT(mail_box, ?) ";
            sql += "WHEN mail_box IS NULL OR (mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) < 1) THEN ";
            sql += "    ? ";
            sql += "END ";
            sql += "WHERE id " + str + "IN ( " + ids + " ) ";
            sql += "AND platform=? ";
            sql += getCondition(type);
            var sql_data = ["," + mail_id, mail_id, platform];
            
            console.log(FUNC + 'sql:\n', sql);
            console.log(FUNC + 'sql_data:\n', sql_data);
            
            _addMail(pool, sql, sql_data, mail_id, function (err, results) {
                next();

                // 发送Redis消息
                var mail_info = {
                    mid: mail_id,
                    reciever_list: ids,
                };
                console.log(FUNC + "mail_info:\n", mail_info);
                var message = JSON.stringify(mail_info);
                RedisUtil.publish(CHANNEL.MAIL_RANK, message);
            });
        }
        else {
            console.log(FUNC + '玩家活跃值为0, 没有玩家需要发放奖励邮件:', mail_id);
            next();
        }
}

function _dropInactive(pool, ids, cb) {
    const FUNC = TAG + "_dropInactive() --- ";

    var sql = "";
    sql += "SELECT id, mission_daily_reset ";
    sql += "FROM tbl_account ";
    sql += "WHERE id IN ( " + ids + " ) ";
    var sql_data = [];

    pool.query(sql, sql_data, function(err, results) {
        // [ 
        // { id: 46, mission_daily_reset: '{}' },
        // { id: 52, mission_daily_reset: '{...,"dailyTotal":0,...}' }
        // ]
        var ids = "";
        for (var i = 0; i < results.length; i++) {
            var account = results[i];
            var mission_daily_reset = ObjUtil.str2Data(account.mission_daily_reset);
            if (mission_daily_reset.dailyTotal > 0) {
                if (ids.length > 0) {
                    ids += ",";
                }
                ids += account.id;
            }
        }
        if (DEBUG) {
            console.log('======================================');
            console.log(FUNC + '排行榜排除(当日不活跃用户)的用户ID:\n', ids);
            console.log('======================================');
        }
        cb(ids);
    });
}

/**
 * @param op_set 一组操作[{},{}], 每一个操作包含{ func:?, mail_id:?, account_list:? }
 */
function addMails(pool, op_set, cb) {
    var op = op_set.shift();
    if (op.account_list.length > 0) {
        op.func(pool, op.mail_id, op.account_list, op.type, op.platform, function () {
            if (op_set.length > 0) {
                addMails(pool, op_set, cb);
            }
            else {
                cb();
            }
        });
    }
    else {
        cb();
    }
}

/**
 * 网数据库中写入日志.
 */
function writeLogMailReward(pool, cb) {
    var count = CacheLogMailReward.length();
    if (count > 0) {
        insertMassiveLogMailReward(pool, CacheLogMailReward.cache(), count, cb);
    }
    else {
        cb && cb(ERROR_OBJ.CACHE_EMPTY);
    }
}

/**
 * 插入大量的日志数据(用户异常).
 * @param group 插入数据的来源(队列)
 * @param num 插入数据的数目
 */
function insertMassiveLogMailReward(pool, group, num, cb) {
    const FUNC = TAG + "insertMassiveLogMailReward() --- ";

    console.log(FUNC + "CALL...");
    
    if (group.length > 0) {
        
        var sql = '';
        sql += 'INSERT INTO `log_mail_reward` ';
        sql += '(`uid`,`log_at`,`mid`, `reward`) ';
        sql += 'VALUES ';
        sql += '(?,?,?,?)';
        if (group.length > 1) {
            for (var i = 0; i < group.length - 1; i++) {
                sql += ',(?,?,?,?)';
            }
        }
        
        var sql_data = [];
        for (var i = 0; i < num; i++) {
            var record = group.shift();
            
            sql_data.push(record.uid);
            sql_data.push(record.log_at);
            sql_data.push(record.mid);
            sql_data.push(record.reward);
        }
        
        if (DEBUG) console.log(FUNC + 'sql(' + sql.length + '):\n', sql);
        if (DEBUG) console.log(FUNC + 'sql_data(' + sql_data.length + '):\n', sql_data);
        
        pool.query(sql, sql_data, function (err, result) {
            if (err && ERROR) {
                console.error('------------------------------------------------------');
                console.error(FUNC + 'err:', err);
                console.log(FUNC + 'sql(' + sql.length + '):\n', sql);
                console.log(FUNC + 'sql_data(' + sql_data.length + '):\n', sql_data);
                console.error('------------------------------------------------------');
                cb && cb(err);
            }
            cb && cb(null, result);
        });

    }
    else {
        cb && cb(ERROR_OBJ.CACHE_EMPTY);
    }
}

//==============================================================================
// private
//==============================================================================

//------------------------------------------------------------------------------
// 系统操作相关
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 阅读邮件相关
//------------------------------------------------------------------------------
function _prepareReadMail(data, cb) {
    
    var token = data['token'];
    var id = data['id'];
    
    if (!CommonUtil.isParamExist("dao_mail", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", id, "接口调用请传参数id(阅读的邮件ID)", cb)) return false;

    // 验证玩家是否有这封邮件.
    var account_id = token.split("_")[0];
    CacheAccount.hasMail(account_id, id, function (err, ret) {
        if(!ret){
            console.log("玩家请求了一封过期邮件");
        }
        cb(null, ret);
    });
}

function _didReadMail(pool, data, cb) {
    var FUNC = TAG + "_didReadMail() --- ";
    
    var token = data['token'];
    var id = data['id'];
    
    DaoCommon.checkAccount(pool, token, function (err, account) {

        if (err) {
            if (ERROR) console.error(FUNC + "玩家账号检测出错:", id);
            if (ERROR) console.error(FUNC + "出错原因——err:", err);
            cb(err);
            return;
        }

        if(account){
            // 获取邮件详细信息.

            _getMailsDetail([id], function (err, mails) {

                var mail = mails[id];
                var mail_reward = mail.reward;
                // 发放奖励.
                if (mail_reward != null) {
                    console.log("mail_reward:", mail_reward);

                    for (var i = 0; i < mail_reward.length; i++) {
                        var reward = mail_reward[i];
                        var item_id = reward[0];
                        var item_num = reward[1];
                        if (item_id == "i005") {
                            mail_reward.splice(i, 1);
                            // 增加玩家rmb数值
                            DEBUG = 1;
                            if (DEBUG) console.log(FUNC + "增加玩家充值经验(钻数):", item_num);
                            DEBUG = 0;
                            var params = {
                                uid: account.id,
                                diamond: item_num,
                            };
                            buzz_vip.updateRmbAndVip(null, params);
                            // account.rmb += item_num;
                        }
                    }

                    DaoReward.getReward(pool, account, mail_reward, function (err_get_reward, results_get_reward) {
                        if (err_get_reward) {
                            console.log(JSON.stringify(err_get_reward));
                            return;
                        }
                        // account.mail_box中删除邮件.
                        // 缓存操作
                        CacheAccount.deleteMail(account, id);

                        _updateDb4AccountMailBox(pool, account.id, function (err, result) {
                            if (err) {
                                if (ERROR) console.log(FUNC + "err:\n", err);
                                return;
                            }
                            if (DEBUG) console.log(FUNC + "玩家数据库中的mail_box字段已经同步");
                            cb(null, [account]);
			    
                            // yDONE: 增加一条玩家领取邮件奖励的记录
                            console.log(FUNC + "增加一条玩家领取邮件奖励的记录");
                            var mailReward = {
                                uid: account.id,
                                mid: id,
                                reward: ObjUtil.data2String(mail_reward),
                                log_at: DateUtil.format(new Date(), "yyyy-MM-dd hh:mm:ss"),
                            };
                            CacheLogMailReward.push(mailReward);

                            let item_list = ObjUtil.str2Data(mail_reward);
                            console.log(FUNC + "000mailReward:", item_list);
                            let goldGain = 0;
                            let diamondGain = 0;
                            let huafeiGain = 0;
                            for (var i = 0; i < item_list.length; i++) {
                                var reward = item_list[i];
                                var item_id = reward[0];
                                var item_num = reward[1];
                                console.log(FUNC + "item_id:", item_id);
                                console.log(FUNC + "item_num:", item_num);
                                if ("i001" == item_id) {
                                    goldGain += item_num;
                                }
                                if ("i002" == item_id) {
                                    diamondGain += item_num;
                                }
                                if ('i003' == item_id) {
                                    huafeiGain += item_num;
                                }
                            }
                            let uid = account.id;
                            if (goldGain > 0) {
                                // yDONE: 金币记录日志
                                console.log(FUNC + uid + "领取邮件发放的金币");
                                logGold.push({
                                    account_id: uid,
                                    log_at: new Date(),
                                    gain: goldGain,
                                    cost: 0,
                                    duration: 0,
                                    total: account.gold,
                                    scene: common_log_const_cfg.MAIL,
                                    nickname: 0,
                                    level: account.level,
                                });
                            }
                            if (diamondGain > 0) {
                                // yDONE: 钻石记录日志
                                console.log(FUNC + uid + "领取邮件发放的钻石");
                                logDiamond.push({
                                    account_id: uid,
                                    log_at: new Date(),
                                    gain: diamondGain,
                                    cost: 0,
                                    total: account.pearl,
                                    scene: common_log_const_cfg.MAIL,
                                    nickname: 0,
                                });
                            }
                            if (huafeiGain > 0) {
                                // yDONE: 话费券记录日志
                                console.log(FUNC + uid + "领取邮件发放的话费券");
                                let total = account.package['9']['i003'];
                                logHuafei.push({
                                    uid: uid,
                                    gain: huafeiGain,
                                    cost: 0,
                                    total: total,
                                    scene: common_log_const_cfg.MAIL,
                                    comment: "'邮件发放话费券'",
                                    time: new Date(),
                                });
                            }
                        });
                    });
                }
                else {
                    cb(null, [account]);
                }
            });


        }
        else {
            cb(new Error("缓存中没有有效期内的邮件"));
        }

    });
}

// 更新账号的邮箱数据到数据库
function _updateDb4AccountMailBox(pool, account_id, cb) {
    var FUNC = TAG + "_updateDb4AccountMailBox()---";
    // DONE: 更新数据库
    CacheAccount.getMailBox(account_id, function (err, mail_box) {
        mail_box = mail_box.toString();//做个测试
        mail_box = StringUtil.trim(mail_box, ',');

        var sql = "UPDATE tbl_account ";
        sql += "SET mail_box=? ";
        sql += "WHERE id=? ";

        var sql_data = [
            mail_box,
            account_id
        ];

        if (DEBUG) console.log(FUNC + "sql:\n", sql);
        if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

        pool.query(sql, sql_data, function (err, results) {
            cb(err, results);
        });
    });
}

//------------------------------------------------------------------------------
// 邮件列表相关
//------------------------------------------------------------------------------
function _prepareMailList(data, cb) {
    
    var token = data['token'];
    var id = data['id'];
    var num = data['num'];
    
    if (!CommonUtil.isParamExist("dao_mail", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", id, "接口调用请传参数id(客户端持有的邮件最大ID, 服务器只需要返回此ID之后的邮件即可)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", num, "接口调用请传参数num(服务器需要返回给客户端的邮件条数)", cb)) return false;
    
    return true;
}


function _getMailsDetail(mids, cb){


    let sp = '';
    for(let i = 1; i <= mids.length; ++i){
        sp += '?';
        if(i!= mids.length){
            sp += ',';
        }
    }

    let sql = `SELECT * FROM tbl_mail WHERE id IN(${sp})`;
    mysqlPool.query(sql, mids, function (err, results) {
        if(err){
            cb(err);
            return;
        }

        let objs = {};

        if(results && results.length){
            for(let i = 0; i< results.length; ++i){
                objs[results[i].id] = results[i];
            }
        }

        cb(err, objs);
    })

}


function _didMailList(pool, data, cb) {
    const FUNC = TAG + "_didMailList() --- ";
    
    if (DEBUG) console.log("【CALL】_didMailList");

    var token = data['token'];
    var max_mail_id = data['id'];
    var num = data['num'];
    
    if (DEBUG) {
        console.log("token:", token);
        console.log("max_mail_id:", max_mail_id);
        console.log("num:", num);
    }

    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        // 在缓存中操作
        var mail_box = CacheAccount.getMailList(account, max_mail_id, num);
        //console.log("_didMailList()--------------mail_box:", mail_box);
        var mail_detail = [];
        // 需要查找到所有的邮件内容做成结构化数据块返回
        if (mail_box != null) {
            if (DEBUG) console.log("------------------mail_box.length:", mail_box.length);
        }
        if (mail_box != null && mail_box.length > 0) {

            _getMailsDetail(mail_box, function (err, mails) {
                if(err) {
                    cb('查询邮件信息失败');
                    return;
                }

                var box = [];
                for (var i in mail_box) {
                    //console.log("i:", i);
                    var mail_id = mail_box[i];
                    if (DEBUG) console.log("cache:", CacheMail.cache());
                    //console.log("CacheMail.contains(%d)", mail_id);
                    var content = mails[mail_id];
                    //console.log("content:", content);

                    if(!!content && mail_id != undefined){
                        mail_detail.push({
                            id: mail_id,
                            title: content.title,
                            content: content.content,
                            reward: ObjUtil.str2Data(content.reward),
                            sendtime: content.sendtime,
                        });
                        box.push(mail_id);
                    }

                }
                mail_box = box;

                if (DEBUG) console.log("_didMailList()--------------mail_detail:", mail_detail);
                cb(null, mail_detail);
            });
        }
        else {
            cb(null, []);
        }

    });
}

//------------------------------------------------------------------------------
// 批量发送邮件相关
//------------------------------------------------------------------------------
function _prepareSendMails(data, cb) {
    
    var type = data['type'];
    var mail_list = data['mail_list'];
    
    if (!CommonUtil.isParamExist("dao_mail", type, "接口调用请传参数type(邮件类型, 1.系统邮件; 2.排行榜邮件; 3.补偿邮件)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", mail_list, "接口调用请传参数mail_list(邮件列表)", cb)) return false;

    return true;
}

function _didSendMails(pool, data, cb) {
    const FUNC = TAG + "_didSendMails() --- ";
    
    var mail_list = data.mail_list;
    
    var sql = "INSERT INTO tbl_mail ";
    sql += "(type, title, content, reward) ";
    sql += "VALUES ";
    for (var i = 0; i < mail_list.length; i++) {
        if (i > 0) {
            sql += ",";
        }
        sql += "(?,?,?,?) ";
    }
    
    var sql_data = [];
    for (var i = 0; i < mail_list.length; i++) {
        sql_data.push(data.type);
        sql_data.push(mail_list[i].title);
        sql_data.push(mail_list[i].content);
        sql_data.push(mail_list[i].reward);
    }
    
    pool.query(sql, sql_data, function (err, results) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        cb(err, results);
    });
}

//------------------------------------------------------------------------------
// 发送邮件相关
//------------------------------------------------------------------------------
function _prepareSendMail(data, cb) {
    const FUNC = TAG + "_prepareSendMail() --- ";

    //var token = data['token'];
    var type = data['type'];
    var title = data['title'];
    var content = data['content'];
    var reward = data['reward'];
        
    //if (!_isParamExist(token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", type, "接口调用请传参数type(邮件类型, 1.系统邮件; 2.排行榜邮件)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", title, "接口调用请传参数title(邮件标题)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", content, "接口调用请传参数content(邮件内容)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_mail", reward, '接口调用请传参数reward(邮件奖励["i011", 10])', cb)) return false;

    // 2. TODO: 管理员验证

    // 3. DONE: reward数据格式验证
    try {
        var reward_json = JSON.parse(reward);
        if (!ArrayUtil.isArray(reward_json)) {
            cb(ERROR_OBJ.MAIL_REWARD_NOT_ARRAY);
            return false;
        }
        // BUG352: 服务器增加邮件奖励检测, 查看发放物品是否真实存在
        var invalid_item_list = [];
        for (var idx in reward_json) {
            var item_key = reward_json[idx][0];
            if (!item_item_cfg[item_key]) {
                invalid_item_list.push(item_key);
            }
        }
        if (invalid_item_list.length > 0) {
            var extraErrInfo = { debug_info: "不存在的物品:" + invalid_item_list.toString() };
            if (ERROR) console.error('------------------------------------------------------');
            if (ERROR) console.error(FUNC + extraErrInfo.debug_info);
            if (ERROR) console.error('------------------------------------------------------');
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.MAIL_REWARD_INVALID));
            return false;
        }
    }
    catch(err) {
        console.error("reward:", reward);
        cb(ERROR_OBJ.MAIL_WRONG_JSON_FORMAT);
        return false;
    }

    return true;
}

function _didSendMail(pool, data, cb) {
    const FUNC = TAG + "_didSendMail() --- ";
    if (DEBUG) console.log(FUNC + "player_list:", data.player_list);
    console.log(FUNC + "data:", data);

    if (data.player_list == undefined || data.player_list == "undefined") {
        cb("收件人列表为空, 不会发送邮件");
        return;
    }

    var sql = "INSERT INTO tbl_mail ";
    sql += "(type, title, content, reward) ";
    sql += "VALUES ";
    sql += "(?,?,?,?) ";
    
    var sql_data = [
        data.type,
        data.title,
        data.content,
        data.reward
    ];
    
    pool.query(sql, sql_data, function (err, results) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        cb(err, results.insertId);
    });
}

/**
 * 在tbl_account.mail_box中插入一条邮件.
 * 邮件对象为mail = { id : MailId, stat : [UNREAD|READ|GOT] }
 * 邮箱(mail_box)数据格式为[ mail1, mail2, ... , mailN ], 注意存储时无中括号"[]"方便使用SQL语句直接UPDATE.
 * @param mail_id 插入的邮件ID
 */
function addMailForAll(pool, mail_id, cb) {
    const FUNC = TAG + "addMailForAll() --- ";
    if (DEBUG)　console.info(FUNC + "CALL...");

    _addMailAll(pool, mail_id, null, function (err, results) {
        cb(err, mail_id);
    });
}

/**
 * 仅向指定玩家发送邮件.
 * @param mail_id 插入的邮件ID
 * @param payer_list 指定玩家的ID列表
 */
function addMailForPlayer(pool, mail_id, payer_list, cb) {
    const FUNC = TAG + "addMailForPlayer() --- ";
    if (DEBUG)　console.info(FUNC + "CALL...");

    _addMailAll(pool, mail_id, payer_list, function (err, results) {
        cb(err, mail_id);
    });
}

function _addMailAll(pool, mail_id, payer_list, cb) {
    var sql = "";
    sql += "UPDATE tbl_account ";
    sql += "SET mail_box = CASE ";
    sql += "WHEN mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) > 0 THEN ";
    sql += "    CONCAT(mail_box, ?) ";
    sql += "WHEN mail_box IS NULL OR (mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) < 1) THEN ";
    sql += "    ? ";
    sql += "END ";
    if (payer_list) {
        sql += "WHERE id IN (" + payer_list + ") ";
    }
    var sql_data = ["," + mail_id, mail_id];
    
    _addMail(pool, sql, sql_data, mail_id, cb);
}

function _addMail(pool, sql, sql_data, mail_id, cb) {
    const FUNC = TAG + "_addMail() --- ";
    pool.query(sql, sql_data, function (err, results) {
        ErrorUtil.handleDbError(err, sql, sql_data, ERROR, FUNC);
        if (err) return cb(err);
        cb(err, results);
    });
}