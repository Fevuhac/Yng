////////////////////////////////////////
// DateUtil
// 日期处理工具集
//--------------------------------------
// 如何使用
// <script src="/javascript/util/DateUtil.js"></script>
// DateUtil.func(str, params...);
////////////////////////////////////////
// 工具列表
// pattern(date, fmt)
// format(date, fmt)
////////////////////////////////////////

/**
 * date类型转成string
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.pattern = function (fmt) {
    var o = {
        "M+" : this.getMonth() + 1, //月份         
        "d+" : this.getDate(), //日         
        "h+" : this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
        "H+" : this.getHours(), //小时         
        "m+" : this.getMinutes(), //分         
        "s+" : this.getSeconds(), //秒         
        "q+" : Math.floor((this.getMonth() + 3) / 3), //季度         
        "S" : this.getMilliseconds() //毫秒         
    };
    var week = {
        "0" : "\u65e5",         
        "1" : "\u4e00",         
        "2" : "\u4e8c",         
        "3" : "\u4e09",         
        "4" : "\u56db",         
        "5" : "\u4e94",         
        "6" : "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/**
 * date类型转成string
 * eg:
 * (new Date()).pattern("yyyyMMddhhmmss") ==> 20161010110655
 */
Date.prototype.format = function (fmt) { //author: meizz   
    var o = {
        "M+" : this.getMonth() + 1,               //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth() + 3) / 3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


//==============================================================================
// 模块输出
//==============================================================================

/**
 * 格式化日期，以string的形式输出
 */
function _pattern(date, fmt) {
    return date.pattern(fmt);
};

/**
 * 格式化日期，以string的形式输出
 */
function _format(date, fmt) {
    return date.format(fmt);
};

/**
 * 获得当前日期的偏移值.
 * @add_day_count 以基准日期向前（-x）向后（+x）推算
 * @base_date 基准日期，如果没有指定则使用系统当前日期
 */
function _getDateOffset(add_day_count, base_date) {
    if (!base_date) {
        base_date = new Date();
    }
    base_date.setDate(base_date.getDate() + add_day_count);
    return base_date;
};

/**
 * 输入: 2017-09-05 20:00:01
 * 输出: 2017-09-05 19:00:00
 */
function getLastHourStart() {
    d = new Date();
    d = +d - 1000*60*60;
    d = Math.floor(d / (1000*60)) * 1000*60;
    d = new Date(d);
    return d.format("yyyy-MM-dd hh:mm:ss");
}

/**
 * 输入: 2017-09-05 20:00:01
 * 输出: 2017-09-05 20:00:00
 */
function getLastHourEnd() {
    d = new Date();
    d = +d;
    d = Math.floor(d / (1000*60)) * 1000*60;
    d = new Date(d);
    return d.format("yyyy-MM-dd hh:mm:ss");
}

/**
 * 工具类DateUtil的定义.
 */
var DateUtil = {
    pattern : _pattern,
    format : _format,
    getDateOffset : _getDateOffset,
    getLastHourStart : getLastHourStart,
    getLastHourEnd : getLastHourEnd,
}