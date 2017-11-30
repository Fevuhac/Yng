function setRanking() {
    console.log('setRanking()');
    $("#btn-get-ranking").click(function () {
        console.log('点击"获取排名"');
        getCharts(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                alert(data.err);
                return;
            }
            console.log(data.data);
        });
    });
}

function getCharts(fnSuccess, fnFail) {
    console.log('getCharts(): ajax请求');
    
    var dataPara = getFormJsonRanking();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/get_ranking";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function getFormJsonRanking() {
    console.log('getFormJsonRanking()');
    return HttpUtil.getFormJson([
        "#input-account-id",
        "#input-account-token",
        "#input-ranking-count"
    ]);
}