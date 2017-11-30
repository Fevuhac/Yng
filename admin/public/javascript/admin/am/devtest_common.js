function getAes() {
    var hasChk = $('#checkboxAes').is(':checked');
    if (hasChk) {
        console.log('已选中');
        return true;
    } else {
        console.log('未选中');
        return false;
    }
}

function getBaseUrl() {
    var base_url = "..";
    var input_url = $("#select-url").val();
    if (input_url != null && input_url != "") {
        base_url = input_url;
    }
    return base_url;
}