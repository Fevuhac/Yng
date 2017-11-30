//调用
function setActive() {
    
    $("#btn-show-me-activity-quest").click(function () {
        console.log('点击"获取活动任务"');
        showMeActivity(1, function (data) {
            handleResponse(data);
            showActiveInfo(data, 'quest');
        });
    });
    
    $("#btn-show-me-activity-charge").click(function () {
        console.log('点击"获取充值回馈"');
        showMeActivity(2, function (data) {
            handleResponse(data);
            showActiveInfo(data, 'charge');
        });
    });
    
    $("#btn-show-me-activity-exchange").click(function () {
        console.log('点击"获取限时兑换"');
        showMeActivity(3, function (data) {
            handleResponse(data);
            showActiveInfo(data, 'exchange');
        });
    });

    $("#btn-update-active").click(function () {
        console.log('点击"更新"');
        updateActive(function (data) {
            handleResponse(data);
        });
    });
}

function showMeActivity(type, fnSucc, fnFail) {
    console.log('showMeActivity(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/show_me_activity";
    var token = $("#input-account-token").val();
    var dataPara = { token: token, type: type };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function updateActive(fnSucc, fnFail) {
    console.log('updateActive(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/update_account";
    var token = $("#input-account-token").val();
    var data = $("#input-update-active").val();
    var dataPara = { token: token, active: data, type: 21 };

    console.log('dataPara:', dataPara);
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}



function showActiveInfo(data, type) {
    var active_data = data.data;
    $("#active-info").text(JSON.stringify(active_data));
    
    $("#active-table").remove();
    var table = '';
    table += '<table style = "width: 100%;" class="table-bordered" id="active-table">';
    
    var title = ["任务ID", "活动ID", "任务条件", "任务小类", "进度", "目标", "是否领取"];
    var keys = ["id", "activeid", "condition", "value1", "cur", "value2", "is_got"];
    table += '<tr>';
    for (var col = 0; col < title.length; col++) {
        table += '<th>';
        table += title[col];
        table += '</th>';
    }
    table += '</tr>';

    for (var row = 0; row < active_data[type].length; row++) {
        var one_active = active_data[type][row];
        
        table += '<tr>';
        for (var col = 0; col < keys.length; col++) {
            table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
            table += one_active[keys[col]];
            table += '</td>';
        }
        table += '</tr>';
    }
    table += '</table>';
    $("#active-list").append(table);
}