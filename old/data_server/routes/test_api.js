// test_api
// 调试相关的API, 包括
// =========================================================
// upload_profile
// =========================================================
var express = require('express');
var router = express.Router();

var sys = require('sys');
var fs = require('fs');
var _ = require('underscore');
var StringUtil = require('../src/utils/StringUtil');
var FileUtil = require('../src/utils/FileUtil');

/**
 * 上传策划配置文件,上传后改名
 * test_api/upload_profile
 */
router.post('/upload_profile', function (req, res) {
    console.log("call API upload_profile...");

    var formidable = require("formidable");
    
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/temp";
    form.parse(req, function (err, fields, files) {
        
        console.log(JSON.stringify(files));
        
        var types = files.file.name.split('.');
        console.log("文件路径：" + files.file.path);
        
        // 这样得到的是一个字符串
        var data = fields.data;
        console.log("fields: " + JSON.stringify(fields));
        var filepath = './' + files.file.path.replace('\\', '/');
        
        // 拷贝一份文件, 名字为文件名
        var stat = fs.stat;
        
        var _src = files.file.path.replace('\\', '/');
        var _dst_excel = './public/temp/data_table_js/' + files.file.name;
        var _dst_json = './public/fishjoy_game/res/raw-assets/resources/game/cfgs/' + files.file.name;
        var _dst_cfg_json = './cfgs/' + files.file.name;
        stat(_src, function (err, st) {
            console.log(err);
            if (err) {
                throw err;
            }
            // 判断是否为文件
            if (st.isFile()) {
                console.log("files.file.name: " + files.file.name);
                if (StringUtil.endsWith(files.file.name, '.xlsx')) {
                    console.log("end with xlsx");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_excel);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    res.success({ type: 1, msg: '上传成功', data: 1 });
                    //res.redirect('/fjds/pages-design-test.html?show_hint=true');
                    
                    // 调用python脚本转换Excel文件为JS配置文件
                    var exec = require('child_process').exec;
                    var cmd = 'python ./utils/src_js/convert_table.py';
                    //var cmd = 'python ./utils/src_js/convert_table_json.py';
                    exec(cmd, function (error, stdout, stderr) {
                        if (error) {
                            console.info('stderr : ' + stderr);
                        }
                        else {
                            console.info('success');
                            // 对新上传的Excel产生的js文件进行列表操作
                            //var path = "./cfgs/cfg_list.cfg";
                            //var src_path = "./cfgs/";
                            //FileUtil.dir(src_path, path, true, null, "js");

                            //// TODO: 将所有json文件列表到一个新的cfg文件中
                            //FileUtil.dir(src_path, "./cfgs/json_list.cfg", true, null, "json");
                            listCfgVersion();
                        }
                    });
                }
                else if (StringUtil.endsWith(files.file.name, '.js')){
                    console.log("end with js");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_json);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    //res.success({ type: 1, msg: '上传成功js', data: 1 });
                    // 跳转页面
                    res.redirect('/fjds/pages-design-test.html?show_hint=true');
                }
                else if (StringUtil.endsWith(files.file.name, '.json')) {
                    console.log("end with json");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_cfg_json);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    readable.on('end', function() {
                        console.log('read end');
                        listCfgVersion();
                    });
                    
                    //res.success({ type: 1, msg: '上传成功json', data: 1 });
                    // 跳转页面
                    res.redirect('/fjds/pages-design-test.html?show_hint=true');
                }
            }
        });
    });
    
    return;
});

/**
 * 接收支付完成后的回调参数
 * test_api/pay_callback
 */
router.post('/pay_callback', function (req, res) {
    console.log("call API add_gold_log...");
    console.log("req: " + req);
    console.log("req.body: " + JSON.stringify(req.body));
    console.log("req.params: " + JSON.stringify(req.params));
});

/**
 * 接收支付完成后的回调参数
 * test_api/pay_callback
 */
router.get('/pay_callback', function (req, res) {
    console.log("call API add_gold_log...");
    console.log("req: " + req);
    console.log("req.body: " + JSON.stringify(req.body));
    console.log("req.params: " + JSON.stringify(req.params));
});

function listCfgVersion() {
    var to_file = "./cfgs/json_list.cfg";
    var src_path = "/cfgs/";
    FileUtil.dir(src_path, to_file, true, null, 'json');
}

module.exports = router;