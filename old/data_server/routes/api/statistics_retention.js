﻿//==============================================================================
// import
//==============================================================================
var admin_common = require('./admin_common');


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.get_retention_data = _get_retention_data;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function _get_retention_data(req, res) {
    req.dao.getRetentionData(admin_common.getDataObj(req), function (err, rows) {
        console.log("getRetentionData complete...");
        admin_common.response('获取留存数据', res, err, rows);
    });
}


//==============================================================================
// private
//==============================================================================
