/**
 * 周末狂欢活动相关
 * {
 * id: 1, //活动id
 * mseconds: 1,//距离可领奖剩余毫秒数 
 * progress: 0 // 进度，-1标识已领取，>=0标识进度
 * }
 */
const DailyWeekendCfg = require('../../cfgs/daily_weekend_cfg');
let data_util = require('./data_util');
let RedisUtil = require('../../src/utils/RedisUtil');
let BuzzUtil = require('../../src/utils/BuzzUtil');

let DaoCommon = require('../../src/dao/dao_common');

//根据时间从小到大排序
DailyWeekendCfg.sort(function(a, b) {
    let at = new Date(a.time).getTime();
    let bt = new Date(b.time).getTime();
    if (at < bt) {
        return -1;
    }else if (at > bt) {
        return 1;
    }
    return 0;
});

const UID_WEEKEND_REWARD_GOT = 'pair:uid:happyweekend_reward';

class HappyWeekend {

    constructor () {
    }

    //返回当前最近活动数据,注意一天有两个活动内容
    _getNearestActivity () {
        let data = {
            outOfDate: false, //过期
            info: [], // [{id: 1, mseconds: 1, progress: 0}]//最近活动的id，包含前后两天//当前时间距离最近活动的时间，毫秒//已领取
        };

        let idx = -1;
        let dd = 24*60*60*1000;
        let now = new Date().getTime();
        let length = DailyWeekendCfg.length;
        if (length == 0) {
            data.outOfDate = true;
            return data;
        }
        let endTime = DailyWeekendCfg[length - 1].time;
        endTime = new Date(endTime).getTime();
        if (now > endTime) {
            data.outOfDate = true;
            return data;
        }
        let startTime = DailyWeekendCfg[0].time;
        startTime = new Date(startTime).getTime();
        let offsetDays = 2;
        if (now > startTime) {
            offsetDays = 5;
        }
        
        let nextIdx = -1;
        for (let i = 0; i < DailyWeekendCfg.length; i ++) {
            let temp = DailyWeekendCfg[i];
            let ttime = new Date(temp.time).getTime();
            let mseconds = ttime - now;
            let tdays = Math.ceil(mseconds/dd);
            //console.log('tdays = ', tdays, mseconds);
            if (tdays >= 0 && tdays <= offsetDays) {
                if (mseconds < 0 && tdays == 0) {
                    mseconds = 0;
                }
                nextIdx = i + 2;
                if (nextIdx >= DailyWeekendCfg.length) {
                    nextIdx = -1;
                }
                let nextMSeconds = -1;
                if (nextIdx > 0) {
                    let next = DailyWeekendCfg[nextIdx];
                    let nextTime = new Date(next.time).getTime();
                    nextMSeconds = nextTime - ttime;
                }
                
                data.info.push({
                    id: temp.id, 
                    mseconds: mseconds, 
                    progress: 0,
                    nextMSeconds: nextMSeconds,
                });
                if (data.info.length === 2) {
                    break;
                }
            }
        }
        if (data.info.length != 2) {
            data.info = [];
            data.outOfDate = true;
            return data;
        }

        return data;
    }

    //返回当前最近活动数据
    getDataWithToken (pool, token, res, aes) {
        const TAG = '获取周末狂欢活动数据';
        DaoCommon.checkAccount(pool, token, function(error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, TAG);
                return;
            }
            let data = this._getNearestActivity();
            if (!data.outOfDate) {
                //检查是否已领取
                let id = account.id;
                RedisUtil.hget(UID_WEEKEND_REWARD_GOT, id, function(err, val) {
                     if (err) {
                         data_util.handleReturn(res, aes, err, null, TAG);
                         return;
                     }
                    let info = data.info;
                     if (!val) {
                         let defVal = {};
                         for (let i = 0; i < info.length; i ++) {
                             let temp = info[i];
                             temp.progress = 0;
                             defVal[temp.id] = 0;
                         }
                         //不存在，则及时将默认值写入
                         RedisUtil.hset(UID_WEEKEND_REWARD_GOT, id, JSON.stringify(defVal));
                     }else{
                         try {
                             val = JSON.parse(val);
                         } catch (error) {
                            data_util.handleReturn(res, aes, '解析失败', null, TAG);
                            return;
                         }
                         for (let i = 0; i < info.length; i ++) {
                             let temp = info[i];
                             val[temp.id] = val[temp.id] || 0;
                             temp.progress = val[temp.id];
                             if (temp.progress === -1) {
                                 temp.mseconds = temp.nextMSeconds;
                             }
                         }
                         RedisUtil.hset(UID_WEEKEND_REWARD_GOT, id, JSON.stringify(val));
                     }
                     data_util.handleReturn(res, aes, error, data, TAG);
                });
            }else{
                data_util.handleReturn(res, aes, error, data, TAG);
            }
        }.bind(this));
    }

    //领奖
    check2GetReward (req, token, res, aes, activityId) {
        const TAG = '领取周末狂欢奖励';
        DaoCommon.checkAccount(req.pool, token, function(error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, TAG);
                return;
            }
        
            let data = {};
            let id = account.id;
            RedisUtil.hget(UID_WEEKEND_REWARD_GOT, id, function(err, val) {
                if (err) {
                    data_util.handleReturn(res, aes, err, null, TAG);
                    return;
                }
                let errMsg = '：尚无记录，无法领取';
                try {
                    val = JSON.parse(val);
                } catch (error) {
                    data_util.handleReturn(res, aes, '解析失败', null, TAG);
                    return;
                }
                if (val) {
                    let curAcInfo = null;
                    let nextIdx = -1;
                    for (let i = 0 ;i < DailyWeekendCfg.length; i ++) {
                        let temp = DailyWeekendCfg[i];
                        if (temp.id === activityId) {
                            curAcInfo = temp;
                            nextIdx = i + 2;//下一次同类型活动
                            if (nextIdx >= DailyWeekendCfg.length) {
                                nextIdx = -1;
                            }
                            break;
                        }
                    }
                    if (curAcInfo) {
                        let now = new Date().getTime();
                        let ttime = new Date(curAcInfo.time).getTime();
                        if (now < ttime) {
                            data_util.handleReturn(res, aes, '时间未到', null, TAG);
                            return;
                        }
                        let progress = val[activityId];
                        if (progress == undefined) {
                            errMsg = '：活动id不存在';
                        }else if (progress == -1) {
                            errMsg = '：已领取！';
                        }else if ((curAcInfo.type === 0 && progress == 0) || (progress >= curAcInfo.condition)) {
                            //可领取、加奖励：
                            let item_list = [];
                            let cfg = curAcInfo.reward;
                            for (let i = 0; i < cfg.length; i ++) {
                                let tt = cfg[i];
                                item_list.push({
                                    item_id: tt[0], 
                                    item_num: tt[1],
                                })
                            }
                            BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
                                let change = BuzzUtil.getChange(account, reward_info);
                                data.item_list = item_list;
                                data.change = change;
                                val[activityId]= -1; //标记成功领取
                                if (nextIdx > 0) {
                                    let temp = DailyWeekendCfg[nextIdx];
                                    let ttime = new Date(temp.time).getTime();
                                    let ctime = new Date(curAcInfo.time).getTime();
                                    let nextMSeconds = ttime - ctime;
                                    data.nextMSeconds = nextMSeconds;
                                }else{
                                    data.nextMSeconds = -1;
                                }
                                data.code = 0;
                                RedisUtil.hset(UID_WEEKEND_REWARD_GOT, id, JSON.stringify(val));
                                errMsg = null;
                            });
                        }else{
                            errMsg = '：未知错误';
                        }
                    }else{
                        errMsg = '：无此活动！';
                    }
                }
                data_util.handleReturn(res, aes, errMsg, data, TAG);
            });
        }.bind(this));
    }

    //跨天重置
    clear () {
        RedisUtil.del(UID_WEEKEND_REWARD_GOT, function () {
            console.log('已清空周末狂欢数据!');
        });
    }

    //更新捕鱼任意条进度
    saveFishingCount (pool, token, res, aes, activityId, fishingCount) {
        const TAG = '更新周末狂欢捕鱼任意条进度';
        DaoCommon.checkAccount(pool, token, function(error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, TAG);
                return;
            }
            
            let id = account.id;
            RedisUtil.hget(UID_WEEKEND_REWARD_GOT, id, function(err, val) {
                if (err) {
                    data_util.handleReturn(res, aes, err, null, TAG);
                    return;
                }
                try {
                    val = JSON.parse(val);
                } catch (error) {
                    data_util.handleReturn(res, aes, '解析失败', null, TAG);
                    return;
                }
                if (val) {
                    activityId && (val[activityId] = fishingCount);
                    RedisUtil.hset(UID_WEEKEND_REWARD_GOT, id, JSON.stringify(val));
                    data_util.handleReturn(res, aes, null, {}, TAG);
                }
            });
        }.bind(this));
    }

}

module.exports = HappyWeekend;