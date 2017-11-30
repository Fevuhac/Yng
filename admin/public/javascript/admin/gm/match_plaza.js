function setPlaza() {
    console.log("setPlaza");
    $("#btn-get-plaza-info").click(function () {
        sendCommandPost("/admin_api/match_plaza_info", function (data) {
            handleResponse(data);
            showPlazaInfo(data.data);
        });
    });
}

function showPlazaInfo(data) {
    console.log("showPlazaInfo()");

    $("#show-plaza-info").empty();

    var info = "";
    info += "<div><b>总房间数:</b>" + data.size + "</div>";
    info += "<div><b>使用数:</b>" + data.used + "</div>";
    info += "<div><b>剩余数:</b>" + data.left + "</div>";
    $("#show-plaza-info").append(info);

}