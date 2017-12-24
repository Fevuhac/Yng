// admin_api
// 管理相关的API, 包括
// =========================================================
// upload_res
// =========================================================
var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');

var sys = require('sys');
var fs = require('fs');
var _ = require('underscore');
var formidable = require("formidable");

var StringUtil = require('../src/utils/StringUtil');
var FileUtil = require('../src/utils/FileUtil');
var admin_auth = require('../routes/api/admin_auth');
var admin_role = require('../routes/api/admin_role');
var admin_user = require('../routes/api/admin_user');
var admin_server = require('../routes/api/admin_server');
var admin_dbsave = require('../routes/api/admin_dbsave');
var admin_backdoor = require('../routes/api/admin_backdoor');
var admin_operation = require('../routes/api/admin_operation');
var admin_match = require('../routes/api/admin_match');
var admin_sdata = require('../routes/api/admin_sdata');
var admin_test = require('../routes/api/admin_test');
var statistics_retention = require('../routes/api/statistics_retention');
var statistics_payuser = require('../routes/api/statistics_payuser');
var data_cd_key = require('./data/cd_key');
var data_mail = require('./data/mail');
var SERVER_CFG = require('../src/cfgs/server_cfg').SERVER_CFG;

var TAG = "【admin_api】";

// 测试周期性生成排行榜奖励
router.post('/generate_cycle_reward', function (req, res) {
    admin_backdoor.generateCycleReward(req, res);
});

//------------------------------------------------------------------------------
// 用户数据持久化
//------------------------------------------------------------------------------
// 计数缓存中的用户量
router.post('/count_account', function (req, res) {
    admin_dbsave.countAccount(req, res);
});

// 列表缓存中的用户
router.post('/list_account', function (req, res) {
    admin_dbsave.listAccount(req, res);
});

// 保存缓存中的用户到数据库
router.post('/save_account', function (req, res) {
    admin_dbsave.saveAccount(req, res);
});

// 重置玩家活动数据
router.post('/reset_active', function (req, res) {
    admin_dbsave.resetActive(req, res);
});

//------------------------------------------------------------------------------
// 测试专用修改数据
//------------------------------------------------------------------------------
// 修改数据供测试用
router.post('/modify_test_data', function (req, res) {
    admin_test.modifyTestData(req, res);
});

// 修改服务器系统时间
router.post('/shell_time_m', function (req, res) {
    admin_test.shellTimeM(req, res);
});

//------------------------------------------------------------------------------
// 运营管理
//------------------------------------------------------------------------------
// 获取配置接口
router.post('/get_operation_cfgs', function (req, res) {
    admin_operation.getOperationCfgs(req, res);
});

// 改变实物领取相关配置的接口
router.post('/modify_cfgs', function (req, res) {
    admin_operation.modifyCfgs(req, res);
});

// 修改订单状态和信息
router.post('/modify_orders', function (req, res) {
    admin_operation.modifyOrders(req, res);
});

// 改变实物领取相关配置的接口
router.post('/get_change_order', function (req, res) {
    admin_operation.getChangeOrder(req, res);
});

// 负载均衡服调用, 用于运营取消订单后给用户加话费券
router.post('/add_huafeiquan', function (req, res) {
    admin_operation.addHuafeiquan(req, res);
});

// 查询奖池总览数据
router.post('/query_jackpot', function (req, res) {
    admin_operation.queryJackpot(req, res);
});

// 查询玩家数据
router.post('/query_player', function (req, res) {
    admin_operation.queryPlayer(req, res);
});

// 查询盈亏排行榜.
router.post('/query_profit', function (req, res) {
    admin_operation.queryProfit(req, res);
});

// 修改捕获率
router.post('/change_rate', function (req, res) {
    admin_operation.changeRate(req, res);
});

//------------------------------------------------------------------------------
// 排位赛管理
//------------------------------------------------------------------------------
// 获取报名池的信息
router.post('/match_enterpool_info', function (req, res) {
    admin_match.getEnterPoolInfo(req, res);
});

// 获取广场服的信息
router.post('/match_plaza_info', function (req, res) {
    admin_match.getPlazaInfo(req, res);
});

//------------------------------------------------------------------------------
// 后门接口
//------------------------------------------------------------------------------
// 查看管理日志
router.post('/query_admin_log', function (req, res) {
    admin_backdoor.queryAdminLog(req, res);
});

// 获取金币日志
router.post('/query_gold', function (req, res) {
    admin_backdoor.queryGold(req, res);
});

// 获取内存数据: 玩家
router.post('/get_ca', function (req, res) {
    admin_backdoor.getCacheAccount(req, res);
});

// 删除缓存中的玩家数据
router.post('/del_ca', function (req, res) {
    admin_backdoor.delCacheAccount(req, res);
});

// 获取内存中玩家的统计数据
router.post('/get_ca_statistics', function (req, res) {
    admin_backdoor.getCacheAccountStatistics(req, res);
});

// 获取内存数据: 邮件
router.post('/get_cm', function (req, res) {
    admin_backdoor.getCacheMail(req, res);
});

// 查看服务器配置表
// 输入任意一张表名, 能够在网页上以table的格式显示这张表的所有内容
router.post('/query_cfgs', function (req, res) {
    admin_backdoor.queryCfgs(req, res);
});

// 获取内存数据: 金币记录
router.post('/get_gl', function (req, res) {
    admin_backdoor.getGoldLog(req, res);
});

// 重置每日数据
router.post('/reset_daily', function (req, res) {
    admin_backdoor.resetDaily(req, res);
});

// 重置每周数据
router.post('/reset_weekly', function (req, res) {
    admin_backdoor.resetWeekly(req, res);
});

// 手动生成留存数据
router.post('/generate_retention', function (req, res) {
    admin_backdoor.generateRetention(req, res);
});

// 修改玩家数据
router.post('/modify_udata', function (req, res) {
    admin_backdoor.modifyUserData(req, res);
});

// 游戏更新版本时踢出玩家
router.post('/kick_user', function (req, res) {
    admin_backdoor.kickUser(req, res);
});

// 账号清空(同样QQ号会另外创建账号并从新手引导开始)
router.post('/account_forbidden', function (req, res) {
    admin_backdoor.accountForbidden(req, res);
});

// 设置账号的权限(0,1,2)
router.post('/account_auth', function (req, res) {
    admin_backdoor.accountAuth(req, res);
});

// 排位赛开关
router.post('/match_switch', function (req, res) {
    admin_backdoor.switchMatch(req, res);
});

// 实物兑换开关
router.post('/cik_switch', function (req, res) {
    admin_backdoor.switchCik(req, res);
});

//------------------------------------------------------------------------------
// 服务器管理
//------------------------------------------------------------------------------
// 关闭API服务器
router.get('/shutdown', function (req, res) {
    admin_server.shutdown(req, res);
});

// 重启ROOM服务器
router.get('/restart_plaza', function (req, res) {
    admin_server.restartPlaza(req, res);
});

// 缓存导入数据库
router.get('/save_all', function (req, res) {
    admin_server.saveAll(req, res);
});

//------------------------------------------------------------------------------
// GM游戏数据查询
//------------------------------------------------------------------------------
//服务器周期数据
router.post('/get_data_water', function (req, res) {
    admin_sdata.water(req, res);
});

//------------------------------------------------------------------------------
// 邮件管理
//------------------------------------------------------------------------------
//发送邮件
router.post('/send_mail', function (req, res) {
    data_mail.sendMail(req, res);
});

//清理邮件中错误的奖励内容
router.post('/clear_mail', function (req, res) {
    data_mail.clearMail(req, res);
});

//------------------------------------------------------------------------------
// CD-KEY
//------------------------------------------------------------------------------

// 产生CD-KEY
router.post('/generate_cdkey', function (req, res) {
    data_cd_key.generate(req, res);
});

// 获取CD-KEY列表
router.post('/get_cdkey_list', function (req, res) {
    data_cd_key.list(req, res);
});

// 获取单独一个CD-KEY的详情
router.post('/get_cdkey_detail', function (req, res) {
    data_cd_key.detail(req, res);
});

//------------------------------------------------------------------------------
// CD-KEY
//------------------------------------------------------------------------------

/**
 * 验证服务器是否正常
 * admin_api/check_server
 */
router.get('/check_server', function (req, res) {
    res.success({ type: 1, msg: '服务器运行正常', data: 1 });
});

var child_process = require('child_process');
router.post('/upload_cfgs_tar', function (req, res) {
    const FUNC = TAG + "/upload_cfgs_tar ---";
    console.log(FUNC + "CALL...");
    
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/temp";
    form.parse(req, function (err, fields, files) {
        console.log(FUNC + "err:", err);
        console.log(FUNC + "fields:", fields);
        console.log(FUNC + "files:", files);

        var filename = files.file.name;
        
        var _src = files.file.path.replace('\\', '/');
        // var _dst = './' + filename;
        var _dst = './cfgs.tar';
        console.log(FUNC + "_src:", _src);
        console.log(FUNC + "_dst:", _dst);
        var readable = fs.createReadStream(_src);// 创建读取流
        var writable = fs.createWriteStream(_dst);// 创建写入流
        readable.pipe(writable);

        if (SERVER_CFG.SYSTEM.WINDOWS) {
            var WORKING_DIR = "F:/svn/project/FishjoyServer/FishjoyDataServer/FishjoyDataServer/";

            child_process.execFile(SERVER_CFG.SYSTEM.COMMAND, null, {cwd:WORKING_DIR}, function (err, stdout, stderr) {
                afterExec(err, stdout, stderr);
            });
        }
        if (SERVER_CFG.SYSTEM.LINUX) {
            child_process.exec(SERVER_CFG.SYSTEM.COMMAND, function (err, stdout, stderr) {
                afterExec(err, stdout, stderr);
            });
        }

        function afterExec(err, stdout, stderr) {
            if (err) {
                console.error(FUNC + 'err:', err);
            }
            else {
                console.log(FUNC + "解压成功");
                console.error(FUNC + 'stdout:', stdout);
                console.error(FUNC + 'stderr:', stderr);
                var redirect_url = '/admin/pages-gm-update.html?show_hint=true';
                res.redirect(redirect_url);
            }
        }
    });
});

/**
 * 上传策划配置文件,上传后改名
 * admin_api/upload_cfg
 */
router.post('/upload_cfg', function (req, res) {
    const FUNC = TAG + "/upload_cfg ---";
    console.log(FUNC + "CALL...");
    
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/temp";
    form.parse(req, function (err, fields, files) {
        
        console.log(FUNC + "files:", files);

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
                var redirect_url = '/admin/pages-gm-update.html?show_hint=true';
                if (StringUtil.endsWith(files.file.name, '.xlsx')) {
                    console.log("处理Excel文件");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_excel);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    //res.success({ type: 1, msg: '上传成功', data: 1 });
                    res.redirect(redirect_url);
                    
                    // 调用python脚本转换Excel文件为JS配置文件
                    var exec = require('child_process').exec;
                    console.log("文件拷贝结束，执行python脚本进行转化");
                    exec('python ./utils/src_js/convert_table.py', function (error, stdout, stderr) {
                        if (error) {
                            console.error('stderr : ' + stderr);
                        }
                        else {
                            console.log("文件转化成功，生成版本文件(js)");
                            // 对新上传的Excel产生的js文件进行列表操作
                            listCfgVersion();
                        }
                    });
                    exec('python ./utils/src_js/convert_table_json.py', function (error, stdout, stderr) {
                        if (error) {
                            console.error('stderr : ' + stderr);
                        }
                        else {
                            console.log("文件转化成功，生成版本文件(json)");
                            // 对新上传的Excel产生的js文件进行列表操作
                            listCfgVersion();
                        }
                    });
                }
                else if (StringUtil.endsWith(files.file.name, '.js')) {
                    console.log("end with js");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_json);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    // 跳转页面
                    res.redirect(redirect_url);
                }
                else if (StringUtil.endsWith(files.file.name, '.json')) {
                    console.log("end with json");
                    // 创建读取流
                    var readable = fs.createReadStream(_src);
                    // 创建写入流
                    var writable = fs.createWriteStream(_dst_cfg_json);
                    // 通过管道来传输流
                    readable.pipe(writable);
                    
                    readable.on('end', function () {
                        console.log('read end');
                        listCfgVersion();
                    });
                    
                    // 跳转页面
                    res.redirect(redirect_url);
                }
            }
        });
    });
    
    return;
});

function listCfgVersion() {
    var src_path = "./cfgs/";
    FileUtil.dir(src_path, "./cfgs/cfg_list.cfg", true, null, "js");
    FileUtil.dir(src_path, "./cfgs/json_list.cfg", true, null, "json");
}

/**
 * 上传资源文件,上传后改名
 * admin_api/upload_res
 */
router.post('/upload_res', function (req, res) {
    console.log("call API upload_res...");
    
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
        
        // 文件路径可以在fields.path中设置
        var raw_type = fields.raw_type;
        var raw_path = '';
        if (raw_type == 'assets') {
            raw_path = 'raw-assets/';
        }
        else if (raw_type == 'internal') {
            raw_path = 'raw-internal/';
        }
        var _dst_file = './public/fishjoy_game/res/' + raw_path + fields.path + '/' + files.file.name;
        
        if (!fs.existsSync(_dst_file)) {
            res.success({ type: 1, msg: '上传失败', err: '目标文件不存在, 请确认目录是否正确' });
            return;
        }

        console.log("_dst_file: " + _dst_file);
        var copy_path = 'res/' + raw_path + fields.path + '/' + files.file.name;
        
        // 拷贝一份文件, 名字为文件名
        var stat = fs.stat;
        
        var _src = files.file.path.replace('\\', '/');
        stat(_src, function (err, st) {
            console.log(err);
            if (err) {
                return;
            }
            // 判断是否为文件
            if (st.isFile()) {
                console.log("files.file.name: " + files.file.name);
                FileUtil.copy(_src, _dst_file);
                res.success({ type: 1, msg: '上传成功', data: 1 });

                // 后续处理
                // _updateResVersion(fields.path + '/' + files.file.name, copy_path);

            }
        });
    });
    
    return;
});

// // 更新文件版本的配置文件
// function _updateResVersion(file_name, copy_path) {

//     // 1. 从/admin/res_map.js中查找到对应资源的UUID.
//     var res_map = require('./admin/res_map');
//     var uuid = res_map.assets[file_name];
    
//     console.log("res_map.assets: " + res_map.assets);
//     console.log("res_map.internal: " + res_map.internal);
//     console.log("file_name: " + file_name);
//     console.log("uuid: " + uuid);

//     // 2. 在update.js中更新文件的版本号
//     var update_file = "./public/fishjoy_game/src/update.js";
//     fs.readFile(update_file, "utf8", function (error, data) {
//         if (error) {
//             console.log(error);
//             return;
//         }
//         //console.log(data);
//         var version_list = StringUtil.split(data, '\n');
//         //console.log(version_list.length);
//         var isVersionExist = false;
//         for (var i = 0; i < version_list.length; i++) {
//             var vd = version_list[i];
//             //console.log('(' + i + ') ' + vd);
//             if (StringUtil.contain(vd, uuid)) {
//                 isVersionExist = true;
//                 // TODO: 将version+1
//                 var s1 = '"][0]+="?v=';
//                 var s2 = '";';
//                 var start = vd.indexOf(s1) + s1.length;
//                 var end = vd.indexOf(s2);
//                 var version_number = parseInt(vd.slice(start, end));
//                 var new_version_number = version_number + 1;
//                 vd = vd.slice(0, start) + new_version_number + s2;
//                 //console.log('new vd: ' + vd);
//                 version_list[i] = vd;
//             }
//         }
//         if (!isVersionExist) {
//             var new_version_data = '';
//             new_version_data += '_CCSettings.rawAssets.assets["';
//             new_version_data += uuid;
//             new_version_data += '"][0]+="?v=1";';
//             version_list.push(new_version_data);
//         }
//         // 写文件
//         var txt = version_list.join('\n');
//         //console.log(txt);
//         //写入文件
//         fs.writeFile(update_file, txt, function (err) {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             console.log("update.js Saved !"); //文件被保存
            
//             // 3. 更新index.html中的update.js的版本号
//             _updateIndexHtml(copy_path);
//         });
//     });
// }

// 更新index.html中的update.js版本
function _updateIndexHtml(copy_path) {
    var index_html = "./public/fishjoy_game/index.html";
    fs.readFile(index_html, "utf8", function (error, data) {
        if (error) {
            console.log(error);
            return;
        }
        //console.log(data);
        var result_array = [];
        var settings_js = '<script src="src/settings.js" charset="utf-8"></script>';
        var update_js_a = '<script src="src/update.js?v=';
        var update_js_b = '" charset="utf-8"></script>';
        if (StringUtil.contain(data, update_js_a)) {
            console.log('存在update.js的引用，直接递增版本号');
            var start = data.indexOf(update_js_a) + update_js_a.length;
            var end = data.indexOf(update_js_b, start);
            var version_number = parseInt(data.slice(start, end));
            var new_version_number = version_number + 1;
            
            result_array.push(data.slice(0, start));
            result_array.push('' + new_version_number);
            result_array.push(data.slice(end, data.length));
        }
        else {
            console.log('不存在update.js的引用，需要插入一段代码');
            var insert_point = data.indexOf(settings_js) + settings_js.length;
            result_array.push(data.slice(0, insert_point));
            result_array.push('\n' + update_js_a + 1 + update_js_b);
            result_array.push(data.slice(insert_point, data.length));
        }

        // 写文件
        var txt = result_array.join('');
        //console.log(txt);
        //写入文件
        fs.writeFile(index_html, txt, function (err) {
            if (error) {
                console.log(error);
                return;
            }
            console.log("index.html Saved !");
            _copyToTarget(copy_path);
        });
    });
}

function _copyToTarget(copy_path) {
    var from_path = "./public/fishjoy_game/";
    var target_path = "./../FishjoyServer/public/fishjoy_js/";
    fs.exists(target_path, function (exists) {
        console.log('目标文件夹是否存在?' + exists);
        if (exists) {
            var _src = '';
            var _dst = '';
            // 开始拷贝
            
            // (1) index.html
            _src = from_path + 'index.html';
            _dst = target_path + 'index.html';
            FileUtil.copy(_src, _dst);
            
            // (2) update.js
            _src = from_path + 'src/update.js';
            _dst = target_path + 'src/update.js';
            FileUtil.copy(_src, _dst);
            
            // (3) *.*
            _src = from_path + copy_path;
            _dst = target_path + copy_path;
            //console.log('_src: ' + _src);
            //console.log('_dst: ' + _dst);
            FileUtil.copy(_src, _dst);
        }
    });
}

//==============================================================================
// 数据查询语句

/**
 * 获取在线状态，传入参数包括
 * @date string 基准日期，以字符串形式由客户端传入
 * admin_api/get_online_status
 */
router.post('/get_online_status', function (req, res) {
    console.log("call API admin/get_online_status...");

    var dataObj = JSON.parse(req.body.data);
    
    console.log('req.body' , req.body);
    console.log('dataObj' , dataObj);

    req.dao.getOnlineStatus(dataObj, function (err, rows) {
        console.log("getOnlineStatus complete...");
        if (err) {
            res.success({ type: 1, msg: '获取在线状态失败', err: '' + err });
        } else {
            res.success({ type: 1, msg: '获取在线状态成功', data: rows });
        }
    });
});

/**
 * 获取实时数据，传入参数包括
 * @date string 基准日期，以字符串形式由客户端传入
 * admin_api/get_realtime_data
 */
router.post('/get_realtime_data', function (req, res) {
    console.log("call API admin/get_realtime_data...");

    var dataObj = JSON.parse(req.body.data);
    //var dataObj = req.body.data;
    
    console.log('req.body' , req.body);
    console.log('dataObj' , dataObj);

    req.dao.getRealtimeData(dataObj, function (err, rows) {
        console.log("getRealtimeData complete...");
        if (err) {
            res.success({ type: 1, msg: '获取实时数据失败', err: '' + err });
        } else {
            res.success({ type: 1, msg: '获取实时数据成功', data: rows });
        }
    });
});

/**
 * 获取注册数据，包括指定日期范围内每日登录数据及新增绑定数据
 * 客户端默认传入最近一周的时间范围，如今日是2016年10月14日，则
 * start_date为"2016-10-08"
 * end_date为"2016-10-14"
 * 
 * @start_date string 开始日期
 * @end_date string 结束日期
 * admin_api/get_register_data
 */
router.post('/get_register_data', function (req, res) {
    console.log("call API admin/get_register_data...");
    
    var dataObj = JSON.parse(req.body.data);
    //var dataObj = req.body.data;
    
    console.log('req.body' , req.body);
    console.log('dataObj' , dataObj);
    
    req.dao.getRegisterData(dataObj, function (err, rows) {
        console.log("getRegisterData complete...");
        if (err) {
            res.success({ type: 1, msg: '获取注册数据失败', err: '' + err });
        } else {
            res.success({ type: 1, msg: '获取注册数据成功', data: rows });
        }
    });
});

/**
 * 获取登录数据，包括指定日期范围内每日登录次数以及登录的账户数
 * 客户端默认传入最近一周的时间范围，如今日是2016年10月14日，则
 * start_date为"2016-10-08"
 * end_date为"2016-10-14"
 * 
 * @start_date string 开始日期
 * @end_date string 结束日期
 * admin_api/get_active_data
 */
router.post('/get_active_data', function (req, res) {
    console.log("call API admin/get_active_data...");
    
    var dataObj = JSON.parse(req.body.data);
    //var dataObj = req.body.data;
    
    console.log('req.body' , req.body);
    console.log('dataObj' , dataObj);
    
    req.dao.getActiveData(dataObj, function (err, rows) {
        console.log("getActiveData complete...");
        if (err) {
            res.success({ type: 1, msg: '获取登录数据失败', err: '' + err });
        } else {
            res.success({ type: 1, msg: '获取登录数据成功', data: rows });
        }
    });
});

/**
 * 
 */
router.post('/get_daily_statistics', function (req, res) {
    console.log("call API admin/get_daily_statistics...");
    
    var dataObj = req.body.data;
    try {
        dataObj = JSON.parse(dataObj);
    }
    catch (err) {

    }
    
    console.log('dataObj:' + dataObj);
    console.log('dataObj' , dataObj);
    console.log('start_date:' , dataObj.start_date);
    console.log('end_date:' , dataObj.end_date);
    
    filename = '每日游戏数据' + dataObj.start_date + '到' + dataObj.end_date + '.xlsx';

    req.dao.getDailyStatistics(dataObj, function (err, rows) {
        console.log("getDailyStatistics complete...");
        var result = nodeExcel.execute(_makeConf(rows));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        
        _setHeaderForFilename(req, res, filename, result);
    });

});

function _makeConf(rows) {
    console.log("rows: ", rows);

    var conf = {};
    conf.cols = [{
            caption: '账户',
            type: 'number',
            width: 50
        }, {
            caption: '日期',
            type: 'string',
            width: 30
        }, {
            caption: '游戏时间',
            type: 'string',
            width: 30
        }, {
            caption: '登录次数',
            type: 'number',
            width: 30
        }, {
            caption: '注销次数',
            type: 'number',
            width: 30
        }, {
            caption: '金币获取',
            type: 'string',
            width: 30
        }, {
            caption: '金币消耗',
            type: 'string',
            width: 30
        }, {
            caption: '金币购买次数',
            type: 'number',
            width: 30
        }, {
            caption: '金币购买量',
            type: 'number',
            width: 30
        }, {
            caption: '珍珠获取',
            type: 'string',
            width: 30
        }, {
            caption: '珍珠消耗',
            type: 'string',
            width: 30
        }, {
            caption: '珍珠购买次数',
            type: 'number',
            width: 30
        }, {
            caption: '珍珠购买量',
            type: 'number',
            width: 30
        }, {
            caption: '技能获取',
            type: 'string',
            width: 30
        }, {
            caption: '技能消耗',
            type: 'string',
            width: 30
        }, {
            caption: '武器升级消耗经验',
            type: 'number',
            width: 30
        }, {
            caption: '武器升级消耗珍珠',
            type: 'number',
            width: 30
        }];
    
    conf.rows = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [];
        row.push(rows[i]["account_id"]);
        row.push(rows[i]["log_date"]);
        row.push(rows[i]["game_time"]);
        row.push(rows[i]["login_count"]);
        row.push(rows[i]["logout_count"]);
        row.push(rows[i]["gold_gain"]);
        row.push(rows[i]["gold_cost"]);
        row.push(rows[i]["gold_shop_count"]);
        row.push(rows[i]["gold_shop_amount"]);
        row.push(rows[i]["pearl_gain"]);
        row.push(rows[i]["pearl_cost"]);
        row.push(rows[i]["pearl_shop_count"]);
        row.push(rows[i]["pearl_shop_amount"]);
        row.push(rows[i]["skill_gain"]);
        row.push(rows[i]["skill_cost"]);
        row.push(rows[i]["weapon_levelup_exp"]);
        row.push(rows[i]["weapon_levelup_pearl"]);
        conf.rows.push(row);
    }

    return conf;
}

function _setHeaderForFilename(req, res, filename, data) {
    var userAgent = (req.headers['user-agent'] || '').toLowerCase();
    
    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
    } else if (userAgent.indexOf('firefox') >= 0) {
        res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
    } else {
        /* safari等其他非主流浏览器只能自求多福了 */
        res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
    }
    res.end(data, 'binary');
}

/**
 * 获取留存数据(Retention)
 */
router.post('/get_retention_data', function (req, res) {
    console.log("call API admin_api/get_retention_data...");
    statistics_retention.get_retention_data(req, res);
});

//==============================================================================
// 后台管理API
//==============================================================================

//------------------------------------------------------------------------------
// 用户登录(User Login)
//------------------------------------------------------------------------------
/**
 * 添加权限页面
 */
router.post('/mgmt/signin', function (req, res) {
    console.log("call API admin_api/mgmt/signin...");
    admin_user.signin(req, res);
});

//------------------------------------------------------------------------------
// 付费用户数据获取(Pay User)
//------------------------------------------------------------------------------
/**
 * 获取付费用户的统计数据(指定日期段)
 */
router.post('/get_payuser_data', function (req, res) {
    console.log("call API admin_api/get_payuser_data...");
    statistics_payuser.get_data(req, res);
});

/**
 * 获取月卡用户列表
 */
router.post('/get_carduser_list', function (req, res) {
    console.log("call API admin_api/get_carduser_list...");
    statistics_payuser.get_carduser_list(req, res);
});

/**
 * 获取付费用户的统计数据(按用户分组)
 */
router.post('/get_payuser_rank', function (req, res) {
    console.log("call API admin_api/get_payuser_rank...");
    statistics_payuser.get_user_pay_data(req, res);
});

/**
 * 获取付费日志记录(指定日期段)
 */
router.post('/get_paylog_data', function (req, res) {
    console.log("call API admin_api/get_paylog_data...");
    statistics_payuser.get_paylog(req, res);
});

/**
 * 查询付费记录(使用game_order_id查询单一订单, 使用game_account_id查询一个账户下的所有订单)
 */
router.post('/query_pay', function (req, res) {
    console.log("call API admin_api/query_pay...");
    statistics_payuser.query_pay(req, res);
});

/**
 * 查询玩家日志.
 */
router.post('/query_log', function (req, res) {
    console.log("call API admin_api/query_log...");
    admin_backdoor.queryLog(req, res);
});

//------------------------------------------------------------------------------
// 权限管理(Auth Mgmt)
//------------------------------------------------------------------------------
/**
 * 添加权限页面
 */
router.post('/mgmt/add_auth', function (req, res) {
    console.log("call API admin_api/mgmt/add_auth...");
    admin_auth.add(req, res);
});

/**
 * 禁止权限页面
 */
router.post('/mgmt/delete_auth', function (req, res) {
    console.log("call API admin_api/mgmt/delete_auth...");
    admin_auth.delete(req, res);
});

/**
 * 激活权限页面
 */
router.post('/mgmt/valid_auth', function (req, res) {
    console.log("call API admin_api/mgmt/valid_auth...");
    admin_auth.valid(req, res);
});

/**
 * 编辑权限页面
 */
router.post('/mgmt/edit_auth', function (req, res) {
    console.log("call API admin_api/mgmt/edit_auth...");
    admin_auth.edit(req, res);
});

//------------------------------------------------------------------------------
// 角色管理(Role Mgmt)
//------------------------------------------------------------------------------

/**
 * 添加角色页面
 */
router.post('/mgmt/add_role', function (req, res) {
    console.log("call API admin_api/mgmt/add_role...");
    admin_role.add(req, res);
});

/**
 * 禁止角色页面
 */
router.post('/mgmt/delete_role', function (req, res) {
    console.log("call API admin_api/mgmt/delete_role...");
    admin_role.delete(req, res);
});

/**
 * 激活角色页面
 */
router.post('/mgmt/valid_role', function (req, res) {
    console.log("call API admin_api/mgmt/valid_role...");
    admin_role.valid(req, res);
});

/**
 * 编辑角色页面
 */
router.post('/mgmt/edit_role', function (req, res) {
    console.log("call API admin_api/mgmt/edit_role...");
    admin_role.edit(req, res);
});

//------------------------------------------------------------------------------
// 用户管理(User Mgmt)
//------------------------------------------------------------------------------

/**
 * 添加用户页面
 */
router.post('/mgmt/add_user', function (req, res) {
    console.log("call API admin_api/mgmt/add_user...");
    admin_user.add(req, res);
});

/**
 * 禁止用户页面
 */
router.post('/mgmt/delete_user', function (req, res) {
    console.log("call API admin_api/mgmt/delete_user...");
    admin_user.delete(req, res);
});

/**
 * 激活用户页面
 */
router.post('/mgmt/valid_user', function (req, res) {
    console.log("call API admin_api/mgmt/valid_user...");
    admin_user.valid(req, res);
});

/**
 * 编辑用户页面
 */
router.post('/mgmt/edit_user', function (req, res) {
    console.log("call API admin_api/mgmt/edit_user...");
    admin_user.edit(req, res);
});



//==============================================================================
//==============================================================================

module.exports = router;