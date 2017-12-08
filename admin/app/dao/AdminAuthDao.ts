const authTable = 'tbl_admin_auth';

exports.insert = async (app, data) => {
    try {
        const rows = {
            page: data.page,
            description: data.description,
            parent: data.parent,
            level: data.level
        }
        console.log('adminAuth rows:', rows);
        let res = await app.mysql.insert(authTable, rows);
        console.log('adminAuth insert:', res);
        return { result: true, data: res, errCode: null }

    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.updateById = async (app, data) => {
    try {
        console.log('adminAuth start', data);
        let rows: any = {};
        rows.id = data.id;
        if (data.page != null) rows.page = data.page;
        if (data.description != null) rows.description = data.description;
        if (data.parent != null) rows.parent = data.parent;
        if (data.level != null) rows.level = data.level;
        if (data.valid != null) rows.valid = data.valid;
        console.log('adminAuth rows:', rows);
        let res = await app.mysql.update(authTable, rows);
        console.log('adminAuth insert:', res);
        return { result: true, data: res, errCode: null }

    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.getAll = async (app) => {
    try {
        let res = await app.mysql.select(authTable);
        console.log('adminAuth getAll:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

