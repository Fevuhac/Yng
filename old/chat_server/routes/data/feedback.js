////////////////////////////////////////////////////////////////////////////////
// 玩家反馈的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var data_util = require('./data_util');
var buzz_feedback = require('../../src/buzz/buzz_feedback');

var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【data/feedback】";

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
exports.banUser = banUser;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 玩家建议.
 */
function playerPropose(req, res) {
    const FUNC = TAG + "playerPropose() --- ";
    const HINT = "留言板";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = _parseDataObj(req, HINT);

    buzz_feedback.playerPropose(req, dataObj, function(err, propose) {
        if (err) {
            res.success({ type: 1, msg: '留言失败', err:err, data: null });
        }
        else {
            res.success({ type: 1, msg: '留言成功', data: propose });
        }
    });
}

/**
 * 客户端拉取留言板内容.
 */
function queryMsgboard(req, res) {
    const FUNC = TAG + "queryMsgboard() --- ";
    const HINT = "拉取留言板内容";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = _parseDataObj(req, HINT);

    buzz_feedback.queryMsgboard(dataObj, function(ret) {
        res.success({ type: 1, msg: '反馈成功', data: ret });
    });
}

/**
 * 玩家点赞.
 */
function likeMsgboard(req, res) {
    const FUNC = TAG + "likeMsgboard() --- ";
    const HINT = "玩家点赞";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = _parseDataObj(req, HINT);

    buzz_feedback.likeMsgboard(dataObj, function(ret) {
        res.success({ type: 1, msg: '反馈成功', data: ret });
    });
}

/**
 * 刪除留言.
 * token, mid
 */
function delMsgboard(req, res) {
    const FUNC = TAG + "delMsgboard() --- ";
    const HINT = "刪除留言";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = _parseDataObj(req, HINT);

    buzz_feedback.delMsgboard(req, dataObj, function(ret) {
        if (ret == -1) {
            res.success({ type: 1, msg: '刪除留言失败', data: ret });
        }
        else {
            res.success({ type: 1, msg: '刪除留言成功', data: ret });
        }
    });
}



/**
 * 封号.
 * token, uid_list
 */
function banUser(req, res) {
    const FUNC = TAG + "banUser() --- ";
    const HINT = "玩家封号";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = _parseDataObj(req, HINT);

    buzz_account.banUser(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}




//==============================================================================
// private
//==============================================================================

/**
 * 解析请求中的数据格式.
 * @param req 请求对象.
 * @param hint 提示信息.
 */
function _parseDataObj(req, hint) {
    var dataObj = {};

    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        if (ERROR) console.error(FUNC + "msg:", hint + "失败(json解析错误)");
        if (ERROR) console.error(FUNC + "err:", json_parse_err);
    }

    return dataObj;
}