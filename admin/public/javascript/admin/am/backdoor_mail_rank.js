////////////////////////////////////////////////////////////////////////////////
// 补发排行榜邮件
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setMailRank() {
    console.log("【CALL】 setMailRank");
    $("#btn-mail-rank").click(function () {
        console.log("【CLICK】 btn-mail-rank");
        mailCharts(function (data) {
            handleResponse(data);
            alert("补发排行奖励完成");
        });
    });
}

function mailCharts(fnSucc, fnFail) {
    var dataPara = {};
    var url = getBaseUrl() + "/admin_api/mail_rank";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}