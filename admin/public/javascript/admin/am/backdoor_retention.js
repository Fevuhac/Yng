////////////////////////////////////////////////////////////////////////////////
// 手动生成留存数据
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setRetention() {
    console.log("【CALL】 setRetention");
    $("#btn-retention").click(function () {
        console.log("【CLICK】 btn-retention");
        genRetention(function (data) {
            handleResponse(data);
            alert("生成留存数据完成");
        });
    });
}

function genRetention(fnSucc, fnFail) {
    var start_date = $("#input-retention-start-date").val();
    var end_date = $("#input-retention-end-date").val();

    var dataPara = {
        start_date: start_date,
        end_date: end_date,
    };

    var url = getBaseUrl() + "/admin_api/generate_retention";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}