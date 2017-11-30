// 设置下载相关
function setDownload() {
    $("#btn-download-data").click(function () {
        console.log("点击下载按钮");
        download();
    });
    
    setDateSelector();
}

function doDateQuery(start_date, end_date) {
    console.log('根据日期范围获取Excel表');
    
    download(start_date, end_date);
}

// 可提取公有方法
function download(start_date, end_date) {
    
    var params = {
        start_date: start_date,
        end_date: end_date,
    };
    
    var form = $("<form>");
    form.attr('style', 'display:none');
    form.attr('target', '');
    form.attr('method', 'post');
    form.attr('action', '/admin_api/get_daily_statistics');
    
    var input = $('<input>');
    input.attr('type', 'hidden');
    input.attr('name', 'data');
    input.attr('value', JSON.stringify(params));
    
    $('body').append(form);
    form.append(input);
    
    form.submit();
    form.remove();
};