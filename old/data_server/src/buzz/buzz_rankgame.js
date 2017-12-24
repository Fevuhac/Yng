////////////////////////////////////////////////////////////
// Rankgame Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var HttpUtil = require('../utils/HttpUtil');
var RedisUtil = require('../utils/RedisUtil');
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var CacheAccount = require('./cache/CacheAccount');
var CacheCharts = require('./cache/CacheCharts'),
    RANK_TYPE = CacheCharts.RANK_TYPE;
var Item = require('./pojo/Item');

var _ = require('underscore');
var buzz_account = require('./buzz_account');
var buzz_charts = require('./buzz_charts');

var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('./cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');
var SERVER_CFG = require('../cfgs/server_cfg').SERVER_CFG;

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

const TAG = "【buzz_rankgame】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.result = result;
exports.info = info;
exports.box = box;
exports.ongoing = ongoing;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取排位赛结果
 */
function result(req, data, cb) {
    const FUNC = TAG + "result() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_result");

    buzz_account.getAccountByToken(req, data.token, function(err, account) {
        if (err) {
            cb(err);
            return;
        }
        req.dao.getRankgame(data, cb);
    });
}

/**
 * 获取排位赛信息
 */
function info(req, data, cb) {
    const FUNC = TAG + "info() --- ";

    if (DEBUG) console.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_info");

    // 从Redis中拉取用户的排位赛信息
    _info(req, data, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_rankgame", cb);
    }
}

function _info(req, data, cb) {
    const FUNC = TAG + "_info() --- ";

    var uid = data.uid;
    var token = data.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(err, account) {
        if (err) return cb && cb(err);
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (uid == 828414) {
            console.log(FUNC + uid + "-获取玩家排位赛信息");
        }
        req.dao.rankgameInfo(data, account, function(err, ret) {
            if (uid == 828414) {
                console.log(FUNC + uid + "-err:", err);
                console.log(FUNC + uid + "-ret:", ret);
            }
            if (err) return cb && cb(err);
            // DONE: 使用Redis中生成的排行榜获取玩家的排位赛数据.
            var my_rank_info = CacheCharts.getRank(account.platform, RANK_TYPE.MATCH, uid);
            // console.log(FUNC + "my_rank_info:\n", my_rank_info);
            ret.my_rank = my_rank_info.my_rank;
            // 不仅获取玩家的名次，也要获取玩家的胜点和段位数据.
            // 如果玩家不在排行榜中, 不要覆盖了排行榜的数据
            ret.rank = my_rank_info.rank || account.match_rank;
            ret.points = my_rank_info.points || account.match_points;

            if (account.id == 44) {
                console.log(FUNC + "ret:", ret);
            }
            cb && cb(null, ret);
        });
    }
}

/**
 * 排位赛中的宝箱操作相关
 */
function box(req, data, cb) {
    const FUNC = TAG + "box() --- ";

    if (DEBUG) console.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_box");

    buzz_account.getAccountByToken(req, data.token, function(err, account) {
        if (err) {
            cb(err);
            return;
        }
        req.dao.rankgameBox(data, account, cb);
    });
}

/**
 * 获取是否有正在进行中的比赛.
 */
function ongoing(req, data, cb) {
    const FUNC = TAG + "ongoing() --- ";

    if (DEBUG)console.info(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "rankgame_ising");

    buzz_account.getAccountByToken(req, data.token, function(err, account) {

        if (DEBUG)console.info(FUNC + "getAccountByToken end");
        if (err) {
            cb(err);
            return;
        }

        // cb(null, {room:null});

        connectEnterPoolSocket(account.id, function(roomUrl) {
            cb(null, {room:roomUrl});
        });

        // connectEnterPoolHttp(account.id, function(roomUrl) {
        //     cb(null, {room:roomUrl});
        // });
    });
};

function connectEnterPoolSocket(uid, callback) {
    const FUNC = TAG + "connectEnterPoolSocket() --- ";

    if (DEBUG)console.info(FUNC + "CALL...");
    
    var io = require('socket.io-client');
    var socket = socketConnect();

    socket.on('connect', function () {
        if (DEBUG)console.log(FUNC + " connect to query api...");
        
        // 获取是否有正在进行中的比赛
        socket.emit('getRoom', uid, function(roomUrl) {
            callback(roomUrl);
            socket.disconnect();
        });
    });

    function socketConnect() {
        var socket = null;
        if (SERVER_CFG.HTTP) {
            socket = io.connect(SERVER_CFG.ADDRESS.ENTERPOOL_QUERY_API.HTTP);
        }
        else if (SERVER_CFG.HTTPS) {
            socket = io.connect(SERVER_CFG.ADDRESS.ENTERPOOL_QUERY_API.HTTPS);
        }
        return socket;
    }
}

//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {
    
    var token = data['token'];
    
    if (DEBUG) console.log("token:", token);

    if (!CommonUtil.isParamExist("buzz_rankgame", token, "接口调用请传参数token", cb)) return false;
    
    return true;

}