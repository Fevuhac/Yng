/**
 * Created by dfc on 2017/10/17.
 */
var express = require('express');
var router = express.Router();
const http = require('http');
const https = require('https');
var SERVER_CFG = require("../src/cfgs/server_cfg").SERVER_CFG;
const HTTP_PORT = SERVER_CFG.HTTP ? SERVER_CFG.HTTP_PORT:SERVER_CFG.HTTPS_PORT;
const HTTP_HEAD = SERVER_CFG.HTTP? 'http://':'https://';
var buzz_image = require('../src/buzz/buzz_img');

var DEBUG = 1;
var TAG = "img_api";

router.post('/load_web_img', function (req, res) {
    const FUNC = TAG + "/load_web_img --- ";
    var dataObj = null;
    try {
        dataObj = JSON.parse(req.body.data);
    } catch (err) {
        res.success({
            type: 1,
            msg: '参数错误',
            err: "1"
        });
        throw err;
    }
    if (!dataObj) {
        res.success({
            type: 1,
            msg: '参数错误',
            err: "1"
        });
    }
    buzz_image.downloadImage(dataObj, function (err, results) {
        if (err) {
            console.log(FUNC + "网络图片下载失败 - dataObj:", dataObj);
            // console.error(FUNC + "网络图片下载失败 - dataObj:", dataObj);
            res.success({
                type: 1,
                msg: '网络图片下载失败',
                err: err
            });
        } else {
            if (DEBUG) console.log(FUNC + " results: ", results);
            res.success({
                type: 1,
                msg: '网络图片下载成功',
                data: results,
                aes: false
            });
        }
    });
});

// if (figure_url == 'default.png') {}


function downloadImg(figure_url, cb) {
    let net = http;
    if(figure_url.match('https')){
        net = https;
    }
    let req = net.request(figure_url, function (res) {
        let buff = null;
        res.on('data', function (chunk) {
            if (!buff) {
                buff = Buffer.from(chunk);
            } else {
                buff = Buffer.concat([buff, chunk], buff.byteLength + chunk.byteLength);
            }
        });
        res.on('end', function () {
            cb(null, [buff, res.headers])
        });
    });

    req.on('error', function (error) {
        console.log('error:', error);
        cb(error, [null, null]);
    });
    req.end();
}

router.get('/', function (req, res) {
    if(req.query.figure_url == 'default.png'){
        let url = `${HTTP_HEAD}${req.hostname}:${HTTP_PORT}/default.png`;
        res.redirect(301, url);
    }
    else{
        downloadImg(decodeURIComponent(req.query.figure_url), function (err, [buff, headers]) {
            if(err){
                console.log('downloadImg---', err);
                res.status(400);
                res.json({ rc: 400, error: err });
            }
            else{
                headers["Access-Control-Allow-Origin"] = "*";
                res.writeHead(200, headers);
                res.write(buff);
                res.end();
            }
        });
    }

})

module.exports = router;