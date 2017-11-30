////////////////////////////////////////////////////////////////////////////////
// 存储玩家数据按钮初始化
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setDbSave() {
    console.log("【CALL】 setDbSave");

    $("#btn-dbsave-count").click(function () {
        console.log("【CLICK】 btn-dbsave-count");
        count(function (data) {
            handleResponse(data);
            alert("获取缓存中的玩家数量");
        });
    });

    $("#btn-dbsave-list").click(function () {
        console.log("【CLICK】 btn-dbsave-list");
        list(function (data) {
            handleResponse(data);
            alert("列表缓存中的玩家账号");
        });
    });

    $("#btn-dbsave-save").click(function () {
        console.log("【CLICK】 btn-dbsave-save");
        save(function (data) {
            handleResponse(data);
            alert("保存玩家数据到数据库");
        });
    });

    $("#btn-reset-active").click(function () {
        console.log("【CLICK】 btn-reset-active");
        resetActive(function (data) {
            handleResponse(data);
            alert("重置玩家活动数据");
        });
    });
}

/**
 * 返回缓存中的用户数目.
 */
function count(success, fail) {
    var url = ADDRESS.GAME + "admin_api/count_account";
    var data = {};
    sendPost(url, data, function (data) {
        handleResponse(data);
    });
}

/**
 * 返回缓存中的用户ID列表(点击单个用户ID可以查看详细信息).
 */
function list(success, fail) {
    var url = ADDRESS.GAME + "admin_api/list_account";
    var data = {};
    sendPost(url, data, function (data) {
        handleResponse(data);
        
    });
}

/**
 * 保存缓存中的数据到数据库.
 */
function save(success, fail) {
    var url = ADDRESS.GAME + "admin_api/save_account";
    var data = {};
    sendPost(url, data, function (data) {
        handleResponse(data);
    });
}

/**
 * 重置玩家活动数据
 */
function resetActive(success, fail) {
    var url = ADDRESS.GAME + "admin_api/reset_active";
    var data = {};
    sendPost(url, data, function (data) {
        handleResponse(data);
    });
}