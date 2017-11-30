//调用
function setUpdateAccount() {
    console.log('setUpdateAccount()');
    $("#btn-update-account").click(function () {
        console.log('点击"更新玩家信息"');
        updateAccount(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                console.log(data.aes);
                aes = data.aes;
                if (data != null && data.data != null) {
                    data = CryptoUtil.aes_decrypt(data.data, aes);
                    console.log(data);
                }
                else {
                    console.log("data == null");
                }
                return;
            }
        });
    });
}

function updateAccount(fnSuccess, fnFail) {
    console.log('updateAccount(): ajax请求');
    
    var dataPara = getFormJsonUpdateAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/update_account";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonUpdateAccount() {
    console.log('getFormJsonUpdateAccount()');
    var o = {};
    var item_list = [
        "#input-account-id",
        "#input-account-token",

        // 更新类型
        "#input-update-type",
        // 用于更新玩家经验值
        "#input-cur-exp",
        // 用于更新玩家等级
        "#input-cur-level",
        // 用于更新关卡数据
        "#input-level-mission",
        // 用于更新每日重置任务
        "#input-mission-daily-reset",
        // 用于更新只有一次的任务
        "#input-mission-only-once",
        // 用于更新首充数据
        "#input-first-buy",
        // 用于更新活动礼物
        "#input-activity-gift",
        // 心跳
        "#input-heartbeat",
        // 金币购买次数
        "#input-gold-shopping",
        // 武器皮肤
        "#input-weapon-skin",
        // 奖金
        "#input-bonus",
        // 掉落物品
        "#input-drop",
        // 翻盘购买
        "#input-comeback",
        // VIP礼包购买
        "#input-vip-gift",
        // 武器充能
        "#input-weapon-energy",
        // 海盗任务
        "#input-pirate",
        // 月卡领取
        "#input-get-card",
        // 首充大礼包领取
        "#input-first-buy-gift",
        // 新手引导
        "#input-guide-strong",
        "#input-guide-weak",
    ];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        if (attr_name == "group") {
            attr_val = JSON.parse(attr_val);
        }
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

