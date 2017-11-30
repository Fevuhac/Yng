//调用
$(document).ready(function () {
    $("#menuitem_payuser").addClass("nav-active");

    console.log("按钮配置");
    // 按钮配置
    $("#btn-get-payuser-rank").click(function() {
        console.log("click btn-get-payuser-rank");
        getPayuserRank(function(data) {
            console.log(data);
            if (data.data) {
                fillTableRank(data.data);
            }
        });
    });
    // 按钮配置
    $("#btn-get-carduser-list").click(function() {
        console.log("click btn-get-carduser-list");
        getCarduserList(function(data) {
            console.log(data);
            if (data.data) {
                fillTableCardUser(data.data);
            }
        });
    });

    getPayUserData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        console.log(data.data);
        var rows = data.data;
        
        handleData(rows);
        fillTable(rows);
        fillChart(rows);
    });
    
    setDateSelector();
});

/**
 * 付费用户表格.
 */
function fillTableRank(list) {
    console.log("list:", list);
    var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
    var td_2 = '</td>\n';
    var html = "";
    for (var i = 0; i < list.length; i++) {
        var row = "";
        row += '<tr class="query_data">\n';
        row += td_1 + list[i]['uid'] + td_2;
        row += td_1 + list[i]['cid'] + td_2;
        row += td_1 + list[i]['nickname'] + td_2;
        row += td_1 + list[i]['level'] + td_2;
        row += td_1 + list[i]['rmb'] + td_2;
        row += td_1 + 'VIP' + list[i]['vip'] + td_2;
        row += td_1 + list[i]['total_count'] + td_2;
        row += td_1 + list[i]['total_money'] + td_2;
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data-payuser-rank').replaceWith(html);
}

function getPayuserRank(fn) {
    $.ajax({
        url: "../admin_api/get_payuser_rank",
        type: "post",
        data: { data: 'get_payuser_rank' },
        success: fn
    });
}

/**
 * 月卡表格.
 */
function fillTableCardUser(list) {
    console.log("list:", list);
    var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
    var td_2 = '</td>\n';
    var html = "";
    for (var i = 0; i < list.length; i++) {
        var row = "";
        row += '<tr class="query_data">\n';
        row += td_1 + list[i]['start_date'] + td_2;
        // row += td_1 + list[i]['end_date'] + td_2;
        row += td_1 + list[i]['uid'] + td_2;
        row += td_1 + list[i]['nickname'] + td_2;
        row += td_1 + list[i]['card_type'] + td_2;
        row += td_1 + list[i]['sid'] + td_2;
        row += td_1 + list[i]['card_stat'] + td_2;
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data-carduser-list').replaceWith(html);
}

function getCarduserList(fn) {
    $.ajax({
        url: "../admin_api/get_carduser_list",
        type: "post",
        data: { data: 'get_carduser_list' },
        success: fn
    });
}

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围查询活跃用户');
    
    getPayUserData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        console.log(data.data);
        var rows = data.data;
        
        $('#flot-bars-pay-user').remove();
        $('#panel-pay-user').append('<div class="chart chart-md" id="flot-bars-pay-user"></div>');
        
        $('.query_data').remove();
        $('#query-table').append('<tr id="fake-data"></tr>');
        
        handleData(rows);
        fillTable(rows);
        fillChart(rows);
    }, start_date, end_date);
}

function getPayUserData(fn, start_date, end_date) {
    var dataPara = getDateRange(14, start_date, end_date);
    console.log('dataPara: ', dataPara);
    console.log('getRealtimeData(): ajax请求');
    $.ajax({
        url: "../admin_api/get_payuser_data",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

// 客户端生成shop_pta(付费率), shop_arpu(), shop_arrpu()
function handleData(rows) {
    for (var i = 0; i < rows.length; i++) {
        //rows[i]['shop_tpa'] = rows[i]['shop_tpa'];
        if (rows[i]['active_account'] != 0) {
            rows[i]['shop_pta'] = (rows[i]['shop_account_count'] / rows[i]['active_account'] * 100).toFixed(2) + "%";
            rows[i]['shop_arpu'] =(rows[i]['shop_tpa'] / rows[i]['active_account']).toFixed(2);
        }
        else {
            rows[i]['shop_pta'] = "0.00%";
            rows[i]['shop_arpu'] = (0.00).toFixed(2);
        }
        if (rows[i]['shop_account_count'] != 0) {
            rows[i]['shop_arrpu'] = (rows[i]['shop_tpa'] / rows[i]['shop_account_count']).toFixed(2);
        }
        else {
            rows[i]['shop_arrpu'] = (0.00).toFixed(2);
        }
    }
}

// 填充表格
function fillTable(rows) {
    console.log(rows);
    var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
    var td_2 = '</td>\n';
    var html = "";
    for (var i = 0; i < rows.length; i++) {
        var row = "";
        row += '<tr class="query_data">\n';
        row += td_1 + rows[i]['log_date'] + td_2;
        row += td_1 + rows[i]['active_account'] + td_2;
        row += td_1 + rows[i]['shop_account_count'] + td_2;
        row += td_1 + rows[i]['shop_time_count'] + td_2;
        row += td_1 + rows[i]['shop_tpa'] + td_2;
        row += td_1 + rows[i]['shop_pafft'] + td_2;
        row += td_1 + rows[i]['shop_paffd'] + td_2;
        row += td_1 + rows[i]['shop_pta'] + td_2;
        row += td_1 + rows[i]['shop_arpu'] + td_2;
        row += td_1 + rows[i]['shop_arrpu'] + td_2;
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data').replaceWith(html);
}

// 填充图表
function fillChart(rows) {
    console.log(rows);

    var new_account_data = [];
    
    for (var i = 0; i < rows.length; i++) {
        new_account_data[i] = {
            y: rows[i]['log_date'],
            a: rows[i]['active_account'],
            b: rows[i]['shop_time_count'],
            c: rows[i]['shop_account_count']
        };
    }

    // Morris: Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-pay-user',
        data: new_account_data,
        xkey: 'y',
        ykeys: ['a', 'b', 'c'],
        labels: ['活跃用户', '充值次数', '充值人数'],
        hideHover: true,
        barColors: ['#8088cc', '#0088cc', '#2baab1']
    });
}