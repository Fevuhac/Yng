////////////////////////////////////////////////////////////////////////////////
// 手动设置服务器系统时间
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setSystime() {
    console.log("【CALL】 setSystime");
    $("#btn-systime-set").click(function () {
        console.log("【CLICK】 btn-systime-set");
        setSystemTime(function (data) {
            handleResponse(data);
            alert("设置服务器系统时间完成");
        });
    });
}

function setSystemTime(fnSucc, fnFail) {
    var date = $("#input-systime-date").val();
    var time = $("#input-systime-time").val();

    var dataPara = {
        date: date,
        time: time,
    };

    var url = getBaseUrl() + "/admin_api/shell_time_m";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}