////////////////////////////////////////////////////////////
// SDK Tencent Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var http = require('http');
var _ = require('underscore');
var utils = require('../utils');
var CommonUtil = require('../CommonUtil');
var DateUtil = require('../../utils/DateUtil');
var ObjUtil = require('../ObjUtil');
var StringUtil = require('../../utils/StringUtil');
var ArrayUtil = require('../../utils/ArrayUtil');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var CstError = require('../cst/buzz_cst_error');
var buzz_cst_sdk = require('../cst/buzz_cst_sdk');
var buzz_call_sdk_api = require('../buzz_call_sdk_api');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('../cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var map = [
    require('../../../cfgs/shop_pearl_cfg'),
    require('../../../cfgs/shop_gold_cfg'),
    require('../../../cfgs/shop_gold_cfg'),// TODO: shop_vip_cfg不再使用, 需要删除或替代
    require('../../../cfgs/shop_card_cfg'),
    require('../../../cfgs/shop_gift_cfg'),
    require('../../../cfgs/shop_fund_cfg'),
];

//==============================================================================
// const
//==============================================================================

var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz/sdk/tencent】";

//const DOMAIN = "openapi.tencentyun.com";//正式环境
//const DOMAIN = "openapi.sparta.html5.qq.com";//测试环境
const DOMAIN = "api.urlshare.cn";//正式环境
const API = "/v3/user/buy_playzone_item";

var API_INFO = {
    "user.getInfo": {
        path: '/v3/user/get_info',
        handler: _handleInfo,
        content: _contentInfo,
    },
    "user.buyPlayzoneItem": {
        path: '/v3/user/buy_playzone_item',
        handler: _handleBuy,
        content: _contentBuy,
    },
    // TODO: 新增腾讯接口
    "user.isLogin": {
        path: '/v3/user/is_login',
        handler: _handleIsLogin,
        content: _contentIsLogin,
    },
    // TODO: 新增腾讯接口
    "relation.getAppFriends": {
        path: '/v3/relation/get_app_friends',
        handler: _handleFriends,
        content: _contentFriends,
    },
};

//var GLOBAL_PF = "wanba_ts";
var GLOBAL_PF = "qzone";
module.exports.GLOBAL_PF = GLOBAL_PF;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getFunId = getFunId;
exports.sig = sig;

exports.callInfoApi = callInfoApi;
exports.callIsLogin = callIsLogin;
exports.callBuyApi = callBuyApi;
exports.callFriendsApi = callFriendsApi;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 根据游戏中的道具类型和ID获取平台中定义的道具ID.
 */
function getFunId(itemid, itemtype, zoneid) {
    var cfg = map[itemtype];
    
    for (var idx in cfg) {
        if (cfg[idx].id == itemid) {
            if (zoneid == 1) {
                return cfg[idx].funid;
            }
            else if (zoneid == 2) {
                return cfg[idx].funidiOS;
            }
        }
    }
    return 0;// 这会返回道具ID错误
}

function sort(data) {
    
    // 对象转数组(_.pairs)
    // 数组排序(_.sortBy)
    return _.sortBy(_.pairs(data), function (item) {
        return item[0];
    });

}

/**
 * 平台相关的签名.
 */
function sig(data, path) {
    const FUNC = TAG + "sig() --- ";
    
    // 第1步：将请求的URI路径进行URL编码，得到： %2Fv3%2Fuser%2Fget_info
    var path = encodeURIComponent(path);
    
    // 第2步：将除“sig”外的所有参数按key进行字典升序排列，排列结果为：appid，format，openid，openkey，pf，userip 
    var sortData = sort(data);
    
    console.log("=========================================================");
    console.log(FUNC + "sortData:", sortData);
    console.log("=========================================================");
    
    // 第3步： 将第2步中排序后的参数(key = value) 用 & 拼接起来
    var params = '';
    for (var i = 0; i < sortData.length; i++) {
        if (i > 0) params += "&";
        params += sortData[i][0] + '=' + sortData[i][1];
    }
    
    var params = encodeURIComponent(params);
    
    // 第4步： 将HTTP请求方式， 第1步以及第3步中的到的字符串用 & 拼接起来， 得到源串
    // TODO: 这里有硬编码的GET, 如有需要, 需要根据实际API进行修改
    var to_be_signed = 'GET&' + path + '&' + params;
    
    // 得到密钥的方式：在应用的appkey末尾加上一个字节的“&”，即appkey&
    var private_key = buzz_cst_sdk.WANBA_PARAMS.APP_KEY + '&';
    
    // 使用HMAC-SHA1加密算法，使用Step2中得到的密钥对Step1中得到的源串加密
    var sign_data = hmac_sha1(to_be_signed, private_key);
    
    var ret = base64(sign_data.toString());
    ret = encodeURIComponent(ret);
    
    return ret;
    
    function hmac_sha1(to_be_signed, private_key) {
        var CryptoJS = require("crypto-js");
        return CryptoJS.HmacSHA1(to_be_signed, private_key);
    }
    
    function base64(input) {
        var b = new Buffer(input, "hex");
        return b.toString('base64');
    }
}

/**
 * 调用平台的用户信息接口.
 */
function callInfoApi(data, req_client, cb) {
    
    var params = {
        action: "user.getInfo",
        data: _getCommonData(data),
    };
    _callTencentApi(params, req_client, cb);

}

/**
 * 调用平台的用户登录验证接口.
 */
function callIsLogin(data, req_client, cb) {
    
    var params = {
        action: "user.isLogin",
        data: _getCommonData(data),
    };
    _callTencentApi(params, req_client, cb);

}

/**
 * 调用平台的支付接口.
 */
function callBuyApi(data, req_client, cb) {
    
    var paramsData = _getCommonData(data);
    paramsData.itemid = data["itemid"];
    var params = {
        action: "user.buyPlayzoneItem",
        data: paramsData
    };
    _callTencentApi(params, req_client, cb);

}

function callFriendsApi(data, req_client, cb) {
    
    var params = {
        action: "relation.getAppFriends",
        data: _getCommonData(data),
    };
    _callTencentApi(params, req_client, cb);

}

//==============================================================================
// private
//==============================================================================

//------------------------------------------------------------------------------
// Common Function
//------------------------------------------------------------------------------

function _getCommonData(data) {
    return {
        openid: data["openid"],
        openkey: data["openkey"],
        zoneid: data["zoneid"],
        appid: buzz_cst_sdk.WANBA_PARAMS.APP_ID,
        pf: GLOBAL_PF,
        format: "json",
    }
}

function _callTencentApi(params, req_client, cb) {

    console.log("params.action: ", params.action);

    var action = params.action;
    var data = params.data;
    if (data == undefined) {
        data = JSON.stringify({ openid: params.openid, openkey: params.openkey });
    }
    
    data.userip = _getClientIp(req_client);
    console.log("data: ", data);
    
    console.log("-----------------action: ", action);
    API_INFO[action].handler(data, action, req_client, cb);
}

function _getClientIp(req) {
    var ori = '';

    if (req.connection.socket) {
        ori = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }
    else {
        ori = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress;
    }

    if (ori && StringUtil.contain(ori, ",")) {
        ori = StringUtil.subString(ori, 0, StringUtil.indexOf(ori, ","));
    }
    return ori;
}

//------------------------------------------------------------------------------
// content(获取请求服务器的内容——调用接口后面跟的一串参数)
//------------------------------------------------------------------------------
function _contentInfo(data, action) {
    console.log("CALL _contentInfo()");
    const FUNC = TAG + "_contentInfo() --- ";
    
    data = ObjUtil.str2Data(data);
    
    var content = getCommonContent(data);
    content += '&sig=' + sig(data, API_INFO[action].path);
    console.log(FUNC + "params content: " + content);
    
    return content;
}

function _contentBuy(data, action) {
    console.log("CALL _contentBuy()");
    const FUNC = TAG + "_contentBuy() --- ";
    
    data = ObjUtil.str2Data(data);
    
    var content = getCommonContent(data);
    content += '&zoneid=' + data.zoneid;
    content += '&itemid=' + data.itemid;
    content += '&sig=' + sig(data, API_INFO[action].path);
    console.log(FUNC + "params content: " + content);
    
    return content;
}

function _contentIsLogin(data, action) {
    console.log("CALL _contentIsLogin()");
    const FUNC = TAG + "_contentIsLogin() --- ";
    
    data = ObjUtil.str2Data(data);
    
    var content = getCommonContent(data);
    content += '&sig=' + sig(data, API_INFO[action].path);
    console.log(FUNC + "params content: " + content);
    
    return content;
}

function _contentFriends(data, action) {
    console.log("CALL _contentFriends()");
    const FUNC = TAG + "_contentFriends() --- ";

    data = ObjUtil.str2Data(data);
    
    var content = getCommonContent(data);
    content += '&sig=' + sig(data, API_INFO[action].path);
    console.log(FUNC + "params content: " + content);
    
    return content;
}

function getCommonContent(data) {
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&userip=' + data.userip;
    return content;
}

//------------------------------------------------------------------------------
// handler(验证openid并进行联网请求)
//------------------------------------------------------------------------------
function _handleInfo(data, action, req_client, cb) {
    
    var data = ObjUtil.str2Data(data);
    if (!_checkOpenId(data.openid, cb)) return;
    
    // 联网请求
    var options = _getOptions(action, data);
    _httpRequest(options, cb);
}

function _handleBuy(data, action, req_client, cb) {
    
    var data = ObjUtil.str2Data(data);
    if (!_checkOpenId(data.openid, cb)) return;
    
    // 联网请求
    var options = _getOptions(action, data);
    _httpRequest(options, cb);
}

function _handleIsLogin(data, action, req_client, cb) {
    
    var data = ObjUtil.str2Data(data);
    if (!_checkOpenId(data.openid, cb)) return;
    
    // 联网请求
    var options = _getOptions(action, data);
    _httpRequest(options, cb);
}

function _handleFriends(data, action, req_client, cb) {
    console.log("【CALL】 _handleFriends()");
    const FUNC = TAG + "_handleFriends() --- ";
    
    var data = ObjUtil.str2Data(data);
    if (!_checkOpenId(data.openid, cb)) return;
    
    // 联网请求
    console.log(FUNC + "action: ", action);
    var options = _getOptions(action, data);
    //_httpRequest(options, cb);
}

function _httpRequest(data, cb) {
    console.log("【CALL】 _httpRequest()");
    const FUNC = TAG + "_httpRequest() --- ";
    
    var options = data.options;
    var content = data.content;
    var req = http.request(options, function (res) {
        console.log(FUNC + 'STATUS:' + res.statusCode);
        console.log(FUNC + 'HEADERS:' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', _success);
    });
    
    req.on('error', function (e) {
        console.log(FUNC + 'problem with request: ' + e.message);
        cb(e);
    });
    req.write(content);
    req.end();
    
    // 处理正常返回的数据(仅网络错误不进入)
    function _success(chunk) {
        chunk = ObjUtil.str2Data(chunk);
        
        console.log(FUNC + "chunk:", chunk);
        
        if (chunk.ret != null) {
            chunk.code = chunk.ret;
            chunk.message = chunk.msg;
            cb(null, chunk);
            return;
        }
        else if (chunk.code != null) {
            cb(null, chunk);
            return;
        }
    }
}

// 获取网络请求的选项
function _getOptions(action, data) {
    const FUNC = TAG + "_getOptions() --- ";

    console.log(FUNC + 'API_INFO:', API_INFO);
    console.log(FUNC + 'action:', action);
    var apiInfo = API_INFO[action];
    console.log(FUNC + 'apiInfo:', apiInfo);
    var content = apiInfo.content(data, action);
    
    var options = {
        hostname: DOMAIN,
        port: 80,
        path: apiInfo.path + content,
        method: 'GET',
        headers: {
            "Content-Length": content.length
        }
    };
    return {
        options: options,
        content: content,
    };
}

// 校验openid
function _checkOpenId(openid, cb) {
    if (openid == null) {
        cb("openid == null");
        return false;
    }
    
    var isMatch = openid.match(/^([0-9A-F]{32})$/);
    if (isMatch == null) {
        cb("不合法的openid");
        return false;
    }

    return true;
}


