const logTableDef = require('./logTableDef');
const utils = require('../base/utils/utils');

/**
 * log写入mysql
 */
class MysqlLogInsert {

    constructor() {
        this.sqlTemplate = {};
        this._init();
    }


    /**
     * 通过事务批量刷入日志
     * @param sourceData
     * @param cb
     */
    flush(sourceData, cb) {
        let flag = false;
        for (let type in sourceData) {
            let datas = sourceData[type];
            if(datas.length === 0){
                continue;
            }
            flag = true;
            let len = datas.length;
            let sqlParams = mysqlConnector.buildParam(this.sqlTemplate[type], datas);
            datas.splice(0, datas.length);
            mysqlConnector.execTransaction(sqlParams, function (err, result) {
                if(err){
                    logger.error('批量日志类型:' + type + '写入事务提交失败,'+err);
                }
                logger.info('批量日志写入成功,数量', len);
                utils.invokeCallback(cb, err, result);
            });
        }

        if(!flag){
            utils.invokeCallback(cb, null);
        }
    }

    /**
     * 根据字段条目生成占位符?
     * @param fields
     * @returns {string}
     * @private
     */
    _genPlaceholder(fields) {
        let placeholder = '';
        for(let i = 1; i <= fields.length; ++i){
            placeholder +='?';
            if(i !== fields.length){
                placeholder +=',';
            }
        }

        return placeholder;
    }

    /**
     * 初始化创建日志写入sql
     * @private
     */
    _init(){
        for(let type in logTableDef.TABLE){
            let table = logTableDef.TABLE[type];
            let sql = `INSERT INTO ${table.name} (${table.field.join()}) VALUES (${this._genPlaceholder(table.field)})`;
            this.sqlTemplate[type] = sql;
        }
    }


}

module.exports = new MysqlLogInsert();