const crc = require('crc');

module.exports.dispatch = function (key, list) {
    let index = key % list.length;
    if(isNaN(index)){
        return;
    }
    return list[index];
};

module.exports.dispatchEx = function(key, list) {
    let index = Math.abs(crc.crc32(key)) % list.length;
    if(isNaN(index)){
        return;
    }
    return list[index];
};



