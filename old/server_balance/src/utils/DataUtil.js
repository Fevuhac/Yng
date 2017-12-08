////////////////////////////////////////////////////////////////////////////////
// 数据预处理的通用工具类
// requestInfo
// get_data
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// tools
//------------------------------------------------------------------------------
var CryptoJS = require("crypto-js");


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.requestInfo = requestInfo;
exports.parseDataObj = parseDataObj;
exports.handleReturn = handleReturn;
exports.getDataObj = getDataObj;

exports.isParamExist = isParamExist;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 打印请求信息(慎用)
 */
function requestInfo(req, func_name) {
    if (DEBUG) console.log("call " + func_name + "()...");
    if (DEBUG) console.log("req: " + req);
    if (DEBUG) console.log("req.body: " + JSON.stringify(req.body));
    if (DEBUG) console.log("req.params: " + JSON.stringify(req.params));
}

/**
 * 解析请求中的数据格式.
 * @param req 请求对象.
 * @param HINT 提示信息.
 */
function parseDataObj(req, FUNC, HINT) {
    var dataObj = {};
    
    try {
        dataObj = getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        if (ERROR) console.error(FUNC + "msg:", HINT + "失败(json解析错误)");
        if (ERROR) console.error(FUNC + "err:", json_parse_err);
    }
    
    return dataObj;
}

/**
 * 解析请求中的数据格式.
 * @param res 响应对象.
 * @param aes 是否加密标记.
 * @param err 错误对象, 不为空时返回此对象.
 * @param result 返回对象.
 * @param HINT 提示信息.
 */
function handleReturn(res, aes, err, result, FUNC, HINT) {
    // const FUNC = TAG + "handleReturn() --- ";
    if (err) {
        if (ERROR) console.error(FUNC + "msg:", HINT + "失败");
        if (ERROR) console.error(FUNC + "err:", err);
        res.success({ type: 1, msg: HINT + "失败", err: err });
    } else {
        var res_data = getResData(result, aes);
        res.success({ type: 1, msg: HINT + "成功", data: res_data, aes: aes });
    }
}

/**
 * 从客户端上传数据(经过加密的字符串)获取数据对象(json格式).
 * @throw err SyntaxError: Unexpected end of input
 */
function getDataObj(str_data, aes) {
    if (DEBUG) console.log("原始数据: " + str_data);
    var dataObj = {};
    if (aes == true || aes == "true") {
        var bytes = CryptoJS.AES.decrypt(str_data, _game.key);
        var str_data = bytes.toString(CryptoJS.enc.Utf8);
        if (DEBUG) console.log("decode aes: " + str_data);
    }
    try {
        dataObj = JSON.parse(str_data);
    }
    catch (err) {
        throw err;
    }
    return dataObj;
}

/**
 * 将返回对象转换为字符串后进行加密处理返回给客户端.
 */
function getResData(json_data, aes) {
    if (DEBUG) console.log("aes: " + aes);
    if (aes == true || aes == "true") {
        if (DEBUG) console.log("加密");
        return CryptoJS.AES.encrypt(JSON.stringify(json_data), _game.key).toString();
    }
    else {
        if (DEBUG) console.log("不加密");
        return json_data;
    }
}

function isParamExist(module, param, err_info, cb) {
    if (param == null) {
        var extraErrInfo = { debug_info: module + "._isParamExist()-" + err_info };
        if (ERROR) console.error('------------------------------------------------------');
        if (ERROR) console.error(extraErrInfo.debug_info);
        if (ERROR) console.error('------------------------------------------------------');
        if (cb == null) console.error('!!!!!!!!!!!!!!!!!!!!!!!');
        // cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.PARAM_MISSING));
        return false;
    }
    return true;
}

//==============================================================================
// private
//==============================================================================

