////////////////////////////////////////////////////////////////////////////////
// CD-KEY Operation
// 生成CD-KEY, 玩家使用CD-KEY兑换礼品
// generate
// use
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');


//==============================================================================
// const
//==============================================================================
var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.generate = generate;
exports.use = use;
exports.list = list;
exports.detail = detail;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 创建CD-KEY
 */
function generate(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);

    req.dao.generateCdKey(dataObj, function (err, results) {
        //console.log(err);
        //console.log(results);
        if (err) {
            res.success({ type: 1, msg: '生成CD-KEY失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData({cdkey_list: results}, aes);
            res.success({ type: 1, msg: '生成CD-KEY成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 根据传入的action_id获取此活动下所有CD-KEY极其状态
 */
function list(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.listCdKey(dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '获取CD-KEY失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData({ cdkey_list: results }, aes);
            res.success({ type: 1, msg: '获取CD-KEY成功', data: res_data, aes: aes });
        }
    });
}

function detail(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.showCdkeyDetail(dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '获取CD-KEY详情失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(results[0], aes);
            res.success({ type: 1, msg: '获取CD-KEY详情成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 使用CD-KEY
 */
function use(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.useCdKey(dataObj, function (err, account) {
        if (err) {
            res.success({ type: 1, msg: '使用CD-KEY失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(account, aes);
            res.success({ type: 1, msg: '使用CD-KEY成功', data: res_data, aes: aes });
        }
    });
}


//==============================================================================
// private
//==============================================================================

