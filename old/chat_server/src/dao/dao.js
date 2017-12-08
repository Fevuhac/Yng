
var DaoFeedback = require('./dao_feedback');
//==============================================================================
// 调试变量.
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao】";

//==============================================================================
// 
//==============================================================================

function _findAccountByToken(pool, token, cb) {
    var sql = 'SELECT `id`,`tempname`,`created_at`,`updated_at` FROM `tbl_account` WHERE `token`=?';
    pool.query(sql, [token], cb);
}

exports.withDbPool = function (_pool) {
    var pool = {
        query: function (sql, values, cb) {
            // _pool.query(sql, values, cb);
            _pool.getConnection(function(err,conn){
                const FUNC = TAG + "getConnection() --- ";
                if (err) {
                    if (ERROR) console.error(FUNC + "create err:\n", err);
                    cb(err);
                    return;
                }
                if (!conn) {
                    var msg = "Can't create more database connection";
                    if (ERROR) console.error(FUNC + msg);
                    cb({code:1002, msg:msg});
                    return;
                }
                try {
                    conn.query(sql, values, function(err, data){
                        conn.release(); //释放连接
                        cb(err, data);
                    });
                }
                catch(err) {
                    if (ERROR) console.error(FUNC + "query err:\n", err);
                    cb(err);
                }
            });
        }
    };
    return {
        //---------------------Feedback--------------------------
        insertMsg: function (uid, text, cb) {
            DaoFeedback.insertMsg(pool, uid, text, cb);
        },
        findAccountByToken: function (token, cb) {
            _findAccountByToken(pool, token, cb);
        },
        delMsgboard: function (mid, cb) {
            DaoFeedback.del(pool, mid, cb);
        },
    }
};