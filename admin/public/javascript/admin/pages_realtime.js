
function getRealtimeData(fn) {
    var dataPara = { date: DateUtil.pattern(new Date(), 'yyyy-MM-dd') };
    console.log('dataPara: ', dataPara);
    console.log('getRealtimeData(): ajax请求');
    $.ajax({
        url: "../admin_api/get_realtime_data",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

function genChartNewAccount(new_account_data) {
    // Morris: Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-new-account',
        data: new_account_data,
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['昨日', '今日'],
        hideHover: true,
        barColors: ['#0088cc', '#2baab1']
    });
}

function genChartLoginCount(login_count_data) {
    // Morris: Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-login-count',
        data: login_count_data,
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['昨日', '今日'],
        hideHover: true,
        barColors: ['#0088cc', '#2baab1']
    });
}

function genChartAccountCount(account_count_data) {
    // Morris: Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-account-count',
        data: account_count_data,
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['昨日', '今日'],
        hideHover: true,
        barColors: ['#0088cc', '#2baab1']
    });
}

//调用
$(document).ready(function () {
    // 这样会有一种关闭了再打开的效果
    $("#menu_statistics").addClass("nav-expanded nav-active");
    $("#menuitem_realtime").addClass("nav-active");

    getRealtimeData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        var rows = data.data;
        //console.log(rows);
        
        var new_account_data = [];
        var login_count_data = [];
        var account_count_data = [];
        for (var i = 0; i < 24; i++) {
            new_account_data[i] = { y: '' + i, a: 0, b: 0 };
            login_count_data[i] = { y: '' + i, a: 0, b: 0 };
            account_count_data[i] = { y: '' + i, a: 0, b: 0 };
        }
        
        for (var i = 0; i < rows.length; i++) {
            var time_info = rows[i].created_at.split(' ');
            var date_info = time_info[0];
            var hour_info = Number(time_info[1]);
            console.log('日期: ' + date_info);
            console.log('时间: ' + hour_info);

            var now = DateUtil.pattern(new Date(), 'yyyy-MM-dd');
            var new_account_date = new_account_data[hour_info];
            var login_count_date = login_count_data[hour_info];
            var account_count_date = account_count_data[hour_info];

            console.log('new_account_date', new_account_date);
            console.log('login_count_date', login_count_date);
            console.log('account_count_date', account_count_date);

            if (now != date_info) {
                // prev date
                new_account_date.a = rows[i].new_account;
                login_count_date.a = rows[i].login_count;
                account_count_date.a = rows[i].account_count;
            }
            else {
                // this date
                new_account_date.b = rows[i].new_account;
                login_count_date.b = rows[i].login_count;
                account_count_date.b = rows[i].account_count;
            }
            new_account_data[hour_info] = new_account_date;
            login_count_data[hour_info] = login_count_date;
            account_count_data[hour_info] = account_count_date;
        }

        genChartNewAccount(new_account_data);
        genChartLoginCount(login_count_data);
        genChartAccountCount(account_count_data);
    });
});