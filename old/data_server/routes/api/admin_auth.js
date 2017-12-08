//==============================================================================
// import
//==============================================================================
var admin_common = require('./admin_common');


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.add = _add;
exports.delete = _delete;
exports.valid = _valid;
exports.edit = _edit;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function _add(req, res) {
    req.dao.addAuth(admin_common.getDataObj(req), function (err, rows) {
        console.log("addAuth complete...");
        admin_common.response('添加权限', res, err, rows);
    });
}

////////////////////////////////////////
function _delete(req, res) {
    req.dao.deleteAuth(admin_common.getDataObj(req), function (err, rows) {
        console.log("deleteAuth complete...");
        admin_common.response('禁止权限', res, err, rows);
    });
}

////////////////////////////////////////
function _valid(req, res) {
    req.dao.validAuth(admin_common.getDataObj(req), function (err, rows) {
        console.log("validAuth complete...");
        admin_common.response('激活权限', res, err, rows);
    });
}

////////////////////////////////////////
function _edit(req, res) {
    req.dao.editAuth(admin_common.getDataObj(req), function (err, rows) {
        console.log("editAuth complete...");
        admin_common.response('修改权限', res, err, rows);
    });
}