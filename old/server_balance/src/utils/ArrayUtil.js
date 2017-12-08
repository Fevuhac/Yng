////////////////////////////////////////
// ArrayUtil
// 数组处理工具集
//--------------------------------------
// 如何使用
// var ArrayUtil = require('src/utils/ArrayUtil');
// ArrayUtil.func(arr, params...);
////////////////////////////////////////

var StringUtil = require('../utils/StringUtil');

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.addOnly = addOnly;
exports.contain = contain;
exports.inArray = inArray;
exports.isArray = isArray;
exports.getItem = getItem;
exports.sum = sum;
exports.makeArrayString = makeArrayString;
exports.getIntArr = getIntArr;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function addOnly(arr, add_item) {
    if (arr.indexOf(add_item) == -1) {
        arr.push(add_item);
    }
};

function contain(arr, target) {
    return arr.indexOf(target) != -1;
};

function inArray(arr, target, field) {
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (item[field] == target) {
            return true;
        }
    }
    return false;
};

function getItem(arr, target, field) {
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (item[field] == target) {
            return item;
        }
    }
    return null;
};

function isArray(obj) {
    if (typeof obj == "object" && obj.constructor == Array) {
        return true;
    }
    return false;
};

function sum(arr) {
    var ret = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i]) {
            ret += arr[i];
        }
    }
    return ret;
};

function makeArrayString(str) {
    var ret = str;
    if (StringUtil.isString(str)) {
        if (!StringUtil.startsWith(str, "[") 
            && !StringUtil.endsWith(str, "]")) {
            ret = "[" + str + "]";
        }
    }
    return ret;
};

/**
 * 从一个数组样式的字符串获取一个数字数组
 */
function getIntArr(str) {
    if (isArray(str)) {
        return str;
    }
    var strArr = str.split(",");
    var intArr = [];
    strArr.forEach(function(data,index,arr) {
        intArr.push(+data);
    });
    return intArr;
}