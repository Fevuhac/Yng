////////////////////////////////////////////////////////////////////////////////
// 重启服务器按钮初始化
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setRestart() {
    console.log("【CALL】 setRestart");

    $("#btn-restart-server-balance").click(function () {
        console.log("【CLICK】 btn-restart-server-balance");
        restartServerBalance(function (data) {
            handleResponse(data);
            alert("重启负载均衡服完成");
        });
    });

    $("#btn-restart-server-api").click(function () {
        console.log("【CLICK】 btn-restart-server-api");
        restartServerApi(function (data) {
            handleResponse(data);
            alert("重启API服务器完成");
        });
    });

    $("#btn-restart-server-room").click(function () {
        console.log("【CLICK】 btn-restart-server-room");
        restartServerRoom(function (data) {
            handleResponse(data);
            alert("重启房间服务器完成");
        });
    });
}

function restartServerBalance(success, fail) {
    // var url = "http://localhost:1338/admin_api/shutdown_by_update";
    var url = ADDRESS.BALANCE + "admin_api/shutdown_by_update";
    var data = {};
    sendPost(url, data, function (data) {
        handleResponse(data);
    });
}

function restartServerApi(success, fail) {

}

function restartServerRoom(success, fail) {

}