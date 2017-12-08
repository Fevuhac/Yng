//==============================================================================
// import
//==============================================================================
var admin_common = require('./admin_common');
var CacheUtil = require('../../src/buzz/cache/CacheUtil');
var DateUtil = require('../../src/utils/DateUtil');
var data_util = require('../data/data_util');

var CacheAccount = require('../../src/buzz/cache/CacheAccount');

var DaoAccount = require('../../src/dao/dao_account');

var SERVER_CFG = require('../../src/cfgs/server_cfg').SERVER_CFG;

var DEBUG = 0;
var ERROR = 1;
var TAG = "【admin_server】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.countAccount = countAccount;
exports.listAccount = listAccount;
exports.saveAccount = saveAccount;
exports.resetActive = resetActive;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function countAccount(req, res) {
    const FUNC = TAG + "countAccount() --- ";
    const HINT = "返回缓存中的用户数量";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        var ret = {
            account_count: CacheAccount.length(),
        }
        data_util.handleReturn(res, false, null, ret, HINT);
    });
}

////////////////////////////////////////
function listAccount(req, res) {
    const FUNC = TAG + "listAccount() --- ";
    const HINT = "返回缓存中所有用户列表";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        var ret = {
            account_list: CacheAccount.uid_list(),
        }
        data_util.handleReturn(res, false, null, ret, HINT);
    });
}

////////////////////////////////////////
function saveAccount(req, res) {
    const FUNC = TAG + "saveAccount() --- ";
    const HINT = "保存所有玩家信息到数据库";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        DaoAccount.updateDb(req.pool, function (err, results) {
            if (err) {
                console.error(FUNC + "err:", err);
                data_util.handleReturn(res, false, err, null, HINT);
                return;
            }
            var ret = {status: "success"};
            data_util.handleReturn(res, false, null, ret, HINT);
        });
    });
}

////////////////////////////////////////
function resetActive(req, res) {
    const FUNC = TAG + "resetActive() --- ";
    const HINT = "重置玩家活动数据";
    console.log(FUNC + "CALL...");

    _checkAdmin(function () {
        var activeReset = require('../../src/buzz/activeReset');
        activeReset.resetDB(req.pool);
    });
}

//==============================================================================
// private
//==============================================================================
// TODO: 验证管理员身份
function _checkAdmin(cb) {
    cb();
}