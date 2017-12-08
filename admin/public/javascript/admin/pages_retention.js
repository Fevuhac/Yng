//调用
$(document).ready(function () {
    $("#menu_statistics").addClass("nav-expanded nav-active");
    $("#menuitem_retention").addClass("nav-active");
    setRetention();
    setDateSelector();
});

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围查询留存率');

    getRetentionData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        
        $('.log-data').remove();
        $('#log-table').append('<tr id="fake-data"></tr>');

        fillTable(data.data);
    }, start_date, end_date);
}


function setRetention() {
    getRetentionData(function (data) {
        console.log(data.msg);
        if (data.err) {
            console.log(data.err);
            return;
        }
        console.log('data:', data);
        fillTable(data.data);
    });
}

function fillTable(rows) {
    console.log(rows);
    var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
    var td_2 = '</td>\n';
    var html = "";
    for (var i = 0; i < rows.length; i++) {
        var row = "";
        row += '<tr class="log-data">\n';
        row += td_1 + rows[i]['log_date'] + td_2;
        row += td_1 + rows[i]['new_account'] + td_2;
        row += td_1 + rows[i]['drr'] + td_2;
        row += td_1 + rows[i]['wrr'] + td_2;
        row += td_1 + rows[i]['mrr'] + td_2;
        row += '</tr>\n';
        html += row;
    }
    $('#fake-data').replaceWith(html);
}

// function formatData(input) {
//     return input.toFixed(2);
// }

function getRetentionData(fn, start_date, end_date) {
    var dataPara = getDateRange(30, start_date, end_date);
    console.log('dataPara: ', dataPara);
    console.log('getRegisterData(): ajax请求');
    
    $.ajax({
        url: "../admin_api/get_retention_data",
        type: "post",
        data: { data: dataPara },
        success: fn
    });
}