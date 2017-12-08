////////////////////////////////////////////////////////////////////////////////
// Account Update Comeback
// 翻盘购买数据的更新, 需要购买操作完成后由客户端进行主动更新
// update
// fill
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var StringUtil = require('../../../utils/StringUtil');
var ObjUtil = require('../../../buzz/ObjUtil');
var ErrorUtil = require('../../../buzz/ErrorUtil');
var shop_fund_cfg = require('../../../../cfgs/shop_fund_cfg');
var vip_vip_cfg = require('../../../../cfgs/vip_vip_cfg');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【update/comeback】";

const FUND_10 = 1001;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;
exports.fill = _fill;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 翻盘数据更新(每日重置为{}).
 * 处理的数据格式为{comeback:{cb_id:?}}
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL comeback.update()");
    
    var uid = my_account['id'];
    var token = my_account['token'];
        
    var comeback = ObjUtil.str2Data(data['comeback']);
    var cb_id = parseInt(comeback['cb_id']);
        
    if (DEBUG) console.log('comeback: ', comeback);
    if (DEBUG) console.log('cb_id: ', cb_id);
        
    // 获取my_account中的对应字段
    var old_comeback_json = my_account["comeback"];
    if (DEBUG) console.log('old_comeback_json: ', old_comeback_json);
    try {
        old_comeback_json = ObjUtil.str2Data(old_comeback_json);
    }
    catch (err_parse) {
        if (DEBUG) console.log('my_account: ', my_account);
        cb(new Error("解析错误: 账户数据中的json字符串无法解析为json格式"));
        return;
    }
    // TODO: 数据有效性验证
        
    // 查看当日的翻盘基金是否已经购买
    if (_alreadyBuy(old_comeback_json, cb)) return;
        
    // 没有购买，则设置当前的翻盘基金ID
    old_comeback_json['cb_id'] = cb_id;
    if (DEBUG) console.log('old_comeback_json: ', old_comeback_json);
        
    var price = 0;
    var gold = 0;
    var isFundFound = false;
    // 获取翻盘基金获取的金币数额和RMB的数额
    for (var i = 0; i < shop_fund_cfg.length; i++) {
        var fund = shop_fund_cfg[i];
        if (fund['id'] == cb_id) {
            price = fund['price'] * 100;// 配置表中的单位为元，此处转换为分
            gold = fund['gold'];
            isFundFound = true;
            old_comeback_json['hitrate'] = fund['hitrate'];
            break;
        }
    }
    if (_cantFoundFund(isFundFound, cb)) return;
    if (FUND_10 == cb_id && _isPlayerCanBuy(my_account, cb)) return;
    
    // 购买翻盘基金的必要条件就是玩家金币数量已经为0
    // 此处直接设置金币数量, 不再使用叠加

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setGold(uid, gold);
    CacheAccount.addRmb(uid, price);
    CacheAccount.setComeback(uid, old_comeback_json);
    //--------------------------------------------------------------------------
    CacheAccount.getAccountById(uid, function (err, account) {
        cb(null, [account]); 
    });
}

/**
 * 填充数据.
 */
function _fill(pool, cb) {
    _reset_all(pool, cb);
}

//==============================================================================
// private
//==============================================================================

// 玩家对应的VIP等级没有开通翻盘基金
function _isPlayerCanBuy(my_account, cb) {
    // 检查玩家是否达到了可以购买翻盘基金的条件
    for (var i = 0; i < vip_vip_cfg.length; i++) {
        var temp_vip = vip_vip_cfg[i];
        if (temp_vip['vip_level'] == my_account['vip']) {
            return ErrorUtil.checkError(temp_vip['vip_specialskill'] == 0, "玩家对应的VIP等级没有开通翻盘基金，请升级VIP后购买。", cb);
        }
    }
}

// 已经购买则返回错误.
function _alreadyBuy(old_comeback_json, cb) {
    var cb_id = old_comeback_json['cb_id'];
    console.log("玩家已购买的翻盘基金为" + cb_id);
    return ErrorUtil.checkError(cb_id, "今日玩家已经购买了翻盘基金，请勿重复购买。", cb);
}

// 无法查找到Fund返回错误信息.
function _cantFoundFund(isFundFound, cb) {
    return ErrorUtil.checkError(!isFundFound, "传入的翻盘基金ID错误", cb);
}

function _reset_all(pool, cb) {
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.resetAllComeback();
    //--------------------------------------------------------------------------
    
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `comeback`=?';
    var sql_data = ['{}'];
    
    if (DEBUG) console.log('sql: ', sql);
    if (DEBUG) console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log('[ERROR] comeback.fill()');
            if (ERROR) console.log(JSON.stringify(err));
            cb(err);
        } else {
            if (DEBUG) console.info('comeback数据填充成功');
        }
    });
}