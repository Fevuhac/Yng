////////////////////////////////////////////////////////////
// Aquarium Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
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
var buzz_goddess = require('./buzz_goddess');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('./cache/CacheLink');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var dao_gold = require('../dao/dao_gold');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var aquarium_petfish_cfg = require('../../cfgs/aquarium_petfish_cfg');// 宠物鱼
var aquarium_petup_cfg = require('../../cfgs/aquarium_petup_cfg');// 宠物鱼升级表
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
const goddess_goddessup_cfg = require('../../cfgs/goddess_goddessup_cfg');
var shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

const ItemTypeC = Item.ItemTypeC;

var DEBUG = 0;
var ERROR = 1;

const PET_STATE = {
    LOCKED : 0, //锁住的
    NOTPLACED : 1, //未放养
    PLACED : 2, //已放养
    READY : 3, //可收取
    ALREADY_REWARD : 4, //已收取
};

const GODDESS_STATE = {
    NOTPLACED : 0, //未放养
    PLACED : 1, //已放养
};

var TAG = "【buzz_aquarium】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.upgradePetfish = upgradePetfish;
exports.putPetfish = putPetfish;
exports.rewardPetfish = rewardPetfish;
exports.putGoddess = putGoddess;
exports.getAquarium = getAquarium;

exports.getCost = _getCost;
exports.getChipFromId = _getChipFromId;

exports.PET_STATE = PET_STATE;
exports.GODDESS_STATE = GODDESS_STATE;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

function upgradePetfish(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_aquarium.upgradePetfish()");
    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "upgrade_petfish");
    checkAccount(req, data, cb, _didUpgradePetfish);
}

function putPetfish(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_aquarium.putPetfish()");
    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "put_petfish");
    checkAccount(req, data, cb, _didPutPetfish);
}

function rewardPetfish(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_aquarium.rewardPetfish()");
    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "reward_petfish");
    checkAccount(req, data, cb, _didRewardPetfish);
}

function putGoddess(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_aquarium.putGoddess()");
    if (!_prepare(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "put_goddess");
    checkAccount(req, data, cb, _didPutGoddess);
}

function getAquarium(req, data, cb) {
    if (DEBUG) console.log("【CALL】 buzz_aquarium.getAquarium()");
    if (!_prepareGet(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "get_aquarium");
    checkAccount(req, data, cb, _didGetAquarium);
}

function checkAccount(req, data, cb, next) {
    buzz_account.check(req, data, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        next(req, data, cb, account);
    });
}


//==============================================================================
// private
//==============================================================================

//----------------------------------------------------------
// 获取水族馆信息(玩家点击水族馆时调用)
//----------------------------------------------------------
function _didGetAquarium(req, data, cb) {
    const FUNC = TAG + "_didGetAquarium() --- ";
    DEBUG = 0;

    if (DEBUG) console.log(FUNC + "CALL...");
    
    var token = data['token'];
    var account_id = data['account_id'];
    
    
    CacheAccount.getAccountById(account_id, function (err, account) {

        if (DEBUG) console.log(FUNC + "玩家ID存在于内存:", account_id);
        if (DEBUG) console.log(FUNC + "Aquarium:", _currentAquarium(account));

        cb(null, _currentAquarium(account));

    });
}

//----------------------------------------------------------
// 放置女神
//----------------------------------------------------------
function _didPutGoddess(req, data, cb) {
    const FUNC = TAG + "_didPutGoddess() --- ";
    
    var token = data['token'];
    var id = data['id'];
    var account_id = data['account_id'];


    CacheAccount.getAccountById(account_id, function (err, account) {
        if(account){
            if (DEBUG) console.log(FUNC + "call _getAquariumOrInit()");
            var aquarium = _getAquariumOrInit(account);

            // 数据验证及操作.
            if (aquarium.goddess['' + id] == null) {
                if (ERROR) console.error(FUNC + "放置的女神没有解锁");
                cb(ERROR_OBJ.GODDESS_LOCKED);
                return;
            }
            else {
                if (DEBUG) console.log(FUNC + "放置的女神已解锁");
                var goddess = aquarium.goddess['' + id];
                if (DEBUG) console.log(FUNC + "goddess:", goddess);
                if (GODDESS_STATE.PLACED == goddess.state) {
                    if (ERROR) console.error(FUNC + "女神已经处于放置状态，请勿重复放置");
                    cb(ERROR_OBJ.GODDESS_PLACED);
                    return;
                }
                else if (GODDESS_STATE.NOTPLACED == goddess.state
                    || undefined == goddess.state) {
                    // 遍历设置女神为0
                    for (var idx in aquarium.goddess) {
                        aquarium.goddess[idx].state = GODDESS_STATE.NOTPLACED;
                    }

                    goddess.state = GODDESS_STATE.PLACED;
                    CacheAccount.setAquarium(account, aquarium);
                    account.commit();
                    cb(null, _currentAquarium(account));// 返回当前水族馆的所有数据
                    return;
                }
                if (ERROR) console.error(FUNC + "女神处于未知状态:" + goddess.state);
                if (ERROR) console.error(FUNC + "goddess:", goddess);
                cb(ERROR_OBJ.GODDESS_STATE_ERR);
                return;
            }
        }
    });

}

//----------------------------------------------------------
// 获取宠物鱼奖励
//----------------------------------------------------------
function _didRewardPetfish(req, data, cb, account) {
    const FUNC = TAG + "_didRewardPetfish() --- ";
    
    var token = data['token'];
    var id = data['id'];
    var account_id = data['account_id'];

    CacheAccount.getAccountById(account_id, function (err, account) {
        if (DEBUG) console.log(FUNC + "call _getAquariumOrInit()");
        var aquarium = _getAquariumOrInit(account);

        if (!_fishUnlocked(aquarium, id, cb)) return;

        var petfish = aquarium.petfish['' + id];

        if (!_fishPlaced(petfish)) {
            if (ERROR) console.error(FUNC + "宠物鱼未放养，无法收取");
            cb(ERROR_OBJ.PETFISH_REWARD_ERR_NOTPLACED);
            return;
        }

        // 引导没有完成跳过时间判断
        var guideWeak = account.guide_weak;//CacheAccount.getGuideWeak(account_id);
        if (DEBUG) console.log(FUNC + "guideWeak:", guideWeak);
        if (guideWeak.petfish == null || !guideWeak.petfish) {
            // Do nothing.
            if (DEBUG) console.log(FUNC + "没有完成引导, 需要跳过倒计时");
        }
        else {
            if (!_PetfishCanReward(petfish,aquarium)) {
                if (ERROR) console.error(FUNC + "宠物鱼没有到时间");
                cb(ERROR_OBJ.PETFISH_REWARD_ERR_TIME_NOT_UP);
                return;
            }
        }

        // 计算玩家可以开启宝箱的次数: probase + progoldadd
        // TODO: 将客户端计算的宝箱掉落逻辑转移到服务器
        // 重置宠物鱼状态
        petfish.state = PET_STATE.ALREADY_REWARD;

        // var aquarium = account.aquarium;
        var goddess = getCurrentGoddess();
        var item_list = getItemlistFromFish(petfish, goddess);




        BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
            var change = BuzzUtil.getChange(account, reward_info);
            var ret = {
                item_list: item_list,
                change: change,
                aquarium: _currentAquarium(account),
            };
            account.aquarium = ret.aquarium;
            account.commit();

            cb(null, ret);
        });

        function getCurrentGoddess() {
            for (var idx in aquarium.goddess) {
                var goddess = aquarium.goddess[idx];
                var state = goddess.state;
                if (GODDESS_STATE.PLACED == state) {
                    goddess.id = idx;
                    return goddess;
                }
            }
            return null;
        }

        function getItemlistFromFish(petfish, goddess) {
            var petfish_info = BuzzUtil.getPetfishFromId(petfish.id);
            var tid = petfish_info.treasureid;
            console.log(FUNC + "tid:", tid);
            var goddess_id = 0;
            var goddess_lv = 0;
            if (goddess) {
                goddess_id = goddess.id;
                goddess_lv = goddess.lv;
            }
            var reward_times = BuzzUtil.getRewardTimes4Petfish(petfish, goddess_id, goddess_lv);
            var droplist_key = BuzzUtil.getDroplistIdFromTid(tid);

            var item_list = BuzzUtil.getItemListFromDroplistId(account, droplist_key, reward_times);

            return item_list;
        }

    });

}

//----------------------------------------------------------
// 放养
//----------------------------------------------------------

function _didPutPetfish(req, data, cb) {
    
    var id = data['id'];
    var account_id = data['account_id'];

    CacheAccount.getAccountById(account_id, function (err, account) {
        _checkFish(account, id, cb);
    });
}

function _checkFish(account, id, cb) {
    const FUNC = TAG + "_checkFish() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var aquarium = _getAquariumOrInit(account);
    
    for (var i in id) {
        var fish_id = id[i];
        //console.log("fish_id:", fish_id);
        if (!_fishUnlocked(aquarium, fish_id, cb)) return;
        
        if (DEBUG) console.log(FUNC + "用户放养的鱼在水族馆中");
        var petfish = aquarium.petfish['' + fish_id];
        if (_fishPlaced(petfish)) {
            if (ERROR) console.error(FUNC + "用户放养的鱼已经处于放养状态，请勿重复放养");
            cb(ERROR_OBJ.PETFISH_PLACED);
            return;
        }
        else if (petfish.state == PET_STATE.NOTPLACED) {
            petfish.state = PET_STATE.PLACED;
            petfish.starttime = new Date().getTime();// 设置时间戳
            //petfish.starttime = new Date().getTime() - 10000;// 设置时间戳,测试，开始时间早10秒
            continue;
        }
        else if (petfish.state == PET_STATE.ALREADY_REWARD) {
            if (ERROR) console.error(FUNC + "宠物鱼今日已放养并领取奖励");
            continue;
        }

        if (ERROR) console.error(FUNC + "宠物鱼处于未知状态:" + petfish.state);
        cb(ERROR_OBJ.PETFISH_STATE_ERR);
        return;
    }

    account.aquarium = aquarium;
    account.commit();
    cb(null, _currentAquarium(account));// 返回当前水族馆的所有数据
}

// 判断当前宠物鱼是否解锁
function _fishUnlocked(aquarium, id, cb) {
    const FUNC = TAG + "_fishUnlocked() --- ";

    if (aquarium.petfish['' + id] == null) {
        if (ERROR) console.error(FUNC + "用户放养的鱼并没有在水族馆中");
        if (cb) cb(ERROR_OBJ.PETFISH_LOCKED);
        return false;
    }
    return true;
}

// 判断当前宠物鱼是否为放养状态
function _fishPlaced(petfish) {
    return petfish.state == PET_STATE.PLACED || petfish.state == PET_STATE.READY;
}

// 宠物鱼已经可以收取奖励(时间已到)
function _PetfishCanReward(petfish,aquarium) {
    _setLeftTime(petfish,aquarium);
    return petfish.lefttime == 0;
}

//----------------------------------------------------------
// 升级
//----------------------------------------------------------

function _didUpgradePetfish(req, data, cb) {
    const FUNC = TAG + "_didUpgradePetfish() --- ";

    var token = data['token'];
    var id = data['id'];
    var uid = data['account_id'];
    
    if (DEBUG) console.log(FUNC + "fish_id:", id);

    var chip_id = _getChipFromId(id);

    CacheAccount.getAccountById(uid, function (err, account) {

        if(account){

            let coinId = shop_shop_buy_type_cfg.PETFISH_UP.id;
            let coinType = shop_shop_buy_type_cfg.PETFISH_UP.name;

            account.aquarium = account.aquarium || {};// 数据为空则初始化
            account.aquarium.petfish = account.aquarium.petfish || {};// 数据为空则初始化

            let aquarium = account.aquarium;

            // 未解锁指定id的鱼等级设置为0
            var level = 0;//data['level'];

            // 取用对象的键时再确认一下对象是否为空.
            if (aquarium.petfish != null && aquarium.petfish["" + id] != null) {
                level = account.aquarium.petfish["" + id].level;
            }
            var need = _getCost(level);// 获取消耗品种类和数量
            if (DEBUG) console.log(FUNC + "解锁或升级需要消耗的碎片 --- need:", need);

            // 查看当前玩家水族馆中这个鱼是否解锁或达到了目标等级
            if (_alreadyHave(account, id, level)) return;

            // 判断玩家碎片是否足够
            if (!_isChipEnough(account, id, need.chip, cb)) return;

            let package1 = account.package;
            var chip = package1[ItemTypeC.DEBRIS];

            // 金币数量判断
            if (!_isGoldEnough(account, need.gold, cb)) return;

            // 消耗碎片: 从缓存背包中删除一定量的碎片, 从缓存金币数量中扣除金币
            chip[chip_id] -= need.chip;
            
            BuzzUtil.useCoin(account, coinId, need.gold, function (err, res) {

                // account.gold = -need.gold;

                if (aquarium && aquarium.petfish) {

                    // 在水族馆中放入一条鱼(数据字段为aquarium)
                    // 或升级已经解锁的鱼
                    if (level == 0) {
                        if (DEBUG) console.log(FUNC + "解锁！");
                        aquarium.petfish["" + id] = {
                            id: id,
                            level: level + 1,
                            state: PET_STATE.NOTPLACED,
                            time: 0,
                        };
                    }
                    else {
                        if (DEBUG) console.log(FUNC + "升级！");
                        aquarium.petfish["" + id].level++;
                    }

                    // 记录玩家宠物鱼的排名更新
                    var petfish_list = aquarium.petfish;
                    var total_level = 0;
                    for (var i in petfish_list) {
                        var petfish = petfish_list[i];
                        total_level += petfish.level;
                    }
                    CacheAccount.setMaxPetfishLevel(account, total_level);
                    CacheAccount.setAquarium(account, aquarium);
                    account.package = package1;
                    account.commit();
                }

                // 返回玩家数据
                cb(null, account);
                
            });

            /**
             * 玩家游戏币是否足够的判断.
             */
            function _isGoldEnough(account, needCoin, cb) {
                const FUNC = TAG + "_isGoldEnough() --- ";

                var ownCoin = account[coinType];
                if (DEBUG) console.log(FUNC + "ownCoin:", ownCoin);
                if (ownCoin < needCoin) {
                    if (ERROR) console.error("金币不足:", ERROR_OBJ.GOLD_NOT_ENOUGH);
                    cb(ERROR_OBJ.GOLD_NOT_ENOUGH);
                    return false;
                }
                return true;
            }
        }
        else {
            cb(new Error("玩家数据错误"));
        }

    });
}

////------------------------------------------------------------------------------

/**
 * 判断玩家碎片是否足够, 需要读取缓存中的背包.
 */
function _isChipEnough(account, fish_id, need_chip, cb) {
    const FUNC = TAG + "_isChipEnough() --- ";

    account.package = ObjUtil.str2Data(account.package);
    var pack = account.package;
    var chip = pack[ItemTypeC.DEBRIS];
    var chip_id = _getChipFromId(fish_id);
    if (DEBUG) console.log(FUNC + "chip:", chip);
    if (DEBUG) console.log(FUNC + "chip_id:", chip_id);
    if (chip) {
        if (chip[chip_id] == null || chip[chip_id] < need_chip) {
            if (ERROR) console.error(FUNC + "碎片不足:", ERROR_OBJ.CHIP_NOT_ENOUGH);
            cb(ERROR_OBJ.CHIP_NOT_ENOUGH);
            return false;
        }
        return true;
    }
    else {
        if (ERROR) console.error(FUNC + "碎片不足:", ERROR_OBJ.CHIP_NOT_ENOUGH);
        cb(ERROR_OBJ.CHIP_NOT_ENOUGH);
        return false;
    }
}

function _getCost(level) {
    for (var idx in aquarium_petup_cfg) {
        var petup = aquarium_petup_cfg[idx];
        if (petup.level == level + 1) {
            return {
                chip: petup.chip,
                gold: petup.needgold,
            }
        }
    }
    throw new Error("没有查找到对应的宠物鱼等级");
}

function _alreadyHave(account, id, level) {
    if (account.aquarium != null) {
        if (level == 0 && account.aquarium["" + id] != null) {
            // cb(new Error("玩家已经解锁了这条鱼"));
            return true;
        }
        else if (level > 0 && account.aquarium["" + id] > level) {
            // cb(new Error("玩家已经将这条鱼升级到了" + (level + 1)));
            return true;
        }
    }
    return false;
}

function _prepareGet(data, cb) {
    const FUNC = TAG + "_prepareGet() --- ";
    
    var token = data['token'];
    if (DEBUG) console.log(FUNC + "token:", token);
    if (!CommonUtil.isParamExist("aquarium", token, "接口调用请传参数token", cb)) return false;
    var account_id = token.split("_")[0];
    data['account_id'] = account_id;
    
    return true;
}

function _prepare(data, cb) {
    const FUNC = TAG + "_prepareGet() --- ";
    
    var token = data['token'];
    var id = data['id'];
    
    if (DEBUG) console.log(FUNC + "token:", token);
    if (DEBUG) console.log(FUNC + "id:", id);

    if (!CommonUtil.isParamExist("aquarium", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("aquarium", id, "接口调用请传参数id(玩家需要解锁的鱼的ID)", cb)) return false;
    
    // 扩展数据
    var account_id = token.split("_")[0];
    data['account_id'] = account_id;
    
    return true;
}

//----------------------------------------------------------
// 通用
//----------------------------------------------------------

function _petupInfo(level) {
    for (var idx in aquarium_petup_cfg) {
        var info = aquarium_petup_cfg[idx];
        if (info.level == level) {
            return info;
        }
    }
}

function _petfishInfo(id) {
    for (var idx in aquarium_petfish_cfg) {
        var info = aquarium_petfish_cfg[idx];
        if (info.id == id) {
            return info;
        }
    }
}

function _getChipFromId(id) {
    const FUNC = TAG + "_getChipFromId() --- ";
    var fishInfo = _petfishInfo(id);
    if (fishInfo) {
        return fishInfo.chip;
    }
    else {
        console.error(FUNC + "获取鱼的信息失败, 鱼的id:", id);
        return null;
    }
    // return _petfishInfo(id).chip;
}

function _realProtime(id, level) {
    const FUNC = TAG + "_realProtime() --- ";
    
    if (DEBUG) console.log(FUNC + "id:", id);
    if (DEBUG) console.log(FUNC + "level:", level);
    var protime = _petfishInfo(id).protime;
    var protimecut = _petupInfo(level).protimecut;
    return protime * (1 - protimecut);
}

// 获取当前的水族馆状态(返回给客户端使用)
function _currentAquarium(account) {
    const FUNC = TAG + "_currentAquarium() --- ";

    if (DEBUG) console.log(FUNC + "call _getAquariumOrInit()");
    var aquarium = _getAquariumOrInit(account);
    
    for (var idx in aquarium.petfish) {
        var petfish = aquarium.petfish[idx];
        if (petfish.state == PET_STATE.PLACED) {
            _setLeftTime(petfish,aquarium);
        }
        if (petfish.state == PET_STATE.ALREADY_REWARD) {
            _resetPetFishState(petfish);
        }
    }
    account.aquarium = aquarium;
    account.commit();
    return aquarium;
}

// 返回的时间要转化为剩余时间
function _setLeftTime(petfish,aquarium) {
    var passedtime = Math.floor((new Date().getTime() - petfish.starttime) / 1000);
    petfish.time = passedtime;
    petfish.lefttime = _realProtime(petfish.id, petfish.level) - passedtime;
    if(aquarium){
        for(let i in aquarium.goddess) {
            if(aquarium.goddess[i].state==1){
                let id = i;
                let level = aquarium.goddess[i].level || 1;
                let camp;
                for(let k in goddess_goddessup_cfg) {
                    for(let l in aquarium_petfish_cfg) {
                        if(aquarium_petfish_cfg[l].id==petfish.id) {
                            camp = aquarium_petfish_cfg[l].camp;
                        }
                    }
                    if(goddess_goddessup_cfg[k].id==id && goddess_goddessup_cfg[k].level == level &&
                        goddess_goddessup_cfg[k].property==6 && camp==id) {
                        petfish.lefttime -= goddess_goddessup_cfg[k].value;
                        break;
                    }
                }
            }
        }
    }
    if (petfish.lefttime < 0) {
        petfish.lefttime = 0;
        // 服务器永远不会有这个可领取状态(是否可领取根据petfish.lefttime = 0来设置)
        // petfish.state = PET_STATE.READY;// 剩余时间为0, 设置宠物鱼状态为可领取
    }

    //petfish.time = 10000000;// 测试用
    //petfish.lefttime = 0;// 测试用
}

// 如果开始时间早于当日的凌晨0时时间戳, 则设置状态为未放置
function _resetPetFishState(petfish) {
    if (petfish.starttime < DateUtil.timestamp4zero()) {
        petfish.state = PET_STATE.NOTPLACED;
    }
}

// 获取水族馆数据或初始化
function _getAquariumOrInit(account, cb) {
    const FUNC = TAG + "_getAquariumOrInit() --- ";

    var aquarium = account.aquarium = account.aquarium || {};

    // 宠物鱼初始化
    if (aquarium.petfish == null) {
        if (DEBUG) console.log(FUNC + "aquarium.petfish == null, 宠物鱼重新设置");
        aquarium.petfish = {};
    }

    // 女神初始化
    if (DEBUG) console.log(FUNC + "aquarium.goddess:", aquarium.goddess);
    if (aquarium.goddess == null || _.keys(aquarium.goddess).length == 0) {
        aquarium.goddess = buzz_goddess.getUnlocked(account);
        // 默认第一个女神状态为1
        for (var idx in aquarium.goddess) {
            if (idx == '1') {
                aquarium.goddess['' + idx].state = 1;
                break;
            }
        }
    }
    else {
        var unlocked_goddess = buzz_goddess.getUnlocked(account);
        for (var goddess_id in aquarium.goddess) {
            if (!unlocked_goddess[goddess_id]) {
                delete aquarium.goddess[goddess_id];
            }
        }
        account.aquarium = aquarium;
        buzz_goddess.updateLevel(account);
    }

    if (aquarium.goddess.state) {
        delete aquarium.goddess.state;
    }
    account.aquarium = aquarium;
    account.commit();
    return aquarium;
}