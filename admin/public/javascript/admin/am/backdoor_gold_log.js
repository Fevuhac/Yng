////////////////////////////////////////////////////////////////////////////////
// 获取服务器缓存中的金币记录
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setGoldLog() {
    console.log("【CALL】 setGoldLog");
    $("#btn-gold-log").click(function () {
        console.log("【CLICK】 btn-gold-log");
        getGoldLog(function (data) {
            handleResponse(data);
        });
    });
}

function getGoldLog(fnSucc, fnFail) {
    var account_id = $("#input-gl-account-id").val();
    
    var dataPara = {
        account_id: account_id, 
    };
    var url = getBaseUrl() + "/admin_api/get_gl";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}