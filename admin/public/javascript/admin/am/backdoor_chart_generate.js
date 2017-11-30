////////////////////////////////////////////////////////////////////////////////
// 生成周期排行榜奖励
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setChartGenerate() {
    console.log("【CALL】 setChartGenerate");

    $("#btn-generate-daily-reward").click(function () {
        console.log("【CLICK】 btn-generate-daily-reward");
        generateDailyReward(function (data) {
            handleResponse(data);
        });
    });

    $("#btn-generate-weekly-reward").click(function () {
        console.log("【CLICK】 btn-generate-weekly-reward");
        generateWeeklyReward(function (data) {
            handleResponse(data);
        });
    });

    $("#btn-generate-monthly-reward").click(function () {
        console.log("【CLICK】 btn-generate-monthly-reward");
        generateMonthlyReward(function (data) {
            handleResponse(data);
        });
    });
}

function generateDailyReward(fnSucc, fnFail) {
    var dataPara = {
        type: 1, 
    };
    callGenerateCycleReward(dataPara, fnSucc);
}

function generateWeeklyReward(fnSucc, fnFail) {
    var dataPara = {
        type: 2, 
    };
    callGenerateCycleReward(dataPara, fnSucc);
}

function generateMonthlyReward(fnSucc, fnFail) {
    var dataPara = {
        type: 3, 
    };
    callGenerateCycleReward(dataPara, fnSucc);
}

function callGenerateCycleReward(dataPara, fnSucc) {
    var url = getBaseUrl() + "/admin_api/generate_cycle_reward";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}