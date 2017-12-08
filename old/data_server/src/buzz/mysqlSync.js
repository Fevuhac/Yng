const async = require('async');
const utils = require('../utils/utils');
const rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');


function DBMysqlHelper() {
};


/**
 * 获取排位赛段位
 * @param {排位赛积分} points 
 * @return {返回段位ID} 
 */
DBMysqlHelper.prototype.getRankId = function(points){
    let max_id = 1;
    for(let i = 0; i< rank_rankgame_cfg.length; ++i){
        max_id = rank_rankgame_cfg[i].id;
        if(points < rank_rankgame_cfg[i].integral){
            return rank_rankgame_cfg[i].id - 1;
        }
    }
    return max_id;
};



//

/**
 * 构建排位赛重置sql参数列表
 * @param {slq语句模板} sqlTemplate 
 * @param {排位积分数据} datas 
 * @return {返回排位积分集合} 
 */
DBMysqlHelper.prototype.buildRankResetSqlParams = function (sqlTemplate, datas) {
    let sqlParamsEntity = [];
    datas.forEach(function (params) {
        // console.log(`params.id:${params.id}params.points:${params.points} params.rank:${params.rank}`)
        let reset_points = 740 + (Math.max(params.points - 800, 100)*0.6);
        let real_points = reset_points < 800 ? 800:reset_points;
        let inc = real_points - params.points;
        params.points = inc;
        params.rank = this.getRankId(real_points);
        // console.log(`reset_points:${reset_points} real_points:${real_points} inc${inc} rank${params.rank}`)
        sqlParamsEntity.push({
            sql: sqlTemplate,
            params: [params.points, params.rank, params.id]
        })
    }.bind(this));
    return sqlParamsEntity;
};

/**
 * 构建通用sql参数列表
 * @param {slq语句模板} sqlTemplate 
 * @param {数据} datas 
 * @return {返回排位积分集合} 
 */
DBMysqlHelper.prototype.buildGeneralSqlParams = function (sqlTemplate, datas) {

    let sqlParamsEntity = [];
    datas.forEach(function (params) {
        sqlParamsEntity.push({
            sql: sqlTemplate,
            params: params
        })
    }.bind(this));
    return sqlParamsEntity;
};

DBMysqlHelper.prototype.execTrans = function (pool, sqlparams, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return callback(err, null);
        }
        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                return callback(err, null);
            }
            // console.log("开始执行transaction，共执行" + sqlparams.length + "条数据");
            let funcAry = [];
            sqlparams.forEach(function (sql_param) {
                let temp = function (cb) {
                    let sql = sql_param.sql;
                    let param = sql_param.params;
                    connection.query(sql, param, function (tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function () {
                                console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                connection.release();
                                throw tErr;
                            });
                        } else {
                            return cb(null, 'ok');
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function (err, result) {
                if (err) {
                    connection.rollback(function (err) {
                        console.log("transaction error: " + err);
                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function (err, info) {
                        // console.log("transaction info: " + JSON.stringify(info));
                        if (err) {
                            console.log("执行事务失败，" + err);
                            connection.rollback(function (err) {
                                console.log("transaction error: " + err);
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, info);
                        }
                    })
                }
            })
        });
    });
};

//批量重置玩家排位赛积分
DBMysqlHelper.prototype.rankReset =  function(pool, skip, limit) {
    if (null === pool || skip === null || null === limit) {
        console.error('参数错误');
        return;
    }

    let sql = 'select id, points, rank from tbl_rankgame limit ?,?';
    let sqlRankTemplate = "update tbl_rankgame set points = points + ?, rank=? where id=?";
    let args = [skip, limit];
    pool.query(sql, args, function (err, docs) {
        if(err){
            console.error('排行榜重置，数据库异常', err);
            return;
        }

        this.execTrans(pool, this.buildRankResetSqlParams(sqlRankTemplate, docs), function (err, result) {
            if(err){
                console.error('排行榜重置，提交事务数据库异常', err);
                return;
            }

            if(limit === docs.length){
                skip += limit;
               this.rankReset(pool, skip, limit);
            }
            else {
                console.log('执行结束')
                console.timeEnd('tttt');
            }
        }.bind(this));
    }.bind(this));
};

module.exports =  DBMysqlHelper;
