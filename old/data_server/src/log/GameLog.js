let async = require('async');
let LogUtil = require('../utils/LogUtil');
let LogObj = LogUtil.LogObj;

let buzz_bigdata = require('../buzz/buzz_bigdata');

let TAG = '【GameLog】';

exports.addGameLog = addGameLog;
exports.flushLog = flushLog;

// =========================================================
// 话费券日志
// =========================================================
class LogHuafei extends LogObj{
    /**
     * 话费券日志.
     */
    constructor(logInfo) {
        super(logInfo.table, logInfo.fields, logInfo.timeFields);
    }
}

let huafeiLogInfo = {
    table: 'tbl_huafei_log',
    fields: ['uid','gain','cost','total','scene','comment','time'],
    timeFields:['time'],
};
/**
 * 数据格式:
logHuafei.push({
    uid: 21,
    gain: 10,
    cost: 0,
    total: 20,
    scene: 1,
    comment: "'后台取消兑换返还玩家话费券'",
    time: new Date(),
});
*/
global.logHuafei = new LogHuafei(huafeiLogInfo);


// =========================================================
// 金币日志
// =========================================================
class LogGold extends LogObj{
    /**
     * 金币日志.
     */
    constructor(logInfo) {
        super(logInfo.table, logInfo.fields, logInfo.timeFields);
    }

    push(data) {
        super.push(data);
        console.log('记录到大数据统计中');
        buzz_bigdata.recordGold(
            data.account_id,
            data.cost,
            data.gain,
            data.total,
            data.scene);
    }
}

let goldLogInfo = {
    table: 'tbl_gold_log',
    fields: ['account_id','log_at','gain','cost','total','duration','scene','nickname', 'level'],
    timeFields:['log_at'],
};
/** 数据格式:
logGold.push({
    account_id: 21,
    log_at: new Date(),
    gain: 10,
    cost: 0,
    duration: 20,
    total: 20,
    scene: 1,
    nickname: 0,
    level: 1,
});
*/
global.logGold = new LogGold(goldLogInfo);


// =========================================================
// 钻石日志
// =========================================================
class LogDiamond extends LogObj{
    /**
     * 钻石日志.
     */
    constructor(logInfo) {
        super(logInfo.table, logInfo.fields, logInfo.timeFields);
    }
}

let diamondLogInfo = {
    table: 'tbl_pearl_log',
    fields: ['account_id','log_at','gain','cost','total','scene','nickname'],
    timeFields:['log_at'],
};
/** 数据格式:
logDiamond.push({
    account_id: 21,
    log_at: new Date(),
    gain: 10,
    cost: 0,
    total: 20,
    scene: 1,
    nickname: 0,
});
*/
global.logDiamond = new LogDiamond(diamondLogInfo);


// =========================================================
// 登录日志
// =========================================================
class LogLogin extends LogObj{
    /**
     * 登录日志.
     */
    constructor(logInfo) {
        super(logInfo.table, logInfo.fields, logInfo.timeFields);
    }
}

let loginLogInfo = {
    table: 'tbl_login_log',
    fields: ['account_id','log_at'],
    timeFields:['log_at'],
};
/** 数据格式:
logLogin.push({
    account_id: 21,
    log_at: new Date(),
});
*/
global.logLogin = new LogLogin(loginLogInfo);

//==============================================================================

/**
 * 存储日志到数据库
 */
function flushLog(cb) {
    async.waterfall(
        [
            function step1(cb) {
                LogUtil.logDb(logHuafei, function(err, res) {
                    console.log('话费券日志已经输出到MySQL数据库');
                    cb(err, res);
                });
            }
            ,function step2(result, cb){
                LogUtil.logDb(logDiamond, function(err, res) {
                    console.log('钻石日志已经输出到MySQL数据库');
                    cb(err, res);
                });
            }
            ,function step3(result, cb){
                LogUtil.logDb(logGold, function(err, res) {
                    console.log('金币日志已经输出到MySQL数据库');
                    cb(err, res);
                });
            }
            ,function step4(result, cb){
                LogUtil.logDb(logLogin, function(err, res) {
                    console.log('登录日志已经输出到MySQL数据库');
                    cb(err, res);
                });
            }
        ],
        function next(err, res) {
            console.log("next()");
            console.log("err:", err);
            console.log("res:", res);
            cb && cb(err);
        }
    );
}

/**
 * 添加游戏货币log(游戏货币包括金币, 钻石, 话费券)
 * @param {*} item_list [{"item_id":"i001","item_num":10}], 如果item_num<0则进入消耗日志 
 * @param {*} account 用户数据
 * @param {*} scene 场景
 * @param {*} hint 用于日志输出的提示文字, 可以不写
 */
function addGameLog(item_list, account, scene, hint) {
    var FUNC = TAG + "addGameLog() --- ";

    console.log(FUNC + "item_list:", item_list);
    let goldGain = 0;
    let diamondGain = 0;
    let huafeiGain = 0;
    for (let i = 0; i < item_list.length; i++) {
        let item = item_list[i];
        let item_id = item.item_id;
        let item_num = item.item_num;
        if ('i001' == item_id) {
            goldGain += item_num;
        }
        if ('i002' == item_id) {
            diamondGain += item_num;
        }
        if ('i003' == item_id) {
            huafeiGain += item_num;
        }
    }
    let uid = account.id;
    if (goldGain != 0) {
        // yDONE: 金币记录日志
        console.log(FUNC + uid + hint + '金币');
        logGold.push({
            account_id: uid,
            log_at: new Date(),
            gain: goldGain > 0 ? goldGain : 0,
            cost: goldGain < 0 ? -goldGain : 0,
            duration: 0,
            total: account.gold,
            scene: scene,
            nickname: 0,
            level: account.level,
        });
    }
    if (diamondGain != 0) {
        // yDONE: 钻石记录日志
        console.log(FUNC + uid + hint + '钻石');
        logDiamond.push({
            account_id: uid,
            log_at: new Date(),
            gain: diamondGain > 0 ? diamondGain : 0,
            cost: diamondGain < 0 ? -diamondGain : 0,
            total: account.pearl,
            scene: scene,
            nickname: 0,
        });
    }
    if (huafeiGain != 0) {
        // yDONE: 话费券记录日志
        console.log(FUNC + uid + hint + '话费券');
        let total = account.package['9']['i003'];
        logHuafei.push({
            uid: uid,
            gain: huafeiGain > 0 ? huafeiGain : 0,
            cost: huafeiGain < 0 ? -huafeiGain : 0,
            total: total,
            scene: scene,
            comment: "'月卡发放话费券'",
            time: new Date(),
        });
    }   
}