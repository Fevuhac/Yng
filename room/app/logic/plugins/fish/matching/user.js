const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const consts = require('../consts');
const configReader = require('../configReader');

class User {
    constructor(opts) {
        this.account = opts.account;
        this.account.kindId = consts.ENTITY_TYPE.PLAYER;
        this.account.sid = opts.ext.sid;
        this.account.uid = opts.ext.uid;
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
        let total = this.account.match_win + this.account.match_fail;
        total = Math.max(total, 1);
        this._sword = this.account.match_points * (1 + (this.account.match_win / total - 0.5) * 2);
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
    
    /**
     * 计算核弹消耗
     * 来自配置
     */
    genNbombCost () {
        return configReader.getValue('rank_rankgame_cfg', this.account.match_rank).nbgold;
    }

    /**
     * 计算胜率
     * 注意该字段不会持久化，而是及时计算所得
     * -1标识无胜率
     */
    genWinRate () {
        let winning_rate = -1;
        let win = this.account.match_win;
        let fail = this.account.match_fail;
        let total = win + fail;
        if (total > 0) {
            winning_rate = win / total * 100;
            winning_rate = Math.round(winning_rate * 100) / 100;
        }
        return winning_rate;
    }

     /**
     * 返回报名匹配成功所需信息
     * 格式来自协议
     */
    getMatchingInfo () {
        return {
            uid: this.account.uid,
            rank: this.account.match_rank,
            nickname: this.account.nickname,
            figure_url: this.account.figure_url,
            winning_rate: this.genWinRate(),
            wp_skin: this.account.weapon_skin.equip,
            nbomb_cost: this.genNbombCost(),
        };
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
    ACCOUNTKEY.MATCH_WIN,
    ACCOUNTKEY.MATCH_FAIL,
    ACCOUNTKEY.MATCH_POINTS,
];

module.exports = User;