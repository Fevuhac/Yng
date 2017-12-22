

var zlib = require('zlib');

var fs = require('fs');
var Path = require('path');

/**
 * date类型转成string
 * eg:
 * (new Date()).format("yyyyMMddhhmmss") ==> 20161010110655
 */
Date.prototype.format = function (fmt) { //author: meizz   
    var o = {
        "M+" : this.getMonth() + 1,               //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth() + 3) / 3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// let filePath = "F:/project/fishjoy_develop/fishjoy_js/assets/resources/common/cfgs/all_cfgs.json";

// unzip_file();

var zip_file = function(filePath, topath) {

	fs.readFile(filePath, 'utf8', (err, data)=> {
		if (err) {
			return console.error(err);
		}else{
			// console.log("----------------", data);
			zlib.deflate(data, (err, buffer) => {
			  if (!err) {
					// console.log(buffer.toString('base64'));
					var baseName = Path.basename(filePath);
					// const newFileName = filePath.substring(0, filePath.lastIndexOf("."));
					baseName = baseName.substring(0, baseName.lastIndexOf("."));
					console.log("----newfile:", baseName );
					fs.writeFile(Path.join(topath, baseName), buffer.toString('base64'), (err) => {
						if (err){
							console.log(err);
						}else {
							// unzip_file();
							console.log(baseName + " success");
							// fs.unlinkSync(filePath);
						}
					})
			  } else {
				// handle error
			  }
			});
		}
	})
};

// zip_file("../../fishjoy_js/assets/resources/common/cfgs/all_cfgs.json");

// zip_file("../../fishjoy_js/assets/resources/game/cfgs/all_merge.json");

zip_file("客户端导出/all_cfgs.json", "服务器导出");

zip_file("客户端导出/all_merge.json", "服务器导出");

//更新压缩文件时间戳记录
var timeStamp = (new Date()).format("yyyyMMddhhmmss")
var str = '"cfgs/all_cfgs":' + timeStamp + ',\n"cfgs/all_merge":' + timeStamp + ' \n'
fs.writeFile(Path.join("服务器导出", 'json_list.cfg'), str, (err) => {
	if (err){
		console.log(err);
	}else {
		console.log("json_list success");
	}
});


