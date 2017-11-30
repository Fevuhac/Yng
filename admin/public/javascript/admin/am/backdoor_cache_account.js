////////////////////////////////////////////////////////////////////////////////
// 获取内存中玩家数据, 修改玩家数据
////////////////////////////////////////////////////////////////////////////////

var ca_data = null;

// 初始化, 绑定按钮事件
function setCacheAccount() {
    console.log("【CALL】 setCacheAccount");
    $('#btn-get-ca').click(function () {
        console.log("【CLICK】 btn-get-ca");
        var field = $("#input-field").val();
        getCacheAccount(function (data) {
            handleResponse(data);
            if (field == "active") {
                data = data.data;
                for (var idx in TaskType) {
                    console.log("(" + TaskType[idx] + ")" + idx + ":");
                    for (var key in data) {
                        if (parseInt(key) == TaskType[idx]) {
                            console.log(data[key]);
                        }
                    }
                }
            }
        });
    });
    
    $('#btn-del-cache').click(function () {
        console.log("【CLICK】 btn-del-cache");
        delCacheAccount(function (data) {
            handleResponse(data);
        });
    });

    $('#btn-get-ca-statistics').click(function () {
        console.log("【CLICK】 btn-get-ca-statistics");
        getCacheAccountStatistics(function (data) {
            handleResponse(data);
            ca_data = data.data;
            setCATable(ca_data);
            $('#input-sum-cache-account').val("" + data.data.length);
            $('.sort-btn').show();
        });
    });
    
    $('.sort-btn').hide();

    // TODO: 服务器的updated_at字段需要修改为时间戳
    $('#btn-sort-time').click(function () {
        console.log("【CLICK】 btn-sort-time");
        ca_data.sort(function(a, b) {
            return a.updated_at - b.updated_at;
        })
        setCATable(ca_data);
    });

    $('#btn-sort-gold').click(function () {
        console.log("【CLICK】 btn-sort-gold(从高到低排序)");
        ca_data.sort(function(a, b) {
            return b.gold - a.gold;
        })
        setCATable(ca_data);
    });

    $('#btn-sort-pearl').click(function () {
        console.log("【CLICK】 btn-sort-pearl(从高到低排序)");
        ca_data.sort(function(a, b) {
            return b.pearl - a.pearl;
        })
        setCATable(ca_data);
    });

    $('#btn-sort-level').click(function () {
        console.log("【CLICK】 btn-sort-level(从高到低排序)");
        ca_data.sort(function(a, b) {
            return b.level - a.level;
        })
        setCATable(ca_data);
    });

    $('#btn-sort-rmb').click(function () {
        console.log("【CLICK】 btn-sort-rmb(从高到低排序)");
        ca_data.sort(function(a, b) {
            return b.rmb - a.rmb;
        })
        setCATable(ca_data);
    });
}

function setCATable(data) {
    var table_html = getTableHtml(data);
    // console.log("table_html:\n", table_html);
    $('.ca-row').remove();
    $('.ca-head').append(table_html);
}

function getTableHtml(data) {
    // console.log("data:\n", data);
    var table_html = "";
    var td_style = '    <td style="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
    for (var i = 0; i < data.length; i++) {
        var account = data[i];
        var tr = '';
        tr += '<tr id="fake-data" class="ca-row">\n';
        tr += td_style + (i + 1) + '</td>\n';
        tr += td_style + account.uid + '</td>\n';
        tr += td_style + account.nickname + '</td>\n';
        tr += td_style + account.updated_at + '</td>\n';
        tr += td_style + account.gold + '</td>\n';
        tr += td_style + account.pearl + '</td>\n';
        tr += td_style + account.level + '</td>\n';
        tr += td_style + account.rmb + '</td>\n';
        tr += td_style + account.platform + '</td>\n';
        tr += '</tr>\n';
        table_html += tr;
    }
    return table_html;
}


function getCacheAccount(fnSucc, fnFail) {
    var account_id = $("#input-account-id").val();
    var field = $("#input-field").val();
    
    var dataPara = {
        account_id: account_id, 
        field: field,
    };
    var url = getBaseUrl() + "/admin_api/get_ca";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}


function delCacheAccount(fnSucc, fnFail) {
    var account_id = $("#input-account-id").val();
    
    var dataPara = {
        account_id: account_id, 
    };
    var url = getBaseUrl() + "/admin_api/del_ca";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function getCacheAccountStatistics(fnSucc, fnFail) {
    
    var dataPara = {};
    var url = getBaseUrl() + "/admin_api/get_ca_statistics";
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

var TaskType = {
    NONE : 0,
    CATCH_FISH : 1,          //捕获x鱼y条，如果x为0则为任意鱼
    USE_SKILL : 2,           //使用x技能y次，如果x为0则为任意技能
    UPDATE_USER_LV : 3,      //角色等级x级
    UPDATE_WEAPON_LV : 4,    //解锁炮台x倍
    USE_FISH_CATCH_FISH : 5, //利用x鱼炸死y条其他鱼
    GET_WEAPON_SKIN : 6,     //获得炮台皮肤x个
    ONE_CATCH_FISH : 7,      //单次开炮捕获鱼x条
    ONE_GET_GOLD : 8,        //单次开炮获得金币x
    GET_GOLD : 9,            //累计获得金币x           
    USE_DIAMOND : 10,        //累计消耗钻石x
    USE_GOLD : 11,           //累计消耗金币x
    SHARE_TIMES : 12,        //分享x次
    CONTINUE_LOGIN : 13,     //累计登录x天
    GET_RANK_LV : 14,        //获得排位x阶段位y次
    GET_VIP_LV : 15,         //成为VIPx
    GET_DRAGON_STAR : 16,    //达成龙宫x星y次
    GET_ACHIEVE_POINT : 17,  //获得x点成就点
    GOLD_TIMES : 18 , //金币次数
    CHARG_PEARL : 19, //充值珍珠
    DEFEND_GODDESS : 20, //保卫女神
    STOCKING_FISH : 21, //放养鱼
    GODDESS_LEVEL : 22, //女神最高闯关
    PETFISH_TOTAL_LEVEL : 23, //宠物鱼等级和
    UNLOCK_GODDESS : 24, //解锁女神
    PLAY_LITTLE_GAME : 25, //x小游戏中获得y分
    MAX : 26,//最后一个，暂时取消掉了
};