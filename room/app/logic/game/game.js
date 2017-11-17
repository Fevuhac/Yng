const pomelo = require('pomelo');
const plugins = require('../plugins');
const event = require('../base/event');
const Entity = require('../base/entity');
const shareData = require('../../cache/shareData');
const dataType = require('../../cache/dataType');
const eventType = require('../../consts/eventType');

class Game extends Entity{
    constructor() {
        super({})
        this.instances = new Map(); //服务器实例
        this.uids = new Map(); //uid <=> 实例映射
    }

    start() {
        let config = pomelo.app.get('redis');
        redisClient.start(config, function (err, connector) {
            if(err){
                logger.error('连接redis数据库失败:', err);
                return;
            }
            shareData.load();
            redisClient.sub(eventType.PUMPWATER, this.onPumpwater.bind(this));

        }.bind(this));
    }

    stop() {
        redisClient.stop();
        // pomelo.app.get('sync').flush();
    }

    getScene(uid){
        let inst = this.uids.get(uid);
        if(!inst){
            return;
        }
        return inst.getScene(uid);
    }

    //获取玩家负载信息
    getLoadInfo(){
        let info = [...this.instances.values()].reduce(function (prev, next) {
            let sub = next.getLoadStatistics();
            return {
                playerCount:prev.playerCount + sub.playerCount,
                roomCount:prev.roomCount + sub.roomCount
            }
        }, {playerCount:0, roomCount:0});

        return info;
    }

    getInstance(gameType){
        let inst = this.instances.get(gameType);
        if(!inst){
            inst = new plugins[gameType].Instance();
            this.instances.set(gameType, inst);
            inst.run();
        }
        return inst;
    }

    //玩家加入
    onPlayerJoin(data, cb){
        if(this.uids.has(data.uid)){
            utils.invokeCallback(cb, null)
            return;
        }

        let inst = this.getInstance(data.gameType);
        inst.enterScene(data, function (err) {
            if(!err){
                logger.error('onPlayerJoin enter' , data.uid);
                this.uids.set(data.uid, inst);
            }
            utils.invokeCallback(cb, err);
        }.bind(this));
    }

    //玩家离开
    onPlayerLeave(uid, cb){
        logger.error('onPlayerLeave enter' , uid);
        let inst = this.uids.get(uid);
        if(!inst){
            utils.invokeCallback(cb, null);
            return
        }

        logger.error('onPlayerLeave' , uid);
        inst.leaveScene(uid, cb);
        this.uids.delete(uid);
    }


    onPumpwater(msg){
        shareData.set(dataType.PUMPWATER, msg.pumpwater);
    }
}

module.exports = new Game();
