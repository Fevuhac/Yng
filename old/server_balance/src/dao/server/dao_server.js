/////////////////////////////////////////////////////////////////////////////////////////
// Server Mgmt Related
// 服务器管理相关
// saveAll
/////////////////////////////////////////////////////////////////////////////////////////

//=======================================================================================
// import
//=======================================================================================
// var ObjUtil = require('../buzz/ObjUtil');
// var CstError = require('../buzz/cst/buzz_cst_error');
// var DaoGold = require('./dao_gold');
// var DaoAccount = require('./dao_account');
// var DaoMail = require('./dao_mail');
// var DaoLink = require('./dao_link');
var DaoOperation = require('./dao_operation');
var DaoChange = require('./dao_change');


//=======================================================================================
// constant
//=======================================================================================
// var ERROR_CODE = CstError.ERROR_CODE;
// var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_server】";


//=======================================================================================
// public
//=======================================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.saveAll = saveAll;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function saveAll(pool, cb) {
    var funcList = [
        {func: DaoOperation.flush, desc:"更新运营数据"},
        {func: DaoChange.flush, desc:"更新实物交换订单"},
    ];

    runStep(funcList, pool, cb);
}

function runStep(funcList, params, next) {
    if (funcList.length == 0) {
        next();
        return;
    }
    var func_info = funcList.shift();
    var func = func_info.func;
    func(params, function() {
        console.log(func_info.desc + "成功");
        runStep(funcList, params, next);
    });
}


//=======================================================================================
// private
//=======================================================================================
