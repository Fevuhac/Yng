//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.response = _response;
exports.getDataObj = _getDataObj;

var TAG = "【admin_common】"

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

function _response(desc, res, err, rows) {
    if (err) {
        res.success({ type: 1, msg: desc + '失败', err: '' + err });
    } else {
        res.success({ type: 1, msg: desc + '成功', data: rows });
    }
}

function _getDataObj(req) {
    const FUNC = TAG + "_getDataObj() --- ";

    var dataObj = req.body.data;
    try {
        dataObj = JSON.parse(dataObj);
    }
    catch (err) {
    }
    console.log(FUNC + 'dataObj:', dataObj);
    return dataObj;
}


//==============================================================================
// private
//==============================================================================
