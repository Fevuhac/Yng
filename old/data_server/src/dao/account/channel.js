////////////////////////////////////////////////////////////////////////////////
// Account Channel Function
// 渠道账户相关函数
// create
// login
////////////////////////////////////////////////////////////////////////////////
// 注意: 此文件中的login方法已经废弃
////////////////////////////////////////////////////////////////////////////////


//==============================================================================
// import
//==============================================================================
var _ = require("underscore");
var utils = require('../../buzz/utils');
var buzz_cst_sdk = require('../../buzz/cst/buzz_cst_sdk');
var StringUtil = require('../../utils/StringUtil');
var RedisUtil = require('../../utils/RedisUtil');
var BuzzUtil = require('../../utils/BuzzUtil');
var ObjUtil = require('../../buzz/ObjUtil');
var buzz_goddess = require('../../buzz/buzz_goddess');
var buzz_image = require('../../buzz/buzz_image');
var ErrCst = require('../../buzz/cst/buzz_cst_error');
var ERROR_OBJ = ErrCst.ERROR_OBJ;

var SERVER_CFG = require("../../cfgs/server_cfg").SERVER_CFG;

var AccountCommon = require('./common');

var CacheAccount = require('../../buzz/cache/CacheAccount');
var CacheAccountServer = require('../../buzz/cache/CacheAccountServer');

var REDIS_KEYS = require('../../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

// 配置文件
var player_users_cfg = require('../../../cfgs/player_users_cfg');
var init_gold = player_users_cfg[0]['gold'];
var init_pearl = player_users_cfg[0]['pearl'];
var init_level = player_users_cfg[0]['level'];
var init_exp = player_users_cfg[0]['exp'];

var ERROR = 1;
var DEBUG = 0;

var TAG = "【channel】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.create = _create;
exports.login = _login;
exports.getUserInfoByChannelId = getUserInfoByChannelId;
exports.getChannelPrefix = _getChannelPrefix;
exports.getNickname = _getNickname;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 创建渠道账户
 * data: {channel_account_id:?, channel_account_name:?, channel_account_info:?}
 */
function _create(pool, data, cb) {
    const FUNC = TAG + "_create() --- ";
    var channel = _getChannelPrefix(data);
    var channel_account_id = data['channel_account_id'];
    var channel_account_info = data['channel_account_info'];
    
    if (!_prepare(data, cb)) return;

    getUserInfoByChannelId(pool, "id", channel, channel_account_id, function(err, row) {
        if (err) return cb && cb(err);
        if (!!row) {
            cb(new Error('此渠道此账号已经存在，请直接登录'));
            return;
        }
        
        let nickname = _getNickname(channel_account_info);
        calculateRedressNo(pool, nickname, function (redress_no) {
            console.log("redress_no:\n", redress_no);
            data.redress_no = redress_no;
            _didCreateChannelAccount(pool, data, cb);
        });
    });
};

/**
 * 使用渠道ID获取用户信息
 */
function getUserInfoByChannelId(pool, field, channel, channel_account_id, cb) {
    const FUNC = TAG + "getUserInfoByChannelId() --- ";
    // var sql = "SELECT " + field + " FROM `tbl_account` WHERE `channel`=? AND `channel_account_id`=? ";
    // var sql_data = [channel, channel_account_id];
    var sql = "SELECT " + field + " FROM `tbl_account` WHERE `channel_account_id`=? ";
    var sql_data = [channel_account_id];

    // if ("wb" == channel) {
    //     sql = "SELECT * FROM `tbl_account` WHERE `channel_account_id`=?";
    // 	sql_data = [channel_account_id];
    // }

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            console.error(FUNC + 'err:\n', err);
            console.error(FUNC + 'sql:\n', sql);
            console.error(FUNC + 'sql_data:\n', sql_data);
            cb(err);
            return;
        }

        // if (rows.length == 0) {
        //     console.error(FUNC + 'err:\n', err);
        //     console.error(FUNC + 'sql:\n', sql);
        //     console.error(FUNC + 'sql_data:\n', sql_data);
        //     cb(new Error('数据库中没有用户'));
        //     return;
        // }

        cb(null, rows[0]);
    });
}

function _getNickname(channel_account_info) {
    const FUNC = TAG + "_getNickname() --- ";
    
    channel_account_info = ObjUtil.str2Data(channel_account_info);
    var channel_account_name = null;
    if (channel_account_info != null) {
        if (channel_account_info['name'] != null) {
            channel_account_name = channel_account_info['name'];
        }
    }
    console.log(FUNC + "channel_account_name: ", channel_account_name);
    return channel_account_name;
}

function calculateRedressNo(pool, nickname, cb) {
    var sql = "";
    sql += "SELECT COUNT(id) AS redress_no ";
    sql += "FROM tbl_account ";
    // sql += "WHERE tempname=? OR nickname=? OR channel_account_name=? ";
    sql += "WHERE channel_account_name=? ";
    
    // var sql_data = [nickname, nickname, nickname];
    var sql_data = [nickname];

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            console.error("查询同名人数时出现数据库访问错误:\n", err);
            cb(0);
            return;
        }
        cb(rows[0].redress_no);
    });
}

/**
 * data: {channel:?, channel_account_id:?}
 */
function _login(pool, data, cb) {
    const FUNC = TAG + "_login() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var channel = _getChannelPrefix(data);
    var channel_account_id = data['channel_account_id'];
    if (channel == null || channel == "") {
        console.error(FUNC + "渠道名不能为空!");
        cb(new Error("渠道名不能为空!"));
        return;
    }
    if (channel_account_id == null || channel_account_id == "") {
        console.error(FUNC + "渠道账户ID不能为空!");
        cb(new Error("渠道账户ID不能为空!"));
        return;
    }
    _didLoginChannelAccount(pool, data, cb);
}


//==============================================================================
// private
//==============================================================================
/**
 * 验证客户端传入的参数.
 */
function _prepare(data, cb) {
    
    var channel = _getChannelPrefix(data);
    var channel_account_id = data['channel_account_id'];
    var channel_account_info = data['channel_account_info'];
    
    if (!_isParamExist(channel, "接口调用请传参数channel(渠道前缀)", cb)) return false;
    if (!_isParamExist(channel_account_id, "接口调用请传参数channel_account_id(渠道ID)", cb)) return false;
    //if (!_isParamExist(channel_account_info, "接口调用请传参数channel_account_info(渠道信息，可从中获取渠道用户名)", cb)) return false;
    
    return true;
}

/**
 * 检测客户端传入的参数, 如果参数不存在，返回false, 如果通过检测, 返回true.
 * @param param 待检测的参数.
 * @param err_info 如果检测失败，回调需要传回的信息.
 */
function _isParamExist(param, err_info, cb) {
    if (param == null) {
        var extraErrInfo = { debug_info: "channel._isParamExist()-" + err_info };
        if (ERROR) {
            console.error('------------------------------------------------------');
            console.error(extraErrInfo.debug_info);
            console.error('------------------------------------------------------');
        }
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.PARAM_MISSING));
        return false;
    }
    return true;
}

// 获取渠道前缀
function _getChannelPrefix(data) {
    var channelPrefix = "" + data['channel'];
    // 如果长度为4, 需要查找前缀
    if (StringUtil.strLen(channelPrefix) == 4) {
        channelPrefix = buzz_cst_sdk.CHANNEL[channelPrefix].PREFIX;
    }
    return channelPrefix;
}



// 正式创建渠道账户
function _didCreateChannelAccount(pool, data, cb) {
    const FUNC = TAG + "_didCreateChannelAccount() --- ";

    var channel = _getChannelPrefix(data);
    var channel_account_id = data['channel_account_id'];
    var channel_account_info = ObjUtil.str2Data(data['channel_account_info']);
    
    console.log(FUNC + "channel_account_id: ", channel_account_id);
    console.log(FUNC + "channel_account_info: ", channel_account_info);

    var channel_account_name = _getNickname(channel_account_info);
    
    var figure_url = channel_account_info.figure_url;
    
    if (figure_url != null) {
        console.log(FUNC + "figure_url != null");
        // DONE: 先加载头像存储并获得对应的tbl_img.id后存储.
        var img_data = {
            web_url: figure_url,
            localpath: "./",
        };
        buzz_image.downloadImage(pool, img_data, function (err, local_url, figure_id) {
            console.log(FUNC + "figure_id:\n", figure_id);
            createChannelAccount(figure_id);
        });
    }
    else {
        createChannelAccount(null);
    }
    
    function createChannelAccount(figure_id) {
        // 导入数据库时转化为字符串
        channel_account_info = ObjUtil.data2String(channel_account_info);
        var salt = utils.createSalt();
        var encrypted = utils.encodePassword(salt, "12345678");


        var channel_fields = [
            {name:"`salt`", value:salt},
            {name:"`password`", value:encrypted},
            {name:"`channel`", value:channel},
            {name:"`channel_account_id`", value:channel_account_id},
            {name:"`channel_account_name`", value:channel_account_name},
            {name:"`channel_account_info`", value:channel_account_info},
            {name:"`redress_no`", value:data.redress_no},
        ];
        if (figure_id) {
            channel_fields.push({name:"`figure`", value:figure_id});
        }
        // 插入platform(Android或iOS)
        var platformGetter = channel_account_id.split("_");
        if (platformGetter.length == 2) {
            channel_fields.push({name: "`platform`", value: parseInt(platformGetter[1])});
        }
        AccountCommon.createNewPlayer(pool, channel_fields, cb);
    }
}

// 登录渠道账户
function _didLoginChannelAccount(pool, data, cb) {
    const FUNC = TAG + "_didLoginChannelAccount() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var channel = _getChannelPrefix(data);
    var channel_account_id = data['channel_account_id'];
    
    if (DEBUG) console.error("channel(来自_getChannelPrefix):", channel);

    // 先看缓存中是否存在玩家并判断玩家关键数据是否都在缓存中
    RedisUtil.hget(PAIR.OPENID_UID, channel_account_id, function(err, res) {
        if (err) return cb && cb(err);
        if (DEBUG) console.log(FUNC + "res:", res);

        if (res) {
            var uid = res;

            var account = CacheAccount.getAccountById(uid);
            if (account) {
                if (!AccountCommon.checkCheat(account, cb)) return;
                console.log(FUNC + "玩家数据在缓存中, 直接返回客户端");
                if (account.has_social) {

                    console.log(FUNC + "玩家社交数据在缓存中, 直接返回");
                    BuzzUtil.cacheLinkAccountApi({uid:uid}, "login_channel_account");
                    AccountCommon.modifySessionToken(account);

                    AccountCommon.updateCardData(account, function() {
                        AccountCommon.updateVipGold(pool, account, function() {
                            AccountCommon.accountCharmOpt(account, function () {
                                cb(null, [account]);
                            });
                        });
                    });
                }
                else {
                    console.log(FUNC + "玩家社交数据不在缓存中, 需要查询数据库导入玩家数据");
                    queryFromDb();
                }
            }
            else {
                console.log(FUNC + "玩家数据不在缓存中, 需要查询数据库导入玩家数据");
                queryFromDb();
            }
        }
        else {
            queryFromDb();
        }
    });

    function queryFromDb() {
        getUserInfoByChannelId(pool, "id", channel, channel_account_id, function(err, row) {
            if (err) return cb && cb(err);
            if (!row) {
                if (ERROR) console.error("查询渠道用户不存在:", err);
                cb(new Error('用户不存在'));
                return;
            }
            
            var account = row;
            if (!AccountCommon.checkCheat(account, cb)) return;
            var id = account.id;
            
            AccountCommon.getAccountByUid(pool, id, function(err, account) {
                AccountCommon.login(pool, account, "login_channel_account", cb);
            });
        });
    }
}