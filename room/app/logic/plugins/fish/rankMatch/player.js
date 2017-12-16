const Player = require('../../../base/player');

class RankMatchPlayer extends Player {
    /**
     * {
     * kindId:0,
     * sid:0,
     * uid:0,
     * account:{}
     * ready:false
     * 
     * }
     * @param {*} opts 
     */
    constructor(opts) {
        super(opts);
        this._ready = false;
        this._statistics = {
            total: 1000,
            fish: {}
        }

    }

    set ready(value) {
        this._ready = value;
    }

    get ready() {
        return this._ready;
    }

    static allocPlayer(data) {
        let player = new RankMatchPlayer({
            uid: data.uid,
            sid: data.sid,
            account: account,
            kindId: consts.ENTITY_TYPE.PLAYER
        });
    }
}

module.exports = RankMatchPlayer;