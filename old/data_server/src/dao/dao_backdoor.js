/////////////////////////////////////////////////////////////////////////////////////////
// Backdoor Related
// 后门相关
/////////////////////////////////////////////////////////////////////////////////////////

//=======================================================================================
// import
//=======================================================================================
var ObjUtil = require('../buzz/ObjUtil');
var CstError = require('../buzz/cst/buzz_cst_error');

var DaoGold = require('./dao_gold');
var DaoAccount = require('./dao_account');
var DaoCommon = require('./dao_common');
var DaoMail = require('./dao_mail');

var CacheAccount = require('../buzz/cache/CacheAccount');


//=======================================================================================
// constant
//=======================================================================================
var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG= "【dao_backdoor】";


//=======================================================================================
// public
//=======================================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.modifyUserData = modifyUserData;
exports.kickUser = kickUser;
exports.accountForbidden = accountForbidden;
exports.accountAuth = accountAuth;
exports.switchMatch = switchMatch;
exports.switchCik = switchCik;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function modifyUserData(pool, data, cb) {
    const FUNC = TAG + "modifyUserData() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid = data.uid;
    var field = data.field;
    var value = data.value;

    if (AVAILABLE_FIELD.indexOf(field) != -1) {
        if (field == 'nuclear') {
            updateNuclear(pool, uid, value, cb);
        }
        else if (field == 'goddess') {
            if (DEBUG) console.log(FUNC + "field == 'goddess'");
            updateGoddess(pool, uid, value, cb);
        }
        // else if (field == 'card') {
        //     updateCard(pool, uid, value, cb);
        // }
        else {
            updateSingleValue(pool, uid, field, value, cb);
        }
    }
    else {
        if (ERROR) console.error(FUNC + "此字段数据暂不支持修改:", field);
    }
}

/**
 * 游戏更新时强制踢出玩家.
 * @param data 数据格式为{uid_list:"1,2,3"}
 */
function kickUser(pool, data, cb) {
    const FUNC = TAG + "kickUser() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid_list = data.uid_list;
    if (DEBUG) console.log(FUNC + "uid_list:", uid_list);
    // 是否踢出指定玩家
    var kick_specific_user = uid_list != null && uid_list.length > 0;
    
    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`='server_update' ";
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
            if (DEBUG) console.log(FUNC + "踢出玩家成功");
        }
    });
 
}

/**
 * 重置玩家.
 * @param data 数据格式为{uid:"1,2,3"}
 */
function accountForbidden(pool, data, cb) {
    const FUNC = TAG + "accountForbidden() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid_list = data.uid;
    if (DEBUG) console.log(FUNC + "uid_list:", uid_list);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `channel_account_id`=CONCAT(`channel_account_id`, '_DELETE'), `test`=2 ";
    sql += "WHERE id IN (?)";

    var sql_data = [uid_list];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            if (DEBUG) console.log(FUNC + "重置玩家成功");
        }
    });
 
}

/**
 * 修改账号权限.
 * @param data 数据格式为{uid:"1,2,3", "test":0|1|2}
 */
function accountAuth(pool, data, cb) {
    const FUNC = TAG + "accountForbidden() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid_list = data.uid;
    var test = data.test;
    if (DEBUG) console.log(FUNC + "uid_list:", uid_list);
    if (DEBUG) console.log(FUNC + "test:", test);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `test`=? ";
    sql += "WHERE id IN (?)";

    var sql_data = [test, uid_list];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            if (DEBUG) console.log(FUNC + "修改账号权限成功");
        }
    });
 
}

/**
 * 排位赛开关.
 */
function switchMatch(pool, data, cb) {
    const FUNC = TAG + "switchMatch() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid_list = data.uid;
    var action = data.action;
    var match_on = 0;
    if ("on" == action) {
        match_on = 1;
    }
    if (DEBUG) console.log(FUNC + "action:", action);
    if (DEBUG) console.log(FUNC + "match_on:", match_on);

    var sql = "";
    sql += "UPDATE `tbl_switch` ";
    sql += "SET `match_on`=? ";
    sql += "WHERE id IN (" + uid_list + ")";

    var sql_data = [match_on];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            if (DEBUG) {
                if (match_on) {
                    console.log(FUNC + uid_list + "排位赛开启成功");
                }
                else {
                    console.log(FUNC + uid_list + "排位赛关闭成功");
                }
            }
        }
    });
}

/**
 * 实物兑换开关.
 */
function switchCik(pool, data, cb) {
    const FUNC = TAG + "switchCik() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid_list = data.uid;
    var action = data.action;
    var cik_on = 0;
    if ("on" == action) {
        cik_on = 1;
    }
    if (DEBUG) console.log(FUNC + "action:", action);
    if (DEBUG) console.log(FUNC + "cik_on:", cik_on);

    var uid_list_array = uid_list.split(",");
    for (var i = 0; i < uid_list_array.length; i++) {
        var uid = uid_list_array[i];
        CacheAccount.getAccountById(uid, function (account) {
            account.cik_on = cik_on;
        });

    }

    var sql = "";
    sql += "UPDATE `tbl_switch` ";
    sql += "SET `cik_on`=? ";
    sql += "WHERE id IN (" + uid_list + ")";

    var sql_data = [cik_on];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            if (DEBUG) {
                if (cik_on) {
                    console.log(FUNC + uid_list + "实物兑换开启成功");
                }
                else {
                    console.log(FUNC + uid_list + "实物兑换关闭成功");
                }
            }
        }
    });
}


//=======================================================================================
// private
//=======================================================================================

function updateNuclear(pool, uid, data, cb) {
    const FUNC = TAG + "updateNuclear() --- ";

    var data  = JSON.parse(data);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`='modify' ";
    sql += "WHERE id=?";

    var sql_data = [uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            // 修改缓存数据
            CacheAccount.setToken(uid, "modify");
            CacheAccount.getAccountById(uid, function (err, account) {
                let skill = account.skill;
                if (DEBUG) console.log(FUNC + "skill:", skill);
                for (var key in data) {
                    skill[key] = data[key];
                }
            });
        }
    });
}

/**
 * 修改女神
 * 传入数据格式:
[{"id":1, "startWaveIdx":60}]
[{"id":1, "level":5, "startWaveIdx":60}]
 */
function updateGoddess(pool, uid, data, cb) {
    const FUNC = TAG + "updateGoddess() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var data  = JSON.parse(data);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`='modify' ";
    sql += "WHERE id=?";

    var sql_data = [uid];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            // 修改缓存数据
            CacheAccount.setToken(uid, "modify");
            CacheAccount.getAccountById(uid, function (err, account) {
                if(!!account){
                    var goddess =account.goddess;
                    if (DEBUG) console.log(FUNC + "goddess:", goddess);
                    for (var i = 0; i < data.length; i++) {
                        var id = data[i].id;
                        for (var j = 0; j < goddess.length; j++) {
                            if (id = goddess[j].id) {
                                for (var key in data[i]) {
                                    goddess[i][key] = data[i][key];
                                }
                            }
                        }
                    }

                    // 设置数据库中的数据
                    updateTableAccountGoddess(pool, uid, JSON.stringify(goddess), function(err, result) {

                        if (err) {
                            if (ERROR) console.error(FUNC + "err: ", err);
                        }
                        else {
                            if (DEBUG) console.log(FUNC + "修改玩家女神数据成功");
                        }

                    });
                }
                else {
                    if (DEBUG) console.log(FUNC + "玩家数据不在缓存中");
                }
            });
        }
    });
}

function updateTableAccountGoddess(pool, uid, goddess, cb) {
    const FUNC = TAG + "updateTableAccountGoddess() --- ";

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `goddess`=? ";
    sql += "WHERE id=?";

    var sql_data = [goddess, uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);
    });
}

/**
 * 更新玩家月卡信息.
 */
function updateCard(pool, uid, data, cb) {
    const FUNC = TAG + "updateCard() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var data  = JSON.parse(data);

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `token`='modify' ";
    sql += "WHERE id=?";

    var sql_data = [uid];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            // 修改缓存数据
            CacheAccount.setToken(uid, "modify");
            CacheAccount.getAccountById(uid, function (err, account) {
                if(!!account){
                    let card = account.card;
                    if (DEBUG) console.log(FUNC + "card:", card);
                    account.card = data;
                    account.commit();

                    // 设置数据库中的数据
                    updateTableAccountCard(pool, uid, JSON.stringify(account.card), function(err, result) {
                        if (err) {
                            if (ERROR) console.error(FUNC + "err: ", err);
                        }
                        else {
                            if (DEBUG) console.log(FUNC + "修改玩家月卡数据成功");
                        }
                    });
                }
                else {
                    if (DEBUG) console.log(FUNC + "玩家数据不在缓存中");
                }
            });
        }
    });
}

function updateTableAccountCard(pool, uid, card, cb) {
    const FUNC = TAG + "updateTableAccountCard() --- ";

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `card`=? ";
    sql += "WHERE id=?";

    var sql_data = [card, uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);
    });
}

/**
 * 目前支持更新字段如下
 * gold, pearl, weapon
 */
function updateSingleValue(pool, uid, field, value, cb) {
    const FUNC = TAG + "updateSingleValue() --- ";

    var sql = "";
    sql += "UPDATE `tbl_account` ";
    sql += "SET `" + field + "`=? ";
    sql += ",`token`='modify' ";
    sql += "WHERE id=?";

    var sql_data = [value, uid];

    pool.query(sql, sql_data, function (err, rows) {
        if (cb != null) cb(err, rows);

        if (err) {
            if (ERROR) console.error(FUNC + "err: ", err);
        }
        else {
            // 修改缓存数据
            console.log(FUNC + "进入缓存修改");
            DaoCommon.getAccount(pool, uid, function(err, account) {
                if (err) {
                    console.log(FUNC + "获取用户数据出错:", err);
                    return;
                }
                doNextWithAccount(account);
            });

            function doNextWithAccount(account) {
                // console.log(FUNC + "获取了用户数据:", account);
                CacheAccount.setToken(uid, "modify");
                switch(field) {
                    case 'gold':
                        CacheAccount.setGold(account, parseInt(value));
                        break;
                    case 'pearl':
                        CacheAccount.setPearl(account, parseInt(value));
                        break;
                    case 'weapon':
                        CacheAccount.setWeapon(account, parseInt(value));
                        break;
                    case 'level':
                        CacheAccount.setLevel(account, parseInt(value));
                        break;
                    case 'exp':
                        CacheAccount.setExp(account, parseInt(value));
                        break;
                    case 'vip':
                        console.log(FUNC + "修改用户VIP:", value);
                        CacheAccount.setVip(account, parseInt(value));
                        break;
                    case 'rmb':
                        CacheAccount.setRmb(account, parseInt(value));
                        break;
                    case 'weapon_skin':
                        // {"own":[1,2],"equip":1}
                        console.log(FUNC + "修改玩家皮肤数据:", value);
                        CacheAccount.setWeaponSkin(account, JSON.parse(value));
                        break;
                    case 'card':
                        CacheAccount.setCard(account, JSON.parse(value));
                        break;
                    case 'get_card':
                        CacheAccount.setGetCard(account, JSON.parse(value));
                        break;

                    // 女神数据修改
                    case 'goddess_free':
                        CacheAccount.setGoddessFree(account, value);
                        break;
                    case 'goddess_ctimes':
                        CacheAccount.setGoddessCTimes(account, value);
                        break;
                    case 'goddess_crossover':
                        CacheAccount.setGoddessCrossover(account, value);
                        break;
                    case 'goddess_ongoing':
                        CacheAccount.setGoddessOngoing(account, value);
                        break;
                }
            }
        }
    });
}

const AVAILABLE_FIELD = [
    'gold',
    'pearl',
    'weapon',
    'weapon_skin',
    'level',
    'exp',
    'goddess',
    'nuclear',
    'card',
    'get_card',
    'vip',
    'rmb',

    'goddess_free',
    'goddess_ctimes',
    'goddess_crossover',
    'goddess_ongoing',
];