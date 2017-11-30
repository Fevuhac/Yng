function setMail() {
    $("#btn-set-mail").click(function () {
        sendMail(function (data) {
            handleResponse(data);
            if (data.err) {
                var err_msg = "[CODE]" + data.err.code + "\n[MSG]" + data.err.msg;
                alert(err_msg);
            }
        });
    });

    $("#btn-clear-mail").click(function () {
        clearMail(function (data) {
            handleResponse(data);
        });
    });
}

function sendMail(fnSucc, fnFail) {
    var title = $("#input-mail-title").val();
    var content = $("#input-mail-content").val();
    var reward = $("#input-mail-reward").val();
    var type = $("#input-mail-type").val();
    var player_list = $("#input-player-list").val();

    var dataPara = {
        title: title, 
        content: content,
        reward: reward,
        type: type,
        player_list: player_list
    };
    var url = getBaseUrl() + "/admin_api/send_mail";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function clearMail(fnSucc, fnFail) {

    var dataPara = {};
    var url = getBaseUrl() + "/admin_api/clear_mail";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}
