////////////////////////////////////////////////////////////////////////////////
// 手动重置数据
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setReset() {
    console.log("【CALL】 setReset");
    $("#btn-reset-daily").click(function () {
        console.log("【CLICK】 btn-reset-daily");
        resetDaily(function (data) {
            handleResponse(data);
            alert("重置每日数据完成");
        });
    });
    $("#btn-reset-weekly").click(function () {
        console.log("【CLICK】 btn-reset-weekly");
        resetWeekly(function (data) {
            handleResponse(data);
            alert("重置每周数据完成");
        });
    });
}

function resetDaily(fnSucc, fnFail) {
    var id_list = $("#input-reset-account-id").val();

    var dataPara = {
        id_list: id_list,
    };

    var url = getBaseUrl() + "/admin_api/reset_daily";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function resetWeekly(fnSucc, fnFail) {
    var id_list = $("#input-reset-account-id").val();

    var dataPara = {
        id_list: id_list,
    };

    var url = getBaseUrl() + "/admin_api/reset_weekly";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}