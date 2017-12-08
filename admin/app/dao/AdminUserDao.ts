const userTable = 'tbl_admin_user';

exports.insert = async (app, data) => {
    try {
        const rows = {
            uname: data.uname,
            salt: data.salt,
            password: data.password,
            role: data.role
        }
        let res = await app.mysql.insert(userTable, rows);
        console.log('adminUser insert:', res);
        console.log('adminUser insertId:', res.insertId);
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
        rows.id = data.id;
        if (data.token != null) rows.token = data.token;
        if (data.uname != null) rows.uname = data.uname;
        if (data.password != null) rows.password = data.password;
        if (data.role != null) rows.role = data.role;
        if (data.valid != null) rows.valid = data.valid;
        if (data.salt != null) rows.salt = data.salt;

        let res = await app.mysql.update(userTable, rows);
        console.log('adminUser updateById:', res);
        return { result: true, data: data, errCode: null }

    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.getByName = async (app, data) => {
    try {
        let res = await app.mysql.get(userTable, {
            where: { uname: data.uname }
        });
        console.log('adminUser getByName:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.getAll = async (app) => {
    try {
        let res = await app.mysql.select(userTable);
        console.log('adminUser getAll:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}