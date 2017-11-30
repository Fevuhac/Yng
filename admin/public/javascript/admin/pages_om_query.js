//调用
$(document).ready(function () {
    $("#menuitem_om_query_log").addClass("nav-active");

    console.log("查询玩家信息");
    // setDateSelector();

    hideTable();
    setQueryLog();

});

const DB_TABLE = {
    "1": "tbl_gold_log",
    "2": "tbl_pearl_log",
    "3": "tbl_weapon_log",
    "4": "tbl_skill_log",
};

function hideTable() {
    $('#gold-log').hide();
    $('#pearl-log').hide();
    $('#weapon-log').hide();
    $('#skill-log').hide();
}

function setQueryLog() {
    $('#btn-query-log').click(function() {
        var uid = $('#input-uid').val();
        var type = $('#input-type').val();
        var $start = $('#start-date').val();
        var $end = $('#end-date').val();
        var start_date = DateUtil.pattern(new Date($start), "yyyy-MM-dd");
        var end_date = DateUtil.pattern(new Date($end), "yyyy-MM-dd");

        console.log("uid:", uid);
        console.log("type:", type);
        console.log("$start: ", start_date);
	    console.log("$end: ", end_date);

        if (!uid) {
            alert('请输入玩家UID');
            return;
        }

        var params = {
            uid: uid,
            type: type,
            start_date: start_date,
            end_date: end_date,
        };
        l_GetQueryLog(params, function (data) {
            console.log(data);
            l_FillTable(data.data, type);
        });
    });

    function l_GetQueryLog(params, succ) {
        $.ajax({
            url: getBaseUrl() + "/admin_api/query_log",
            type: "post",
            data: { data: JSON.stringify(params) },
            success: succ
        });
    }

    function l_FillTable(log_list, type) {
        $('.query_data').remove();
        switch(type) {
            case "1":
                console.log("日志类别:", DB_TABLE[type]);
                l_FillGoldTable();
            break;

            case "2":
                console.log("日志类别:", DB_TABLE[type]);
                l_FillPearlTable();
            break;

            case "3":
                console.log("日志类别:", DB_TABLE[type]);
                l_FillWeaponTable();
            break;

            case "4":
                console.log("日志类别:", DB_TABLE[type]);
                l_FillSkillTable();
            break;
        }

        function l_FillGoldTable() {
            // cost:23520
            // gain:12480
            // id:132602
            // level:17
            // log_at:"2017-10-27 11:35:50"
            // scene:103
            // total:8822100
            
            var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
            var td_2 = '</td>\n';
            var html = "";
            for (var i = 0; i < log_list.length; i++) {
                var log = log_list[i];
                var row = "";
                row += '<tr class="query_data">\n';
                row += td_1 + log['id'] + td_2;
                row += td_1 + log['log_at'] + td_2;
                row += td_1 + log['gain'] + td_2;
                row += td_1 + log['cost'] + td_2;
                row += td_1 + log['total'] + td_2;
                row += td_1 + log['scene'] + td_2;
                row += td_1 + log['level'] + td_2;
                row += '</tr>\n';
                html += row;
            }
            html += '<tr id="fake-data-query-log-gold"></tr>\n';
            $('#fake-data-query-log-gold').replaceWith(html);
            hideTable();
            $('#gold-log').show();
        }

        function l_FillPearlTable() {
            // cost:10
            // gain:0
            // id:38888
            // log_at:"2017-10-23 11:44:57"
            // scene:100
            // total:39280
            
            var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
            var td_2 = '</td>\n';
            var html = "";
            for (var i = 0; i < log_list.length; i++) {
                var log = log_list[i];
                var row = "";
                row += '<tr class="query_data">\n';
                row += td_1 + log['id'] + td_2;
                row += td_1 + log['log_at'] + td_2;
                row += td_1 + log['gain'] + td_2;
                row += td_1 + log['cost'] + td_2;
                row += td_1 + log['total'] + td_2;
                row += td_1 + log['scene'] + td_2;
                row += '</tr>\n';
                html += row;
            }
            html += '<tr id="fake-data-query-log-pearl"></tr>\n';
            $('#fake-data-query-log-pearl').replaceWith(html);
            hideTable();
            $('#pearl-log').show();
        }

        function l_FillWeaponTable() {
            // id:8125
            // level:120
            // level_up:20
            // log_at:"2017-10-13 21:51:58"
            
            var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
            var td_2 = '</td>\n';
            var html = "";
            for (var i = 0; i < log_list.length; i++) {
                var log = log_list[i];
                var row = "";
                row += '<tr class="query_data">\n';
                row += td_1 + log['id'] + td_2;
                row += td_1 + log['log_at'] + td_2;
                row += td_1 + log['level'] + td_2;
                row += td_1 + log['level_up'] + td_2;
                row += '</tr>\n';
                html += row;
            }
            html += '<tr id="fake-data-query-log-weapon"></tr>\n';
            $('#fake-data-query-log-weapon').replaceWith(html);
            hideTable();
            $('#weapon-log').show();
        }

        function l_FillSkillTable() {
            // comment:"无"
            // cost:1
            // gain:0
            // id:883229
            // log_at:"2017-10-27 17:09:22"
            // skill_id:8
            // total:8

            var td_1 = '<td style="border: solid thin #eeeeee" class="cell-padding">';
            var td_2 = '</td>\n';
            var html = "";
            for (var i = 0; i < log_list.length; i++) {
                var log = log_list[i];
                var row = "";
                row += '<tr class="query_data">\n';
                row += td_1 + log['id'] + td_2;
                row += td_1 + log['log_at'] + td_2;
                row += td_1 + log['skill_id'] + td_2;
                row += td_1 + log['gain'] + td_2;
                row += td_1 + log['cost'] + td_2;
                row += td_1 + log['total'] + td_2;
                row += td_1 + log['comment'] + td_2;
                row += '</tr>\n';
                html += row;
            }
            html += '<tr id="fake-data-query-log-skill"></tr>\n';
            $('#fake-data-query-log-skill').replaceWith(html);
            hideTable();
            $('#skill-log').show();
        }
    }
}