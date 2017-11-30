////////////////////////////////////////////////////////////////////////////////
// 获取内存中玩家数据, 修改玩家数据
////////////////////////////////////////////////////////////////////////////////

var ca_data = null;

// 初始化, 绑定按钮事件
function setKick() {
    console.log("【CALL】 setKick");
    $('#btn-kick').click(function () {
        console.log("【CLICK】 btn-btn-kick");
        kickUser(function (data) {
            handleResponse(data);
        });
    });
}

function kickUser(fnSucc, fnFail) {
    var uid_list = $("#input-kick-uid").val();
    
    var dataPara = {
        uid_list: uid_list, 
    };
    var url = getBaseUrl() + "/admin_api/kick_user";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

