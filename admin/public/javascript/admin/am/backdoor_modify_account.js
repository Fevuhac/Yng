////////////////////////////////////////////////////////////////////////////////
// 修改玩家数据
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setModifyAccount() {
    console.log("【CALL】 setModifyAccount");
    $("#btn-modify-udata").click(function () {
        console.log("【CLICK】 btn-modify-udata");
        modifyAccount(function (data) {
            handleResponse(data);
        });
    });
}

function modifyAccount(fnSucc, fnFail) {
    var uid = $("#input-modify-uid").val();
    var field = $("#input-modify-field").val();
    var value = $("#input-modify-value").val();
    
    var dataPara = {
        uid: uid, 
        field: field, 
        value: value, 
    };
    var url = getBaseUrl() + "/admin_api/modify_udata";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}