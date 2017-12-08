/////////////////////////////////////////////////////////////////////////////////////////
// Server Mgmt Related
// 服务器管理相关
// saveAll
/////////////////////////////////////////////////////////////////////////////////////////

//=======================================================================================
// import
//=======================================================================================
var ObjUtil = require('../buzz/ObjUtil');
var CstError = require('../buzz/cst/buzz_cst_error');
var DaoGold = require('./dao_gold');
var DaoPearl = require('./dao_pearl');
var DaoWeapon = require('./dao_weapon');
var DaoAccount = require('./dao_account');
var DaoMail = require('./dao_mail');
var DaoLink = require('./dao_link');
var DaoOperation = require('./dao_operation');


//=======================================================================================
// constant
//=======================================================================================
var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;


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
        DaoGold.flush,
        DaoPearl.flush,
        DaoWeapon.flush,
        DaoAccount.flush,
        DaoMail.flush,
        DaoLink.flush,
        DaoOperation.flush,
    ];

    runStep(funcList, pool, cb);
}

function runStep(funcList, params, next) {
    if (funcList.length == 0) {
        next();
        return;
    }
    var func = funcList.shift();
    func(params, function() {
        console.log("更新成功");
        runStep(funcList, params, next);
    });
}


//=======================================================================================
// private
//=======================================================================================
