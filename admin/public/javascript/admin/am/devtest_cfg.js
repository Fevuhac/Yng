function getCfgList(fn, fnFail) {
    console.log('getCfgList(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/get_cfg_list";

    $.ajax({
        url: url,
        type: "get",
        data: {},
        success: fn
    });
}

function getCfgFile(fn, fnFail) {
    console.log('getCfgFile(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/get_cfg_file";
    var path = $("#select-file-path").val();
    var dataPara = { path : path };

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

function setBroadcast(fnSucc, fnFail) {
    console.log('getBroadcast(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/set_broadcast";
    var type = parseInt($("#input-broadcast-type").val());
    var txt = $("#input-broadcast-txt").val();
    var times = parseInt($("#input-broadcast-times").val());
    var token = $("#input-account-token").val();
    console.log("token: ", token);
    var dataPara = { type : type, token: token, content : { txt : txt, times : times }};
    
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
    var token = $("#input-account-token").val();
    var dataPara = { token:token, server: 1488340399131, gameevent: 0, famousonline: 0, platform: 1 };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

//调用
function setCfg() {
    $("#btn-get-cfg-list").click(function () {
        console.log('点击"拉取配置版本表"');
        getCfgList(function (data) {
            console.log(data.msg);
            //alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                var html_option = "";
                // DONE: 在selector中配置所有的文件
                for (var path in data.data) {
                    $("#select-file-path").append("<option>" + path + "</option>");
                }
                return;
            }
        });
    });

    $("#btn-get-cfg-file").click(function () {
        console.log('点击"拉取配置文件"');
        getCfgFile(function (data) {
            handleResponse(data);
        });
    });
    
    $("#btn-set-broadcast").click(function () {
        console.log('点击"设置公告"');
        setBroadcast(function (data) {
            handleResponse(data);
        });
    });
    
    $("#btn-get-broadcast").click(function () {
        console.log('点击"获取公告"');
        getBroadcast(function (data) {
            handleResponse(data);
        });
    });
}

function handleResponse(data) {
    console.log(data.msg);
    if (data.err) {
        console.log(data.err);
        return;
    }
    if (data.data) {
        console.log(data.data);
        console.log(JSON.stringify(data.data));
        return;
    }
}