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
exports.get_order_list = get_order_list;
exports.get_data = get_data;
exports.get_paylog = get_paylog;
exports.query_pay = query_pay;
exports.get_user_pay_data = get_user_pay_data;
exports.get_carduser_list = get_carduser_list;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function get_order_list(req, res) {
    req.dao.getOrderList(admin_common.getDataObj(req), function (err, rows) {
        console.log("getOrderList complete...");
        admin_common.response('获取付费玩家数据', res, err, rows);
    });
}

function get_data(req, res) {
    req.dao.getPayUserData(admin_common.getDataObj(req), function (err, rows) {
        console.log("getPayUserData complete...");
        admin_common.response('获取付费玩家数据', res, err, rows);
    });
}

function get_user_pay_data(req, res) {
    req.dao.getUserPayData(function (err, rows) {
        console.log("getUserPayData complete...");
        admin_common.response('获取月卡玩家数据(按玩家分组)', res, err, rows);
    });
}

function get_carduser_list(req, res) {
    
    req.dao.getCardUserList(function (err, rows) {
        console.log("rows:", rows);
        if (rows && rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var account = rows[i];
                var card = account.card;
                var get_card = account.get_card;
                if (card) {
                    card = JSON.parse(card);
                    account.card_type = 0;
                    if (card.normal) {
                        account.card_type += 1;
                        account.start_date1 = card.normal.start_date;
                    }
                    if (card.senior) {
                        account.card_type += 2;
                        account.start_date2 = card.senior.start_date;
                    }
                    switch(account.card_type) {
                        case 0:
                            account.card_type = "没有月卡";
                        break;
                        case 1:
                            account.card_type = "普通月卡";
                            account.start_date = account.start_date1;
                        break;
                        case 2:
                            account.card_type = "土豪月卡";
                            account.start_date = account.start_date2;
                        break;
                        case 3:
                            account.card_type = "两张月卡";
                            account.start_date = account.start_date1 + "|"+ account.start_date2;
                        break;
                    }
                }
                if (get_card) {
                    get_card = JSON.parse(get_card);
                    if (get_card.normal || get_card.senior) {
                        account.card_stat = "已领取";
                    }
                    else {
                        account.card_stat = "未领取";
                    }
                }
                rows[i] = account;
            }
        }
        console.log("getCardUserList complete...");
        console.log("rows:", rows);
        admin_common.response('获取付费玩家数据(按玩家分组)', res, err, rows);
    });
}

function get_paylog(req, res) {
    req.dao.getPayLogData(admin_common.getDataObj(req), function (err, rows) {
        console.log("getPayLogData complete...");
        admin_common.response('获取支付流水', res, err, rows);
    });
}

function query_pay(req, res) {
    req.dao.getQueryPay(admin_common.getDataObj(req), function (err, rows) {
        console.log("getQueryPay complete...");
        admin_common.response('查询订单详情', res, err, rows);
    });
}


//==============================================================================
// private
//==============================================================================
