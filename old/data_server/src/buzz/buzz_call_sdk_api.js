//==============================================================================
// import
//==============================================================================
var http = require('http');
var buzz_cst_sdk = require('./cst/buzz_cst_sdk');
var buzz_pay = require('./buzz_pay');
var buzz_sdk_tencent = require('./sdk/tencent');
var ObjUtil = require('./ObjUtil');

// var tencent_domain = 'openapi.tencentyun.com';
var tencent_domain = 'api.urlshare.cn';


//==============================================================================
// const
//==============================================================================
var egret_api = {
    "user.getInfo": { hostname: 'api.egret-labs.org', path: '/v2/user/getInfo', handler: _egret_user_getinfo },
    "friend.isOpen": { hostname: 'api.egret-labs.org', path: '/v2/friend/isOpen', handler: _friend_isopen },
    "friend.getList": { hostname: 'api.egret-labs.org', path: '/v2/friend/getList', handler: _friend_getlist },
};

var tencent_api = {
    "user.getInfo": { hostname: tencent_domain, path: '/v3/user/get_info', handler: _tencent_user_getinfo },// 正式环境
    "user.isLogin": { hostname: tencent_domain, path: '/v3/user/is_login', handler: _tencent_user_isLogin },// 正式环境
    "user.buyPlayzoneItem": { hostname: tencent_domain, path: '/v3/user/buy_playzone_item', handler: _tencent_user_buyPlayzoneItem },// 正式环境
    "relation.getAppFriends": { hostname: tencent_domain, path: '/v3/relation/get_app_friends', handler: _tencent_relation_getAppFriends },// 正式环境
    "user.getMultiInfo": { hostname: tencent_domain, path: '/v3/user/get_multi_info', handler: _tencent_user_getMultiInfo },// 正式环境
    "user.sendGamebarMsg": { hostname: tencent_domain, path: '/v3/user/send_gamebar_msg', handler: _tencent_user_sendGamebarMsg },// 正式环境
};

var CHANNEL_ID = buzz_cst_sdk.CHANNEL_ID;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_call_sdk_api】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.callEgretApi = callEgretApi;
exports.callTencentApi = callTencentApi;

exports.getWanbaUrl = _tencent_user_getinfo;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 处理白鹭SDK提供的API
 */
function callEgretApi(params, req_client, cb) {
    var action = params.action;
    var data = params.data;
    if (data == undefined) {
        data = JSON.stringify({ token: params.token });
    }
    //console.log("-----------data: ", data);
    _handleEgretApi(data, egret_api[action], req_client, cb);
}

/**
 * 处理腾讯玩吧SDK提供的API
 */
function callTencentApi(data, req_client, cb) {
    const FUNC = TAG + "callTencentApi() --- ";

    console.log(FUNC + "data: ", data);
    var action = data.action;
    // var data = params;
    // console.log(FUNC + "data: ", data);

    if (action == "user.getInfo") {
        _handleTencentApi(data, tencent_api[action], req_client, cb);
    }
    else if (action == "user.isLogin") {
        _handleTencentApiIsLogin(data, tencent_api[action], req_client, cb);
    }
    else if (action == "user.buyPlayzoneItem") {
        _handleTencentApiBuy(data, tencent_api[action], req_client, cb);
    }
    else if (action == "relation.getAppFriends") {
        _handleTencentApiFriends(data, tencent_api[action], req_client, cb);
    }
    else if (action == "user.getMultiInfo") {
        _handleTencentApiGetMultiInfo(data, tencent_api[action], req_client, cb);
    }
    else if (action == "user.sendGamebarMsg") {
        _handleTencentApiSendGamebarMsg(data, tencent_api[action], req_client, cb);
    }
}


//==============================================================================
// private
//==============================================================================
function _getClientIp(req) {
    if (req.connection.socket) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }
    else {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress;
    }
}

// 处理腾讯玩吧API
function _handleEgretApi(data, api, req_client, cb) {
    const FUNC = TAG + "_handleEgretApi() --- ";

    var hostname = api.hostname;
    var path = api.path;
    var content = api.handler(data);
    
    var options = {
        hostname: hostname,
        port: 80,
        path: path + content,
        method: 'POST',
        headers: {
            "Content-Length": content.length
        }
    };
    
    var req = http.request(options, function (res) {
        if (DEBUG) console.log(FUNC + 'STATUS: ' + res.statusCode);
        if (DEBUG) console.log(FUNC + 'HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            _handleReturnData("1001", chunk, req_client, cb);
        });
    });
    
    req.on('error', function (e) {
        if (ERROR) console.error(FUNC + 'problem with request: ' + e.message);
        cb(e);
    });
    
    // write data to request body
    req.write(content);
    
    req.end();
}

// 处理玩吧API
function _handleTencentApi(data, api, req_client, cb) {
    const FUNC = TAG + "_handleTencentApi() --- ";
    
    var data = ObjUtil.str2Data(data);
    if (DEBUG) console.log(FUNC + "data:", data);
    var zoneId = data.zoneId;
    data.userip = _getClientIp(req_client);

    if (!_checkOpenId(data, cb)) return;

    var hostname = api.hostname;
    var path = api.path;
    var content = api.handler(data);
    
    var options = {
        hostname: hostname,
        port: 80,
        path: path + content,
        method: 'GET',
        headers: {
            "Content-Length": content.length
        }
    };
    
    if (false) {
        returnWanbaFake(data, req_client, cb);
    }
    else {
        var req = http.request(options, function (res) {
            if (DEBUG) console.log('STATUS: ' + res.statusCode);
            if (DEBUG) console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunk = ObjUtil.str2Data(chunk);
                chunk.data = { "id": data.openid };
                chunk.openid = data.openid;
                if (DEBUG) console.log('chunk:', chunk);
                console.log('chunk:', chunk);
                
                var ret_data = {};
                for (var key in chunk) {
                    ret_data[key] = chunk[key];
                }
                ret_data.data = { "id": data.openid };
                ret_data.openid = data.openid;
                if (DEBUG) console.log('ret_data:', ret_data);
                console.log('ret_data:', ret_data);
                
                // 传递zoneId
                if (zoneId != null) chunk.zoneId = zoneId;
                
                _handleReturnData("1002", chunk, req_client, cb);

                // TODO: 测试代码: 获取用户信息后8秒调用一次is_login
                setTimeout(function () {
                    if (DEBUG) console.log(FUNC + "调用了一次is_login");
                    console.log(FUNC + "调用了一次is_login");
                    _handleTencentApiIsLogin(data, tencent_api["user.isLogin"], req_client, function () {
                        if (DEBUG) console.log(FUNC + "is_login调用结束");
                        console.log(FUNC + "is_login调用结束");
                    });
                }, 8000);
                //// TODO: 测试代码: 每2分钟调用一次is_login接口
                //setInterval(function () {
                //    console.log(FUNC + "调用了一次is_login");
                //    _handleTencentApiIsLogin(data, tencent_api["user.isLogin"], req_client, function () {
                //        console.log(FUNC + "is_login调用结束");
                //    });
                //}, 120000);
            });
        });
        
        req.on('error', function (e) {
            if (ERROR) console.error('problem with request: ' + e.message);
            cb(e);
        });
        
        // write data to request body
        req.write(content);
        
        req.end();
    }
}

function _handleTencentApiIsLogin(data, api, req_client, cb) {
    const FUNC = TAG + "_handleTencentApiIsLogin() --- ";
    
    var data = ObjUtil.str2Data(data);
    if (DEBUG) console.log(FUNC + "data:", data);
    var zoneId = data.zoneId;
    data.userip = _getClientIp(req_client);

    if (!_checkOpenId(data, cb)) return;
    
    var hostname = api.hostname;
    var path = api.path;
    var content = api.handler(data);
    
    var options = {
        hostname: hostname,
        port: 80,
        path: path + content,
        method: 'GET',
        headers: {
            "Content-Length": content.length
        }
    };
    
    var req = http.request(options, function (res) {
        if (DEBUG) console.log(FUNC + 'STATUS: ' + res.statusCode);
        if (DEBUG) console.log(FUNC + 'HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        // TODO: 重写数据的拼接
        res.on('data', function (chunk) {
            if (DEBUG) console.log(FUNC + 'http request data... length:', chunk.length);
            // 腾讯返回好友列表, 过长导致数据截断解析错误, 直接跳过不解析, 返回ret=0
            // chunk = ObjUtil.str2Data(chunk);
            chunk = {
                ret:0
            };
            chunk.data = { "id": data.openid };
            chunk.openid = data.openid;
            console.log(FUNC + 'chunk:', chunk);
            
            var ret_data = {};
            for (var key in chunk) {
                ret_data[key] = chunk[key];
            }
            ret_data.data = { "id": data.openid };
            ret_data.openid = data.openid;
            console.log(FUNC + 'ret_data:', ret_data);

            // 进一步的处理?
            cb(null, chunk);
        });

        res.on('end', function () {
            if (DEBUG) console.log(FUNC + 'http request end...');
        });
    });
        
    req.on('error', function (e) {
        if (ERROR) console.error(FUNC + 'problem with request: ' + e.message);
        cb(e);
    });
        
    // write data to request body
    req.write(content);
        
    req.end();
}

function returnWanbaFake(data, req_client, cb) {
    var zoneId = data.zoneId;
    // 假数据
    var chunk = {
        "data": {
            "id": data.openid
        },
        "code": 0,
        "ret": 0,
        "is_lost": 0,
        "nickname": "Peter",
        "gender": "男",
        "country": "中国",
        "province": "广东",
        "city": "深圳",
        "figureurl": "http://imgcache.qq.com/qzone_v4/client/userinfo_icon/1236153759.gif",
        "is_yellow_vip": 1,
        "is_yellow_year_vip": 1,
        "yellow_vip_level": 7,
        "is_yellow_high_vip": 0
    };
    if (zoneId != null) chunk.zoneId = zoneId;
    _handleReturnData("1002", chunk, req_client, cb);
}

function _handleTencentApiGetMultiInfo(data, api, req_client, cb) {
    var data = ObjUtil.str2Data(data);
    data.userip = _getClientIp(req_client);

    if (!_checkOpenId(data, cb)) return;

    callHttp(api, data, function(err, chunk) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        if (chunk.ret != null) {
            chunk.code = chunk.ret;
            chunk.message = chunk.msg;
            
            // 调试数据
            if (USE_FAKE) chunk = fakeMultiInfo();

            cb(null, chunk);
            return;
        }
        else if (chunk.code != null) {
            cb(null, chunk);
            return;
        }
    });
}

function _handleTencentApiSendGamebarMsg(data, api, req_client, cb) {
    const FUNC = TAG + "_handleTencentApiSendGamebarMsg() --- ";
    var data = ObjUtil.str2Data(data);
    data.userip = _getClientIp(req_client);

    if (!_checkOpenId(data, cb)) return;

    var condition = {
        param: "frd",
        list: data.frd_list
    };
    data = ObjUtil.exclude(data, ['frd_list']);

    if (condition.list.length > 0) {
        callHttpRecurrence(api, data, condition, function(chunk) {
            cb(null, chunk);
        }, null);
    }
    else {
        if (ERROR) console.error(FUNC + "客户端的frd_list参数长度为0");
        cb(new Error("客户端的frd_list参数长度为0"));
    }
}

/**
 * 递归调用callHttp, 直到condition.list中的数据被取用完毕.
 * @param condition { param: param_string, list: [] } 递归插入需要重复使用的参数.
 * @param chunk http调用后返回的数据块, 首次传入null.
 */
function callHttpRecurrence(api, data, condition, cb, chunk) {
    var param = condition.param;
    var list = condition.list;
    if (list.length > 0) {
        data[param] = list.shift();
        callHttp(api, data, function(err, chunk) {
            if (err) {
                if (ERROR) console.error(FUNC + "err:", err);
            }
            callHttpRecurrence(api, data, condition, cb, chunk);
        });
    }
    else {
        cb(chunk);
    }
}

/**
 * 校验openid.
 */
function _checkOpenId(data, cb) {
    var openid = data.openid;
    
    var isMatch = openid.match(/^([0-9A-F]{32})$/);
    console.log("isMatch:", isMatch);
    
    if (isMatch == null) {
        cb("不合法的openid");
        return false;
    }
    else {
        return true;
    }
}

function _handleTencentApiFriends(data, api, req_client, cb) {
    const FUNC = TAG + "_handleTencentApiFriends() --- ";
    
    var data = ObjUtil.str2Data(data);
    data.userip = _getClientIp(req_client);

    if (!_checkOpenId(data, cb)) return;

    callHttp(api, data, function(err, chunk) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        if (chunk.ret != null) {
            chunk.code = chunk.ret;
            chunk.message = chunk.msg;

            // 调试数据
            if (USE_FAKE) chunk = fakeAppFriends();

            cb(null, chunk);
            return;
        }
        else if (chunk.code != null) {
            cb(null, chunk);
            return;
        }
    });
}

const USE_FAKE = 0;

function fakeAppFriends() {
    return {
        "ret":0,
        "is_lost":0,
        "items":[
            {
                "openid":"ED99718EF653B75E272E65AC8296518A"
            },
            {
                "openid":"511F28AB4B5D075EC2C37A895911FEB5"
            }
        ]
    };
}

function fakeMultiInfo() {
    return {
        "ret":0,
        "is_lost":0,
        "items":[
            {
                "openid":"ED99718EF653B75E272E65AC8296518A",
                "nickname":"十一",
                "figureurl":"http://thirdapp1.qlogo.cn/qzopenapp/86fe7390d65dd581abd95c5a61561cc95e773805b7358aac1ef5299975a19097/50",
                "is_yellow_vip":1,
                "is_yellow_year_vip": 1, 
                "yellow_vip_level": 1, 
                "is_yellow_high_vip": 0
            },
            {
                "openid":"511F28AB4B5D075EC2C37A895911FEB5",
                "nickname":"石破天惊",
                "figureurl":"http://thirdapp1.qlogo.cn/qzopenapp/47c5081aeef5bc9d650ee85b1bf1f397936b9ba9178947ccdd8fee08a4875719/50",
                "is_yellow_vip":1,
                "is_yellow_year_vip": 1, 
                "yellow_vip_level": 2,
                "is_yellow_high_vip": 0
            }
        ]
    };
}

/**
 * 通用的HTTP请求处理...
 */
function callHttp(api, data, cb) {
    const FUNC = TAG + "callHttp() --- ";

    var content = api.handler(data);
    var options = {
        hostname: api.hostname,
        port: 80,
        path: api.path + content,
        method: 'GET',
        headers: {
            "Content-Length": content.length
        }
    };

    var req = http.request(options, function (res) {
        var responseString = "";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseString += chunk;
        });

        res.on('end', function (chunk) {
            chunk = ObjUtil.str2Data(responseString);
            console.log(FUNC + "chunk:", chunk);
            // chunk已经被转换为对象.
            if (cb != null) cb(null, chunk);
        });
    });
    
    req.on('error', function (e) {
        console.error('problem with request: ' + e.message);
        cb(e);
    });
    req.write(content);
    req.end();
}

function _handleTencentApiBuy(data, api, req_client, cb) {
    
    var data = ObjUtil.str2Data(data);
    // 校验openid
    var openid = data.openid;
    data.userip = _getClientIp(req_client);
    
    var isMatch = openid.match(/^([0-9A-F]{32})$/);
    console.log("isMatch:", isMatch);
    
    if (isMatch == null) {
        cb("不合法的openid");
        return;
    }
    
    var hostname = api.hostname;
    var path = api.path;
    var content = api.handler(data);
    
    var options = {
        hostname: hostname,
        port: 80,
        path: path + content,
        method: 'GET',
        headers: {
            "Content-Length": content.length
        }
    };
    
    var req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            chunk = ObjUtil.str2Data(chunk);
            
            console.log("chunk:", chunk);
            
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
        });
    });
    
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        cb(e);
    });
    req.write(content);
    req.end();
}

var crypto = require('crypto');
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
};

function sign(data) {
    var sign_data = "";

    var to_be_signed = '';
    to_be_signed += 'appId=' + data.appId;
    to_be_signed += 'time=' + data.time;
    to_be_signed += 'token=' + data.token;
    to_be_signed += '' + buzz_cst_sdk.EGRET_PARAMS.APP_KEY;
    
    sign_data = md5(to_be_signed);

    return sign_data;
}

//==============================================================================
// 具体的API处理
//==============================================================================

//------------------------------------------------------------------------------
// 白鹭
//------------------------------------------------------------------------------

// http://api.egret-labs.org/v2/user/getInfo
function _egret_user_getinfo(data) {
    //var content = data;
    if (DEBUG) console.log("ori content:", data);
    
    data = ObjUtil.str2Data(data);
    
    // 兼容处理: 没有相应字段时在服务器端获取
    if (!data.appId) {
        data.appId = buzz_cst_sdk.EGRET_PARAMS.APP_ID;
    }
    if (!data.time) {
        data.time = new Date().getTime();
    }
    if (!data.sign) {
        data.sign = sign(data);
    }
    
    var content = '';
    content += '?appId=' + data.appId;
    content += '&time=' + data.time;
    content += '&token=' + data.token;
    content += '&sign=' + data.sign;
    
    if (DEBUG) console.log("params content: " + content);

    return content;
}

// http://api.egret-labs.org/v2/friend/isOpen
function _friend_isopen(data) {
    var content = data;
    return content;
}

// http://api.egret-labs.org/v2/friend/getList
function _friend_getlist(data) {
    var content = data;
    return content;
}

//------------------------------------------------------------------------------
// 玩吧
//------------------------------------------------------------------------------

// 接口调试
// http://open.qq.com/tools 
function _tencent_user_getinfo(data) {
    const FUNC = TAG + "_tencent_user_getinfo() --- ";

    if (DEBUG) console.log(FUNC + "ori content:", data);

    data = _handleTencentRequestData(data);
    
    if (DEBUG) console.log(FUNC + "data:", data);
    
    // 为了区别android和ios, 客户端传入参数中带有zoneId, 此处进行签名需要去掉
    var sigData = ObjUtil.exclude(data, ['zoneId', 'action', 'channel', 'sig']);

    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/user/get_info");

    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&userip=' + data.userip;
    content += '&sig=' + data.sig;

    if (DEBUG) console.log(FUNC + "params content: " + content);
    
    return content;
}

function _tencent_user_isLogin(data) {
    const FUNC = TAG + "_tencent_user_isLogin() --- ";

    if (DEBUG) console.log(FUNC + "ori content:\n", data);
    
    data = _handleTencentRequestData(data);
    
    if (DEBUG) console.log(FUNC + "data:\n", data);
    
    // 为了区别android和ios, 客户端传入参数中带有zoneId, 此处进行签名需要去掉
    var sigData = ObjUtil.exclude(data, ["zoneId", "action", "channel", "sig"]);
    if (DEBUG) console.log(FUNC + "sigData:\n", sigData);

    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/user/is_login");
    
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&userip=' + data.userip;
    content += '&sig=' + data.sig;
    
    if (DEBUG) console.log(FUNC + "params content: " + content);
    
    return content;
}

function _tencent_user_buyPlayzoneItem(data) {
    const FUNC = TAG + "_tencent_user_buyPlayzoneItem() --- ";

    if (DEBUG) console.log(FUNC + "ori content:", data);
    
    data = _handleTencentRequestData(data);
    
    if (DEBUG) console.log(FUNC + "data:", data);
    
    var sigData = ObjUtil.exclude(data, ['zoneId', 'action', 'channel']);
    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/user/buy_playzone_item");
    
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&zoneid=' + data.zoneid;
    content += '&appid=' + data.appid;
    content += '&itemid=' + data.itemid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&userip=' + data.userip;
    content += '&sig=' + data.sig;
    
    if (DEBUG) console.log(FUNC + "params content: " + content);
    
    return content;
}

function _tencent_relation_getAppFriends(data) {
    const FUNC = TAG + "_tencent_relation_getAppFriends() --- ";

    if (DEBUG) console.log(FUNC + "ori content:\n", data);
    
    data = _handleTencentRequestData(data);
    
    if (DEBUG) console.log(FUNC + "data:\n", data);

    var sigData = ObjUtil.exclude(data, ['zoneId', 'action', 'channel']);
    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/relation/get_app_friends");
    
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&sig=' + data.sig;
    content += '&userip=' + data.userip;
    
    if (DEBUG) console.log(FUNC + "params content:\n" + content);
    
    return content;
}

function _tencent_user_getMultiInfo(data) {
    const FUNC = TAG + "_tencent_user_getMultiInfo() --- ";

    console.log(FUNC + "ori content:", data);
    
    data = _handleTencentRequestData(data);
    
    console.log(FUNC + "data:", data);

    var sigData = ObjUtil.exclude(data, ['zoneId', 'action', 'channel']);
    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/user/get_multi_info");
    
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&sig=' + data.sig;
    content += '&userip=' + data.userip;
    // 特有的参数, 每个openid使用"_"连接, 例:
    // 08B9999CACFBE0D9F57CAB4E7D8BDBF0_83A390F6A8E66BA800829ECD6032A6DE
    content += '&fopenids=' + data.fopenids;
    
    console.log(FUNC + "params content: " + content);
    
    return content;
}

function _tencent_user_sendGamebarMsg(data) {
    const FUNC = TAG + "_tencent_user_sendGamebarMsg() --- ";

    console.log(FUNC + "ori content:", data);
    
    data = _handleTencentRequestData(data);

    const PARAM_msgtype = 3;
    const PARAM_content = "在好友排行榜中超过你了!";
    // const PARAM_qua = "V1_AND_QZ_4.9.3_148_RDM_T";
    
    data.msgtype = PARAM_msgtype;
    data.content = PARAM_content;
    // data.qua = PARAM_qua;
    console.log(FUNC + "data:", data);

    var sigData = ObjUtil.exclude(data, ['action', 'channel']);
    data.sig = buzz_sdk_tencent.sig(sigData, "/v3/user/send_gamebar_msg");
    
    var content = '';
    content += '?openid=' + data.openid;
    content += '&openkey=' + data.openkey;
    content += '&appid=' + data.appid;
    content += '&zoneid=' + data.zoneid;
    content += '&pf=' + data.pf;
    content += '&format=' + data.format;
    content += '&sig=' + data.sig;
    content += '&userip=' + data.userip;
    // 特有的参数
    content += '&frd=' + data.frd;// string, 好友openid
    content += '&msgtype=' + data.msgtype;// int, 消息类型，1-pk消息，2-送心消息，3-自定义消息
    content += '&content=' + data.content;// string
    content += '&qua=' + data.qua;// 这个参数如何得到
    
    console.log(FUNC + "params content: " + content);
    
    return content;
}

/**
 * 预处理腾讯SDK接口请求参数.
 */
function _handleTencentRequestData(data) {
    data = ObjUtil.str2Data(data);

    if (!data.appid) {
        data.appid = buzz_cst_sdk.WANBA_PARAMS.APP_ID;
    }
    if (!data.pf) {
        data.pf = buzz_sdk_tencent.GLOBAL_PF;
    }
    if (!data.format) {
        data.format = 'json';
    }

    return data;
}

//==============================================================================
// 结果处理
//==============================================================================

// 处理白鹭返回的结果(主要是错误处理)
function _handleReturnData(channel, chunk, req_client, cb) {
    const FUNC = TAG + "_handleReturnData() --- ";

    console.log(FUNC + 'channel: ', channel);
    console.log(FUNC + 'BODY: ', chunk);
    try {
        chunk = ObjUtil.str2Data(chunk);
    }
    catch (err_parse_chunk) {
        cb({ msg: "chunk parse error!" });
        return;
    }
    if (channel == '1002') {
        chunk.code = chunk.ret;
    }
    console.log(FUNC + 'code: ' + chunk.code);
    if (chunk.code == 0) {

        // 查询数据库, 看这个ID是否已经注册了游戏账号
        req_client.dao.checkChannelAccountSignupStatus(buzz_cst_sdk.CHANNEL[channel].PREFIX, chunk, function (err, result) {
            if (err) {
                console.error(FUNC + "检测账户信息出错:", err);
                cb(chunk);
                return;
            }
            if (DEBUG) console.log(FUNC + "result:", result);
            if (chunk.figureurl) {
                result.figureurl = chunk.figureurl;
            }
            cb(null, result);
        });
    }
    else {
        if (channel == "" + CHANNEL_ID.WANBA) {
            _handleWanbaError(chunk, cb);
        }
        else {
            _handleEgretError(chunk, cb);
        }
    }
}

// 错误处理
function _handleWanbaError(chunk, cb) {
    const FUNC = TAG + "_handleWanbaError() --- ";

    switch (chunk.ret) {
        case -5:
            console.log(FUNC + "签名验证错误");
            cb(new Error("签名验证错误"));
            // returnWanbaFake(chunk, req_client, cb);
            break;
        case -4:
            console.log(FUNC + "玩家IP不正确，需要后端去主动获取");
            cb(new Error("玩家IP不正确，需要后端去主动获取"));
            // returnWanbaFake(chunk, req_client, cb);
            break;
    }
    console.log(FUNC + chunk.msg);
}

// 错误处理
function _handleEgretError(chunk, cb) {
    switch (chunk.code) {
        case 1001:// 参数不全
            cb(chunk);
            break;
        case 1005:// token 错误
            cb(chunk);
            break;
        case 1006:// sign 错误，验证通不过
            cb(chunk);
            break;
        case 1007:// 该用户不存在
            cb(chunk);
            break;
        case 1009:// 重复订单
            cb(chunk);
            break;
        case 1010:// 当前渠道不提供该功能
            cb(chunk);
            break;
        case 1013:// 支付失败
            cb(chunk);
            break;
        default:
            cb(chunk);
            break;
    }
}
