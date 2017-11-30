function ajaxSubmit(fn, fnFail) {
    console.log('ajaxSubmit(): ajax请求');
    $.ajax({
        url: "../data_api/get_cfg_list",
        type: "get",
        data: {},
        success: fn
    });
}

function ajaxSubmit1(fn, fnFail) {
    console.log('ajaxSubmit(): ajax请求');
    var path = $("#input-file-path").val();
    var dataPara = { path : path };
    $.ajax({
        url: "../data_api/get_cfg_file",
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fn
    });
}

//调用
$(document).ready(function () {
    $("#btn-get-cfg-list").click(function () {
        console.log('点击"拉取配置版本表"');
        ajaxSubmit(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                return;
            }
        });
    });
    $("#btn-get-cfg-file").click(function () {
        console.log('点击"拉取配置文件"');
        ajaxSubmit1(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                return;
            }
        });
    });
});