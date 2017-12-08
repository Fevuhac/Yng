////////////////////////////////////////////////////////////
// Test Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var child_process = require('child_process');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var SERVER_CFG = require('../cfgs/server_cfg').SERVER_CFG;
var ObjUtil = require('./ObjUtil');
var DateUtil = require('../utils/DateUtil');
var BuzzUtil = require('../utils/BuzzUtil');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var buzz_cron = require('./buzz_cron');

var ItemTypeC = require('./pojo/Item').ItemTypeC;


//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
// var dao_reward = require('../dao/dao_reward');
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
// var newweapon_weapon_cfg = require('../../cfgs/newweapon_weapon_cfg');
// var newweapon_upgrade_cfg = require('../../cfgs/newweapon_upgrade_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_test】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.modifyTestData = modifyTestData;
exports.shellTimeM = shellTimeM;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 修改服务器数据
 */
function modifyTestData(req, dataObj, cb) {
    const FUNC = TAG + "modifyTestData() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _modifyTestData(req, dataObj, cb);

    function lPrepare(input) {
        console.log(FUNC + "input:", input);
        return BuzzUtil.checkParams(input, ['uid', 'change'], "buzz_test", cb);
    }
}

/**
 * 设置服务器系统时间
 */
function shellTimeM(req, dataObj, cb) {
    const FUNC = TAG + "shellTimeM() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _shellTimeM(req, dataObj, cb);

    function lPrepare(input) {
        console.log(FUNC + "input:", input);
        return BuzzUtil.checkParams(input, ['date', 'time'], "buzz_test", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 修改数据供测试用
 */
function _modifyTestData(req, dataObj, cb) {
    const FUNC = TAG + "_modifyTestData() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var change = dataObj.change;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        console.log(FUNC + "uid:", uid);
        console.log(FUNC + "change:", change);

        var ret = {};
        for (var idx in change) {
            var item = change[idx];
            var item_key = item.key;
            var item_value = item.value;

            if (item_value.length == 1) {
                account[item_key] = item_value[0];
                ret[item_key] = account[item_key];
            }
            else {
                var target = account[item_key];
                if (undefined == ret[item_key]) {
                    ret[item_key] = {};
                }
                var temp = ret[item_key];
                for (var i = 0; i < item_value.length - 1; i++) {
                    if (i == item_value.length - 2) {
                        target[item_value[i]] = item_value[i + 1];
                        temp[item_value[i]] = target[item_value[i]];
                    }
                    else {
                        if (undefined == temp[item_value[i]]) {
                            temp[item_value[i]] = {};
                        }
                        temp = temp[item_value[i]];
                        if (undefined == target[item_value[i]]) {
                            target[item_value[i]] = {};
                        }
                        target = target[item_value[i]];
                    }
                }
            }
        }

        // 返回当前值
        cb(null, ret);
    }
}

function _shellTimeM(req, dataObj, cb) {
    const FUNC = TAG + "_shellTimeM() --- ";
    var date = dataObj.date;
    var time = dataObj.time;
    console.log(FUNC + "date:", date);
    console.log(FUNC + "time:", time);

    // 调用脚本设置时间
    var params = " -d " + date + " -t " + time;
    var command = SERVER_CFG.SYSTEM.SYSTIME + params;
    console.log(FUNC + "command:\n", command);
    if (SERVER_CFG.SYSTEM.WINDOWS) {
        // var WORKING_DIR = "F:/svn/project/FishjoyServer/FishjoyDataServer/FishjoyDataServer/";
        // child_process.execFile(command, null, {cwd:WORKING_DIR}, function(err, stdout, stderr) {
        //     afterExec(err, stdout, stderr);
        // });
        buzz_cron.restartAll();
    }
    else if (SERVER_CFG.SYSTEM.LINUX) {
        child_process.exec(command, function(err, stdout, stderr) {
            afterExec(err, stdout, stderr);
        });
    }

    function afterExec(err, stdout, stderr) {
        if (err) {
            console.error(FUNC + 'err:', err);
        }
        else {
            console.log(FUNC + "设置服务器系统时间成功");
            console.error(FUNC + 'stdout:', stdout);
            console.error(FUNC + 'stderr:', stderr);
            cb(null, "success");
        }
        buzz_cron.restartAll();
    }
}