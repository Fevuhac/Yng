////////////////////////////////////////////////////////////////////////////////
// 数据预处理的通用工具类
// requestInfo
// get_data
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// tools
//------------------------------------------------------------------------------


//==============================================================================
// const
//==============================================================================


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.logSQL = logSQL;
exports.errorSQL = errorSQL;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 打印数据库查询语句.
 */
function logSQL(DEBUG, FUNC, sql, sql_data) {
    if (DEBUG) console.log(FUNC + 'sql:\n', sql);
    if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);
}

/**
 * 出现错误时打印数据库查询语句.
 */
function errorSQL(ERROR, FUNC, sql, sql_data, err) {
    if (ERROR) console.error(FUNC + "err:", err);
    if (ERROR) console.error(FUNC + 'sql:\n', sql);
    if (ERROR) console.error(FUNC + 'sql_data:\n', sql_data);
}

//==============================================================================
// private
//==============================================================================
