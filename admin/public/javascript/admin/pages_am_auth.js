//调用
$(document).ready(function () {
    $("#menuitem_am_auth").addClass("nav-active");
    setBtnAdd();
    setBtnEdit();
    setBtnDelete();
    setAuthList();
});

function setAuthList() {
    // 复杂
    //$(".editable-value").hide();
    //$(".btn-auth-edit").click(function () {
    //    console.log('点击"编辑"');
        
    //    var $thisBtn = $(this);
    //    var $parent = $(this).parent().parent();
    //    //console.log("$parent: " + $parent.html());
    //    // 所有的权限值都设为不可编辑
    //    $(".readonly-value").show();
    //    $(".editable-value").hide();

    //    $parent.find(".editable-value").show();
    //    $parent.find(".readonly-value").hide();
    //});

    // 简洁
    $(".readonly-value").hide();

    $(".btn-auth-edit").click(function () {
    });
}

