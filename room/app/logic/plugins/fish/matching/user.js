const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const consts = require('../consts');

class User {
    constructor(opts) {
        this.account = opts.account;
        this.account.type = consts.ENTITY_TYPE.PLAYER;
        this.ext = opts.ext;
        this._sigupTime = Date.now();
        this._sword = 0;
        this._float_sword = 0;
    }

    get sword() {
        return this._sword;
    }

    get sigupTime() {
        return this._sigupTime;
    }

    //战力计算
    _calcSword() {
        this._sword = this.account.match_points * (1 + (this.account.match_win / Math.min((this.account.match_win + this.account.match_fail), 1) - 0.5) * 2);
    }

    //浮动战力范围
    _calcFloatSword() {
        this._float_sword = 100 + this.account.match_points * Math.min((Date.now() - this._sigupTime) / 1000 / 120, 0.5)
    }

    //匹配条件
    canMatch(enemySword) {
        this._calcFloatSword();
        if (enemySword >= this._sword - this._float_sword && enemySword <= this._sword + this._float_sword) {
            return true;
        }
        return false;
    }

    static allocUser(data) {
        return new Promise((resolve, reject) => {
            redisAccountSync.getAccount(data.uid, User.baseField, function (err, account) {
                if (!!err) {
                    reject(CONSTS.SYS_CODE.DB_ERROR);
                    return;
                }
                if (!account) {
                    reject(CONSTS.SYS_CODE.PLAYER_NOT_EXIST);
                    return
                }

                let user = new User({
                    ext: data,
                    account: account.toJSON()
                });
                user._calcSword();
                resolve(user);
            });
        });
    }
}

User.baseField = [
    ACCOUNTKEY.NICKNAME,
    ACCOUNTKEY.WEAPON_SKIN,
    ACCOUNTKEY.FIGURE_URL,
    ACCOUNTKEY.MATCH_RANK,
    ACCOUNTKEY.MATCH_POINTS,
    ACCOUNTKEY.MATCH_WIN,
    ACCOUNTKEY.MATCH_FAIL,
];

module.exports = User;