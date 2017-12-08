////////////////////////////////////////////////////////////////////////////////
// description: 魅力值计算接口汇总
// author: scott (liuwenming@chufengnet.com)
// date: 20170920
// ATTENTION：
// 魅力值主要由以下几个部分构成：
// VIP等级：每个VIP等级对应一个值，取最大值
// 炮倍率：每个倍率对应一个值，去最大值
// 皮肤：每个皮肤对应一个值，累加
// 皮肤星级：（后期新增功能预留）每个星期对应一个值，取最大值，多个皮肤则求和
// 收到鲜花：每收到1朵鲜花累加一次
// 使用喇叭：每使用1个喇叭累加一次
// 段位：每个段位对应一个值，取最大值
// 好友：好友总数*系数
// 宠物鱼：每个等级对应一个值，取最大值，然后多个鱼求和
// 女神：女神不同等级对应一个值，单个女神取最大值，多个女神则求和
// 月卡：在有月卡的情况下获得加成
// 月卡壕：在有该月卡的情况下获得加成
////////////////////////////////////////////////////////////////////////////////

var player_charmlevel_cfg = require('../../cfgs/player_charmlevel_cfg');
var player_charm_cfg = require('../../cfgs/player_charm_cfg');
var RedisUtil = require('./RedisUtil');
var ArrayUtil = require('./ArrayUtil');
var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

var DEBUG = 0;
let TAG = "【CarmUtil】";

var _checkValidCp = function (curCP) {
    if (typeof(curCP) == 'string') {
        curCP = parseInt(curCP);
    }
    return curCP;
};

//构造需要的关键数据：现将复杂数据简化放入内存
//vip
var vip_vip_cfg = require('../../cfgs/vip_vip_cfg');
var _vipChs = {};
for (var i = 0; i < vip_vip_cfg.length; i ++) {
    var cfg = vip_vip_cfg[i];
    _vipChs[cfg.vip_level] = cfg.charm;
}
vip_vip_cfg = null;
// DEBUG && console.log('-----vip---------', _vipChs);

//weapon
var newweapon_upgrade_cfg = require('../../cfgs/newweapon_upgrade_cfg');
var _weaponChs = {};
for (var i in newweapon_upgrade_cfg) {
    var cfg = newweapon_upgrade_cfg[i];
    _weaponChs[cfg.weaponlevel] = cfg.charm;
}
newweapon_upgrade_cfg = null;
// DEBUG && console.log('--------weapon------', _weaponChs);

//weapon skin
var newweapon_weapons_cfg = require('../../cfgs/newweapon_weapons_cfg');
var _wpskinChs = {};
for (var i in newweapon_weapons_cfg) {
    var cfg = newweapon_weapons_cfg[i];
    _wpskinChs[i] = cfg.charm;
}
newweapon_weapons_cfg = null;
// DEBUG && console.log('------wp skin--------', _wpskinChs);

// weapon star
// yDONE: 97-皮肤升星
var newweapon_star_cfg = require('../../cfgs/newweapon_star_cfg');
var _wpstarChs = {};
for (var i in newweapon_star_cfg) {
    var cfg = newweapon_star_cfg[i];
    // 1589表示15号皮肤89级星...
    _wpstarChs[cfg.id * 100 + cfg.star] = cfg.charm;
}
newweapon_star_cfg = null;
// DEBUG && console.log('------wp star--------', _wpstarChs);

//petfish
var aquarium_petup_cfg = require('../../cfgs/aquarium_petup_cfg');
var _pfChs = {};
for (var i = 0; i < aquarium_petup_cfg.length; i ++) {
    var cfg = aquarium_petup_cfg[i];
    _pfChs[cfg.level] = cfg.charm;
}
aquarium_petup_cfg = null;
// DEBUG && console.log('------petfish--------', _pfChs);

//god:charm
var goddess_goddessup_cfg = require('../../cfgs/goddess_goddessup_cfg');
var _godChs = {};
for (var i = 0; i < goddess_goddessup_cfg.length; i ++) {
    var cfg = goddess_goddessup_cfg[i];
    if (!_godChs[cfg.id]) {
        _godChs[cfg.id] = [];
    }
    _godChs[cfg.id].push(cfg.charm);
}
goddess_goddessup_cfg = null;
// DEBUG && console.log('------goddess--------', _godChs);

//rankgame
var rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');
var _rmChs = {};
for (var i = 0; i < rank_rankgame_cfg.length; i ++) {
    var cfg = rank_rankgame_cfg[i];
    _rmChs[cfg.id] = cfg.charm;
}
rank_rankgame_cfg = null;
// DEBUG && console.log('------rankgame--------', _rmChs);

//计算当前拥有的女神的魅力值
var _catGodTotalCharm = function (curGod) {
    var oT = 0;
    for (var i = 0; i < curGod.length; i ++) {
        var god = curGod[i];
        var charm = _godChs[god.id][god.level];
        oT += charm;
    }
    return oT;
};

//计算当前拥有的宠物鱼的魅力值
var _catPetFishTotalCharm = function (curPetFish) {
    var oT = 0;
    for (var k in curPetFish) {
        var pf = curPetFish[k];
        oT += _pfChs[pf.level];
    }
    return oT;
};

/**
 * 魅力值途径标记值: -1则从对应配置取得具体值，反之为取当前值
 *  1		VIP等级
    2		炮倍率
    3		皮肤
    4		皮肤星级
    5		收到鲜花每朵
    6		使用喇叭每个
    7		段位
    8		好友每个
    9		宠物鱼等级
    10		女神等级
    11		月卡
    12		月卡·壕
 */
function _getCharmWayCfgValue(wayIdx) {
    for (var i = 0; i < player_charm_cfg.length; i ++) {
        var cfg = player_charm_cfg[i];
        if (cfg.id == wayIdx) {
            return cfg.charm;
        }
    }
    return -1;
}

/**
 * 计算月卡产生的魅力加成
 */
var _catMonthCardTotalCharm = function (oldCard, newCard, cardKey) {
    var mC = 0;
    if (cardKey == 'normal') {
        mC = _getCharmWayCfgValue(11); //普通月卡
    }else if (cardKey == 'senior'){
        mC = _getCharmWayCfgValue(12); //土豪月
    }else{
        return 0;
    }
    if (!oldCard[cardKey] && newCard[cardKey]) { //新增：老的没有，新的有
        return mC;
    }else if (oldCard[cardKey] && !newCard[cardKey]) { //过期：老的有，新的没有
        return -mC;
    }
    return 0;
};

/**
 * 新玩家默认武器魅力值
 */
var _getNewAccountCharmPointByWeapon = function (defaultWp) {
    defaultWp = defaultWp || 1;
    var c1 = _weaponChs[defaultWp];
    return c1;
};

/**
 * 新玩家默认女神魅力值,第一个女神默认1级
 */
var _getNewAccountCharmPointByGod = function (defaultGodId, defaultGodLv) {
    defaultGodId = defaultGodId || 1;
    defaultGodLv = defaultGodLv || 1;
    var charm = _godChs[defaultGodId][defaultGodLv];
    return charm || 0;
};

/**
 * 新玩家默认魅力值
 */
exports.getNewAccountCharmPointDefault = function (defaultWp, defaultGodId, defaultGodLv) {
    var c1 = _getNewAccountCharmPointByWeapon(defaultWp);
    console.log('------weapion charm = ', c1);
    c1 += _getNewAccountCharmPointByGod(defaultGodId, defaultGodLv);
    console.log('---and goddess---weapion charm = ', c1);
    return c1;
};

/**
 * 玩家当前应该具备的魅力值
 * 及时计算
 */
exports.getCurrentCharmPoint = function (account, cb) {
    const FUNC = TAG + "getCurrentCharmPoint() --- ";
    var id = account.id;
    
    var flowerC = 0;
    var hornC = 0;
    var friendC = 0;
    var matchRank = 0;
    var tmp = [
        ['hget', PAIR.UID_FLOWER_RECEIVE, id],
        ['hget', PAIR.UID_GAME_FRIEND, id],
        ['hget', PAIR.UID_HORN_USED, id],
        ['hget', PAIR.UID_RANK, id]
    ];
    RedisUtil.multi(tmp, function (err, ret) {
        if (ret && ret.length == tmp.length) {
            flowerC = parseInt(ret[0]) || 0;
            friendC = ret[1]&&JSON.parse(ret[1]).length || 0;
            hornC = parseInt(ret[2]) || 0;
            matchRank = parseInt(ret[3]) || 0;
        }
        // console.log('flowerc = ', flowerC, friendC, hornC);
        var cp = 0;
        //vip
        cp += _vipChs[account.vip] || 0;

        //weapon level
        cp += _weaponChs[account.weapon];

        //weapon skin
        var own = account.weapon_skin.own;
        // yTODO: 为什么own为空
        if (own && own.length) {
            own = ArrayUtil.delRepeat(own);
            for (var i = 0; i < own.length; i ++) {
                var k = own[i];
                cp += _wpskinChs[k];
            }
        }

        // yDONE: 97-皮肤升星
        var star = account.weapon_skin.star;
        if (star) {
            if (DEBUG) console.log(FUNC + "计算武器升星的魅力值");
            for (let weaponId in star) {
                var weaponStar = star[weaponId];
                if (DEBUG) console.log(FUNC + "weaponStar:", weaponStar);
                let idx = weaponId * 100 + weaponStar;
                if (DEBUG) console.log(FUNC + "idx:", idx);
                let oneCharm = _wpstarChs[idx];
                if (DEBUG) console.log(FUNC + "oneCharm:", oneCharm);
                cp += oneCharm;
            }
        }

        //flower
        var fVal = _getCharmWayCfgValue(5);
        fVal *= flowerC;
        cp += fVal;

        //horn
        fVal = _getCharmWayCfgValue(6);
        fVal *= hornC;
        cp += fVal;

        //rm level
        matchRank > 0 && (cp += _rmChs[matchRank]);
        
        //friend
        fVal = _getCharmWayCfgValue(8);
        fVal *= friendC;
        cp += fVal;

        //petfish
        if (account.aquarium.petfish) {
            fVal = _catPetFishTotalCharm(account.aquarium.petfish);
            cp += fVal;
        }
        
        //goddess
        fVal = _catGodTotalCharm(account.goddess);
        cp += fVal;
        
        //month card/普通月卡
        if (account.card && account.card.normal) {
            cp += _getCharmWayCfgValue(11); 
        }
        
        //month card 土豪月
        if (account.card && account.card.senior){
            cp += _getCharmWayCfgValue(12);
        }

        cb && cb(cp);
    }.bind(this));
};

/**
 * 根据点数和排名获取配置魅力等级
 */
exports.getCharmCfgLevel = function (charmPoint, charmRank) {
    var i = player_charmlevel_cfg.length;
    while (i > 0 && i --) {
        var cfg = player_charmlevel_cfg[i];
        var rks = cfg.rank;
        if (rks.length == 1) {
            if (charmRank == rks[0] && charmPoint >= cfg.charm) {
                return cfg.level;
            }
        }else if (rks.length == 2) {
            var min = rks[0];
            var max = rks[1];
            if (charmRank >= min && charmRank <= max && charmPoint >= cfg.charm) {
                return cfg.level;
            }
        }else{
            if (charmPoint >= cfg.charm) {
                return cfg.level;
            }
        }
    }
    return 0;
};









