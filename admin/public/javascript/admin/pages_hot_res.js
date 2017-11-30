

//调用
$(document).ready(function () {
    //$("#path_assets_list")
    var $path_assets_list = $("#path_assets_list");
    var $path_internal_list = $("#path_internal_list");
    var $container_path_selector = $("#container_path_selector");
    $("#path_internal_list").remove();

    $("input:radio[name=raw_type]").change(function () {
        var $selectedvalue = $("input[name='raw_type']:checked").val();
        //alert($selectedvalue);
        if ($selectedvalue == 'assets') {
            $container_path_selector.append($path_assets_list);
            $("#path_internal_list").remove();
        }
        else if ($selectedvalue == 'internal') {
            $container_path_selector.append($path_internal_list);
            $("#path_assets_list").remove();
        }
    });
});