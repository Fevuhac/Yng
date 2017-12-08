
////////////////////////////////////////////////////////////
// Statistics Related (Every Day)
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var DaoUtil = require('./dao_utils');
var DaoAdminFillData = require('./dao_admin_fill_data');

/**
 * 每天产生统计数据(前一天的数据)
 */
function _sumUpLastDay(pool, cb) {
    // 调用DaoAdminFillData.fillDayData参数为前一日的日期字符串
    var last_date = DateUtil.getDateOffset(-1, new Date());
    //var current_date = DateUtil.getDateOffset(0, new Date());
    var data = {
        start_date: last_date,
        end_date: last_date,
    };
    DaoAdminFillData.fillDayData(pool, data, cb);
};
exports.sumUpLastDay = _sumUpLastDay;
