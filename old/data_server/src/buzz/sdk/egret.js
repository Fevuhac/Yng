////////////////////////////////////////////////////////////
// SDK Egret Related
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

//==============================================================================
// const
//==============================================================================

var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz/sdk/egret】";

// 玩吧统计相关参数
const GAME_ID = 91205;
const CHAN_ID = 10080;
const SECRET_KEY = "i2rc2kyjTuNKstkT5ucIF";

// 上玩吧的时候将这里打开
const ENABLE_SDK = 1;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
// 白鹭统计SDK接入
exports.notifyLogin = notifyLogin;
exports.notifyPayment = notifyPayment;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 登录统计.
 * @param uId 玩吧传递openid即可.
 */
function notifyLogin(uId) {
    const FUNC = TAG + "notifyLogin() --- ";

    if (!ENABLE_SDK) return;

    var data = {
        "gameId":GAME_ID,
        "chanId":CHAN_ID,
        "uId":uId,
        "act":"login",
    };
    callHttp(data, function(err, responseString) {
        if (DEBUG) console.log(FUNC + "responseString:", responseString);
    });
}

/**
 * 登录统计.
 * @param uId 玩吧传递openid即可.
 * @param orderId.
 */
function notifyPayment(uId, orderId, num) {
    const FUNC = TAG + "notifyPayment() --- ";
    
    if (!ENABLE_SDK) return;

    var data = {
        "gameId":GAME_ID,
        "chanId":CHAN_ID,
        "uId":uId,
        "act":"payment",
        "num":num,
        "orderId":orderId,
        "serverId":1,
        "dataType":"wb",
    };
    callHttp(data, function(err, responseString) {
        if (DEBUG) console.log(FUNC + "responseString:", responseString);
    });
}

//==============================================================================
// private
//==============================================================================
function callHttp(data, cb) {
    const FUNC = TAG + "callHttp() --- ";
    var dataString = JSON.stringify(data);
    var sign = md5(dataString + SECRET_KEY);

    var body = {
        data: dataString,
        sign: sign,
    };
    var bodyString = JSON.stringify(body);

    var options = {
        hostname: "api-tx.gz.1251278653.clb.myqcloud.com",
        port: 80,
        path: "/v2/user/stat",
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Content-Length": bodyString.length
        }
    };

    console.log(FUNC + "直接调用");
    var link = "http://api-tx.gz.1251278653.clb.myqcloud.com/v2/user/stat?data=" + dataString + "&sign=" + sign;
    console.log(FUNC + "link:\n", link);
    http.get(link, function(res) {
        console.log(FUNC + "Got response: " + res.statusCode);
        var html = "";
        res.on("data", function(data){
            html+=data;
        });

        res.on("end", function(){
            console.log(FUNC + "html:\n", html);
            cb(null, html)
        });
    }).on('error', function(e) {
        console.log(FUNC + "Got error: " + e.message);
    });


    // var req = http.request(options, function (res) {

    //     res.setEncoding('utf8');
    //     var responseString = '';

    //     res.on('data', function (chunk) {
    //         if (DEBUG) console.log(FUNC + 'STATUS: ' + res.statusCode);
    //         // if (DEBUG) console.log(FUNC + 'HEADERS: ' + JSON.stringify(res.headers));
    //         if (DEBUG) console.log(FUNC + 'http request data... length:', chunk.length);
    //         if (DEBUG) console.log(FUNC + 'chunk:', chunk);
    //         responseString += chunk;
    //     });

    //     res.on('end', function () {
    //         if (DEBUG) console.log(FUNC + 'STATUS: ' + res.statusCode);
    //         // if (DEBUG) console.log(FUNC + 'HEADERS: ' + JSON.stringify(res.headers));
    //         if (DEBUG) console.log(FUNC + 'http request end...');
    //         if (DEBUG) console.log(FUNC + 'responseString:', responseString);
    //         cb(null, responseString);
    //     });
    // });
        
    // req.on('error', function (e) {
    //     if (ERROR) console.error(FUNC + 'problem with request: ' + e.message);
    // });

    // req.write(bodyString);
        
    // req.end();
}

var crypto = require('crypto');
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
};