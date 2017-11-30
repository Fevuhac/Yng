function setBroadcastServer(fnSucc, fnFail) {
    console.log('setBroadcastServer(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/set_broadcast";
    var txt = $("#input-broadcast-txt").val();
    var times = $("#input-broadcast-times").val();
    var dataPara = { type: 1, content: { txt : txt, times : times } };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function getBroadcast(fnSucc, fnFail) {
    console.log('getBroadcast(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/get_broadcast";
    var dataPara = { server: 0, gameevent: 0, famousonline: 0, draw: 0 };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function setBroadcast() {
    console.log('setBroadcast()');
    
    getBroadcast(function (data) {
        if (data.data) {
            console.log(data.data);

            var broadcastServer = data.data.server;
            var broadcastGameEvent = data.data.gameevent;
            var broadcastFamousonline = data.data.famousonline;

            if (broadcastServer) {
                $("#input-broadcast-txt").val(broadcastServer.content.txt);
                $("#input-broadcast-times").val(broadcastServer.content.times);
            }
        }
    });
    
    $("#btn-set-broadcast").click(function () {
        console.log('点击"设置公告"');
        setBroadcastServer(function (data) {
            handleResponse(data);
        });
    });
}

//function handleResponse(data) {
//    console.log(data.msg);
//    if (data.err) {
//        console.log(data.err);
//        return;
//    }
//    if (data.data) {
//        console.log(data.data);
//        return;
//    }
//}