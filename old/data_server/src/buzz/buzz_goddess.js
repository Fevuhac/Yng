////////////////////////////////////////////////////////////
// Aquarium Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
let async = require('async');
var BuzzUtil = require('../utils/BuzzUtil');
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var CacheAccount = require('./cache/CacheAccount');
var Item = require('./pojo/Item');

var _ = require('underscore');
var buzz_account = require('./buzz_account');
var buzz_charts = require('./buzz_charts');


//------------------------------------------------------------------------------
// LOG
//------------------------------------------------------------------------------
var GameLog = require('../log/GameLog');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var dao_goddess = require('../dao/dao_goddess');
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('./cache/CacheLink');
var CacheCharts = require('./cache/CacheCharts'),
    RANK_TYPE = CacheCharts.RANK_TYPE;

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');
var goddess_defend_cfg = require('../../cfgs/goddess_defend_cfg');// 保卫女神
var goddess_goddess_cfg = require('../../cfgs/goddess_goddess_cfg');// 女神基础数据
var goddess_goddessup_cfg = require('../../cfgs/goddess_goddessup_cfg');// 女神升级数据
var common_const_cfg = require('../../cfgs/common_const_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
var shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');
const _utils = require('../utils/utils')

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

const ItemTypeC = Item.ItemTypeC;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_goddess】";

/** */
const GODDESS_PROPERTY = {
    GOLD_SHOPPING: 12,
};
exports.GODDESS_PROPERTY = GODDESS_PROPERTY;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.init = init;
exports.getLeftDays = getLeftDays;
exports.getDefend = getDefend;
exports.getUnlocked = getUnlocked;
exports.updateLevel = updateLevel;
exports.challengeGoddess = challengeGoddess;
exports.rewardTimes = rewardTimes;
exports.unlock = unlock;
exports.levelup = levelup;
exports.weekReward = weekReward;
exports.queryWeekReward = queryWeekReward;
exports.putWeekReward = putWeekReward;

exports.getGoddessTop1 = getGoddessTop1;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取初始化的女神数据
 */
function init() {
    if (DEBUG) console.log("【CALL】 buzz_goddess.init()");

    return JSON.stringify(_initGods());
}

function getLeftDays() {
    var ret = [];
    for (var i = 0; i < goddess_goddess_cfg.length; i++) {
        var goddess = goddess_goddess_cfg[i];
        var opentime = goddess.opentime;
        var left_days = DateUtil.leftDays(opentime);
        ret.push(left_days);
    }
    return ret;
}

function getDefend(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_goddess.getDefend()");
    
    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "get_god_data");
    
    buzz_account.check(req, data, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        _didGetDefend(req, data, account, cb);
    });

}


function getUnlocked(account) {
    const FUNC = TAG + "getUnlocked()---";
    if (DEBUG) console.info(FUNC + "CALL...");

    let list = account.goddess;// 一定要把字符串转换为对象处理，否则会得到第一个字符而不是第一个对象
    var response = {};
    for (var idx in list) {
        var goddess = list[idx];
        if (_isGoddessUnlocked(goddess)) {
            response['' + goddess.id] = {
                lv: goddess.level,
                state: 0// 0为未放置状态, 这个值稍后由aquarium修改
            };
        }
    }
    return response;


}

function updateLevel(account) {
    let aquarium_goddess = account.aquarium.goddess;
    var FUNC = TAG + "updateLevel() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");
    let list = account.goddess;
    for (var idx in list) {
        var goddess = list[idx];
        if (DEBUG) console.log(FUNC + "goddess:", goddess);
        if (_isGoddessUnlocked(goddess)) {
            if (!aquarium_goddess['' + goddess.id]) {
                aquarium_goddess['' + goddess.id] = {};
            }
            aquarium_goddess['' + goddess.id].lv = goddess.level;
        }
    }
    account.aquarium = account.aquarium;
    account.commit();
}

/**
 * 挑战女神.
 */
function challengeGoddess(req, data, cb) {
    var FUNC = TAG + "challengeGoddess() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "challenge_god");
    
    buzz_account.check(req, data, function (err, account) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        _didChallengeGoddess(req, data, account, cb);
    });

}

/**
 * 女神结算时返回奖励倍数.
 */
function rewardTimes(req, data, cb) {
    var FUNC = TAG + "rewardTimes() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "goddess_reward_times");
    
    buzz_account.check(req, data, function (err, account) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        _didRewardTimes(req, data, account, cb);
    });
}

/**
 * 女神解锁
 */
function unlock(req, dataObj, cb) {
    const FUNC = TAG + "unlock() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "goddess_unlock");

    _unlock(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'goddess_id', 'idx'], "buzz_goddess", cb);
    }
}

/**
 * 女神升级
 */
function levelup(req, dataObj, cb) {
    const FUNC = TAG + "levelup() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "goddess_levelup");

    _levelup(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'goddess_id'], "buzz_goddess", cb);
    }
}

/**
 * 领取保卫女神周排名奖励
 */
function weekReward(req, dataObj, cb) {
    const FUNC = TAG + "weekReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "god_week_reward");

    _weekReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_goddess", cb);
    }
}

/**
 * 查询当前有无保卫女神周奖励，且返回我的当前排名、以及可以领奖的dropkey
 */
function queryWeekReward(req, dataObj, cb) {
    const FUNC = TAG + "queryWeekReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "goddess_query_week_reward");

    _queryWeekReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_goddess", cb);
    }
}

/**
 * 发放周奖励.
 */
function putWeekReward(pool, cb) {
    const FUNC = TAG + "putWeekReward() --- ";
    //----------------------------------

    // 实现每周女神排行的产生
    buzz_charts.generateWeeklyReward();
    // yTODO: 上线后删除下面代码及相关逻辑
    // dao_goddess.putWeekReward(pool, cb);
}

/**
 * 获取上周结算时女神排名第一的玩家
 * NOTE: 暂时处理成当前第一
 */
function getGoddessTop1(platform) {
    const FUNC = TAG + "getGoddessTop1() --- ";

    var chart = buzz_charts.getTop(platform, RANK_TYPE.GODDESS, 1);
    console.log(FUNC + "chart:", chart);
    // 只取第一名
    return chart[0];
}

//==============================================================================
// private
//==============================================================================
/**
 * 女神是否已经解锁.
 * @param goddess 女神数据(一个女神的全部数据, 其中的unlock为解锁数组).
 */
function _isGoddessUnlocked(goddess) {
    const FUNC = TAG + "_isGoddessUnlocked()---";
    // console.log(FUNC + "hao gui yi goddess:\n", goddess);

    var unlock = goddess.unlock;
    
    // TODO: BUG(20170407【10】)
    if (unlock == null) {
        if (ERROR) console.error("--------------------------------------------------------");
        if (ERROR) console.error(FUNC + "goddess:\n", goddess);
        if (ERROR) console.error("--------------------------------------------------------");
        return false;
    }
    for (var i = 0; i < unlock.length; i++) {
        if (unlock[i] < 2) {
            // 有一个遮罩没被解锁就返回false
            return false;
        }
    }
    // 所有遮罩都被解锁返回true
    return true;
}

function _didGetDefend(req, data, account, cb) {
    const FUNC = TAG + "_didGetDefend() --- ";

    var uid = account.id;
    var goddess = account.goddess;
    var goddess_free = account.goddess_free;
    var goddess_ctimes = account.goddess_ctimes;

    // 检查goddess数据
    for (var i = 0; i < goddess.length; i++) {
        var unlock = goddess[i].unlock;
        var goddess_unlock = 1;
        for (var j = 0; j < unlock.length; j++) {
            if (unlock[j] < 2) {
                goddess_unlock = 0;
            }
        }
        if (goddess_unlock && goddess[i].level == 0) {
            goddess[i].level = 1;
        }
    }

    // yDONE: 没有解锁第一个女神的玩家数据设置
    let first_goddess = goddess[0];
    if (first_goddess && first_goddess.level == 0) {
        first_goddess.level = 1;
        first_goddess.unlock = [2,2,2,2,2,2,2,2,2];
        // CacheAccount.setGoddess(uid, goddess);
    }
    CacheAccount.setGoddess(uid, goddess);
    
    var response = {
        leftDays : getLeftDays(),
        gods: goddess,
        free: goddess_free,
        ctimes: goddess_ctimes,
    };

    // if (DEBUG) console.log(FUNC + "response:", response);

    cb(null, response);
    
}

function _didChallengeGoddess(req, data, account, cb) {
    const FUNC = TAG + "_didChallengeGoddess() --- ";

    // var challenge_goddess_id = data["god_id"];

    // 账户数据中原来的女神数据
    var uid = account.id;
    var goddess_free = account.goddess_free;
    var goddess_ctimes = account.goddess_ctimes;
    if (DEBUG) console.log(FUNC + "goddess_free:\n", goddess_free);
    if (DEBUG) console.log(FUNC + "goddess_ctimes:\n", goddess_ctimes);
    if (goddess_free > 0) {
        if (DEBUG) console.log(FUNC + "不消耗钻石");
        goddess_free--;
        CacheAccount.setGoddessFree(uid, goddess_free);
    }
    else {
        if (DEBUG) console.log(FUNC + "计算消耗钻石");
        var pearl_cost = _getPrice(goddess_ctimes);
        if (DEBUG) console.log(FUNC + "pearl_cost:", pearl_cost);
        // 消耗钻石
        if (account.pearl < pearl_cost) {
            if (ERROR) console.error(FUNC + "玩家钻石不足, 不能挑战女神");
            // 客户端无法把这个错误导向钻石购买, 返回一个消耗钻石数
            // cb(ERROR_OBJ.DIAMOND_NOT_ENOUGH);
            var ret = {
                pearl_cost: pearl_cost
            };
            cb(null, ret);
            return;
        }
        account.pearl -= pearl_cost;
        goddess_ctimes++;
        CacheAccount.setPearl(uid, account);
        CacheAccount.setGoddessCTimes(uid, goddess_ctimes);
    }
    account.commit();
    var ret = {
        pearl: account.pearl,
        free: account.goddess_free,
        ctimes: account.goddess_ctimes,
    };
    if (DEBUG) console.log(FUNC + "返回数据:", ret);
    cb(null, ret);
}

function _didRewardTimes(req, data, account, cb) {
    const FUNC = TAG + "_didRewardTimes() --- ";
    var wave = data.wave;
    var gidx = data.gid;
    // 获取玩家保卫女神奖励
    var tid = BuzzUtil.getTidByGidxAndWave(gidx, wave);

    // yDONE: BUG修改——玩家的crossover字段必须异步获取, 否则为空导致玩家无法获取奖励
    async.waterfall(
        [
            function step1(cb) {
                CacheAccount.getGoddessCrossover(account.id, function(err, res) {
                    console.log(FUNC + 'res:', res);
                    if (res == null) {
                        res = 1;
                    }
                    cb(err, res);
                });
            }
        ],
        function next(err, res) {
            if (err) return cb && cb(err);
            let crossover = res;
            calGodReward(crossover);
        }
    );

    function calGodReward(crossover) {

        console.log(FUNC + 'crossover:', crossover);
        var times = 1 + crossover * 0.5;
        if (times > 4) {
            times = 4;
        }

        // 从tid获取奖励
        var item_list = BuzzUtil.getItemListByTid(account, tid);
        console.log(FUNC + 'item_list:', item_list);
        // yDONE: BUG修改——需要在放入时就乘以倍数
        var times_item_list = [];
        for (var i = 0; i < item_list.length; i++) {
            let item_info = item_list[i];
            times_item_list.push({
                item_id: item_info.item_id,
                item_num: Math.floor(item_info.item_num * times),
                drop_count: item_info.drop_count,
            });
        }
        BuzzUtil.putIntoPack(req, account, times_item_list, function (reward_info) {
            // BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
            var change = BuzzUtil.getChange(account, reward_info);
            var ret = {
                item_list: item_list,
                change: change,
                times: times,
            };
            cb(null, ret);

            GameLog.addGameLog(times_item_list, account, common_log_const_cfg.GOD_CHALLENGE, '保卫女神结算时领取');
        });

    }
}

/**
 * 获取挑战女神消耗的钻石数
 */
function _getPrice(ctimes) {
    var price = common_const_cfg.GODDESS_COST;
    var idx = ctimes > price.length - 1 ? price.length - 1 : ctimes;
    return price[idx];
}

function _initGods() {
    var ret = [];
    for (var i = 0; i < goddess_goddess_cfg.length; i++) {
        var goddess = goddess_goddess_cfg[i];
        var god = {
            id: goddess.id,
            level: 0,
            hp: _getHpByIdAndLv(goddess.id, 0),
            startWaveIdx: 0,
            free: goddess.free,
            ctimes: 0,
            unlock: [0, 0, 0, 0, 0, 0, 0, 0, 0],//女神解锁
            interactReward: [0, 0, 0, 0],//互动奖励时间戳, 4个，身体四个区域
            isPauseAway: false,
        };
        ret.push(god);
    }
    return ret;
}

function _getHpByIdAndLv(id, lv) {
    for (var idx in goddess_goddessup_cfg) {
        var lvGoddess = goddess_goddessup_cfg[idx];
        if (lvGoddess.id == id && lvGoddess.level == lv) {
            return lvGoddess.hp;
        }
    }
    return 0;
}

function _prepare(data, cb) {
    
    var token = data['token'];
    
    if (DEBUG) console.log("token:", token);

    if (!CommonUtil.isParamExist("buzz_goddess", token, "接口调用请传参数token", cb)) return false;
    
    return true;

}

//----------------------------------------------------------
// 女神解锁

const UNLOCK_STAT = {
    NO_STONE: 0,
    WITH_STONE: 1,
    UNLOCKED: 2,
};

function _getItemList(quest_reward) {
    var item_list = [];
    for (var i = 0; i < quest_reward.length; i++) {
        var reward = quest_reward[i];
        item_list.push({
            item_id: reward[0],
            item_num: reward[1],
        });
    }
    return item_list;
}

function _unlock(req, dataObj, cb) {
    const FUNC = TAG + "_unlock() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var goddess_id = dataObj.goddess_id;
    var idx = dataObj.idx;
    var pool = req.pool;
    console.log(FUNC + "goddess_id:", goddess_id);

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        var goddess_list = account.goddess;
        var goddess_info = BuzzUtil.getGoddessById(goddess_id);
        if (!_checkUnlock1()) return;
        var goddess = _getGoddessById(goddess_list, goddess_id)
        var goddess_unlock = goddess.unlock;
        var needitem = goddess_info.needitem[idx];
        var needitem_id = needitem[0];
        var needitem_num = needitem[1];
        if (!_checkUnlock2()) return;

        // 设置对应解锁位为2
        goddess.unlock[idx] = 2;
        // 消耗对应女神的魂石(解锁一个碎片消耗一个)
        var item_list = _getItemList([needitem]);

        BuzzUtil.removeFromPack(req, account, item_list, function(cost_info) {
            var change = BuzzUtil.getChange(account, cost_info);
            var unlock_all = _isGoddessUnlocked(goddess);
            if (unlock_all) {
                goddess.level = 1;
            }
            var ret = {
                change: change,
                goddess_id: goddess_id,
                idx: idx,
                level: goddess.level,
                unlock_all: unlock_all,
            };
            if (unlock_all) {
                ret.change = ret.change || {};
                //全部解锁时即获得该女神一级属性
                CacheAccount.setGoddess(account.id, goddess_list, function (chs) {
                    if (chs && chs.length == 2) {
                        var charmPoint = chs[0];
                        var charmRank = chs[1];
                        charmPoint >= 0 && (ret.change.charm_point = charmPoint);
                        charmRank >= 0 && (ret.change.charm_rank = charmRank);
                    }   
                    cb(null, ret); 
                });
            }else{
                cb(null, ret);
            }
        })

        // 校验方法
        function _checkUnlock1() {
            if (null == goddess_info) {
                cb(ERROR_OBJ.GODDESS_ID_ERROR);
                return false;
            }

            return true;
        }
        function _checkUnlock2() {
            console.log(FUNC + "goddess_unlock[" + idx + "]:", goddess_unlock[idx]);
            if (idx < 0 || idx > 8) {
                cb(ERROR_OBJ.GODDESS_UNLOCK_IDX_ERROR);
                return false;
            }
            if (account.package[ItemTypeC.DEBRIS]) {
                if (account.package[ItemTypeC.DEBRIS][needitem_id] < needitem_num) {
                    cb(ERROR_OBJ.GODDESS_UNLOCK_NO_STONE);
                    return false;
                }
            }
            else {
                cb(ERROR_OBJ.GODDESS_UNLOCK_NO_STONE);
                return false;
            }
            if (UNLOCK_STAT.UNLOCKED == goddess_unlock[idx]) {
                cb(ERROR_OBJ.GODDESS_ALREADY_UNLOCKED);
                return false;
            }

            return true;
        }
    }
}

function _getGoddessById(goddess_list, goddess_id) {
    for (var i = 0; i < goddess_list.length; i++) {
        var goddess = goddess_list[i];
        if (goddess_id == goddess.id) {
            return goddess;
        }
    }
}

//----------------------------------------------------------
// 女神升级

function _levelup(req, dataObj, cb) {
    const FUNC = TAG + "_levelup() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var goddess_id = dataObj.goddess_id;
    var pool = req.pool;

    // DEBUG = 1;

    if (DEBUG) console.log(FUNC + "女神ID:", goddess_id);

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        let coinType = shop_shop_buy_type_cfg.GODDESS_UP.name;
        let coinId = shop_shop_buy_type_cfg.GODDESS_UP.id;

        var goddess_list = account.goddess;
        var goddess_info = BuzzUtil.getGoddessById(goddess_id);

        if (!_checkLevelup1()) return;
        var goddess = _getGoddessById(goddess_list, goddess_id);
        var goddess_level = goddess.level;
        if (DEBUG) console.log(FUNC + "女神当前等级:", goddess_level);
        var goddessup = BuzzUtil.getGoddessUpByIdAndLevel(goddess_id, goddess_level + 1);
        if (!_checkLevelup2()) return;
        var needitem_id = goddessup.needitem[0];
        var needitem_num = goddessup.needitem[1];
        if (!_checkLevelup3()) return;

        var levelup_cost = [goddessup.needitem];
        if (goddessup.needgold > 0) {
            levelup_cost.push([coinId, goddessup.needgold]);
        }
        if (DEBUG) console.log(FUNC + "levelup_cost:", levelup_cost);
        var item_list = _getItemList(levelup_cost);
        if (DEBUG) console.log(FUNC + "item_list:", item_list);

        BuzzUtil.removeFromPack(req, account, item_list, function(cost_info) {
            goddess.level++;
            if (DEBUG) console.log(FUNC + "女神升级到:", goddess.level);
            var change = BuzzUtil.getChange(account, cost_info);
            var ret = {
                change: change,
                goddess_id: goddess_id,
                level: goddess.level,
            };
            //女神升级一级可改变魅力值
            CacheAccount.setGoddess(account.id, goddess_list, function (chs) {
                ret.change = ret.change || {};
                if (chs && chs.length == 2) {
                    var charmPoint = chs[0];
                    var charmRank = chs[1];
                    charmPoint >= 0 && (ret.change.charm_point = charmPoint);
                    charmRank >= 0 && (ret.change.charm_rank = charmRank);
                }
                cb(null, ret);    
            });
            DEBUG = 0;
        })

        // 校验方法
        function _checkLevelup1() {
            if (null == goddess_info) {
                cb(ERROR_OBJ.GODDESS_ID_ERROR);
                return false;
            }

            return true;
        }
        function _checkLevelup2() {
            if (null == goddessup) {
                cb(ERROR_OBJ.GODDESS_UP_DATA_WRONG);
                return false;
            }

            return true;
        }
        function _checkLevelup3() {
            if (account[coinType] < goddessup.needgold) {
                cb(ERROR_OBJ.GODDESS_UP_LACK_GOLD);
                return false;
            }
            if (account.package && account.package[ItemTypeC.DEBRIS]) {
                if (account.package[ItemTypeC.DEBRIS][needitem_id] < needitem_num) {
                    cb(ERROR_OBJ.GODDESS_UP_LACK_DEBRIS);
                    return false;
                }
            }
            else {
                return false;
            }

            return true;
        }
    }
}

//------------------------------------------------------------------------------
// 保卫女神周奖励相关

const WEEK_REWARD_STATUS = {
    UNABLE: 0,
    AVAILABLE: 1,
    ALREADY: 2,
};
const MIN_RATE = 1;
const MAX_RATE = 1000;

/**
 * 领取女神周奖励
 */
function _weekReward(req, dataObj, cb) {
    const FUNC = TAG + "_weekReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    dataObj.type = RANK_TYPE.GODDESS_LW;
    buzz_charts.getChartReward(req, dataObj, function(err, resposne) {
        console.log('------------------getChartReward:', resposne);
        if (_.keys(resposne).length == 0) {
            cb({code:11111, msg:"用户奖励已经领取"});
        }
        else {
            var ret = {
                item_list: resposne.item_list,
                change: resposne.change,
                week_reward: resposne.reward,
                //max_wave: 0,
            };
            cb &&cb(null, ret);
        }
    })

    return;

    // DaoCommon.checkAccount(pool, token, function(error, account) {
    //     if (error) {
    //         cb(error);
    //         return;
    //     }
    //     doNextWithAccount(account);
    // });

    // function doNextWithAccount(account) {

    //     var max_wave = account.max_wave;
    //     var week_reward = account.week_reward;
    //     var week_rank = account.week_rank;
    //     if (!_checkWeekReward1()) return;

    //     var rank_reward = BuzzUtil.getRankrewardByRank(week_rank, max_wave);

    //     var item_list = BuzzUtil.getItemList(rank_reward);

    //     account.week_reward = WEEK_REWARD_STATUS.ALREADY;


    //     BuzzUtil.putIntoPack(req, account, item_list, function(reward) {
    //         var change = BuzzUtil.getChange(account, reward);
    //         var ret = {
    //             item_list: item_list,
    //             change: change,
    //             week_reward: account.week_reward,
    //             max_wave: max_wave,
    //         };

    //         cb(null, ret);
    //     });

    //     // 校验方法
    //     function _checkWeekReward1() {
    //         if (WEEK_REWARD_STATUS.UNABLE == week_reward) {
    //             if (ERROR) console.error(FUNC + "保卫女神周奖励领取错误(week_reward为不可领取)");
    //             cb(ERROR_OBJ.GODDESS_WEEKREWARD_UNABLE);
    //             return false;
    //         }
    //         if (WEEK_REWARD_STATUS.ALREADY == week_reward) {
    //             if (ERROR) console.error(FUNC + "保卫女神周奖励领取错误(week_reward为已领取)");
    //             cb(ERROR_OBJ.GODDESS_WEEKREWARD_ALREADY);
    //             return false;
    //         }
    //         if (week_rank < MIN_RATE || week_rank > MAX_RATE) {
    //             if (ERROR) console.error(FUNC + "保卫女神未进入排名, 不可领取:", week_rank);
    //             cb(ERROR_OBJ.GODDESS_WEEKREWARD_OUT_OF_RANKS);
    //             return false;
    //         }

    //         return true;
    //     }
    // }
}

/**
 * 查询女神周奖励
 */
function _queryWeekReward(req, dataObj, cb) {
    const FUNC = TAG + "_queryWeekReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    dataObj.type = RANK_TYPE.GODDESS_LW;

    dataObj.account_id = dataObj.uid;

    buzz_charts.getUserRank(req, dataObj, function(err, info) {
        console.log(FUNC + "info:", info);
        var rank_reward = BuzzUtil.getGoddessChartRewardByRank(info.my_rank, info.score);
        var ret = {};
        ret.week_reward = info.reward;
        ret.week_rank = info.my_rank;
        ret.rank_reward = rank_reward;
        ret.max_wave = info.score;
        cb(null, ret);
    });
    return;

    // DaoCommon.checkAccount(pool, token, function(error, account) {
    //     if (error) {
    //         cb(error);
    //         return;
    //     }
    //     doNextWithAccount(account);
    // });

    // function doNextWithAccount(account) {
    //     var max_wave = account.max_wave;
    //     var week_reward = account.week_reward;
    //     var week_rank = account.week_rank;
    //     if (!_checkQueryWeekReward1()) return;

    //     var rank_reward = BuzzUtil.getGoddessChartRewardByRank(week_rank, max_wave);
    //     var ret = {
    //         week_reward: week_reward,
    //         week_rank: week_rank,
    //         rank_reward: rank_reward,
    //         max_wave: max_wave,
    //     };
    //     cb(null, ret);

    //     // 校验方法
    //     function _checkQueryWeekReward1() {
    //         // 这里直接将week_reward设置为不可领取的状态即可, 无需返回错误
    //         if (WEEK_REWARD_STATUS.AVAILABLE == week_reward) {
    //             if (week_rank < MIN_RATE || week_rank > MAX_RATE) {
    //                 if (ERROR) console.error(FUNC + "保卫女神周奖励状态错误(week_reward为可领取,但是week_rank在1~1000之外)");
    //                 week_reward = WEEK_REWARD_STATUS.UNABLE;
    //                 account.week_reward = WEEK_REWARD_STATUS.UNABLE;
    //             }
    //         }

    //         return true;
    //     }
    // }
}
