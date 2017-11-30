//调用
$(document).ready(function () {
    $("#menuitem_log").addClass("nav-active");
    
    $('#pay_stat').hide();

    getPayLogData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        console.log(data.data);
        var rows = data.data;

        fillTable(rows);
    });

    setBtns();
    setDateSelector();
});

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围查询流水');

    getPayLogData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        console.log(data.data);
        var rows = data.data;
        
        // TODO: 去掉流水中原有的数据(tr)
        $('.log-data').remove();
        $('#log-table').append('<tr id="fake-data"></tr>');

        fillTable(rows);
    }, start_date, end_date);
}

//==============================================================================
// 查询处理
//==============================================================================

var query_account_id_results = [];

// 设置按订单号和用户ID查询的功能
function setBtns() {
    $('#btn-query-goid').click(function () {
        console.log('点击"查询订单号"');

        _clickBtnQueryOrderId(function (data) {
            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            var html = _fillQueryOrderIdResult(data.data);
            $('#qgoi-result').replaceWith(html);
            $('#qgai-result').replaceWith('<div id="qgai-result"></div>');
        });
    });

    $('#btn-query-gaid').click(function () {
        console.log('点击"查询账户ID"');

        _clickBtnQueryAccountId(function (data) {
            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            query_account_id_results = data.data;
            var html = _fillQueryAccountIdResult(data.data);
            $('#qgai-result').replaceWith(html);
            $('#qgoi-result').replaceWith('<div id="qgoi-result"></div>');
        });
    });
}

function _clickBtnQueryOrderId(fnSuccess, fnFail) {
    console.log('_clickBtnQueryOrderId(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-game-order-id"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/query_pay";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function _clickBtnQueryAccountId(fnSuccess, fnFail) {
    console.log('_clickBtnQueryAccountId(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-game-account-id"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/query_pay";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function _fillQueryOrderIdResult(rows) {
    return _showOrderDetail(rows[0], "qgoi-result", 12);
}

function _showOrderDetail(order_data, id, width) {
    var td_1 = '<tr><td>';
    var td_2 = '</td></tr>\n';

    var row = "";
    row += '<div id="' + id + '" class="col-md-' + width + '">\n';
    row += '<table style="width: 100%;" class="table-striped table-bordered">\n';
    row += td_1 + "支付日期</td><td>" + order_data['created_at'] + td_2;
    row += td_1 + "支付渠道</td><td>" + order_data['channel'] + td_2;
    row += td_1 + "游戏账号ID</td><td>" + order_data['game_account_id'] + td_2;
    row += td_1 + "渠道账号ID</td><td>" + order_data['channel_account_id'] + td_2;
    row += td_1 + "游戏订单ID</td><td>" + order_data['game_order_id'] + td_2;
    row += td_1 + "渠道订单ID</td><td>" + order_data['channel_order_id'] + td_2;
    row += td_1 + "商品ID</td><td>" + order_data['goods_id'] + td_2;
    row += td_1 + "价格(元)</td><td>" + order_data['money'] + td_2;
    row += '</table>\n';
    row += '</div>\n';
    return row;
}

function _fillQueryAccountIdResult(rows) {
    var td_1 = '<td>';
    var td_2 = '</td>\n';
    var html = "";
    html += '<div id="qgai-result">\n';

    html += '<div class="col-md-6">\n';
    html += '<table style="width: 100%;" class="table-striped table-bordered">\n';
    html += "<tr>";
    html += "<th>支付日期</th>";
    html += "<th>支付渠道</th>";
    html += "<th>游戏订单ID</th>";
    html += "</tr>";
    for (var i = 0; i < rows.length; i++) {
        var row = '';
        row += '<tr id="order_' + i + '" onclick="clickOrder(' + i + ')">';
        row += td_1 + rows[i]['created_at'] + td_2;
        row += td_1 + rows[i]['channel'] + td_2;
        row += td_1 + rows[i]['game_order_id'] + td_2;
        row += '</tr>';
        html += row;
    }
    html += '</table>\n';
    html += '</div>\n';

    html += '<div id="qgai-detail" class="col-md-6">\n';
    html += '</div>\n';

    html += '</div>\n';
    return html;
}

function clickOrder(orderIdx) {
    console.log("orderIdx: " + orderIdx);
    var html = _showOrderDetail(query_account_id_results[orderIdx], "qgai-detail", 6);
    $('#qgai-detail').replaceWith(html);
}
//==============================================================================

function getPayLogData(fn, start_date, end_date) {
    // 默认获取的流水天数
    var default_log_days = 2;
    var dataPara = getDateRange(default_log_days, start_date, end_date);
    console.log('dataPara: ', dataPara);
    console.log('getRealtimeData(): ajax请求');
    $.ajax({
        url: "../admin_api/get_paylog_data",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

Date.prototype.format = function(format) {
    var date = {
       "M+": this.getMonth() + 1,
       "d+": this.getDate(),
       "h+": this.getHours(),
       "m+": this.getMinutes(),
       "s+": this.getSeconds(),
       "q+": Math.floor((this.getMonth() + 3) / 3),
       "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
       format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
       if (new RegExp("(" + k + ")").test(format)) {
           format = format.replace(RegExp.$1, RegExp.$1.length == 1
              ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
       }
    }
    return format;
}

// 填充表格
function fillTable(rows) {
    console.log(rows);
    var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
    var td_2 = '</td>\n';
    var html = "";
    var sum = 0;
    for (var i = 0; i < rows.length; i++) {
        var row = "";
        row += '<tr class="log-data">\n';
        //row += td_1 + new Date(rows[i]['created_at']).format("yyyy-MM-dd hh:mh:ss") + td_2;
        row += td_1 + rows[i]['created_at'] + td_2;
        row += td_1 + rows[i]['channel'] + td_2;
        row += td_1 + rows[i]['game_account_id'] + td_2;
        row += td_1 + rows[i]['channel_account_id'] + td_2;
        row += td_1 + rows[i]['game_order_id'] + td_2;
        row += td_1 + rows[i]['channel_order_id'] + td_2;
        row += td_1 + rows[i]['goods_id'] + td_2;
        row += td_1 + rows[i]['money'] + td_2;
        row += '</tr>\n';
        html += row;
        sum += rows[i]['money'];
    }
    $('#fake-data').replaceWith(html);
    $('#pay_sum').html((sum/10) + "元");
    $('#pay_user_count').html(rows.length);
    $('#pay_stat').show();
}