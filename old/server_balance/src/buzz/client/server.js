////////////////////////////////////////////////////////////
// 客户端获取API服务器的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var DataUtil = require("../../utils/DataUtil");

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 数据库访问
//------------------------------------------------------------------------------
var dao_client_server = require("../../dao/client/server");

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheOpenid = require("../cache/CacheOpenid");
var CacheUser = require("../cache/CacheUser");

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var SERVER_CFG = require("../../cfgs/server_cfg").SERVER_CFG;


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz/client/server】";



//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getApiServer = getApiServer;
exports.genSidIdx = genSidIdx;


const HTTPS_CFG = {
    server_api: SERVER_CFG.API_SERVER_LIST.HTTPS,
    server_msgboard: SERVER_CFG.MSGBOARD_SERVER.HTTPS,
    server_enter: SERVER_CFG.ENTER_SERVER.HTTPS,
    server_chat: SERVER_CFG.CHAT_SERVER.HTTPS,
    server_download: SERVER_CFG.RESOURCE_SERVER.HTTPS,
    server_fighting: SERVER_CFG.FIGHTING_SERVER.HTTPS,
}

const HTTP_CFG = {
    server_api: SERVER_CFG.API_SERVER_LIST.HTTP,
    server_msgboard: SERVER_CFG.MSGBOARD_SERVER.HTTP,
    server_enter: SERVER_CFG.ENTER_SERVER.HTTP,
    server_chat: SERVER_CFG.CHAT_SERVER.HTTP,
    server_download: SERVER_CFG.RESOURCE_SERVER.HTTP,
    server_fighting: SERVER_CFG.FIGHTING_SERVER.HTTP,
}

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取API服务器的地址.
 */
function getApiServer(req, dataObj, cb) {
    const FUNC = TAG + "getApiServer() --- ";
    var uid = dataObj.uid;
    var openid = dataObj.openid;
    var platform = dataObj.platform;
    var is_https = dataObj.is_https;

    cb && cb(null, is_https ? HTTPS_CFG : HTTP_CFG);
}

const transServerIds = {
    "1": 1,
    "2": 1,
    "3": 1, //TODO: 1123
    "7": 1,
    "8": 1
};
const testOpenId = {
    "A849193C7D0257E3A9C0DFB1B5095247": 1
};


//==============================================================================
// private
//==============================================================================
function _checkParams(input, params, hint, cb) {
    for (var i = 0; i < params.length; i++) {
        var param_name = params[i];
        var param = input[params[i]];
        if (!DataUtil.isParamExist(hint, param, "接口调用请传参数" + param_name, cb)) return false;
    }
    return true;
}

function getSidIdxFromUidRange(pool, uid, cb) {
    if (uid == 0) {
        //console.log("创建新账户, 查询数据库总人数");
        dao_client_server.getAccountCount(pool, function (err, total) {
            total = parseInt(total);
            genSidIdx(total + 1, cb);
        });
        // cb(1);
    } else {
        if (uid < STRATEGY_1) {
            genSidIdx(uid, cb);
        } else {
            var userInfo = CacheUser.getUserInfoByUid(uid);
            // 玩家服务器数据存在于缓存就从缓存中拉取, 否则读取数据库
            if (userInfo) {
                if (DEBUG) console.error("---老账户, 服务器数据已经在缓存中, 直接读取缓存数据");
                cb(sid2SidIdx(userInfo.sid));
            } else {
                if (DEBUG) console.error("---老账户, 服务器数据不在缓存中, 需要从数据库表tbl_account_server查询玩家所在服务器");
                dao_client_server.getAccountServerId(pool, uid, function (err, sid) {
                    if (err) {
                        if (DEBUG) console.error("-老账户, 查询数据库错误使用默认策略");
                        genSidIdx(uid, cb);
                        return;
                    }
                    if (sid == null) {
                        if (DEBUG) console.error("-老账户, 查询数据库没有玩家数据使用默认策略");
                        genSidIdx(uid, cb);
                        return;
                    }
                    if (DEBUG) console.error("-老账户, 查询数据库获取玩家所在服务器后进行处理");
                    cb(sid2SidIdx(sid));
                });
            }
        }
    }
}

function sid2SidIdx(sid) {
    const FUNC = TAG + "sid2SidIdx() --- ";
    if (DEBUG) console.log(FUNC + "sid:", sid);
    if (DEBUG) console.log(FUNC + "sid-1:", sid - 1);
    return sid - 1;
}

/**
 * 策略1: 固定服务器分配固定用户
 */
const STRATEGY_1 = 160000;
// const STRATEGY_1 = 1000;// 测试
/**
 * 策略2: 五台服务器分别分配取余计算得到的服务器id
 */
const STRATEGY_2 = 10000000;

function genSidIdx(uid, cb) {
    const FUNC = TAG + "genSidIdx() --- ";
    if (DEBUG) console.log(FUNC + "uid:", uid);
    var sidIdx = 0;
    if (uid <= STRATEGY_1) {
        for (var i = 0; i < SERVER_CFG.ServerRange.length; i++) {
            var range = SERVER_CFG.ServerRange[i];
            for (var j = 0; j < range.length; j++) {
                var area = range[j];
                if (uid >= area[0] && uid <= area[1]) {
                    sidIdx = i;
                    break;
                }
            }
        }
    } else if (uid > STRATEGY_1 && uid <= STRATEGY_2) {
        var temp = uid % 5;
        if (temp == 0) temp = 5;
        sidIdx = temp;
    }
    if (DEBUG) console.log(FUNC + "sidIdx:", sidIdx);
    if (sidIdx == 1) { // 2服不再接受新玩家
        sidIdx += ((uid % 4) + 1);
    }
    cb(sidIdx);
}