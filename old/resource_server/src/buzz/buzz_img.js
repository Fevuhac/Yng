/**
 * 下载图片
 * Created by dfc on 2017/10/17.
 */

var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");

exports.downloadImage = downloadImage;

const base_url = "public/img";

var TAG = "【buzz_img】";
var DEBUG = 1;
var ERROR = 1;

function downloadImage(data, cb) {
    const FUNC = TAG + "downloadImage() --- ";

    var web_url = data.web_url.split("_|||_")[0];
    var id = data.id;


    if (DEBUG) console.log(FUNC + "web_url:", web_url);

    /*if (web_url == null || web_url == "" || web_url == undefined) {
        cb(null, 'img/0/0/jiaodie.png');
        return;
    }

    if(web_url.split("_|||_")[0]=="http://p3.wmpic.me/article/2015/05/18/1431913649_GWJqwtVU.jpeg") {
        cb(null, 'img/0/0/jiaodie.png');
        return;
    }*/

    var split = web_url.split(":");
    if (split[0] != "https") {
        if (split[0] != "http") {
            web_url = "http:" + web_url;
        }
        try {
            http.get(web_url, function (res) {

                if (DEBUG) console.log(FUNC + "Got response: " + res.statusCode);

                if (res.statusCode == 404) {
                    if (ERROR) console.error("下载图片失败(可能图片链接失效或错误):", res.statusCode);
                    cb(null, 'img/0/0/jiaodie.png');
                }
                else {
                    var imgData = "";

                    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

                    res
                        .on("data", function (chunk) {
                            if (DEBUG) console.log(FUNC + "add chunk");
                            imgData += chunk;
                        })
                        .on("end", function () {
                            if (DEBUG) console.log(FUNC + "download end");
                            storeImage(id, imgData, cb);
                        })
                        .on("error", function () {
                            if (DEBUG) console.log(FUNC + "download error");
                        });
                }
            })
                .on("error", function (err) {
                    if (ERROR) console.error(FUNC + "下载图片出现错误:", err);
                    cb("下载图片失败");
                });
        } catch (err) {
            cb(null, 1);
        }


    }
    if (split[0] == "https") {
        https.get(web_url, function (res) {

            if (DEBUG) console.log(FUNC + "Got response: " + res.statusCode);

            if (res.statusCode == 404) {
                if (ERROR) console.error("下载图片失败(可能图片链接失效或错误):", res.statusCode);
                cb(null, 'img/0/0/jiaodie.png');
            }
            else {
                var imgData = "";

                res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

                res
                    .on("data", function (chunk) {
                        if (DEBUG) console.log(FUNC + "add chunk");
                        imgData += chunk;
                    })
                    .on("end", function () {
                        if (DEBUG) console.log(FUNC + "download end");
                        storeImage(id, imgData, cb);
                    })
                    .on("error", function () {
                        if (DEBUG) console.log(FUNC + "download error");
                    });
            }
        })
            .on("error", function (err) {
                if (ERROR) console.error(FUNC + "下载图片出现错误:", err);
                cb("下载图片失败");
            });
    }


}

// 存储图片路径到数据库和缓存
function storeImage(id, imgData, cb) {
    let dir = createDirName(id);
    // 生成一个新的文件名.
    var local_url = dir+id + ".png";
    mkdirs(dir,function () {
        fs.writeFile(local_url, imgData, "binary", function (err) {
            if (err) {
                if (ERROR) console.error("打开文件失败(可能是路径问题):", err);
                cb("打开文件失败");
                return;
            }
            if (DEBUG) console.log("下载图片成功");
            cb(null, local_url.replace("public/",""));
        });
    })

}

function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

function createDirName(id) {
    let a = id % 1000;
    let b = Math.floor(id / 1000) % 1000;
    return base_url + "/" + a + "/" + b+"/";
}