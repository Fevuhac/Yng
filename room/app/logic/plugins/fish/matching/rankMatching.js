const config = require('../config');
const User = require('./user');
const pomelo = require('pomelo');
const messageService = require('../../../net/messageService');
const matchingCmd = require('../../../../cmd/matchingCmd');
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
    async c_signup(data, cb) {
        try {
            let user = await User.allocUser(data);
            this._users.set(data.uid, user);
            cb();

        } catch (err) {
            cb(err);
        }
    }

    //取消报名
    c_cancle(data, cb) {
        this._users.delete(data.uid);
        cb();
    }

    _searchEnemy(user) {
        // let enemyNum = user.ext.num - 1;
        // let enemys = [];
        let mate_enemy = null;
        for (let i = 0; i < levels.length; i++) {
            let enemy = levels[i][1];
            if (!enemy) continue;
            if (user.canMatch(enemy.sword)) {
                //enemys.push(enemy)
                if (enemy.canMatch(user.sword)) {
                    mate_enemy = enemy;
                    break;
                }

            } else {
                break;
            }
        }
        return mate_enemy;
    }

    //TODO: 分配机器人
    _allocRobotEnemy(user) {
        let baseInfo = this._robotBuilder.genBaseInfo();
        let weapon_skin = this._robotBuilder.genOwnWeaponSkin();

        let account = {
            uid:uuidv1(),
            nickname: baseInfo.nickname,
            figure_url: baseInfo.figure_url,
            weapon_skin: weapon_skin,
            type: consts.ENTITY_TYPE.MATCH_ROBOT
        };

        return {
            account: account
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
            levels[i] = null;
            let user = levels[i][1];
            let enemy = this._searchEnemy(user);
            if (!enemy) {
                //TODO:读取配置文件，不同段位的玩家，匹配机器人时间不同
                if (Date.now() - user.sigupTime > config.MATCH.MATE_TIMEOUT) {
                    enemy = this._allocRobotEnemy(user);
                }
            }

            if (enemy) {
                let uids = this._getUids(user, enemy);
                try {
                    let serverId = await this._allocMatchServer();
                    let matchInfo = await this._joinMatchRoom(serverId, [user.account, enemy.account]);

                    let mateResult = {
                        roomInfo: {
                            serverId: serverId,
                            roomId: matchInfo.roomId,
                            countdown: matchInfo.countdown,
                            bulletNum: matchInfo.bulletNum
                        },
                        users: [
                            user.account,
                            enemy.account
                        ]
                    }

                    this._sendMateResult(null, mateResult, uids);
                } catch (err) {
                    logger.error('排位赛加入异常', err);
                    this._sendMateResult(err, null, uids);
                }
            }
        }
    }

    _getUids(users) {
        let uids = [];
        users.forEach(user => {
            if (users.account.type == consts.ENTITY_TYPE.PLAYER) {
                uids.push({
                    uid: user.ext.uid,
                    sid: user.ext.sid
                });
            }
        });
        return uids;
    }

    _allocMatchServer() {
        return new Promise(function (resolve, reject) {
            pomelo.app.rpc.balance.getRankMatch({}, function (err, serverId) {
                if (err) {
                    reject(err);
                } else {
                    resolve(serverId);
                }
            })
        })
    }

    _joinMatchRoom(serverId, users) {
        return new Promise(function (resolve, reject) {
            pomelo.app.rpc.rankMatch.rankMatchRemote.join({
                rankMatchId: serverId
            }, users, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    _sendMateResult(err, data, uids) {
        if (err) {
            messageService.broadcast(matchingCmd.push.matchingResult.route, answer.respNoData(err), uids);
            return;
        }
        messageService.broadcast(matchingCmd.push.matchingResult.route, answer.respData(data), uids);
    }
}

module.exports = RankMatching;