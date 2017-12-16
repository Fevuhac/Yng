/**
 * Created by Administrator on 2017/4/15.
 */

var pomelo = require('pomelo');


class PlayerFilter{
    constructor(){
    }

    before(msg, session, next){
        let scene = pomelo.app.game.getScene(session.get('game').scene);
        if(!scene){
            next(CONSTS.SYS_CODE.PALYER_NOT_IN_SCENE);
            return;
        }
        msg.scene = scene;
        next();
    }

    after(err, msg, session, resp, next){
        next();
    }

}

module.exports = new PlayerFilter();