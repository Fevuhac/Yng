////////////////////////////////////////////////////////////
// 反馈接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CachePropose = require('./cache/CachePropose');
var CommonUtil = require('./CommonUtil');
var async = require('async');
var RedisUtil = require('../utils/RedisUtil');
//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// POJO
//------------------------------------------------------------------------------
var ObjPropose = require('./pojo/Propose');
var Propose = ObjPropose.Propose;

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('./cache/CacheLink');
var CachePropose = require('./cache/CachePropose');
var CacheUserInfo = require('./cache/CacheUserInfo');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var dao_feedback = require('../dao/dao_feedback');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_feedback】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.playerPropose = playerPropose;
exports.queryMsgboard = queryMsgboard;
exports.likeMsgboard = likeMsgboard;
exports.delMsgboard = delMsgboard;
exports.saveAll = saveAll;
exports.loadAll = loadAll;
exports.loadAllUserInfo = loadAllUserInfo;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 接收玩家发来的一条留言
 * token, text
 */
function playerPropose(req, dataObj, cb) {
    const FUNC = TAG + "playerPropose() --- ";

    console.error(FUNC + "CALL...");
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "player_propose");

    // 插入数据到CachePropose
    var uid = dataObj.token.split("_")[0];
    var text = dataObj.text;

    if(DEBUG) console.log(FUNC + "uid:", uid);
    if(DEBUG) console.log(FUNC + "text:", text);
    async.waterfall([
        function(cb) {
            RedisUtil.hget(PAIR.UID_TALK_FORBIDDEN, uid, cb);
        },
        function(res,cb) {
            if(res==1) {
                cb("你已经被禁言了");
            }
            else{
                req.dao.insertMsg(uid, text, cb);
            }
        }
    ],function(err,mid) {
            if(err){
                cb(err);
                return;
            }
            CacheUserInfo.queryOrInsert(req, uid, function() {
                var propose = new Propose(mid, uid, text);
                CachePropose.push(propose);
                var ret = ObjPropose.getPropose(uid, propose);
                cb(null, ret);
            });
        }
    );

    function lPrepare(input) {
        return _checkParams(input, ['token', 'text'], "buzz_feedback", cb);
    }
}

/**
 * 客户端拉取留言板内容.
 * token, timestamp, count, hot4
 */
function queryMsgboard(dataObj, cb) {
    const FUNC = TAG + "queryMsgboard() --- ";

    if (DEBUG) console.log(FUNC + "dataObj:", dataObj);
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "query_msgboard");

    var request_uid = dataObj.token.split("_")[0];
    var timestamp = dataObj.timestamp;
    var count = dataObj.count;
    var hot4 = dataObj.hot4;
    DEBUG = 1;
    if (DEBUG) console.log(FUNC + "timestamp:", timestamp);
    if (DEBUG) console.log(FUNC + "count:", count);
    if (DEBUG) console.log(FUNC + "hot4:", hot4);
    var ret = CachePropose.query(request_uid, timestamp, count, hot4);
    if (DEBUG) console.log(FUNC + "ret:", ret);
    DEBUG = 0;
    cb(ret);

    function lPrepare(input) {
        return _checkParams(input, ['token', 'timestamp', 'count'], "buzz_feedback", cb);
    }
}

/**
 * 玩家点赞.
 * token, mid
 */
function likeMsgboard(dataObj, cb) {
    const FUNC = TAG + "likeMsgboard() --- ";

    console.log(FUNC + "dataObj:", dataObj);
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "like_msgboard");

    var uid = dataObj.token.split("_")[0];
    var mid = dataObj.mid;

    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "mid:", mid);

    var ret = CachePropose.like(uid, mid);
    cb(ret);

    function lPrepare(input) {
        return _checkParams(input, ['token', 'mid'], "buzz_feedback", cb);
    }
}

/**
 * 刪除留言.
 * token, mid
 */
function delMsgboard(req, dataObj, cb) {
    const FUNC = TAG + "delMsgboard() --- ";

    console.log(FUNC + "dataObj:", dataObj);
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "del_msgboard");

    var uid = dataObj.token.split("_")[0];
    var mid = dataObj.mid;

    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "mid:", mid);

    // TODO: 需要验证uid是否拥有留言板管理权限

    var ret = CachePropose.del(mid);

    if (ret == mid) {
        console.log(FUNC + "删除成功, 需要更新数据库");
        req.dao.delMsgboard(mid, function() {
            console.log(FUNC + "删除数据库留言成功");
        });
    }
    cb(ret);

    function lPrepare(input) {
        return _checkParams(input, ['token', 'mid'], "buzz_feedback", cb);
    }
}

/**
 * 将缓存中所有的建议存到数据库中. 此操作定时进行.
 */
function saveAll(pool) {
    dao_feedback.saveAll(pool);
}

/**
 * 将数据库中所有的留言加载到缓存中.
 */
function loadAll(pool, cb) {
    dao_feedback.loadAll(pool, cb);
}

/**
 * .
 */
function loadAllUserInfo(pool, uid_list, cb) {
    dao_feedback.loadAllUserInfo(pool, uid_list, cb);
}

//==============================================================================
// private
//==============================================================================

function _checkParams(input, params, hint, cb) {
    for (var i = 0; i < params.length; i++) {
        var param_name = params[i];
        var param = input[params[i]];
        if (!CommonUtil.isParamExist(hint, param, "接口调用请传参数" + param_name, cb)) return false;
    }
    return true;
}