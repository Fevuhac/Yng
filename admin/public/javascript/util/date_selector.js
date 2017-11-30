function setDateSelector() {
    $('#start-date').datepicker({ dateFormat: "yyyy-mm-dd" });
    $('#end-date').datepicker({ dateFormat: "yyyy-mm-dd" });

    $('#btn-query').click(function () {
        console.log('点击"查询"根据日期范围进行查询');
        
        // 调用date-selector.js的文件必须提供一个doDateQuery()函数
        var $start = $('#start-date').val();
        var $end = $('#end-date').val();

        console.log("$start: " + $start);
        console.log("$end: " + $end);

        var start_date = DateUtil.pattern(new Date($start), "yyyy-MM-dd");
        var end_date = DateUtil.pattern(new Date($end), "yyyy-MM-dd");
        
        console.log("start_date: " + start_date);
        console.log("end_date: " + end_date);

        doDateQuery(start_date, end_date);
    });
}

// default_last: 默认从当前日期向前推算的天数
function getDateRange(default_last, start_date, end_date) {
    var dataPara = {
        start_date: DateUtil.pattern(DateUtil.getDateOffset(-default_last), 'yyyy-MM-dd'),
        end_date: DateUtil.pattern(new Date(), 'yyyy-MM-dd')
    };
    if (start_date != null && end_date != null) {
        dataPara = {
            start_date: start_date,
            end_date: end_date
        };
    }
    return dataPara;
}