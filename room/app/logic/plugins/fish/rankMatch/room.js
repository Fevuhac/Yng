const rankMatchCmd = require('../../../../cmd/rankMatchCmd');
class RankMatchRoom {
    constructor(opts) {
        this._playerMap = new Map();
        this._countdown = 150 * 1000;
        this._state = 0;
        this._createTime = Date.now();
        this._lastUpdateTime = Date.now();
        this._roomId = opts.roomId;
        this.channel = pomelo.app.get('channelService').getChannel(this._roomId, true);
    }

    get state() {
        return this._state;
    }

    _flushCountdown() {
        let subTime = Date.now() - this._lastUpdateTime;

        this._countdown -= subTime;
        this._countdown = Math.max(this._countdown, 0);

        this._lastUpdateTime = Date.now();

        return subTime;
    }

    update() {
        if (!this._state) {
            return;
        }
        //更新倒计时
        let subTime = this._flushCountdown();
        if (subTime >= 1000000) {
            this._sendCountdown();
        }
        if (this._countdown == 0) {
            this._settlement();
            this._state = 2;
            return;
        }
    }

    gameover() {
        return this._countdown == 0;
    }

    setReady(uid) {
        let player = this._playerMap.get(uid);
        if (!player) {
            return '玩家不在房间中';
        }

        player.ready = true;

        this._state = this._canStart();
        if (this._state) {
            this._lastUpdateTime = Date.now();
        }
    }

    setFightInfo(uid, data) {
        let player = this._playerMap.get(uid);
        if (!player) {
            return '玩家不在房间中';
        }
    }

    _canStart() {
        for (let player of this._playerMap.values()) {
            if (!player.ready) {
                return 0;
            }
        }
        return 1;
    }

    _broadcast(route, data) {
        this.channel.pushMessage(route, packMsg(data));
    }

    //战斗结算
    _settlement() {
        let data = {};
        for (let player of this._playerMap.values()) {
            this._broadcast(rankMatchCmd._push.pkResult.route, data)
        }
    }

    //发送倒计时
    _sendCountdown() {
        this._broadcast(rankMatchCmd._push.pkResult.route, {countdown:this._countdown});
    }

}
module.exports = RankMatchRoom;