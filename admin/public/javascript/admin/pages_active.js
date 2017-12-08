//调用
$(document).ready(function () {
    $("#menu_statistics").addClass("nav-expanded nav-active");
    $("#menuitem_active").addClass("nav-active");
    
    getActiveData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        fillChart(data.data);
    });
    
    setDateSelector();
});

function fillChart(rows) {
    console.log(rows);
    
    var log_count = [];
    for (var i = 0; i < rows.length; i++) {
        log_count.push({
            y: rows[i]['log_date'],
            a: rows[i]['temp_login'],
            b: rows[i]['nickname_login']
        });
    }
    genChartLogCountData(log_count);
    
    var account_count = [];
    for (var i = 0; i < rows.length; i++) {
        account_count.push({
            y: rows[i]['log_date'],
            a: rows[i]['temp_count'],
            b: rows[i]['nickname_count']
        });
    }
    genChartAccountCountData(account_count);
}

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围查询活跃用户');
    
    getActiveData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        
        $('#flot-bars-log-count').remove();
        $('#panel-log-count').append('<div class="chart chart-md" id="flot-bars-log-count"></div>');
        
        $('#flot-bars-account-count').remove();
        $('#panel-account-count').append('<div class="chart chart-md" id="flot-bars-account-count"></div>');
        
        fillChart(data.data);
    }, start_date, end_date);
}

function getActiveData(fn, start_date, end_date) {
    var dataPara = getDateRange(6, start_date, end_date);
    console.log('dataPara: ', dataPara);
    console.log('getRegisterData(): ajax请求');
    
    $.ajax({
        url: "../admin_api/get_active_data",
        type: "post",
        data: { data: dataPara },
        success: fn
    });
}

function genChartLogCountData(new_account) {
    //Morris: Stacked Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-log-count',
        data: new_account,
        xkey: 'y',
        ykeys: ['a'],
        labels: ['login'],
        hideHover: true,
        stacked: true,
        barColors: ['#0088cc']
    });
}

function genChartAccountCountData(account_count) {
    // Morris: Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-account-count',
        data: account_count,
        xkey: 'y',
        ykeys: ['a'],
        labels: ['player'],
        hideHover: true,
        stacked: true,
        barColors: ['#0088cc']
    });
}

