//调用
$(document).ready(function () {
    $("#menu_statistics").addClass("nav-expanded nav-active");
    $("#menuitem_register").addClass("nav-active");
    
    getRegisterData(function (data) {
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
    
    var new_account = [];
    for (var i = 0; i < rows.length; i++) {
        new_account.push({
            y: rows[i]['log_date'],
            a: rows[i]['new_temp_account'],
            b: rows[i]['new_nickname_account']
        });
    }
    genChartRegiterData(new_account);
}

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围查询留存率');
    
    getRegisterData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        
        $('#flot-bars-new-account').remove();
        $('#panel-new-account').append('<div class="chart chart-md" id="flot-bars-new-account"></div>');
        
        fillChart(data.data);
    }, start_date, end_date);
}

function getRegisterData(fn, start_date, end_date) {
    var dataPara = getDateRange(6, start_date, end_date);
    console.log('dataPara: ', dataPara);
    console.log('getRegisterData(): ajax请求');

    $.ajax({
        url: "../admin_api/get_register_data",
        type: "post",
        data: { data: dataPara },
        success: fn
    });
}

function genChartRegiterData(new_account) {
    //Morris: Stacked Bar
    Morris.Bar({
        resize: true,
        element: 'flot-bars-new-account',
        data: new_account,
        xkey: 'y',
        ykeys: ['b'],
        labels: ['count'],
        barColors: ['#2baab1'],
        fillOpacity: 0.7,
        smooth: false,
        stacked: true,
        hideHover: true
    });
}

