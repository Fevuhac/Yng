const roleTable = 'tbl_admin_role';

exports.insert = async (app, data) => {
    try {
        const rows = {
            rname: data.rname,
            description: data.description,
            auth_ids: data.auth_ids
        }
        let res = await app.mysql.insert(roleTable, rows);
        console.log('adminRole insert:', res);
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
        if (data.rname != null) rows.rname = data.rname;
        if (data.description != null) rows.description = data.description;
        if (data.auth_ids != null) rows.auth_ids = data.auth_ids;
        if (data.valid != null) rows.valid = data.valid;

        let res = await app.mysql.update(roleTable, rows);
        console.log('adminRole insert:', res);
        return { result: true, data: res, errCode: null }

    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}

exports.getAll = async (app) => {
    try {
        let res = await app.mysql.select(roleTable);
        console.log('adminRole getAll:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}