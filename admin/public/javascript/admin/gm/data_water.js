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

    console.log('data:', data);
    data = JSON.parse(data);

    var str_period = "普通周期";
    if (data.pumpWater > 1) {
        str_period = "出分周期";
    }
    else if (data.pumpWater < 1) {
        str_period = "吃分周期";
    }

    var info = "";
    info += "<div><b>当前周期:</b>" + "(" + str_period + ")</div>";
    info += "<div><b>当前抽水:</b>" + data.pumpWater + "</div>";
    info += "<div><b>周期开始时间:</b>" + new Date(data.start_time).pattern("yyyy-MM-dd HH:mm:ss") + "</div>";
    info += "<div><b>周期持续时长:</b>" + data.duration / 1000 + "s</div>";
    $("#show-data-water").append(info);
};