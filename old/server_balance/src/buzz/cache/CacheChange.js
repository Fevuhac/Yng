////////////////////////////////////////
// CacheChange
// 实物领取相关数据缓存(需要服务器后台可以配置)
//--------------------------------------
// 如何使用
// var CacheChange = require('src/buzz/cache/CacheChange');
// CacheChange.func();
////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ArrayUtil = require('../../utils/ArrayUtil');
var BuzzUtil = require('../../utils/BuzzUtil');
var HttpUtil = require('../../utils/HttpUtil');
var DateUtil = require('../../utils/DateUtil');
// var CacheAccount = require('./CacheAccount');

//==============================================================================
// constant
//==============================================================================
var ERROR = 1;
var DEBUG = 0;
var sn = 0;

var TAG = "【CacheChange】";

var CacheOperation = require("./CacheOperation");
var CacheUser = require("./CacheUser");


//==============================================================================
// global variable
//==============================================================================
// 使用说明: 定时存储记录, 存储时用队列方式
// 记录下当前长度len, 从队列中移除len个数据存入数据库, 等待下个周期
// 每一条记录格式如下
/**
 * 领取实物奖励的记录
{
    uid:?,
    name:?,
    phone:?,
    address:?,
    time:?,
    cid:?,
    status:?,
    thingnum:?,
    way:?,
    cost:?,
    count:?,
}
 */
var gChangeLogCache = [];


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.init = init;
exports.obj = obj;
exports.push = push;
exports.cache = cache;
exports.length = length;
exports.getStatusByOrderId = getStatusByOrderId;
exports.getUidByOrderId = getUidByOrderId;
exports.findChangeByOrderId = findChangeByOrderId;
exports.findChangeByUidAndOrderId = findChangeByUidAndOrderId;
exports.findChangeLogByUid = findChangeLogByUid;
exports.cancelCik = cancelCik;
exports.makeSn = makeSn;
exports.findOrdersByTimeRange = findOrdersByTimeRange;
exports.findOrdersByTimeRangeAndFilter = findOrdersByTimeRangeAndFilter;

exports.updateStatus = updateStatus;
exports.updateWay = updateWay;
exports.updateCard = updateCard;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------


function obj() {
    var ret = {};
    for (var idx in gChangeLogCache) {
        var order = gChangeLogCache[idx];
        ret["" + order.orderid] = gChangeLogCache[idx];
    }
    return ret;
}

/**
 * 初始化所有数据.
 */
function init(data) {
    const FUNC = TAG + "init() --- ";
    for (var i = 0; i < data.length; i++) {
        // if (DEBUG) console.log(FUNC + "data[i]:", data[i]);
        gChangeLogCache.push(data[i]);
    }
    // 初始化sn
    for (var i = 0; i < gChangeLogCache.length; i++) {
        var change = gChangeLogCache[i];
        if (DEBUG) console.log(FUNC + "today DateString:", new Date().toDateString());
        if (DEBUG) console.log(FUNC + "change DateString:", new Date(change.created_at).toDateString());
        if (new Date(change.created_at).toDateString() == new Date().toDateString()) {
            if (sn < change.sn) {
                sn = change.sn;
            }
        }
    }
    sn++;
    if (DEBUG) console.log(FUNC + "init sn:", sn);
}

/**
 * 检测gChangeCache长度, 超过11000条数据时将前面的10000条写入数据库中
 */
function push(data) {
    const FUNC = TAG + "push() --- ";
    console.log(FUNC + "CALL...");
    console.log(FUNC + "data:", data);
    gChangeLogCache.push(data);
}

/**
 * 将gChangeCache全部写入数据库中
 */
function cache() {
    return gChangeLogCache;
}

/**
 * 将gChangeCache全部写入数据库中
 */
function length() {
    return gChangeLogCache.length;
}

function getStatusByOrderId(orderid) {
    return findChangeByOrderId(orderid).status;
}

function getUidByOrderId(orderid) {
    return findChangeByOrderId(orderid).uid;
}

function findChangeByOrderId(orderid) {
    for (var i = 0; i < gChangeLogCache.length; i++) {
        var change = gChangeLogCache[i];
        if (orderid == change.orderid) {
            return change;
        }
    }
}

function findChangeByUidAndOrderId(uid, orderid) {
    for (var i = 0; i < gChangeLogCache.length; i++) {
        var change = gChangeLogCache[i];
        if (uid == change.uid
            && orderid == change.orderid) {
            return change;
        }
    }
}

function findChangeLogByUid(uid) {
    const FUNC = TAG + "findChangeLogByUid() --- ";
    var ret = [];
    for (var i = 0; i < gChangeLogCache.length; i++) {
        var change = gChangeLogCache[i];
        if (uid == change.uid) {
            // ret.push(change);
            ret.push({
                ship_at: change.ship_at,
                created_at: change.created_at,
                cost: change.cost,
                itemname: change.itemname,
                count: change.count,
                // 新增
                orderid: change.orderid,
                thingnum: change.thingnum,
                way: change.way,
                card_num: change.card_num,
                card_pwd: change.card_pwd,
                phone: change.phone,
                address: change.address,
                recver: change.name,
                state: change.status,
                icon: change.icon,
            });
        }
    }
    if (DEBUG) console.log(FUNC + "gChangeLogCache:", gChangeLogCache);
    if (DEBUG) console.log(FUNC + "uid:" + uid + " - ret:", ret);
    return ret;
}

/** 实物兑换订单状态 */
const ORDER_STATUS = {
    /** 确认中 */
    ISOK : 0,
    /** 发放中 */
    SENGING : 1,
    /** 发放成功 */
    SENDSUCCESS : 2,
    /** 取消 */
    CANCEL : 3,
    /** 发放失败 */
    SENDFAIL : 4,
};
exports.ORDER_STATUS = ORDER_STATUS;

/**
 * 取消订单
 */
function cancelCik(uid, orderid) {
    const FUNC = TAG + "cancelCik() --- ";
    var ret = [];
    for (var i = 0; i < gChangeLogCache.length; i++) {
        var change = gChangeLogCache[i];
        if (orderid == change.orderid) {
            if (uid != change.uid) {
                if (ERROR) console.error(FUNC + "这不是玩家的兑换订单ID");
                return false;
            }
            if (ORDER_STATUS.ISOK != change.status) {
                if (ERROR) console.error(FUNC + "玩家的订单状态不是发放中:", change.status);
                if (ERROR) console.error(FUNC + "兑换订单ID:", orderid);
                return false;
            }
            if (uid == change.uid) {
                change.status = ORDER_STATUS.CANCEL;

                var cid = change.cid;
                var cross_cancel = !DateUtil.isToday(change.created_at);
                CacheOperation.addStore4Cancel(cid, 1, cross_cancel);

                return change;
            }
        }
    }
    if (ERROR) console.error(FUNC + "没有找到兑换订单ID:", orderid);
    return false;
}

function makeSn() {
    return sn++;
}

/**
 * 找到指定时间范围内的所有订单.
 * @param start_date 开始日期
 * @param end_date 结束日期(注意直接用结束日期获取的时间戳为其凌晨时间)
 */
function findOrdersByTimeRange(start_date, end_date) {
    var start_timestamp = new Date(start_date).getTime();
    var end_timestamp = new Date(end_date).getTime() + 1000 * 60 * 60 * 24;
    var ret = [];
    for (var idx in gChangeLogCache) {
        var order = gChangeLogCache[idx];
        var created_at = order.created_at;
        if (created_at >= start_timestamp && created_at <= end_timestamp) {
            ret.push(order);
        }
    }
    return ret;
}

/**
 * 找到指定时间范围内的所有订单.
 * @param start_date 开始日期
 * @param end_date 结束日期(注意直接用结束日期获取的时间戳为其凌晨时间)
 * @param filter 筛选条件
 */
function findOrdersByTimeRangeAndFilter(start_date, end_date, filter) {
    var start_timestamp = new Date(start_date).getTime();
    var end_timestamp = new Date(end_date).getTime() + 1000 * 60 * 60 * 24;
    var catalog = filter.order_catalog;
    var status = filter.order_status;
    var ret = [];
    for (var idx in gChangeLogCache) {
        var order = gChangeLogCache[idx];
        var created_at = order.created_at;
        if (created_at >= start_timestamp && created_at <= end_timestamp
            && ArrayUtil.contain(catalog, order.catalog)
            && ArrayUtil.contain(status, order.status)) {
            ret.push(order);
        }
    }
    return ret;
}

function updateStatus(req, orderid, status) {
    const FUNC = TAG + "updateStatus() --- ";
    var order = findChangeByOrderId(orderid);
    order.status = status;
    if (order.status == ORDER_STATUS.SENGING) {
        order.ship_at = new Date().getTime();
    }
    var params1 = {
        orderid: order.orderid,
        status: order.status,
    };
    // if (order.status == ORDER_STATUS.SENGING) {
    //     var params2 = {
    //         orderid: order.orderid,
    //         ship_at: order.ship_at,
    //     };
    // }
    if (order.status == ORDER_STATUS.CANCEL) {
        console.log(FUNC + "需要修改用户数据返还对应的话费券");
        var uid = order.uid;
        var num = order.cost;
        // TODO: 需要查询玩家在那台服务器再去修改
        var user_info = CacheUser.getUserInfoByUid(uid);
        console.log(FUNC + "uid:", uid);
        console.log(FUNC + "user_info:", user_info);
        var info = BuzzUtil.getServerInfoById(user_info.sid);
        console.log(FUNC + "info:", info);

        var api = "/admin_api/add_huafeiquan";
        var host = info.server_ip;
        var port = info.server_port;
        var data = {uid:uid, num:num};
        HttpUtil.post(api, host, port, data, function(response) {
            console.log(FUNC + "response:", response);
        });
    }
}

function updateWay(req, orderid, way, thingnum) {
    const FUNC = TAG + "updateWay() --- ";

    // 修改缓存中的订单数据
    var order = findChangeByOrderId(orderid);
    order.way = way;
    order.thingnum = thingnum;
}

function updateCard(req, orderid, card_num, card_pwd) {
    const FUNC = TAG + "updateCard() --- ";

    // 修改缓存中的订单数据
    var order = findChangeByOrderId(orderid);
    order.card_num = card_num;
    order.card_pwd = card_pwd;
}
