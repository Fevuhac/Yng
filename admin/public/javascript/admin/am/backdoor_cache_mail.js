////////////////////////////////////////////////////////////////////////////////
// 获取内存中邮件数据
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setCacheMail() {
    console.log("【CALL】 setCacheMail");
    $("#btn-get-cm").click(function () {
        console.log("【CLICK】 btn-get-cm");
        getCacheMail(function (data) {
            handleResponse(data);
        });
    });
}

function getCacheMail(fnSucc, fnFail) {
    var min = $("#input-min-mail-id").val();
    var max = $("#input-max-mail-id").val();
    
    var dataPara = {
        min: min, 
        max: max,
    };
    var url = getBaseUrl() + "/admin_api/get_cm";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}