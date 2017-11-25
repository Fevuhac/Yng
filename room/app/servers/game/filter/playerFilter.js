/**
 * Created by Administrator on 2017/4/15.
 */

var pomelo = require('pomelo');


class PlayerFilter{
    constructor(){
    }

    before(msg, session, next){
        let scene = pomelo.app.game.getScene(session.get('gameType'),session.get('sceneType'));
        if(!scene){
            next(CONSTS.SYS_CODE.PALYER_NOT_IN_SCENE);
            return;
        }

        msg.scene = scene;

        next();

        // let route = msg.__route__;
        //
        // msg.__route__.match('')
    }

    after(err, msg, session, resp, next){
        next();
    }

}

module.exports = new PlayerFilter();