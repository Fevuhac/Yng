function setDataWater() {
    $("#btn-data-water").click(function () {
        console.log("点击按钮: 获取服务器周期");
        sendCommandPost("/admin_api/get_data_water", function (data) {
            handleResponse(data);
            showDataWater(data.data);
        });
    });
}

function showDataWater(data) {
    console.log("showDataWater()");

    $("#show-data-water").empty();

    var str_period = "普通周期";
    if (data.period > 1) {
        str_period = "出分周期";
    }
    else if (data.period < 1) {
        str_period = "吃分周期";
    }

    var info = "";
    info += "<div><b>当前周期:</b>" + data.period + "(" + str_period + ")</div>";
    info += "<div><b>当前抽水:</b>" + data.cur_extract + "</div>";
    info += "<div><b>重置周期开始时间(普通):</b>" + new Date(data.time_reset).pattern("MM-dd HH:mm:ss") + "</div>";
    info += "<div><b>特殊周期开始时间(吃分, 出分):</b>" + new Date(data.time_special).pattern("MM-dd HH:mm:ss") + "</div>";
    info += "<div><b>重置周期持续时长:</b>" + data.weight_time1 / 1000 + "s</div>";
    info += "<div><b>出分周期持续时长:</b>" + data.weight_time2 / 1000 + "s</div>";
    info += "<div><b>吃分周期持续时长:</b>" + data.weight_time3 / 1000 + "s</div>";
    $("#show-data-water").append(info);
};