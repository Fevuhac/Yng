////////////////////////////////////////////////////////////////////////////////
// 女神数据的相关读取和存储
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var CommonUtil = require('../buzz/CommonUtil');
var ObjUtil = require('../buzz/ObjUtil');

var ERROR_OBJ = require('../buzz/cst/buzz_cst_error').ERROR_OBJ;

var CacheAccount = require('../buzz/cache/CacheAccount');
var RedisUtil = require('../utils/RedisUtil');

// var AccountCommon = require('./account/common');
var buzz_charts = require('../buzz/buzz_charts');

//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【dao_goddess】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.resetMaxWaveForAll = resetMaxWaveForAll;
exports.putWeekReward = putWeekReward;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 重置保卫女神的最大波数
 */
function resetMaxWaveForAll(pool, id_list, cb) {
    const FUNC = TAG + "resetMaxWaveForAll() --- ";

    
    console.log(FUNC + "pool:\n" , pool);
    console.log(FUNC + "id_list:\n" , id_list);
    console.log(FUNC + "cb:\n" , cb);
    
    if (DEBUG) console.errlogor(FUNC + "CALL...");
    
    var sql = "";
    sql += "UPDATE `tbl_goddess` ";
    sql += "SET `max_wave`=? ";
    if (id_list) {
        sql += "WHERE id IN (" + id_list + ") ";
    }
    
    var sql_data = [0];

    console.log(FUNC + "sql:\n" , sql);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        cb(null, results);
    });

}

/**
 * 发放周奖励.
 */
function putWeekReward(pool, cb) {
    const FUNC = TAG + "putWeekReward() --- ";
    _resetWeekReward(pool, function() {
        console.log(FUNC + "数据清理完毕");
        _putWeekRewardByPlatform(pool, 1, function() {
            console.log(FUNC + "Android平台周奖励发放完毕");
            _putWeekRewardByPlatform(pool, 2, function() {
                console.log(FUNC + "iOS平台周奖励发放完毕");
                cb();
            });
        });
    });
}


//==============================================================================
// private
//==============================================================================

/**
 * 重置周奖励和周排名.
UPDATE `tbl_goddess` SET week_rank=0, week_reward=0;
 */
function _resetWeekReward(pool, cb) {
    const FUNC = TAG + "_resetWeekReward() --- ";
    var sql = "";
    sql += "UPDATE `tbl_goddess` ";
    sql += "SET week_rank=0 ";
    sql += ", week_reward=0 ";

    var sql_data = [];

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        console.log("results:", results);
        cb();
    });
}

var DBMysqlHelper = require('../buzz/mysqlSync');
const sqlTemplate = 'UPDATE tbl_goddess set week_rank = ?, week_reward=1 where id = ?';

function _putWeekRewardData(pool, platform, start, stop, cb) {

    buzz_charts.getLastweekRank(platform, start, stop, function (err, rank_datas) {

        if(err){
            !!cb && cb(err);
            return;
        }

        console.log('获取到redis排行数据:', rank_datas);

        let mysqlHelper = new DBMysqlHelper();

        let datas = [];
        for(let i = 0; i<rank_datas.length; ++i){
            let data_item = [];
            data_item.push(rank_datas[i]);
            if(i%2){
                datas.push([data_item[1],data_item[0]]);
            }
        }

        let paramEntitys = mysqlHelper.buildGeneralSqlParams(sqlTemplate, datas);
        mysqlHelper.execTrans(pool, paramEntitys, function (err, result) {
            cb&&cb(err, result);
        })

    });
}

function _putWeekRewardByPlatform(pool, platform, cb) {
    _putWeekRewardData(pool, platform,0, 9999, function (err, result) {
            if(err){
                console.log('发放周排行奖励失败 err:',err, '平台:', platform);
                cb && cb(err);
                return
            }
            console.log('发放周排行奖励成功 err:',err, '平台:', platform);
            cb && cb(null);
    })

}