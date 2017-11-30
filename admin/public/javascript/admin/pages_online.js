
function getOnlineStatus(fn) {
    // var dataPara = { date: DateUtil.pattern(new Date(), 'yyyy-MM-dd') };
    // var dataPara = {
    //     start_time: '2017-09-06 00:00:00',
    //     end_time: '2017-09-06 01:00:00',
    // };
    var dataPara = {
        start_time: DateUtil.getLastHourStart(),
        end_time: DateUtil.getLastHourEnd(),
    };
    console.log('dataPara: ', dataPara);
    console.log('getOnlineStatus(): ajax请求');
    $.ajax({
        url: "../admin_api/get_online_status",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

function genChartAll(rows) {
    // Morris: Bar
    Morris.Line({
        resize: true,
        element: 'flot-bars-online-minute',
        data: rows,
        xkey: 'time',
        ykeys: ['online_count', 'link_count'],
        labels: ['在线人数', '一分钟连接数'],
        hideHover: true,
        barColors: ['#0088cc', '#2baab1']
    });
}

//调用
$(document).ready(function () {
    // 这样会有一种关闭了再打开的效果
    $("#menu_statistics").addClass("nav-expanded nav-active");
    $("#menuitem_online").addClass("nav-active");

    getOnlineStatus(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        var rows = data.data;
        console.log(rows);

        // 处理不同服务器的数据
        var server_list = {};
        for (var i = 0; i < rows.length; i++) {
            var link_data = rows[i];
            var sid = link_data.sid;
            console.log(sid);
            if (!server_list["" + sid]) {
                server_list["" + sid] = [];
            }
            server_list["" + sid].push(link_data);
        }
        console.log(server_list);

        for (var sid in server_list) {
            var serverX_data = server_list["" + sid];
            for (var i = 0; i < serverX_data.length; i++) {
                serverX_data[i].time = i;
            }
        }
        console.log(server_list);

        genChartAll(server_list[0]);
    });
});