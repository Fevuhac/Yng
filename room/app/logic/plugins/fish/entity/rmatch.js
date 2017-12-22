// //--[[
// description: 排位赛统计信息
// author: scott (liuwenming@chufengnet.com)
// date: 20171129
// ATTENTION：
// //--]]

const config = require('../config');
const consts = require('../consts');
const gamePlay = require('../gamePlay/gamePlay');
const STATE = consts.RMATCH_STATE;

class Rmatch {
    constructor () {
        this._sid = 0;
        this._roomId = 0;
        this._leftSecond = 0; //剩余时间，单位秒
        this._curScore = 0; //总共得分
        this._fireC = 0; //开炮数
        this._fHistory = null; //打死什么鱼、多少条、多少分
        this._fHistoryNB = null; //核弹打死多少条鱼、共计分
        this._state = STATE.READY; //比赛状态,0准备中 1开始比赛 2一百炮开完 3使用核弹 4取消核弹 5比赛结束
        this._updateFunc = null;
        this._nbCost = 1000;
    }

    get sid () {
        return this._sid;
    }

    get roomId () {
        return this._roomId;
    }

    get nbombCost () {
        return this._nbCost;
    }

    /**
     * 记录本次核弹消耗
     */
    setNbCost (val) {
        this._nbCost = val;
    }

    /**
     * 记录比赛房间相关id
     * @param {*} data 
     */
    setServerData (data) {
        this._sid = data.serverId;
        this._roomId = data.roomId;
    }

    /**
     * 数据发生变化时，及时回调
     * @param {*回调} func 
     */
    registerUpdateFunc (func) {
        this._updateFunc = func;
    }

    /**
     * 统计开炮次数,子弹碰撞完毕才算一次
     * times： 一炮当多炮，如金蝉武器，默认普通炮为1
     */
    _fireTimes (times) {
        if (this.isNormalFireEnd()) {
            return;
        }
        times = times || 1;
        this._fireC += times;
        this._fireC = Math.min(this._fireC, config.MATCH.FIRE);
    }

    /**
     * 普通开火是否结束
     */
    isNormalFireEnd () {
        return this._fireC === config.MATCH.FIRE;
    }

    /**
     * 排位赛子弹数统计\捕鱼统计
     */
    fireCount (bks, ret) {
        if (!this._updateFunc) return;
        let oldFc = this._fireC;
        if (bks) {
            const cost = gamePlay.cost;
            for (let i = 0; i < bks.length; i ++) {
                let bk = bks[i];
                let temp = cost.parseBulletKey(bk);
                if (!temp.rmatching) {
                    continue;
                }
                const cfg = cost._getWpSKinCfg(temp.skin);
                let times = Math.round(cfg.power[0]);
                this._fireTimes(times);
            }
        }
        let oldScore = this._curScore;
        let isFiredWithNB = this._fishCount(ret);
        if ((oldFc != this._fireC || oldScore != this._curScore) && this._curScore) {
            let td = this._getDetail();
            this._updateFunc(td, isFiredWithNB);
            this._fHistoryNB = null;
            this._fHistory = null;
        }
    }

    /**
     * 排位赛打死鱼统计
     */
    _fishCount (ret) {
        let fireEnd = this.isNormalFireEnd();
        let isFiredWithNB = this._state === STATE.NB_USED;
        for (let fk in ret) {
            let data = ret[fk];
            if (!data.rmatching) {
                continue;
            }
            let fireFlag = data.fireFlag;
            let gold = data.gold;
            let temp = fk.split('#');
            let name = temp[0];
            if (fireEnd && fireFlag === consts.FIRE_FLAG.NBOMB) {
                if (isFiredWithNB) {
                    if (!this._fHistoryNB) {
                        this._fHistoryNB = {
                            num: 0,
                            point: 0,
                        }
                    }
                    this._fHistoryNB.num ++;
                    this._fHistoryNB.point += gold;
                }
            }else{
                if (!this._fHistory) {
                    this._fHistory = {};
                }
                if (!this._fHistory[name]) {
                    this._fHistory[name] = {
                        num: 0,
                        point: 0,
                    };
                }
                this._fHistory[name].num ++;
                this._fHistory[name].point += gold;
            }
            this._curScore += gold;
        }
        return isFiredWithNB;
    }

    /**
     * 核弹使用与否
     */
    nbFlag (isUsed) {
        this._state = isUsed ? STATE.NB_USED : STATE.NB_CANCEL;
    }

    /**
     * 返回当前信息
     * fire: 剩余子弹数
     * score: 当前得分
     */
    _getDetail () {
        let temp = {};
        if (this._fHistoryNB) {
            temp = {
                score: this._curScore,
                nbomb: {
                    num: this._fHistoryNB.num,
                    point: this._fHistoryNB.point,
                }
            };
        }else{
            let flist = {};
            for (let k in this._fHistory) {
                let td = this._fHistory[k];
                flist[k] = {
                    num: td.num,
                    point: td.point,
                }
            }
            temp = {
                score: this._curScore,
                fire: config.MATCH.FIRE - this._fireC,
                fish_list: flist,
            };
        }
        return temp;
    }
    
}

module.exports = Rmatch;