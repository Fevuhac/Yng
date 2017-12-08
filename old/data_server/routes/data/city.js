/**
 * 设置城市
 * Created by zhenghang on 2017/9/20.
 */
var buzz_city = require('../../src/buzz/buzz_city');
var data_util = require('../../routes/data/data_util');

var TAG = "【data/city】";
var DEBUG = 1;

function setCity(req,res) {
    const FUNC = TAG + "setCity() --- ";
    const HINT = "设置城市";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    if(DEBUG)console.log(FUNC+"dataObj",dataObj);
    buzz_city.setCity(req, dataObj, function (err,result) {
        if(DEBUG)console.log(FUNC+"--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

exports.setCity = setCity;