// //--[[
// description: 排位赛统计信息
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：
// //--]]

const consts = require('../consts');
const gamePlay = require('../gamePlay/gamePlay');
const STATE = consts.RMATCH_STATE;

class Rmatch {
    constructor () {
        this._leftSecond = 0; //剩余时间，单位秒
        this._curScore = 0; //总共得分
        this._fireC = 0; //开炮数
        this._fHistory = null; //打死什么鱼、多少条、多少分
        this._fHistoryNB = null; //核弹打死多少条鱼、共计分
        this._state = STATE.READY; //比赛状态,0准备中 1开始比赛 2一百炮开完 3使用核弹 4取消核弹 5比赛结束
    }

    /**
     * 统计开炮次数,子弹碰撞完毕才算一次
     * times： 一炮当多炮，如金蝉武器，默认普通炮为1
     */
    _fireC (times) {
        if (this.isNormalFireEnd()) {
            return;
        }
        times = times || 1;
        this._fireC += times;
    }

    /**
     * 普通开火是否结束
     */
    isNormalFireEnd () {
        return this._fireC >= consts.RMATH_FIRE_MAX;
    }

    /**
     * 比赛是否结束
     */
    isOver () {
        return this._state === STATE.END;
    }

    /**
     * 排位赛子弹数统计\捕鱼统计
     */
    fireCount (bks, ret) {
        if (this.isOver()) {
            return;
        }
        if (bks) {
            const cost = gamePlay.cost;
            for (let i = 0; i < bks.length; i ++) {
                let bk = bks[i];
                if (bk.indexOf('=') > 0) {
                    continue;
                }
                let temp = cost.parseBulletKey(bk);
                const cfg = cost._getWpSKinCfg(temp.skin);
                let times = Math.round(cfg.power[0]);
                this._fireC(times);
            }
        }

        this._fishCount(ret);
    }

    /**
     * 排位赛打死鱼统计
     */
    _fishCount (ret) {
        let fireEnd = this.isNormalFireEnd();
        let isFiredWithNB = this._state === STATE.NB_USED;
        for (let fk in ret) {
            let data = ret[fk];
            let fireFlag = data.fireFlag;
            let gold = data.gold;
            let temp = fk.split('__');
            let name = temp[0];
            if (fireEnd && fireFlag === consts.FIRE_FLAG.NBOMB) {
                if (isFiredWithNB) {
                    if (!this._fHistoryNB) {
                        this._fHistoryNB = {
                            count: 0,
                            score: 0,
                        }
                    }
                    this._fHistoryNB.count ++;
                    this._fHistoryNB.score += gold;
                }
            }else{
                if (!this._fHistory) {
                    this._fHistory = {};
                }
                if (!this._fHistory[name]) {
                    this._fHistory[name] = {
                        count: 0,
                        score: 0,
                    };
                }
                this._fHistory[name].count ++;
                this._fHistory[name].score += gold;
            }
            this._curScore += gold;
        }
    }

    /**
     * 核弹使用与否
     */
    nbFlag (isUsed) {
        this._state = isUsed ? STATE.NB_USED : STATE.NB_CANCEL;
    }

    /**
     * 返回比赛战绩
     * 说明：
     * normal：非核弹打死鱼,null则一条也没打死，反之打死鱼，fishname: {count: 0, score: 0} 
     * nbomb: 核弹打死鱼,null则取消核弹，反之打死鱼，{count: 0, score: 0}
     */
    getHistory () {
        return {
            normal: this._fHistory,
            nbomb: this._fHistoryNB,
        }
    }

    /**
     * 返回当前信息
     * fire: 剩余子弹数
     * score: 当前得分
     */
    getDetail () {
        return {
            fire: consts.RMATH_FIRE_MAX - this._fireC,
            score: this._curScore,
        };
    }
    
}

module.exports = Rmatch;