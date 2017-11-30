function setRestart() {
    console.log("setRestart");
    $("#btn-restart-server-api").click(function () {
        sendCommandGet("/admin_api/shutdown", function (data) {
            handleResponse(data);
        });
    });

    $("#btn-restart-server-room").click(function () {
        sendCommandGet("/admin_api/restart_plaza", function (data) {
            handleResponse(data);
        });
    });
}