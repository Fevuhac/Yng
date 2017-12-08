/**
 * Created by linyng on 2017/4/20.
 */
// sequelize-auto -o "./models" -d fishjoy -h localhost -u root -p 3306 -x root -e mysql

const mysql = require('mysql');
const utils = require('../../../base/utils/utils');
const async = require('async');

class Connector {
    constructor() {
        this.pool = null;
    }

    start(opts, cb) {
        if (!opts.enable) {
            utils.invokeCallback(cb, null);
            return;
        }

        if (!!this.pool) {
            utils.invokeCallback(cb, null);
            return;
        }

        this.insert = this._query;
        this.update = this._query;
        this.delete = this._query;
        this.query = this._query;

        this.pool = this._createPool(opts);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                utils.invokeCallback(cb, '数据库连接失败' + err);
            } else {
                global.mysqlConnector = this;
                utils.invokeCallback(cb, null, this);
            }
        }.bind(this));
    }

    stop() {
        this.pool.end(function (err) {
            console.log('mysql all connections in the pool have ended');
        });
    }

    buildParam(sql, datas) {
        let sqlParams = [];
        if (!sql || !datas) {
            return sqlParams;
        }

        for (let i = 0; i < datas.length; ++i) {
            sqlParams.push({
                sql: sql,
                params: datas[i]
            })
        }

        return sqlParams;
    }


    /**
     * 通过事务执行数据库操作
     * @param sqlCmds
     * @param callback
     */
    execTransaction(sqlParams, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err, null);
                return;
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    callback(err, null);
                    return;
                }

                let funcAry = [];
                sqlParams.forEach(function (sql_param) {
                    let temp = function (cb) {
                        let sql = sql_param.sql;
                        let param = sql_param.params;
                        connection.query(sql, param, function (err) {
                            if (err) {
                                connection.rollback(function () {
                                    console.log("事务失败，", sql_param, " ERROR：", err);
                                    cb(err);
                                });
                            } else {
                                cb(null);
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    if (err) {
                        connection.rollback(function (err) {
                            console.log("事务回滚失败， error: " + err);
                            connection.release();
                            callback(err, null);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            if (err) {
                                console.log("执行事务失败，", err);
                                connection.rollback(function () {
                                    connection.release();
                                    callback(err, null);
                                    return;
                                });
                            } else {
                                connection.release();
                                callback(null, info);
                                return;
                            }
                        })
                    }
                })
            });
        });
    }

    _query(sql, args, cb) {
        this.pool.getConnection(function (err, connection) {
            if (!!connection) {
                connection.query(sql, args, function (error, results) {
                    connection.release();
                    utils.invokeCallback(cb, error, results);
                });
            } else {
                utils.invokeCallback(cb, error);
            }
        });
    }

    _createPool(opts) {
        if (!opts.enable) {
            return;
        }

        console.log(opts);

        let options = {
            host: opts.server.host,
            port: opts.server.port,
            database: opts.server.database,
            user: opts.server.user,
            password: opts.server.password,
            charset: opts.server.charset,
            insecureAuth: opts.server.auth,
            connectionLimit: opts.ext.poolSize,
        };

        return mysql.createPool(options);
    }


}

module.exports = Connector;