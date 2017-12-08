﻿////////////////////////////////////////////////////////////////////////////////
// Gold Data Operation
// 金币数据的操作更新
// add_gold_log
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var data_util = require('./data_util');


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
exports.add_gold_log = _add_gold_log;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加金币记录
 */
function _add_gold_log(req, res) {
    data_util.request_info(req, "add_gold_log");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    req.dao.addGoldLog(dataObj, function (err, rows) {
        if (err) {
            res.success({ type: 1, msg: '更新玩家金币数据失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(rows[0], aes);
            res.success({ type: 1, msg: '更新玩家金币数据成功', data: res_data, aes: aes });
        }
    });
}


//==============================================================================
// private
//==============================================================================
