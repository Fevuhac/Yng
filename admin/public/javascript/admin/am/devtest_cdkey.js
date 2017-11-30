function useCdKey(fnSucc, fnFail) {
    console.log('getBroadcast(): ajax请求');
    
    var url = getBaseUrl() + "/data_api/use_cdkey";
    var token = $("#input-account-token").val();
    var cdkey = $("#input-use-cdkey").val();
    var dataPara = { token: token, cdkey: cdkey };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

//调用
function setCDKey() {
    
    $("#btn-use-cdkey").click(function () {
        console.log('点击"使用"');
        useCdKey(function (data) {
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