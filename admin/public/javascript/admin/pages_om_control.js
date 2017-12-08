const QUERY_INTERVAL = 60000;
const CHANGE_RATE_TYPE = {
    JACKPOT:1,
    PLAYER:2,
};
const PROFIT_TYPE = {
    PROFIT:1,
    LOSS:2,
};
var time = new Date().getTime();
//调用
$(document).ready(function () {
    $("#menu_operation").addClass("nav-expanded nav-active");
    $("#menuitem_om_control").addClass("nav-active");

    // 进入时查询, 然后定时查询修改数据
    queryJackpot();

    setInterval(function() {
        var cur = new Date().getTime();
        var left = Math.round((QUERY_INTERVAL - (cur - time)) / 1000);
        $('.refresh_jackpot b').text( left );
    }, 1000);

    setInterval(function() {
        queryJackpot();

    }, QUERY_INTERVAL);

    $('#btn_refresh_jackpot').click(function() {
        queryJackpot();
    });

    $('#btn_query_player').click(function() {
        queryPlayer();
    });

    $('#listenSliderJackpot').change(function() {
        $('.output_jackpot b').text( this.value );
    });

    $('#listenSliderPlayer').change(function() {
        $('.output_player b').text( this.value );
    });

    $('#btn_change_rate_jackpot').click(function() {
        changeRate(CHANGE_RATE_TYPE.JACKPOT);
    });

    $('#btn_change_rate_player').click(function() {
        changeRate(CHANGE_RATE_TYPE.PLAYER);
    });

    $('#btn_query_profit').click(function() {
        queryProfit();
    });

    $('#btn_query_loss').click(function() {
        queryLoss();
    });

});

function changeRate(type) {
    console.log('call changeRate()');

    var params = {type:type};
    if (CHANGE_RATE_TYPE.PLAYER == type) {
        var uid = _getUid();
        if (!uid) return;
        params.uid = uid;
        params.rate = $('.output_player b').text();
        params.personalGpctOut = _getPersonalGpctOut();
    }
    else if (CHANGE_RATE_TYPE.JACKPOT == type) {
        params.rate = $('.output_jackpot b').text();
        params.globalGpctOut = _getGlobalGpctOut();
    }
    console.log(params);

    $.ajax({
        url: getBaseUrl() + "/admin_api/change_rate",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
    }
}

/**
 * 获取全服捕获率修正过期参数
 */
function _getGlobalGpctOut() {
    var timeout = $('#input-timeout').val();
    if (!timeout) {
        alert('请输入合适的正数');
        return 0;
    }
    return timeout;
}

/**
 * 获取个人捕获率修正过期参数
 */
function _getPersonalGpctOut() {
    var gold = $('#input-gold').val();
    if (!gold) {
        alert('请输入非0整数');
        return 0;
    }
    return gold;
}


function _getUid() {
    var uid = $('#input-uid').val();
    if (uid.length == 0 || isNaN(parseInt(uid))) {
        alert('请输入数字类型的用户ID');
        return false;
    }
    return parseInt(uid);
}

function queryJackpot() {
    time = new Date().getTime();
    console.log('call queryJackpot()');

    var params = {};
    $.ajax({
        url: getBaseUrl() + "/admin_api/query_jackpot",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
        var data = res.data;
        $("#recharge b").replaceWith('<b>' + data.recharge + '</b>');
        $("#cash b").replaceWith('<b>' + data.cash + '</b>');
        $("#totalGold b").replaceWith('<b>' + data.totalGold + '</b>');
        $("#give b").replaceWith('<b>' + data.give + '</b>');
        $("#bonusPool b").replaceWith('<b>' + data.bonusPool + '</b>');
        $("#pump b").replaceWith('<b>' + data.pump + '</b>');
        if (data.globalGpctOut > 0) {
            $("#input-timeout").val(data.globalGpctOut);
        }else{
            $("#input-timeout").val(0);
        }

        var warning = data.warning;
        if (data.warning < 0.95) {
            warning = '<font color="red">' + warning + '</font>';
        }
        else if (data.warning >= 0.95 && data.warning < 1) {
            warning = '<font color="orange">' + warning + '</font>';
        }
        $("#warning b").replaceWith('<b>' + warning + '</b>');

        var rate = data.platformCatchRate * 100;
        $('.output_jackpot b').text( rate );
        // 修改滑块进度的正确方法
        var sliderLength = rate - 50;
        $('#containerSliderJackpot .ui-slider-handle').css('left',''+sliderLength+'%');

        if (data.warning < 1) {
            setTimeout(function() {
                let warnInfo = {
                    title: data.warning_title,
                    text: data.warning_msg,
                }
                if (data.warning < 0.95) {
                    warnInfo.type = 'error';
                }
                new PNotify(warnInfo);
            }, 50);
        }
    }
}

/** 玩家数据仅在点击按钮时查询 */
function queryPlayer() {
    // 获取查询uid
    var uid = _getUid();
    if (!uid) return;

    var params = {uid:uid};
    $.ajax({
        url: getBaseUrl() + "/admin_api/query_player",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
        var data = res.data;
        $("#nickname b").replaceWith('<b>' + data.nickname + '</b>');
        $("#playerRecharge b").replaceWith('<b>' + data.recharge + '</b>');
        $("#playerCash b").replaceWith('<b>' + data.cash + '</b>');
        $("#gold b").replaceWith('<b>' + data.gold + '</b>');

        // var profit = data.cash + data.gold - data.recharge;
        $("#profit b").replaceWith('<b>' + data.gain_loss + '</b>');

        var rate = data.player_catch_rate * 100;
        $('.output_player b').text( rate );

        // 修改滑块进度的正确方法
        var sliderLength = rate - 50;
        $('#containerSliderPlayer .ui-slider-handle').css('left',''+sliderLength+'%');
    }
}

function queryProfit() {
    queryProfitOrLoss(PROFIT_TYPE.PROFIT, succ);
    function succ(res) {
        var data = res.data;
        console.log(data);
        var html = "";
        html += '<tr id="placeHolderProfit"></tr>';
        for (let i = 0; i < data.length; i++) {
            var td1 = '<td style="border: solid thin #000000" class="cell-padding cell-align-center">';
            var td2 = '</td>';
            html += '<tr class="removeOldProfit">';
            html += td1 + data[i].uid + td2;
            html += td1 + data[i].nickname + td2;
            html += td1 + data[i].recharge + td2;
            html += td1 + data[i].cash + td2;
            html += td1 + data[i].gold + td2;
            html += td1 + data[i].profit + td2;
            html += td1 + data[i].player_catch_rate + td2;
            html += '</tr>';
        }
        $(".removeOldProfit").remove();
        $("#placeHolderProfit").replaceWith(html);
    }
}

function queryLoss() {
    queryProfitOrLoss(PROFIT_TYPE.LOSS, succ);
    function succ(res) {
        console.log(res);
        var data = res.data;
        var html = "";
        html += '<tr id="placeHolderLoss"></tr>';
        for (let i = 0; i < data.length; i++) {
            var td1 = '<td style="border: solid thin #000000" class="cell-padding cell-align-center">';
            var td2 = '</td>';
            html += '<tr class="removeOldLoss">';
            html += td1 + data[i].uid + td2;
            html += td1 + data[i].nickname + td2;
            html += td1 + data[i].recharge + td2;
            html += td1 + data[i].cash + td2;
            html += td1 + data[i].gold + td2;
            html += td1 + data[i].profit + td2;
            html += td1 + data[i].player_catch_rate + td2;
            html += '</tr>';
        }
        $(".removeOldLoss").remove();
        $("#placeHolderLoss").replaceWith(html);
    }
}

function queryProfitOrLoss(type, succ) {
    var params = {type:type};
    $.ajax({
        url: getBaseUrl() + "/admin_api/query_profit",
        type: "post",
        data: { data: params },
        success: succ
    });
}
