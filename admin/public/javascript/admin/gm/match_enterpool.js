function setEnterPool() {
    console.log("setEnterPool");
    $("#btn-get-enterpool-info").click(function () {
        sendCommandPost("/admin_api/match_enterpool_info", function (data) {
            handleResponse(data);
            showEnterpoolInfo(data.data);
        });
    });
}

function showEnterpoolInfo(data) {
    console.log("showEnterpoolInfo()");

    $("#show-enterpool-info").empty();

    var info = "";
    info += "<div><b>进入报名池的玩家</b></div>";
    info += "<div><b>缓存进入房间玩家数据</b></div>";
    for (var idx in data.player_in_room) {
        var player = data.player_in_room[idx];
        info += "<div>";
        info += "玩家";
        info += "ID:" + idx + ", ";
        // info += "昵称:" + player.nickname + ", ";
        info += player.plazaId + "号广场, ";
        info += player.roomId + "号房间, ";
        info += "进入时间:" + DateUtil.pattern(new Date(player.time), 'yyyy-MM-dd hh:mm:ss') + "</div>";
    }
    $("#show-enterpool-info").append(info);
}
