const operationTable = 'tbl_operation';
import import_def from '../util/import_def';

exports.getAll = async (app) => {
    try {
        let res = await app.mysql.select(operationTable);
        console.log('operation getAll:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.insert = async (app, data) => {
    try {
        const rows = {
            desc: data.desc,
            value: data.value,
            type: data.type
        }
        let res = await app.mysql.insert(operationTable, rows);
        console.log('operation insert:', res);
        console.log('operation insertId:', res.insertId);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }

}

exports.updateByCfgIdForValue2Decrease = async (app, data) => {
    try {
        let sql = "update `tbl_operation` set `value`=`value`-1 where `cfg_id`=?";
        let res = await app.mysql.query(sql, [data.cfg_id]);
        console.log('operation updateByCfgIdForValue2Decrease:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.updateById = async (app, data) => {
    try {
        let rows: any = {};
        rows.id = data.oid;
        if (data.value != null) rows.value = data.value;
        if (data.desc != null) rows.desc = data.desc;
        if (data.cfg_id != null) rows.cfg_id = data.cfg_id;
        console.log('operation rows:', rows);
        let res = await app.mysql.update(operationTable, rows);
        console.log('operation insert:', res);
        return { result: true, data: res, errCode: null }

    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.getSwitch = async (app) => {
    try {
        let res = await app.redis.get(import_def.REDISKEY.SWITCH.CIK);
        console.log('operation getSwitch:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.updateSwitch = async (app, data) => {
    try {
        let res = await app.redis.set(import_def.REDISKEY.SWITCH.CIK, data);
        console.log('operation updateSwitch:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}
