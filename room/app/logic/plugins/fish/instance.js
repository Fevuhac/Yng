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
        this._kickOfflineTimer = null;
    }


    run() {
        if (!this._vacancyQueryTimer) {
            this._vacancyQueryTimer = setInterval(this.assignRobot.bind(this), config.ROBOT.VACANCY_QUERY_TIMEOUT);
        }
        robotController.run();

        if(!this._kickOfflineTimer){
            this._kickOfflineTimer = setInterval(this.kick_offline_player.bind(this), config.PLAYER.KICK_OFFLINE_CHECK_TIMEOUT);
        }

    }

    stop() {
        if (this._vacancyQueryTimer) {
            clearInterval(this._vacancyQueryTimer);
            this._vacancyQueryTimer = null;
        }
        robotController.stop();
    }

    /**
     * 定时加入机器人到房间
     */
    assignRobot() {
        let rooms = this.queryMultiRoom(true);
        robotController.addRobot(rooms);
    }

    kick_offline_player(){
        for(let scene of this.scenes.values()){
            let scene_uids = scene.kickOfflinePlayer();
            for(let uid of scene_uids){
                this.uids.delete(uid);
            }
        }
    }

    getLoadStatistics() {
        let roomCount = [...this.scenes.values()].reduce(function (prev, next) {
            return prev + next.getRoomCount();
        }, 0);

        return {
            playerCount: this.uids.size,
            roomCount: roomCount
        };
    }


    /**
     * 查询多人房
     */
    queryMultiRoom(robot) {
        let rooms = [];
        for (let scene of this.scenes.values()) {
            let room = scene.multiRoom(robot);
            if (room) {
                rooms.push({
                    room: room,
                    scene: scene
                });
            }
        }
        return rooms;
    }

    async enterScene(data, cb) {
        if (!data.sceneType || !data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }
        let scene = this.scenes.get(data.sceneType);
        if (!scene) {
            scene = new Scene(data.gameType, data.sceneType);
            let ret = scene.start()
            if (ret) {
                utils.invokeCallback(cb, ret)
                return;
            } else {
                logger.info(`${data.gameType} scene ${data.sceneType} 启动成功`);
            }
            this.scenes.set(data.sceneType, scene);
        }

        try {
            let player = await Player.allocPlayer(data);
            if (!!player) {
                let ret = scene.joinGame(player);
                if (ret.code !== CONSTS.SYS_CODE.OK.code) {
                    utils.invokeCallback(cb, ret);
                    return
                }
                this.uids.set(data.uid, scene);
                utils.invokeCallback(cb, null, player.roomId);
            } else {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_CREATE_FAILED);
            }
        } catch (err) {
            utils.invokeCallback(cb, err);
        }
    }

    setPlayerState(data, cb) {
        if (!data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }
        let scene = this.scenes.get(data.sceneType);
        if (!scene) {
            utils.invokeCallback(cb, null)
            return
        }
        let room = scene.getSceneRoom(data.uid)
        if(!!room && room.setPlayerState(data.uid, data.state, data.sid)){
            utils.invokeCallback(cb, null, room.roomId);
        }else{
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
        }
    }

    leaveScene(uid, sceneType, cb) {
        let scene = this.scenes.get(sceneType)
        if (!scene) {
            utils.invokeCallback(cb, null)
            return
        }
        scene.leaveGame(uid);
        this.uids.delete(uid);
        utils.invokeCallback(cb, null)
    }

    getScene(sceneType) {
        return this.scenes.get(sceneType)
    }
}

module.exports = Instance;