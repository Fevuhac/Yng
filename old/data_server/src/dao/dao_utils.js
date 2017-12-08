////////////////////////////////////////////////////////////
// 通用方法
////////////////////////////////////////////////////////////

exports.setField = setField;
exports.getFieldsWhere = _getFieldsWhere;

// exports.errorLog = errorLog;
// function errorLog(ERROR, FUNC, err, sql, sql_data, cb) {
//     if (ERROR) console.error(FUNC + '[ERROR] err:\n', err);
//     if (ERROR) console.error(FUNC + '[ERROR] sql:\n', sql);
//     if (ERROR) console.error(FUNC + '[ERROR] sql_data:\n', sql_data);
//     if (cb) cb(err);
// }

function setField(pool, data, cb) {


    console.log('pool:\n', pool);
    console.log('data:\n', data);

    var table = data.table;
    var field = data.field;
    var value = data.value;
    var id = data.id;

    var sql = "";
    sql += "UPDATE " + table + " ";
    sql += "SET " + field + "=? ";
    sql += "WHERE id=?";
    var sql_data = [value, id];
    console.log('sql:\n', sql);
    console.log('sql_data:\n', sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            cb(err);
            return;
        }
        console.log('rows:\n', rows);
        
        cb(null, rows);
    });
}

// 获取表中符合条件的某几个字段值
function _getFieldsWhere(pool, cb, table_name, where_clause, fields_list) {
    var sql = 'SELECT ' + fields_list + ' FROM ' + table_name + ' where ' + where_clause;
    console.log('sql: ' + sql);
    pool.query(sql, function (err, rows) {
        if (err) {
            cb(err);
            return;
        }
        
        cb(null, { list: rows });
    });
}

// 获取表中的所有项目列表数据
exports.getTableList = function (pool, cb, table_name, err_info) {
    var sql = 'SELECT * FROM `' + table_name + '`';
    pool.query(sql, function (err, rows) {
        if (err) {
            cb(err);
            return;
        }
        
        // 数据为空时也要告知客户端
        //if (rows.length <= 0) {
        //    cb(new Error(err_info));
        //    return;
        //}
        
        cb(null, { list: rows });
    });
};

// 添加表记录
// field_list = '`role_name_cn`, `role_name_en`';
// field_data = [role_name_cn, role_name_en];
// field_replacement = '?,?';
exports.addTableRecord = function (pool, cb, table_name, data, field_list) {
    
    //console.log('data: ', data);
    var field_list_in_sql = '';
    var field_list_data = [];
    var field_replacement = '';
    // 获取SQL中的字段列表
    // 获取需要的替代符数目
    for (var i = 0; i < field_list.length; i++) {
        if (i > 0) {
            field_list_in_sql += ',';
            field_replacement += ',';
        }
        field_list_in_sql += '`' + field_list[i] + '`';
        field_replacement += '?';
    }
    // 获取query函数中的字段值
    for (var i = 0; i < field_list.length; i++) {
        //console.log('data[' + i + ']: ', data[field_list[i]]);
        field_list_data[i] = data[field_list[i]];
    }
    
    var sql = 'INSERT INTO `' + table_name + '` (' + field_list_in_sql + ') VALUES (' + field_replacement + ')';
    console.log('sql: ', sql);
    //console.log('field_list_data: ', field_list_data);
    pool.query(sql, field_list_data, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            cb(null, { result: result });
        }
    });
};

// 保存角色信息
exports.deleteTableRecord = function (pool, cb, data, table_name) {
    
    var id = data['id'];
    
    var sql = 'DELETE FROM `' + table_name + '` WHERE `id`=?';
    console.log('id: ', id);
    console.log('sql: ', sql);
    pool.query(sql, [id], function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            cb(null, { result: result });
        }
    });
};

// 修改表信息
exports.updateTableRecord = function (pool, cb, table_name, data, field_list) {
    var field_list_in_sql = '';
    var field_list_data = [];
    // 获取SQL中的字段列表
    // 获取需要的替代符数目
    for (var i = 0; i < field_list.length; i++) {
        if (i > 0) {
            field_list_in_sql += ',';
        }
        field_list_in_sql += '`' + field_list[i] + '`=?';
    }
    // 获取query函数中的字段值
    for (var i = 0; i < field_list.length; i++) {
        field_list_data[i] = data[field_list[i]];
    }
    
    var id = data['id'];
    field_list_data[field_list_data.length] = id;
    
    var sql = 'UPDATE `' + table_name + '` SET ' + field_list_in_sql + ' WHERE `id`=?';
    console.log('EXECUTE SQL - ' + sql);
    pool.query(sql, field_list_data, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            cb(null, { result: result });
        }
    });
};

// 分组查询工具
// {table_name: 'city', group_name: 'province'}
function _selectTableGroup(pool, cb, data) {
    var table_name = data.table_name;
    var group_name = data.group_name;
    
    var sql = 'SELECT * FROM `' + table_name + '` GROUP BY `' + group_name + '`';
    pool.query(sql, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            cb(null, { result: result });
        }
    });
}
exports.selectTableGroup = _selectTableGroup;

// 批量更新数据
// {table_name: 'province', ref_field: 'id', target_field:'channel', data_array: list}
function _updateData(pool, cb, data) {
    var table_name = data.table_name;
    var ref_field = data.ref_field;
    var target_field = data.target_field;
    var data_array = data.data_array;

    var sql = '';
    sql += 'UPDATE ' + table_name + ' ';
    sql += 'SET ' + target_field + ' = CASE id ';
    var ids = '';
    for (var i = 0; i < data_array.length; i++) {
        sql += 'WHEN ' + data_array[i][ref_field] + ' THEN ' + data_array[i][target_field] + ' ';
        if (i != 0) {
            ids += ',';
        }
        ids += data_array[i][ref_field];
    }
    sql += 'END ';
    sql += 'WHERE id IN(' + ids + ')';
    
    console.log('sql', sql);
    
    pool.query(sql, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            cb(null, 'update table ' + table_name + ' success!');
        }
    });
}
exports.updateData = _updateData;

// 根据关键字查询数据
// {table_name: 'province', ref_field: 'id', target_field:'channel', ref_value: '四川省'}
function _getData(pool, cb, data) {
    var table_name = data.table_name;
    var ref_field = data.ref_field;
    var ref_value = data.ref_value;
    var target_field = data.target_field;
    
    var sql = 'SELECT ' + target_field + ' FROM ' + table_name + ' WHERE ' + ref_field + '=' + ref_value;
    
    console.log('sql', sql);
    
    pool.query(sql, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        else {
            //cb(null, 'get ' + table_name + ' data success!');
            cb(null, result);
        }
    });
}
exports.getData = _getData;

function _checkParams(param_name_list, data, cb) {
    for (var i = 0; i < param_name_list.length; i++) {
        var param_name = param_name_list[i];
        var param_value = data[param_name];
        if (param_value == null || param_value == "") {
            cb(new Error('接口调用请传参数' + param_name + ''));
            return true;
        }
    }
    return false;
}
exports.checkParams = _checkParams;