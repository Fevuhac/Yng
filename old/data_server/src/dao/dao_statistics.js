
////////////////////////////////////////////////////////////
// Statistics Related
////////////////////////////////////////////////////////////
var _ = require('underscore');
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var ObjUtil = require('../buzz/ObjUtil');
var DaoUtil = require('./dao_utils');

var TAG = "【dao_statistics】";
var DEBUG = 0;
var ERROR = 1;

//==============================================================================
// 查询方法(按日期段查询)
//==============================================================================

function _getDailyStatistics(pool, data, cb) {
    var start_date = data['start_date'];
    var end_date = data['end_date'];

    var sql = '';
    sql += 'SELECT ';
    sql += '`account_id`, ';
    sql += '`login_count`, ';
    sql += '`logout_count`, ';
    sql += '`gold_gain`, ';
    sql += '`gold_cost`, ';
    sql += '`game_time`, ';
    sql += '`pearl_gain`, ';
    sql += '`pearl_cost`, ';
    sql += '`skill_gain`, ';
    sql += '`skill_cost`, ';
    sql += '`weapon_levelup_exp`, ';
    sql += '`weapon_levelup_pearl`, ';
    sql += '`gold_shop_count`, ';
    sql += '`gold_shop_amount`, ';
    sql += '`pearl_shop_count`, ';
    sql += '`pearl_shop_amount`, ';
    sql += "DATE_FORMAT(`date`,'%Y-%m-%d') AS log_date, ";
    sql += "`date` ";
    sql += 'FROM tbl_daily_statistics ';
    sql += "WHERE date ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
    console.log("_getDailyStatistics()");
    console.log(sql);

    var sql_data = [];

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}
exports.getDailyStatistics = _getDailyStatistics;

//==============================================================================
// 生成方法(每日开始时生成一次昨日的)
//==============================================================================

/**
 * 每天定时产生统计数据
 */
function _genStatistics(pool, cb) {
    const FUNC = TAG + "_genStatistics() --- ";
    
    // 从tbl_login_log中查询前一日有登录的用户
    _getLoginData(pool, function (err, result_login) {
        console.log("result_login: ", result_login);
        if (result_login.length == 0) {
            cb(new Error('result_login.length == 0: 昨日没有用户登录!!!'));
            return;
        }
        var accounts = _makeLoginData(result_login);
        console.log(FUNC + "加入login数据后:", ObjUtil.length(accounts));

        _getLogoutData(pool, function (err, result_logout) {
            //console.log("result_logout: ", result_logout);
            accounts = _addLogoutData(accounts, result_logout);

            _getGoldData(pool, function (err, result_gold) {
                if (DEBUG) console.log("result_gold: ", result_gold);
                accounts = _addGoldData(accounts, result_gold);
                console.log(FUNC + "加入gold数据后:", ObjUtil.length(accounts));

                _getPearlData(pool, function (err, result_pearl) {
                    //console.log("result_pearl: ", result_pearl);
                    accounts = _addPearlData(accounts, result_pearl);

                    _getSkillData(pool, function (err, result_skill) {
                        //console.log("result_skill: ", result_skill);
                        accounts = _addSkillData(accounts, result_skill);

                        _getWeaponData(pool, function (err, result_weapon) {
                            //console.log("result_weapon: ", result_weapon);
                            accounts = _addWeaponData(accounts, result_weapon);

                            _getShopData(pool, function (err, result_shop) {
                                if (DEBUG) console.log("result_shop: ", result_shop);
                                accounts = _addShopData(accounts, result_shop);
                                
                                console.log(FUNC + "插入数据总条数:", ObjUtil.length(accounts));
                                // _insertAccounts(pool, accounts, cb);
                                _insert10Accounts(pool, accounts, cb);
                            });
                        });
                    });
                });
            });
        });
    });
};
exports.genStatistics = _genStatistics;

// 最大插入数据的条数
const MAX_INSERT_COUNT = 5;
/**
 * 每次5个账号插入, 如果accounts中还有数据, 则需要继续存.
 * @param accounts 还需要插入的数据对象, 插入的就从这个对象中移除.
 */
function _insert10Accounts(pool, accounts, cb) {
    const FUNC = TAG + "_insert10Accounts() --- ";

    var accountsTobeHandle = {};
    var count = 0;
    for (var key in accounts) {
        accountsTobeHandle[key] = accounts[key];
        delete accounts[key];
        count++;
        if (count >= MAX_INSERT_COUNT) break;
    }
    _insertAccounts(pool, accountsTobeHandle, function(err) {
        if (err) {
            if (ERROR) console.error(FUNC + "插入数据出现问题, 不中断流程, 继续插入"); 
            if (ERROR) console.error(FUNC + "本次插入条数:", ObjUtil.length(accountsTobeHandle));
            if (ERROR) console.error(FUNC + "剩余未插入条数:", ObjUtil.length(accounts));
        }
        if (ObjUtil.length(accounts) > 0) {
            _insert10Accounts(pool, accounts, cb);
        }
        else {
            cb(null);
        }
    });
}

/**
 * 插入accounts中所有的账号数据, 出现错误则在LOG中打印.
 * @param accounts 所有需要插入的对象, 出现错误只退出本次插入操作.
 */
function _insertAccounts(pool, accounts, cb) {
    const FUNC = TAG + "_insertAccounts() --- ";

    var account_count = 0;
    for (var account_id in accounts) {
        account_count++;
    }
    var sql = '';
    sql += 'INSERT INTO `tbl_daily_statistics` ';
    sql += '(`account_id`, ';
    sql += '`login_count`, ';
    sql += '`logout_count`, ';
    sql += '`gold_gain`, ';
    sql += '`gold_cost`, ';
    sql += '`game_time`, ';
    sql += '`pearl_gain`, ';
    sql += '`pearl_cost`, ';
    sql += '`skill_gain`, ';
    sql += '`skill_cost`, ';
    sql += '`weapon_levelup_exp`, ';
    sql += '`weapon_levelup_pearl`, ';
    sql += '`gold_shop_count`, ';
    sql += '`gold_shop_amount`, ';
    sql += '`pearl_shop_count`, ';
    sql += '`pearl_shop_amount`, ';
    sql += '`date`) ';
    sql += 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date_sub(curdate(),interval 1 day))';
    if (account_count > 1) {
        for (var i = 1; i < account_count; i++) {
            sql += ',(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date_sub(curdate(),interval 1 day))';
        }
    }
    //console.log('sql: ', sql);
    
    var sql_data = [];
    for (var account_id in accounts) {
        var account = accounts[account_id];
        sql_data.push(account["account_id"]);
        sql_data.push(account["login_count"]);
        sql_data.push(account["logout_count"]);
        sql_data.push(account["gold_gain"]);
        sql_data.push(account["gold_cost"]);
        sql_data.push(account["game_time"]);
        sql_data.push(account["pearl_gain"]);
        sql_data.push(account["pearl_cost"]);
        sql_data.push(account["skill_gain"]);
        sql_data.push(account["skill_cost"]);
        sql_data.push(account["weapon_levelup_exp"]);
        sql_data.push(account["weapon_levelup_pearl"]);
        sql_data.push(account["gold_shop_count"]);
        sql_data.push(account["gold_shop_amount"]);
        sql_data.push(account["pearl_shop_count"]);
        sql_data.push(account["pearl_shop_amount"]);
    }

    //console.log('accounts: ', accounts);
    //console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            if (ERROR) console.error(FUNC + 'sql:\n', sql);
            if (ERROR) console.error(FUNC + 'sql_data:\n', sql_data);
            cb(err);
        } else {
            cb(null);
        }
    });
}

//------------------------------------------------------------------------------
// 获取gold数据
//------------------------------------------------------------------------------
function _getGoldData(pool, cb) {
    var sql = '';
    sql += 'SELECT account_id, SUM(gain) AS gain_sum, SUM(cost) AS cost_sum, SUM(duration) AS daily_play_time, scene ';
    sql += 'FROM tbl_gold_log ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id, scene';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _addGoldData(accounts, result_gold) {
    for (var idx_gold = 0; idx_gold < result_gold.length; idx_gold++) {
        var account_id = result_gold[idx_gold]['account_id'];
        var scene = result_gold[idx_gold]['scene'];
        var gold_account = accounts['' + account_id];

        gold_account = _checkAccount(accounts, gold_account, account_id, '此帐号有金币log却没有登录log!!!');

        gold_account['gold_gain']['' + scene] = result_gold[idx_gold]['gain_sum'];
        gold_account['gold_cost']['' + scene] = result_gold[idx_gold]['cost_sum'];
        gold_account['game_time']['' + scene] = result_gold[idx_gold]['daily_play_time'];
    }
    // 对每一个都做stringify
    for (var account_id in accounts) {
        var one = accounts[account_id];
        one['gold_gain'] = JSON.stringify(one['gold_gain']);
        one['gold_cost'] = JSON.stringify(one['gold_cost']);
        one['game_time'] = JSON.stringify(one['game_time']);
    }
    return accounts;
}

//------------------------------------------------------------------------------
// 获取pearl数据
//------------------------------------------------------------------------------
function _getPearlData(pool, cb) {
    var sql = '';
    sql += 'SELECT account_id, SUM(gain) AS gain_sum, SUM(cost) AS cost_sum, scene ';
    sql += 'FROM tbl_pearl_log ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id, scene';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _addPearlData(accounts, result_pearl) {
    if (result_pearl != null && result_pearl.length > 0) {
        for (var idx_pearl = 0; idx_pearl < result_pearl.length; idx_pearl++) {
            var account_id = result_pearl[idx_pearl]['account_id'];
            var scene = result_pearl[idx_pearl]['scene'];
            var pearl_account = accounts['' + account_id];
            
            pearl_account = _checkAccount(accounts, pearl_account, account_id, '此账号在本日有珍珠log却没有登录log!!!');

            pearl_account['pearl_gain']['' + scene] = result_pearl[idx_pearl]['gain_sum'];
            pearl_account['pearl_cost']['' + scene] = result_pearl[idx_pearl]['cost_sum'];
        }
    }
    // 对每一个都做stringify
    for (var account_id in accounts) {
        var one = accounts[account_id];
        one['pearl_gain'] = JSON.stringify(one['pearl_gain']);
        one['pearl_cost'] = JSON.stringify(one['pearl_cost']);
    }
    return accounts;
}

//------------------------------------------------------------------------------
// 获取skill数据
//------------------------------------------------------------------------------
function _getSkillData(pool, cb) {
    var sql = '';
    sql += 'SELECT account_id, SUM(gain) AS gain_sum, SUM(cost) AS cost_sum, skill_id ';
    sql += 'FROM tbl_skill_log ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id, skill_id';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _addSkillData(accounts, result_skill) {
    if (result_skill != null && result_skill.length > 0) {
        for (var idx_skill = 0; idx_skill < result_skill.length; idx_skill++) {
            var account_id = result_skill[idx_skill]['account_id'];
            var skill_account = accounts['' + account_id];
            var scene = result_skill[idx_skill]['skill_id'];

            skill_account = _checkAccount(accounts, skill_account, account_id, '此账号在本日有技能log却没有登录log!!!');

            skill_account['skill_gain']['' + scene] = result_skill[idx_skill]['gain_sum'];
            skill_account['skill_cost']['' + scene] = result_skill[idx_skill]['cost_sum'];
        }
    }
    // 对每一个都做stringify
    for (var account_id in accounts) {
        var one = accounts[account_id];
        one['skill_gain'] = JSON.stringify(one['skill_gain']);
        one['skill_cost'] = JSON.stringify(one['skill_cost']);
    }
    return accounts;
}

//------------------------------------------------------------------------------
// 获取weapon数据
//------------------------------------------------------------------------------
function _getWeaponData(pool, cb) {
    var sql = '';
    sql += 'SELECT account_id, SUM(level_up) AS level_sum, type ';
    sql += 'FROM tbl_weapon_log ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id, type';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _addWeaponData(accounts, result_weapon) {
    if (result_weapon != null && result_weapon.length > 0) {
        for (var idx_weapon = 0; idx_weapon < result_weapon.length; idx_weapon++) {
            var account_id = result_weapon[idx_weapon]['account_id'];
            var weapon_account = accounts['' + account_id];

            weapon_account = _checkAccount(accounts, weapon_account, account_id, '此账号有武器log却没有登录log!!!');

            var type = result_weapon[idx_weapon]['type'];
            if (type == cfg.weapon_levelup_type.EXP) {
                weapon_account['weapon_levelup_exp'] = result_weapon[idx_weapon]['level_sum'];
            }
            else if (type == cfg.weapon_levelup_type.PEARL) {
                weapon_account['weapon_levelup_pearl'] = result_weapon[idx_weapon]['level_sum'];
            }
        }
    }
    return accounts;
}

//------------------------------------------------------------------------------
// 获取shop数据
//------------------------------------------------------------------------------
function _getShopData(pool, cb) {
    var sql = '';
    sql += 'SELECT account_id, item_id, item_type, item_amount ';
    sql += 'FROM tbl_shop_log ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id, item_type';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _addShopData(accounts, result_shop) {
    if (result_shop != null && result_shop.length > 0) {
        for (var idx_shop = 0; idx_shop < result_shop.length; idx_shop++) {
            var account_id = result_shop[idx_shop]['account_id'];
            var shop_account = accounts['' + account_id];
            
            shop_account = _checkAccount(accounts, shop_account, account_id, '此账号在本日有商店log却没有登录log!!!');

            var type = result_shop[idx_shop]['item_type'];
            //console.log('type: ', type);
            if (type == cfg.shop_item_type.IT_GOLD) {
                shop_account['gold_shop_count'] += 1;
                shop_account['gold_shop_amount'] += result_shop[idx_shop]['item_amount'];
            }
            else if (type == cfg.shop_item_type.IT_PEARL) {
                shop_account['pearl_shop_count'] += 1;
                shop_account['pearl_shop_amount'] += result_shop[idx_shop]['item_amount'];
            }
        }
    }
    return accounts;
}

//------------------------------------------------------------------------------
// 获取login, logout数据
//------------------------------------------------------------------------------
function _getLoginData(pool, cb) {
    _getLogData(pool, cb, 'tbl_login_log');
}

function _makeLoginData(result_login) {
    var accounts = {};
    for (var idx_login = 0; idx_login < result_login.length; idx_login++) {
        var account = _insertOneAccount(result_login[idx_login]["account_id"]);
        account['login_count'] = result_login[idx_login]["id_count"];
        accounts['' + account['account_id']] = account;
    }
    return accounts;
}

function _getLogoutData(pool, cb) {
    _getLogData(pool, cb, 'tbl_logout_log');
}

function _addLogoutData(accounts, result_logout) {
    for (var idx_logout = 0; idx_logout < result_logout.length; idx_logout++) {
        var account_id = result_logout[idx_logout]['account_id'];
        var logout_account = accounts['' + account_id];

        logout_account = _checkAccount(accounts, logout_account, account_id, '此账号在本日有退出登录记录却无登录记录!!!');
        logout_account['logout_count'] = result_logout[idx_logout]['id_count'];
    }
    return accounts;
}

//==============================================================================
// 通用方法
//==============================================================================

function _checkAccount(accounts, account, account_id, errInfo) {
    if (account == null) {
        _logErrorNoLogin(errInfo, account_id);
        accounts['' + account_id] = account = _insertOneAccount(account_id);
    }
    return account;
}

function _logErrorNoLogin(errInfo, account_id) {
    console.error(errInfo);
    console.error('account_id: ', account_id);
    console.error('=============================================================');
}

function _insertOneAccount(account_id) {
    var account = {};
    account['account_id'] = account_id;
    account['login_count'] = 0;
    account['logout_count'] = 0;
    account['gold_gain'] = {};
    account['gold_cost'] = {};
    account['game_time'] = {};
    account['pearl_gain'] = {};
    account['pearl_cost'] = {};
    account['skill_gain'] = {};
    account['skill_cost'] = {};
    account['weapon_levelup_exp'] = 0;
    account['weapon_levelup_pearl'] = 0;
    account['gold_shop_count'] = 0;
    account['gold_shop_amount'] = 0;
    account['pearl_shop_count'] = 0;
    account['pearl_shop_amount'] = 0;
    return account;
}

function _getLogData(pool, cb, table) {
    var sql = '';
    sql += 'SELECT account_id, COUNT(account_id) AS id_count ';
    sql += 'FROM ' + table + ' ';
    sql += 'WHERE TO_DAYS(NOW()) - TO_DAYS(`log_at`) = 1 ';
    sql += 'GROUP BY account_id';
    //console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

