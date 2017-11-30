//==============================================================================
// 接口调用
//==============================================================================
function generateCdKey(fnSucc, fnFail) {
    console.log('generateCdKey(): ajax请求');
    
    var url = getBaseUrl() + "/admin_api/generate_cdkey";
    var action_id = $("#input-active-action-id").val();
    var prefix = $("#input-active-cdkey-prefix").val();
    var num = $("#input-active-cdkey-num").val();
    var dataPara = { action_id: action_id, prefix: prefix, num: num };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

/**
 * 根据活动号获取CD-KEY列表
 */
function getCdkeyList(fnSucc, fnFail) {
    console.log('getCdkeyList(): ajax请求');
    
    var url = getBaseUrl() + "/admin_api/get_cdkey_list";
    var action_id = $("#input-active-action-id").val();
    var dataPara = { action_id: action_id };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function getCdkeyDetail(fnSucc, fnFail) {
    console.log('getCdkeyDetail(): ajax请求');
    
    var url = getBaseUrl() + "/admin_api/get_cdkey_detail";
    var cdkey = $("#input-active-cdkey").val();
    var dataPara = { cdkey: cdkey };
    
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}


//==============================================================================
// 数据显示
//==============================================================================
/**
 * 显示新生成的CD-KEY列表
 */
function showNewCdKeyList(list) {
    console.log('showNewCdKeyList()');
    $("#cdkey-table").remove();
    var table = '';
    table += '<table style="width: 100%;" class="table-bordered" id="cdkey-table">';
    for (var row = 0; row < list.length / 8; row++) {
        table += '<tr>';
        for (var col = 0; col < 8; col++) {
            table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
            table += list[row * 8 + col];
            table += '</td>';
        }
        table += '</tr>';
    }
    $("#cdkey-list").append(table);
}

/**
 * 显示查询的CD-KEY列表
 */
function showExistedCdKeyList(list) {
    console.log('showExistedCdKeyList()');
    $("#cdkey-table").remove();
    var table = '';
    table += '<table style="width: 100%;" class="table-bordered" id="cdkey-table">';
    for (var row = 0; row < list.length / 8; row++) {
        table += '<tr>';
        for (var col = 0; col < 8; col++) {
            var item = list[row * 8 + col];
            if (!item) {
                continue;
            }
            var color = 'eeeeee';
            if (item.use_time) {
                color = 'ff0000';
            }
            console.log("color: ", color);
            table += '<td bgcolor="' + color + '" class="border: solid thin #' + color + '" class="cell-padding cell-align-center">';
            table += item.cd_key;
            table += '</td>';
        }
        table += '</tr>';
    }
    table += '</table>';
    $("#cdkey-list").append(table);
}

/**
 * 显示CD-KEY详情
 */
function showCdkeyDetail(detail) {
    console.log('showCdkeyDetail()');
    
    var TITLE = {
        'action_id': '活动ID',
        'cd_key': 'CD-KEY',
        'created_at': '创建时间',
        'account_id': '玩家ID',
        'use_time': '使用时间',
    };

    $("#cdkey-table").remove();
    var table = '';
    table += '<table style="width: 100%;" class="table-bordered" id="cdkey-table">';
    
    for (var key in TITLE) {
        var title = TITLE[key];
        var value = detail[key];
        table += '<tr>';
        table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
        table += title;
        table += '</td>';
        table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
        table += value;
        table += '</td>';
        table += '</tr>';
    }
    // 计算CD-KEY的使用状态
    table += '<tr>';
    table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
    table += '使用状态';
    table += '</td>';
    table += '<td class="border: solid thin #eeeeee" class="cell-padding cell-align-center">';
    table += (detail.account_id == null && detail.use_time == null) ? '未使用' : '已使用' ;
    table += '</td>';
    table += '</tr>';
    // 添加到tble中
    $("#cdkey-list").append(table);
}


//==============================================================================
function setActive() {
    console.log('setActive()');

    $("#btn-generate-cdkey").click(function () {
        console.log('点击"一键生成兑换码"');
        generateCdKey(function (data) {
            handleResponse(data);
            var list = data.data.cdkey_list;
            showNewCdKeyList(list);
        });
    });
    
    $("#btn-show-cdkey-list").click(function () {
        console.log('点击"显示兑换码列表"');
        getCdkeyList(function (data) {
            handleResponse(data);
            var list = data.data.cdkey_list;
            showExistedCdKeyList(list);
        });
    });

    $("#btn-show-cdkey-detail").click(function () {
        console.log('点击"查询"');
        getCdkeyDetail(function (data) {
            handleResponse(data);
            var detail = data.data;
            showCdkeyDetail(detail);
        });
    });
}

function handleResponse(data) {
    console.log(data.msg);
    if (data.err) {
        console.log(data.err);
        return;
    }
    if (data.data) {
        console.log(data.data);
        return;
    }
}