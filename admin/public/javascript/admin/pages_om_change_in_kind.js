//调用
$(document).ready(function () {
    $("#menuitem_om_change_in_kind").addClass("nav-active");

    console.log("获取实物兑换相应的配置列表");
    setDateSelector();

    getChangeCfgs(function (data) {
        console.log(data);

        fillTable(data.data);
    });

    getSwitch(function (data) {
        setSwitch(data.data);
    });

    getDefaultOrders(function(data) {
        fillOrderTable(data.data);
    });
});

var BLACK_LIST = [
    494289,//?,核弹作弊
    717730,//一叶草,激光作弊
    796007,//鱼死网破,排位赛作弊
    553168,//王族统领,排位赛作弊
    486295,//给妳微笑,刷分享BUG非法获利
    0
];

// var admin_address = "..";
// var admin_address = "http://localhost:1337";
// var admin_address = "http://localhost:1338";
var admin_address = ADDRESS.BALANCE;

//==========================================================
// 实物兑换订单
function getDefaultOrders(cb) {
    console.log('CALL getDefaultOrders()...');
    var filter = getFilter();
    var dataPara = getDateRange(1);
    dataPara.filter = filter;
    console.log('dataPara: ', dataPara);

    getOrders(dataPara, cb);
}

/**
 * 获取指定日期范围的订单列表
 */
function getOrders(dataPara, succ, fail) {
    console.log('CALL getOrders()...');
    $.ajax({
        url: admin_address + "admin_api/get_change_order",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: succ
    });
}

function doDateQuery(start_date, end_date) {
    console.log('CALL doDateQuery()...');
    var filter = getFilter();
    var dataPara = {
        start_date: start_date,
        end_date: end_date,
        filter: filter,
    } 
    getOrders(dataPara, function(data) {
        fillOrderTable(data.data);
    });
}

function getFilter() {
    var $order_catalog = $('.order_catalog');
    var $order_status = $('.order_status');
    var order_catalog = [];
    $order_catalog.each(function() {
        if ($(this).get(0).checked) {
            var value = $(this).val();
            console.log("checked:", value);
            order_catalog.push(parseInt(value));
        }
    });
    var order_status = [];
    $order_status.each(function() {
        if ($(this).get(0).checked) {
            var value = $(this).val();
            console.log("checked:", value);
            order_status.push(parseInt(value));
        }
    });
    console.log("order_catalog:", order_catalog);
    console.log("order_status:", order_status);
    console.log("order_catalog:", order_catalog.toString());
    console.log("order_status:", order_status.toString());
    return {
        // order_catalog: order_catalog.toString(),
        // order_status: order_status.toString(),
        order_catalog: order_catalog,
        order_status: order_status,
    };
}

const ORDER_TYPE = {
    /** 话费卡 */
    CARD_ITEM : 1,
    /** 实物道具 */
    REAL_ITEM : 2,
    /** 游戏道具 */
    GAME_ITEM : 3,
};

const ORDER_STATUS = {
    /** 确认中 */
    ISOK : 0,
    /** 发放中 */
    SENGING : 1,
    /** 发放成功 */
    SENDSUCCESS : 2,
    /** 取消 */
    CANCEL : 3,
    /** 发放失败 */
    SENDFAIL : 4,
};

const ORDER_STATUS_DESC = [
    "确认中",
    "发放中",
    "成功",
    "取消",
    "失败",
];

function fillOrderTable(list) {

    $('.query_data_orders').remove();
    $('#query-table-orders').append('<tr id="fake-data-order-list"></tr>');
        
    console.log("order_list:\n", list);
    // var td_1 = '<td style="border: solid thin #000000" class="cell-padding">';
    var td_a = '<td style="border: solid thin #000000" class="cell-padding">';
    var td_b = '<td style="border: solid thick #111b34" class="cell-padding" bgcolor="#111b34">';// 黑名单中的玩家显示
    var td_2 = '</td>\n';
    var html = "";
    for (var i = 0; i < list.length; i++) {
        var catalog = list[i]['catalog'];
        console.log("catalog:", catalog);
        var orderid = list[i]['orderid'];
        var uid = list[i]['uid'];
        var name = list[i]['name'];
        var phone = list[i]['phone'];
        if (BLACK_LIST.indexOf(uid) != -1) {
        	phone = 133;
        }
        var address = list[i]['address'];
        var created_at = getFormatDateFromTimestamp(list[i]['created_at']);
        var ship_at = getFormatDateFromTimestamp(list[i]['ship_at']);
        var cid = list[i]['cid'];
        var itemname = list[i]['itemname'];

        var way = list[i]['way'];
        var thingnum = list[i]['thingnum'];
        if (catalog == ORDER_TYPE.CARD_ITEM) {
            way = list[i]['card_num'];
            thingnum = list[i]['card_pwd'];
        }

        var status = list[i]['status'];
        var op = opButton(orderid, status, catalog);
        var row = "";
        row += '<tr class="query_data_orders" id="tr_' + orderid + '">\n';
        var td_1 = td_a;
        if (BLACK_LIST.indexOf(uid) != -1) {
            td_1 = td_b;
        }
        row += td_1 + orderid + td_2;
        row += td_1 + uid + td_2;
        row += td_1 + handleNull(name) + td_2;
        row += td_1 + handleNull(phone) + td_2;
        row += td_1 + handleNull(address) + td_2;
        row += td_1 + handleNull(created_at) + td_2;
        row += updateShipDate(ship_at);
        row += td_1 + cid + td_2;
        row += td_1 + itemname + td_2;
        row += td_1 + inputWay(orderid, way) + td_2;
        row += td_1 + inputThingnum(orderid, thingnum) + td_2;
        row += updateStatus(orderid, status);
        // row += td_1 + updateStatus(orderid, status) + td_2;
        if (BLACK_LIST.indexOf(uid) == -1) {
            row += initOpBtn(op, orderid);
        }
        else {
            row += td_a + "作弊玩家不发放" + td_2;
        }
        // row += initOpBtn(op, orderid);
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data-order-list').replaceWith(html);

    // 设置修改按钮的响应事件
    for (var i = 0; i < list.length; i++) {
        var catalog = list[i]['catalog'];
        var orderid = list[i]['orderid'];
        var status = list[i]['status'];
        setBtns(orderid, status, catalog);
    }

    function handleNull(input) {
        if (null == input || undefined == input) {
            return "无";
        }
        return input;
    }

    function getFormatDateFromTimestamp(timestamp) {
        if (null == timestamp || undefined == timestamp) {
            return timestamp;
        }
        return DateUtil.pattern(new Date(timestamp), "MM-dd HH:mm(E)");
    }

    function initOpBtn(op, orderid) {
        var ret = "";
        ret += '<td id="td_op_' + orderid + '" style="border: solid thin #000000" class="cell-padding">';
        ret += op;
        ret += '</td>\n';
        return ret;
    }

    function updateShipDate(ship_at) {
        var ret = "";
        ret += '<td id="td_ship_date_' + orderid + '" style="border: solid thin #000000" class="cell-padding">';
        ret += handleNull(ship_at);
        ret += '</td>\n';
        return ret;
    }

    function updateStatus(orderid, status) {
        var ret = "";
        ret += '<td id="td_status_' + orderid + '" style="border: solid thin #000000" class="cell-padding">';
        ret += getOrderStatus(status);
        ret += '</td>\n';
        return ret;
    }

    function inputWay(orderid, way) {
        var ret = "";
        ret += '<input id="input_way_' + orderid + '" type="text" class="form-control input-xs editable-value" value="';
        ret += handleNull(way);
        ret += '">\n';
        return ret;
    }

    function inputThingnum(orderid, thingnum) {
        var ret = "";
        ret += '<input id="input_thingnum_' + orderid + '" type="text" class="form-control input-xs editable-value" value="';
        ret += handleNull(thingnum);
        ret += '">\n';
        return ret;
    }

    // 点击发货修改订单状态
    function opButton(orderid, status, catalog) {
        // console.log(orderid + "-status:", status);
        var ret = "";
        if (status == ORDER_STATUS.ISOK) {
            ret += '<button id="opb_send_' + orderid + '" class="btn btn-error" type="button">点我发货</button>';
        }
        if (status != ORDER_STATUS.CANCEL && catalog == ORDER_TYPE.REAL_ITEM) {
            ret += '<button id="opb_way_' + orderid + '" class="btn btn-warning" type="button">物流更新</button>';
        }
        if (status != ORDER_STATUS.CANCEL && catalog == ORDER_TYPE.CARD_ITEM) {
            ret += '<button id="opb_card_' + orderid + '" class="btn btn-warning" type="button">卡密更新</button>';
        }
        if (status == ORDER_STATUS.SENGING) {
            ret += '<button id="opb_success_' + orderid + '" class="btn btn-success" type="button">发送成功</button>';
        }
        if (status == ORDER_STATUS.ISOK || status == ORDER_STATUS.SENGING) {
            ret += '<button id="opb_cancel_' + orderid + '" class="btn btn-error" type="button">取消订单</button>';
        }
        
        return ret;
    }

    function getOrderStatus(status) {
        return ORDER_STATUS_DESC[status];
    }

    function setBtns(orderid, status, catalog) {
        
        if (status == ORDER_STATUS.ISOK || status == ORDER_STATUS.SENGING) {
            $("#opb_cancel_" + orderid).click(function() {
                console.log("Click Button opb_cancel_" + orderid);

                var dataPara = {
                    op: "status",
                    orderid: orderid,
                    status: ORDER_STATUS.CANCEL,
                };

                modifyOrders(dataPara, function(ret) {
                    // console.log(ret);
                    handleReturn(ret.data);
                });
            });
        }
        
        if (status == ORDER_STATUS.ISOK) {
            $("#opb_send_" + orderid).click(function() {
                console.log("Click Button opb_send_" + orderid);

                var dataPara = {
                    op: "status",
                    orderid: orderid,
                    status: ORDER_STATUS.SENGING,
                };

                modifyOrders(dataPara, function(ret) {
                    // console.log(ret);
                    handleReturn(ret.data);
                    // 更新发货时间
                    $("#td_ship_date_" + orderid).empty();
                    $("#td_ship_date_" + orderid).append(getFormatDateFromTimestamp(new Date().getTime()));
                });
            });
        }
        if (status != ORDER_STATUS.CANCEL) {
            $("#opb_way_" + orderid).click(function() {
                console.log("Click Button opb_way_" + orderid);
                console.log("更新物流信息");

                var way = $("#input_way_" + orderid)[0].value;
                var thingnum = $("#input_thingnum_" + orderid)[0].value;

                console.log("way:", way);
                console.log("thingnum:", thingnum);

                var dataPara = {
                    op: "way",
                    orderid: orderid,
                    way: way,
                    thingnum: thingnum,
                };

                modifyOrders(dataPara, function(ret) {
                    // console.log(ret);
                    handleReturn(ret.data);
                });
            });
            $("#opb_card_" + orderid).click(function() {
                console.log("Click Button opb_card_" + orderid);
                console.log("更新卡号卡密");

                var card_num = $("#input_way_" + orderid)[0].value;
                var card_pwd = $("#input_thingnum_" + orderid)[0].value;

                console.log("card_num:", card_num);
                console.log("card_pwd:", card_pwd);

                var dataPara = {
                    op: "card",
                    orderid: orderid,
                    card_num: card_num,
                    card_pwd: card_pwd,
                };

                modifyOrders(dataPara, function(ret) {
                    // console.log(ret);
                    handleReturn(ret.data);
                });
            });
        }
        if (status == ORDER_STATUS.SENGING) {
            $("#opb_success_" + orderid).click(function() {
                console.log("Click Button opb_success_" + orderid);

                var dataPara = {
                    op: "status",
                    orderid: orderid,
                    status: ORDER_STATUS.SENDSUCCESS,
                };

                modifyOrders(dataPara, function(ret) {
                    // console.log(ret);
                    handleReturn(ret.data);
                });
            });
        }

        function handleReturn(ret_data) {
            var extraInfo = ret_data.extraInfo;
            if (undefined != extraInfo) {
                alert(extraInfo);
            }
            var ret_status = ret_data.status;
            $("#td_status_" + orderid).empty();
            $("#td_status_" + orderid).append(getOrderStatus(ret_status));
            updateOpBtn(orderid, ret_status);
        }

        function updateOpBtn(orderid, ret_status) {
            var update_to = opButton(orderid, ret_status, catalog);
            console.log("ret_status:", ret_status);
            console.log("update_to:", update_to);
            // $("#td_op_" + orderid).replaceWith(update_to);// 无法删除原有元素
            $("#td_op_" + orderid).empty();
            $("#td_op_" + orderid).append(update_to);
            setBtns(orderid, ret_status, catalog);
        }
    }

    function modifyOrders(dataPara, succ, fail) {
        $.ajax({
            url: admin_address + "admin_api/modify_orders",
            type: "post",
            data: { data: JSON.stringify(dataPara) },
            success: succ
        });
    }
}

//==========================================================
// 实物兑换配置

const INPUT_ID = {
    CID:0,
    DESC:1,
    VALUE:2,
    CHANGE:3,
};

/**
 * 获取实物兑换的配置数据
 */
function getChangeCfgs(succ, fail) {
    var dataPara = {type:1};
    $.ajax({
        url: admin_address + "admin_api/get_operation_cfgs",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: succ
    });
}

/**
 * 获取实物兑换的配置数据
 */
function getSwitch(succ, fail) {
    console.log("获取总开关");
    var dataPara = {type:2};
    $.ajax({
        url: admin_address + "admin_api/get_operation_cfgs",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: succ
    });
}

function setSwitch(data) {
    console.log(data);
    var value = data[0].value;
    // console.log("value:", value);

    var $toggle_cik = $("#toggle-cik");
    $toggle_cik.attr('checked', 1 == value);

    $toggle_cik.change(function() {
        // var value = $(this).attr('checked');
        // var value = $(this).val();
        // var value = $(this).is(':checked');
        var value = $toggle_cik.get(0).checked;
        console.log("value:", value);
        
        var dataPara = {
            op: "update",
            oid: 101,
            value: value ? 1 : 0,
        };

        modifyCfgs(dataPara, function(data) {
            console.log(data);
            var value = data.data;
            $toggle_cik.attr('checked', 1 == value);
        });
    });
}

/**
 * 获取实物兑换的配置数据
 */
function modifyCfgs(dataPara, succ, fail) {
    $.ajax({
        url: admin_address + "admin_api/modify_cfgs",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: succ
    });
}

function fillTable(list) {
    console.log("list:", list);
    var td_1 = '<td style="border: solid thin #000000" class="cell-padding">';
    var td_2 = '</td>\n';
    var et_1 = '<input type="text" class="form-control input-xs editable-value" value="';
    var et_2 = '">\n';
    var html = "";
    for (var i = 0; i < list.length; i++) {
        var id = list[i]['id'];
        var cid = list[i]['cfg_id'];
        var desc = list[i]['desc'];
        var value = list[i]['value'];
        var row = "";
        row += '<tr class="query_data" id="tr_' + id + '">\n';
        row += td_1 + id + td_2;
        row += td_1 + et_1 + cid + et_2 + td_2;
        row += td_1 + cidModify(id) + td_2;
        row += td_1 + et_1 + desc + et_2 + td_2;
        row += td_1 + descModify(id) + td_2;
        row += td_1 + valueDisabled(value) + td_2;
        row += changeInput(id);
        row += td_1 + changeButton(id) + td_2;
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data-change-list').replaceWith(html);

    // 设置修改按钮的响应事件
    for (var i = 0; i < list.length; i++) {
        var id = list[i]['id'];
        setModifyButtn(id);
    }

    function valueDisabled(value) {
        var ret = "";
        ret += '<input type="text" class="form-control input-xs editable-value" disabled="disabled" value="';
        ret += value;
        ret += '">\n';
        return ret;
    }

    function cidModify(id) {
        var ret = "";
        ret += '<button id="cmb_' + id + '" class="btn btn-warning" type="button" style="width: 100%;">修改</button>';
        return ret;
    }

    function descModify(id) {
        var ret = "";
        ret += '<button id="mb_' + id + '" class="btn btn-warning" type="button" style="width: 100%;">修改</button>';
        return ret;
    }

    function changeInput(id) {
        var ret = "";
        ret += td_1 + '<button id="cut_' + id + '" class="btn btn-danger" type="button" style="width: 100%;">-</button>' + td_2;
        ret += td_1 + '<input id="num_' + id + '" type="text" class="form-control" value="0">' + td_2;
        ret += td_1 + '<button id="add_' + id + '" class="btn btn-success" type="button" style="width: 100%;">+</button>' + td_2;
        return ret;
    }

    function changeButton(id) {
        var ret = "";
        ret += '<button id="cb_' + id + '" class="btn btn-warning" type="button" style="width: 100%;">修改</button>';
        return ret;
    }
}

function setModifyButtn(id) {
    $("#cmb_" + id).click(function() {
        console.log("Click Button cmb_" + id);
        var $input = $("#tr_" + id).find("input");
        console.log("Click Button $input:", $input);
        var cfg_id = $input[INPUT_ID.CID].value;
        console.log("cfg_id:", cfg_id);

        var dataPara = {
            op: "update",
            oid: id,
            cfg_id: cfg_id,
        };

        modifyCfgs(dataPara, function(data) {
            console.log(data);
            $input[INPUT_ID.CID].value = data.data;
        });
    });

    $("#mb_" + id).click(function() {
        console.log("Click Button mb_" + id);
        var $input = $("#tr_" + id).find("input");
        console.log("Click Button $input:", $input);
        var desc = $input[INPUT_ID.DESC].value;
        var value = $input[INPUT_ID.VALUE].value;
        console.log("desc:", desc);
        console.log("value:", value);

        var dataPara = {
            op: "update",
            oid: id,
            desc: desc,
        };

        modifyCfgs(dataPara, function(data) {
            console.log(data);
        });
    });

    $("#cut_" + id).click(function() {
        console.log("Click Button cut_" + id);
        var $input = $("#tr_" + id).find("input");
        console.log("Click Button $input:", $input);
        var change = $input[INPUT_ID.CHANGE].value;
        console.log("change:", change);

        change--;
        if (Math.abs(change) > $input[INPUT_ID.VALUE].value) {
            change = -$input[INPUT_ID.VALUE].value;
            alert("只能减少" + $input[INPUT_ID.VALUE].value + "的库存");
        }
        $input[INPUT_ID.CHANGE].value = change;
    });

    $("#add_" + id).click(function() {
        console.log("Click Button add_" + id);
        var $input = $("#tr_" + id).find("input");
        console.log("Click Button $input:", $input);
        var change = $input[INPUT_ID.CHANGE].value;
        console.log("change:", change);

        change++;
        $input[INPUT_ID.CHANGE].value = change;
    });

    $("#cb_" + id).click(function() {
        console.log("Click Button cb_" + id);
        var $input = $("#tr_" + id).find("input");
        console.log("Click Button $input:", $input);
        var change = $input[INPUT_ID.CHANGE].value;
        console.log("change:", change);

        if (change < 0 && Math.abs(change) > $input[INPUT_ID.VALUE].value) {
            change = -$input[INPUT_ID.VALUE].value;
            $input[INPUT_ID.CHANGE].value = change;
            alert("只能减少" + $input[INPUT_ID.VALUE].value + "的库存");
            return;
        }

        var dataPara = {
            op: "update",
            oid: id,
            change: change,
        };

        modifyCfgs(dataPara, function(data) {
            console.log(data);
            $input[INPUT_ID.VALUE].value = data.data;
            $input[INPUT_ID.CHANGE].value = "0";
        });
    });
}