const database = require('../database/dbclient');
const DBType = require('../database/consts/consts').DBType;
const async = require('async');
const logger = require('./logHelper');

class Application{
    constructor(opts){
        this._opts = opts;
    }

    async start(){
        let result = true;
        try {
            
            if(this._opts.db.redis){
                let redis = await database.runner.connectRedis(this._opts.db.redis);
                if(redis){
                    this.dbEvent(DBType.REDIS, redis);
                }
            }

            if(this._opts.db.mysql){
                let mysql = await database.runner.connectMysql(this._opts.db.mysql);
                if(mysql){
                    this.dbEvent(DBType.MYSQL, mysql);
                }
            }

        }catch (err){
            console.error('应用程序基础模块启动失败，err:', err);
            result =  false;
        }

        if(result){
            console.log('应用程序基础模块启动成功');
        }

        let promise = new Promise(function (resolve, reject) {
            resolve(result);
        });

        return promise;
    }

    stop(){

    }

    dbEvent(type, db){
    }

}

module.exports = Application;