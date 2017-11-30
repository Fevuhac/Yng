function setMsgBoard() {
    console.log("setMsgBoard()");
    $("#btn-send-msg").click(function () {
        sendMsg(function (data) {
            handleResponse(data);
        });
    });
    $("#btn-query-msg").click(function () {
        queryMsg(function (data) {
            handleResponse(data);
        });
    });
    $("#btn-del-msg").click(function () {
        delMsg(function (data) {
            handleResponse(data);
        });
    });
}

function sendMsg(fnSucc, fnFail) {
    var token = $("#input-account-token").val();
    var text = $("#input-msg-text").val();

    var dataPara = {
        token: token, 
        text: text,
    };
    var url = getBaseUrl() + "/data_api/player_propose";
    console.log("url:", url);
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function queryMsg(fnSucc, fnFail) {
    var token = $("#input-account-token").val();
    var timestamp = new Date().getTime();
    var count = $("#input-msg-query-count").val();
    var hot4 = $("#input-msg-need-hot4").val();

    var dataPara = {
        token: token, 
        timestamp: timestamp,
        count: count,
        hot4: hot4,
    };
    var url = getBaseUrl() + "/data_api/query_msgboard";
    console.log("url:", url);
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function delMsg(fnSucc, fnFail) {
    var token = $("#input-account-token").val();
    var mid = $("#input-msg-del-mid").val();

    var dataPara = {
        token: token, 
        mid: mid,
    };
    var url = getBaseUrl() + "/data_api/del_msgboard";
    console.log("url:", url);
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}
