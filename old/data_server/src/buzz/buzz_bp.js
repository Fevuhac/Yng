////////////////////////////////////////////////////////////
// 和钻石相关的业务操作
////////////////////////////////////////////////////////////

//==========================================================
// import
//==========================================================

//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

//------------------------------------------------------------------------------
// 业务(Buzz)
//------------------------------------------------------------------------------
var buzz_charts = require('./buzz_charts');

//------------------------------------------------------------------------------
// 数据库访问(DAO)
//------------------------------------------------------------------------------
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
// var CachePearl = require('./cache/CachePearl');

var TAG = "【buzz_bp】";


//==========================================================
// public
//==========================================================

//----------------------------------------------------------
// definition
//----------------------------------------------------------
exports.addBpLog = addBpLog;

//----------------------------------------------------------
// implement
//----------------------------------------------------------

/**
 * 增加一条捕鱼积分记录到Redis中修改玩家积分数据.
 */
function addBpLog(req, dataObj, cb) {
    const FUNC = TAG + "addBpLog() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "add_bp_log");

    _addBpLog(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'total'], "buzz_bp.add_bp_log", cb);
    }
}


//==========================================================
// private
//==========================================================
function _addBpLog(req, dataObj, cb) {
    const FUNC = TAG + "_addBpLog() --- ";
    var token = dataObj.token;
    var uid = dataObj.uid;
    var total = dataObj.total;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(err, account){
        if (err) {
            cb(err);
            return;
        }
        
        doNext(account);
    });

    function doNext(account) {
        var platform = account.platform;
        if (total > 0) {
            RedisUtil.hget(PAIR.UID_BP, uid, function(err, res) {
                if (err) return cb && cb(err);
                var bp = 0;
                if (res) {
                    res = parseInt(res);
                    bp = res + total;
                }
                else {
                    bp = total;
                }
                RedisUtil.hset(PAIR.UID_BP, uid, bp, function () {
                    if (err) return cb && cb(err);
                    // yTODO: 更新排行榜中的对应值
                    buzz_charts.updateRankBp(platform, uid, bp);
                    var ret = {bp:bp};
                    cb(null, ret);
                });
            });
        }
        else {
            cb("没有需要记录的变化");
        }
    }
}