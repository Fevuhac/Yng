const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
const consts = require('../consts');
const config = require('../config');
const fishCode = require('../fishCode');
const uuidv1 = require('uuid/v1');
const RankMatchPlayer = require('./rankMatchPlayer');
const pomelo = require('pomelo');
const rpc = require('../../../net/rpc');
const fishCmd = require('../../../../cmd/fishCmd');
const PlayerFactory = require('../entity/playerFactory');


class RankMatchRoom {
    constructor(opts) {
        this._playerMap = new Map();
        this._countdown = config.MATCH.MSECONDS;
        this._state = consts.MATCH_ROOM_STATE.WAIT;
        this._createTime = Date.now();
        this._lastUpdateTime = Date.now();
        this._roomId = uuidv1();
        this.channel = pomelo.app.get('channelService').getChannel(this._roomId, true);
        
        this._init(opts.users);
    }

    get countdown(){
        return this._countdown;
    }

    get state() {
        return this._state;
    }

    get roomId(){
        return this._roomId;
    }

    _init(users){
        users.forEach(async function(user){
            logger.error('--user = =', user);
            let player = await PlayerFactory.createPlayer({
                uid: user.uid, 
                sid: user.sid, 
                kindId: user.kindId,
                gameMode: consts.GAME_MODE.MATCH
            });
            let uid = user.uid;
            let sid = user.sid;
            logger.error('uid = ', uid);
            logger.error('sid = ', sid);
            this._playerMap.set(uid, player);
            this.channel.add(uid, sid);
        }.bind(this));
    }

    _flushCountdown() {
        let subTime = Date.now() - this._lastUpdateTime;
        return subTime;
    }

    //机器人开火
    _robot_fire(){

    }

    update() {
        if (this._state != consts.MATCH_ROOM_STATE.DOING) {
            return;
        }
        //更新倒计时        
        let subTime = this._flushCountdown();
        if (subTime >= 1000) {
            this._countdown -= 1000;
            this._countdown = Math.max(this._countdown, 0);
            this._sendCountdown();
        }
        this._robot_fire();
        this._try2Settlement();
    }

    isGameOver() {
        return this._state === consts.MATCH_ROOM_STATE.OVER;
    }

    setReady(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOPLAYER;
        }
        player.ready = true;
        player.serverId = data.serverId;

        if (this._canStart()) {
            this._startRmatch();
        }
    }

    weaponChange(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        this._broadcast(rankMatchCmd.push.weaponChange.route, data);
    }

    setFightInfo(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.setFightInfo(data);
        this._broadcast(rankMatchCmd.push.fightInfo.route, data);
    }

    useNbomb(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.useNbomb(data);
        this._broadcast(rankMatchCmd.push.useNbomb.route, data);
        this._try2Settlement();
    }

    cancelNbomb(data) {
        let player = this._playerMap.get(data.uid);
        if (!player) {
            return fishCode.MATCH_ROOM_NOT_EXIST;
        }
        player.cancelNbomb(data);
        this._broadcast(rankMatchCmd.push.cancelNbomb.route, data);
        this._try2Settlement();
    }

    /**
     * 尝试结算
     * 时间到或双方都已开炮完毕则可以结算，反之不可结算
     */
    _try2Settlement () {
        if (this._canOVer()) {
            this._settlement();
        }
    }

    _canStart() {
        for (let player of this._playerMap.values()) {
            if (!player.ready) {
                return false;
            }
        }
        return true;
    }

    _canOVer() {
        if (this._countdown === 0) {
            return true;
        }
        for (let player of this._playerMap.values()) {
            if (!player.isOver()) {
                return false;
            }
        }
        return true;
    }

    _broadcast(route, data) {
        this.channel.pushMessage(route, packMsg(data));
    }

    //战斗结算
    _settlement() {
        let players = [...this._playerMap];
        let p1 = players[0][1];
        let p2 = players[1][1];
        p1.setResult(p2);
        p2.setResult(p1);

        let match_info = []; //双方比赛信息，参赛者都需要收到此数据
        for (let player of this._playerMap.values()) {
            match_info.push(player.getRMatchDetail());
        }
        for (let player of this._playerMap.values()) {
            let pd = player.getPrivateDetail();
            pd.match_info = match_info;
            player.save();
            this._broadcast(rankMatchCmd.push.pkResult.route, pd);
        }
        this._state = consts.MATCH_ROOM_STATE.OVER;
        this._matchFinish();
    }

    //发送倒计时
    _sendCountdown() {
        this._broadcast(rankMatchCmd.push.timer.route, {
            countdown: this._countdown
        });
        this._lastUpdateTime = Date.now();
    }

    //双方准备就绪，正式开始
    _startRmatch() {
        this._broadcast(rankMatchCmd.push.start.route, {
            countdown: this._countdown
        });
        this._state = consts.MATCH_ROOM_STATE.DOING;
        this._lastUpdateTime = Date.now();

        for (let player of this._playerMap.values()) {
            if (player.kindId == consts.ENTITY_TYPE.ROBOT) {
                continue;
            }
            rpc.request('game', 'playerRemote', fishCmd.remote.matchStart.route, {gameSid: player.serverId}, {
                uid: player.account.id,
                nbomb_cost: player.nbomb_cost,
            });
        }
    }

    /**
     * 比赛结束
     */
    _matchFinish(){
        for (let player of this._playerMap.values()) {
            if (player.kindId == consts.ENTITY_TYPE.ROBOT) {
                continue;
            }
            rpc.request('game', 'playerRemote', fishCmd.remote.matchFinish.route, {gameSid: player.serverId}, {uid: player.account.uid});
        }
    }

}
module.exports = RankMatchRoom;