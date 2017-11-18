// const tbl_id_arr = require('./test_ids_1_100000');
// const fs = require('fs');


// let ids = {};
// for(let i = 0; i< tbl_id_arr.length; i++){
//     ids[tbl_id_arr[i]] = 1;
//
// }
//
//
// fs.appendFileSync('test_ids_1_1.json', JSON.stringify(ids));
//
// console.log('写入完成')

// const moment = require('moment')
//
// console.log(moment().format('YYYY-MM-DD HH:MM:SS'));
//
// setTimeout(function () {
//     console.log(moment().format('YYYY-MM-DD HH:MM:SS'));
// },10000)


const fs = require('fs');
// const account_def = require('../consts/account_def');

// let obj = {};
//
// let keys_account = Object.keys(account_def.AccountDef);
// keys_account.forEach(function (key) {
//
//     obj[key.toUpperCase()] = `prefix + ${key.toLowerCase()}`;
//
// });
//
// let keys_other = Object.keys(account_def.OtherDef);
// keys_other.forEach(function (key) {
//
//     obj[key.toUpperCase()] = `prefix + ${key.toLowerCase()}`;
//
// });
//
// fs.appendFileSync('rediskey.json', JSON.stringify(obj));
// console.log('写入完成')


// let obj = {};
//
// let keys_account = Object.keys(account_def.AccountDef);
// keys_account.forEach(function (key) {
//
//     obj[key.toUpperCase()] = key.toLowerCase();
//
// });
//
// let keys_other = Object.keys(account_def.OtherDef);
// keys_other.forEach(function (key) {
//
//     obj[key.toUpperCase()] = key.toLowerCase();
//
// });
//
// fs.appendFileSync('msyqlkey.json', JSON.stringify(obj));
// console.log('写入完成')


const RANK_SCORE_OFFSET = Math.pow(10, 7); //排位权重偏移
const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = ONE_MINUTE_SECONDS * 60;
const ONE_DAY_SECONDS = 24 * ONE_HOUR_SECONDS;
const MONTH_MAX_SECONDS = 2764799;  //月最大秒数

/**
 * 获取时间权重
 * @returns {number}
 */
function getTimeWeight() {
    let t = new Date();
    return t.getDate() * ONE_DAY_SECONDS + t.getHours() * ONE_HOUR_SECONDS + t.getMinutes() * ONE_MINUTE_SECONDS + t.getSeconds();
}

/**
 * 获取时间权重分
 * @param score
 * @returns {number}
 */
function getTimeWeightScore(score) {
    return score*RANK_SCORE_OFFSET + (MONTH_MAX_SECONDS - getTimeWeight());
}

/**
 * 获取原始分数
 * @param weighScore
 * @returns {number}
 */
function getOriginScore(weighScore) {
    return Math.floor(weighScore / RANK_SCORE_OFFSET);
}



let A = getTimeWeightScore(999999998);
console.log('AA:', A);
setTimeout(function () {

    let B = getTimeWeightScore(999999999);
    console.log('BB:', B);
    if (A > B) {
        console.log('A>b OK');

    }else {
        console.log('A<=b OK');
    }

    console.log('A:', getOriginScore(A));
    console.log('B:', getOriginScore(B));

}, 10000);










