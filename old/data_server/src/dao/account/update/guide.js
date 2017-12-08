////////////////////////////////////////////////////////////////////////////////
// Account Update Guide
// 新手引导完成状态
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ObjUtil = require('../../../buzz/ObjUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【update/guide】";
const GUIDE_INIT_WP = 1;
const GUIDE_DONE_WP = 5; 

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL guide.update()");
    
    var uid = my_account['id'];
    var token = my_account['token'];
    
    var guide = data['guide'] ? 1 : 0;
    var guide_weak = ObjUtil.data2String(data['weak']);

    if (DEBUG) console.log('guide_weak:\n', data['weak']);

    // 需要在强引导结束时强制设置武器等级为5(客户端没有显式通知过服务器)
    var guide_complete = 0;
    CacheAccount.getGuide(uid, function (guide_old) {
        if (!guide_old && guide == 1) {
            guide_complete = 1;
        }

        //--------------------------------------------------------------------------
        // 更新缓存中的数据(重要:数据库操作将会被删除)
        //--------------------------------------------------------------------------
        CacheAccount.setGuide(uid, guide);
        CacheAccount.setGuideWeak(uid, data['weak']);
        //--------------------------------------------------------------------------

        // 更新数据库中此账户的guide字段
        var sql = '';
        sql += 'UPDATE `tbl_account` ';
        sql += 'SET `guide`=?, `guide_weak`=? ';
        if (guide_complete) {
            sql += ', `weapon`=? ';
        }
        sql += 'WHERE `id`=? AND `token`=?';
        var sql_data = [guide, guide_weak];
        if (guide_complete) {
            sql_data.push(GUIDE_DONE_WP);
        }
        sql_data.push(uid);
        sql_data.push(token);
        
        if (DEBUG) console.log('sql: ', sql);
        if (DEBUG) console.log('sql_data: ', sql_data);
        
        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                console.error(FUNC + "err:\n", err);
                console.error(FUNC + "sql:\n", sql);
                console.error(FUNC + "sql_data:\n", sql_data);
                cb(err);
            } else {
                var ret = {};
                if (guide_complete) {
                    CacheAccount.setWeapon(my_account, GUIDE_DONE_WP, function (chs) {
                        if (chs && chs.length == 2) {
                            var charmPoint = chs[0];
                            var charmRank = chs[1];
                            charmPoint >= 0 && (ret.charm_point = charmPoint);
                            charmRank >= 0 && (ret.charm_rank = charmRank);
                        }
                        cb(null, [ret]);
                    });
                }else{
                    cb(null, [ret]);
                }
            }
        }); 
    });
}


//==============================================================================
// private
//==============================================================================
