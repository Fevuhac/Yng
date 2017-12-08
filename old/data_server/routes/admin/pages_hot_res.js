var express = require('express');
var router = express.Router();

var FileUtil = require('../../src/utils/FileUtil');
var StringUtil = require('../../src/utils/StringUtil');

/* GET home page. */
router.get('/', function (req, res) {
    // TODO: 获得res下的目录列表(raw-assets和raw-internal分别获取)
    var path_assets = './public/fishjoy_game/res/raw-assets';
    var path_internal = './public/fishjoy_game/res/raw-internal';
    var path_assets_list = FileUtil.listDir(path_assets, true, false);
    var path_internal_list = FileUtil.listDir(path_internal, true, false);

    res.render("pages-hot-res", {
        title: "Hot Resources Replace(json and pictures)",
        path_list: ['path_01', 'path_02', 'path_03'],
        path_assets_list: path_assets_list,
        path_internal_list: path_internal_list,
    });
});

module.exports = router;