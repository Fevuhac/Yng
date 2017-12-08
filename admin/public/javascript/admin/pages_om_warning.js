//调用
$(document).ready(function () {
    $("#menu_operation").addClass("nav-expanded nav-active");
    $("#menuitem_om_warning").addClass("nav-active");

    getContact();

    $("#btn_confirm_add_contact_way").click(function () {
        addContact();
    });

});

function getContact() {
    let params = {};
    $.ajax({
        url: getBaseUrl() + "/getCoefficiency",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
        fillTable(res);
    }
}

function addContact() {
    let phone = $('#input-phone').val().split(',');
    let mail = $('#input-mail').val().split(',');
    let params = {
        phone: phone,
        mail: mail,
    };
    console.log('params:', params);
    $.ajax({
        url: getBaseUrl() + "/setCoefficiency",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
        fillTable(res);
    }
}

function delContact(type, val) {
    let params = {};
    params[type] = JSON.parse('["' + val + '"]');
    console.log('params:', params);
    $.ajax({
        url: getBaseUrl() + "/delCoefficiency",
        type: "post",
        data: { data: params },
        success: succ
    });
    function succ(res) {
        console.log(res);
        fillTable(res);
    }
}

function fillTable(res) {
    let data = res.data;
    let txt_delete = data.txt.txt_delete;
    let phoneList = data.phone;
    let mailList = data.mail;
    console.log("phoneList:", phoneList);
    console.log("mailList:", mailList);

    let html = '<tr id="fake-data-contact-list"></tr>';// add new fake line for replace
    html += addList(phoneList, 'phone');
    html += addList(mailList, 'mail');
    console.log("html:", html);
    $('.del_data').remove();
    $('#fake-data-contact-list').replaceWith(html);
    $('.class_del_btn').click(function() {
        console.log('Click Del Btn...');
        let type = $($($(this).parent()[0]).parent().find("b")[0]).attr("type");
        let val = $($(this).parent()[0]).parent().find("b")[0].innerText;
        console.log('type:', type);
        console.log('value:', val);
        delContact(type, val);
    });

    function addList(list, type) {
        let td_1 = '<td style="border: solid thin #000000" class="cell-padding">';
        let td_2 = '</td>\n';
        let et_1 = '<input type="text" class="form-control input-xs editable-value" value="';
        let et_2 = '">\n';
        let html = "";
        for (let i = 0; i < list.length; i++) {
            let item = '<b type="' + type + '">' + list[i] + '</b>';
            let row = "";
            row += '<tr class="del_data">';
            row += td_1 + item + td_2;
            row += td_1 + makeButton() + td_2;
            row += '</tr>\n';
            html += row;
        }
        return html;
    }

    function makeButton() {
        let btn = '';
        btn += '<button id="id_del_btn" class="class_del_btn">' + txt_delete + '</button>';
        return btn;
    }
}
