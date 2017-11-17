const Scene = require('./scene');
const Player = require('./entity/player');
const Entry = require('./entry');
const robotController = require('./robot/robotController');
const config = require('./config')
class Instance {
    constructor() {
        this.scenes = new Map();
        this.uids = new Map();
        this.entry = new Entry();
        this._vacancyQueryTimer = null;
    }


    run(){
        if(!this._vacancyQueryTimer){
            this._vacancyQueryTimer = setInterval(this.assignRobot.bind(this), config.ROBOT.VACANCY_QUERY_TIMEOUT);
        }
        robotController.run();

    }

    stop(){
        if(this._vacancyQueryTimer){
            clearInterval(this._vacancyQueryTimer);
            this._vacancyQueryTimer = null;
        }
        robotController.stop();
    }

    /**
     * 定时加入机器人到房间
     */
    assignRobot(){
        // let rooms = this.queryMultiRoom();
        // robotController.addRobot(rooms);
    }

    getLoadStatistics(){
        let roomCount = [...this.scenes.values()].reduce(function (prev,next) {
            return prev + next.getRoomCount();
        }, 0);

        return {
            playerCount:this.uids.size,
            roomCount:roomCount
        };
    }


    /**
     * 查询多人房
     */
    queryMultiRoom(){
        let rooms = [];
        for(let scene of this.scenes.values()){
            let room = scene.multiRoom();
            if(room){
                rooms.push({room:room, scene:scene});
            }
        }
        return rooms;
    }

    enterScene(data, cb) {
        if (!data.sceneType || !data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }
        let scene = this.scenes.get(data.sceneType);
        if (!scene) {
            scene = new Scene(data.gameType,data.sceneType);
            let ret = scene.start()
            if(ret){
                utils.invokeCallback(cb, ret)
                return;
            }
            else {
                logger.info(`${data.gameType} scene ${data.sceneType} 启动成功`);
            }
            this.scenes.set(data.sceneType, scene);
        }

        Player.allocPlayer(data).then(function (player) {
            if(!!player){
                let ret = scene.addEntity(player);
                if(ret.code !== CONSTS.SYS_CODE.OK.code){
                    utils.invokeCallback(cb, ret);
                    return
                }
                this.uids.set(data.uid, scene)
                utils.invokeCallback(cb, null)
            }
            else {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_CREATE_FAILED);
            }
        }.bind(this)).catch(function (err) {
            utils.invokeCallback(cb, err);
        });

        
    }

    leaveScene(uid, cb) {
        let scene = this.uids.get(uid)
        if(!scene){
            utils.invokeCallback(cb, null)
            return
        }
        scene.removeEntity(uid);
        this.uids.delete(uid);
        utils.invokeCallback(cb, null)
    }

    getScene(uid){
        return this.uids.get(uid)
    }
}

module.exports = Instance;