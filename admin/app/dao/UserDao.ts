
exports.getTotalUserCount = async (app) => {
    try {
        let data = await app.mysql.query('select count(1) as res from tbl_account', []);
        console.log('getTotalUserCount:', data);
        return { result: true, data: data[0].res, errCode: null }

    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalGold = async (app) => {
    try {
        let sql = "select sum(gold) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }

    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalRecharge = async (app) => {
    try {
        let sql = "select sum(recharge) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }
    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalCash = async (app) => {
    try {
        let sql = "select sum(cash) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }
    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalCost = async (app) => {
    try {
        let sql = "select sum(cost) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }
    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalBonusPool = async (app) => {
    try {
        let sql = "select sum(bonus_pool) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }
    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}

exports.getTotalPumpPool = async (app) => {
    try {
        let sql = "select sum(pump_pool) as res from tbl_account";
        let data = await app.mysql.query(sql, []);
        return { result: true, data: data[0].res, errCode: null }
    }
    catch (err) {
        return { result: false, data: null, errCode: "" }
    }
}