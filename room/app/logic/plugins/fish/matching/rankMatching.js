const config = require('../config');
const User = require('./user');
const pomelo = require('pomelo');
const messageService = require('../../../net/messageService');
const matchingCmd = require('../../../../cmd/matchingCmd');
const balanceCmd = require('../../../../cmd/balanceCmd');
const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const fishCmd = require('../../../../cmd/fishCmd');
const RobotBuilder = require('../robot/robotBuilder');
const consts = require('../consts');
const uuidv1 = require('uuid/v1');

class RankMatching {
    constructor() {
        this._users = new Map();
        this._canRun = true;
        this._robotBuilder = new RobotBuilder();
    }

    runTask() {
        if (!this._canRun) return;
        setTimeout(function () {
            this._mate();
            this.runTask();
        }.bind(this), config.MATCH.MATE_INTERVAL);
    }

    start() {
        this.runTask();
    }

    stop() {
        this._canRun = false;
    }

    //排位赛玩家报名
    async c_signup(data, session, cb) {
        try {
            logger.error('有人报名--', data);
            let user = await User.allocUser(data);
            this._users.set(data.uid, user);
            cb();
        } catch (err) {
            cb(err);
        }
    }

    //取消报名
    c_cancel(data, session, cb) {
        this._users.delete(data.uid);
        cb();
    }

    _searchEnemy(user, levels) {
        let mate_enemy = null;
        for (let i = 0; i < levels.length; i++) {
            if (!levels[i]) continue;
            let enemy = levels[i][1];
            if (user.canMatch(enemy.sword)) {
                if (enemy.canMatch(user.sword)) {
                    mate_enemy = enemy;
                    levels[i] = null;
                    break;
                }

            } else {
                break;
            }
        }
        return mate_enemy;
    }

    //TODO: 分配机器人
    async _allocRobotEnemy(user) {
        let baseInfo = await this._robotBuilder.genBaseInfo();
        let weapon_skin = this._robotBuilder.genOwnWeaponSkin();

        let account = {
            uid: uuidv1(),
            nickname: baseInfo.nickname,
            figure_url: baseInfo.figure_url,
            weapon_skin: weapon_skin,
            match_rank: 5,//TODO
            nbomb_cost: 1000, //TODO 本次核弹消耗金币
            kindId: consts.ENTITY_TYPE.ROBOT,
        };

        return {
            account: account,
        };
    }

    /**
     * TODO:匹配玩家、段位、武器等级、VIP等
     */
    async _mate() {
        let levels = [...this._users];
        levels.sort(function (userA, userB) {
            if (userA.sword != userB.sword) {
                return userA.sword < userB.sword;
            } else {
                return userA.sigupTime > userB.sigupTime;
            }
        });

        for (let i = 0; i < levels.length; i++) {
            if (!levels[i]) continue;

            let user = levels[i][1];
            levels[i] = null;

            let enemy = this._searchEnemy(user, levels);
            if (!enemy) {
                //TODO:读取配置文件，不同段位的玩家，匹配机器人时间不同
                if (Date.now() - user.sigupTime > config.MATCH.MATE_TIMEOUT) {
                    enemy = await this._allocRobotEnemy(user);
                }
            }

            if (enemy) {
                let uids = this._getUids([user, enemy]);
                try {
                    let serverId = await this._allocMatchServer();
                    let matchInfo = await this._joinMatchRoom(serverId, {
                        users: [user.account, enemy.account]
                    });
                    let mateResult = {
                        rankMatch: {
                            serverId: serverId,
                            roomId: matchInfo.roomId,
                        },
                        players: [user.getMatchingInfo(), enemy.getMatchingInfo()],
                    };
                    this._responseMateResult(null, mateResult, uids);
                    this._remQueue(uids);
                } catch (err) {
                    logger.error('排位赛加入异常', err);
                    this._responseMateResult(err, null, uids);
                    this._remQueue(uids);
                }
            }
        }
    }

    _remQueue(uids) {
        uids.forEach(function (item) {
            this._users.delete(item.uid);
        }.bind(this));
    }

    _getUids(users) {
        let uids = [];
        users.forEach(user => {
            if (user.account.kindId == consts.ENTITY_TYPE.PLAYER) {
                uids.push({
                    uid: user.account.uid,
                    sid: user.account.sid
                });
            }
        });
        return uids;
    }

    _allocMatchServer() {
        return new Promise(function (resolve, reject) {
            pomelo.app.rpc.balance.balanceRemote[balanceCmd.remote.getRankMatchServer.route]({}, function (err, serverId) {
                if (err) {
                    reject(err);
                } else {
                    resolve(serverId);
                }
            })
        })
    }

    //加入比赛房间
    _joinMatchRoom(serverId, data) {
        return new Promise(function (resolve, reject) {
            pomelo.app.rpc.rankMatch.rankMatchRemote[rankMatchCmd.remote.join.route]({
                rankMatchSid: serverId
            }, data, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    //回应匹配结果
    _responseMateResult(err, data, uids) {
        if (err) {
            messageService.broadcast(matchingCmd.push.matchingResult.route, answer.respNoData(err), uids);
            return;
        }
        messageService.broadcast(matchingCmd.push.matchingResult.route, data, uids);
    }
}

module.exports = RankMatching;