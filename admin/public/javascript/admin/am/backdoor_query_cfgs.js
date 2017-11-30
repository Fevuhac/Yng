////////////////////////////////////////////////////////////////////////////////
// 获取服务器的配置表
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setQueryCfgs() {
    console.log("【CALL】 setQueryCfgs");
    $("#btn-guery-cfgs").click(function () {
        console.log("【CLICK】 btn-guery-cfgs");
        queryCfgs(function (data) {
            handleResponse(data);
        });
    });
}

function queryCfgs(fnSucc, fnFail) {
    var cfg_name = $("#input-cfg-name").val();
    
    var dataPara = {
        cfg_name: cfg_name, 
    };
    var url = getBaseUrl() + "/admin_api/query_cfgs";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}