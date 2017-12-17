const Scene = require('./scene');
const Entry = require('./entry');
const robotController = require('./robot/robotController');
const config = require('./config');
const PlayerFactory = require('./entity/playerFactory');

class Instance {
    constructor() {
        this.scenes = new Map();
        this.uids = new Map();
        this.entry = new Entry();
        this._vacancyQueryTimer = null;
        this._kickOfflineTimer = null;
    }


    start() {
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

    _getInstScene(sceneId){
        let scene = this.scenes.get(sceneId);
        if (!scene) {
            scene = new Scene(sceneId);
            let err = scene.start()
            if (err) {
                return [err, null];
            }
            this.scenes.set(sceneId, scene);
        }
        return [null, scene];
    }

    async enterScene(data, cb) {
        if (!data.gameMode || !data.sceneId || !data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        if(this.uids.has(data.uid)){
            this.leaveScene(data.uid, data.sceneId);
        }

        let [err, scene] = this._getInstScene(data.sceneId, cb);
        if(err){
            utils.invokeCallback(cb, err);
            return;
        }
        
        try {
            let player = await PlayerFactory.createPlayer(data);
            if (!!player) {
                let [err, roomId] = scene.joinGame(data.gameMode, player);
                if (err) {
                    utils.invokeCallback(cb, err);
                    return
                }
                logger.error('-----------------------enterScene err, roomId:', err, roomId);
                this.uids.set(data.uid, scene);
                utils.invokeCallback(cb, null, roomId);
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
        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS)
            return
        }
        let room = scene.getSceneRoom(data.uid)
        if(!!room && room.setPlayerState(data.uid, data.state, data.sid)){
            utils.invokeCallback(cb, null, room.roomId);
        }else{
            logger.error('setPlayerState dat222a - ', data, room);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
        }
    }

    leaveScene(uid, sceneId, cb) {
        let scene = this.scenes.get(sceneId)
        if (!scene) {
            utils.invokeCallback(cb, null)
            return
        }
        let data = scene.leaveGame(uid);
        this.uids.delete(uid);
        utils.invokeCallback(cb, null, data);
    }

    getScene(sceneId) {
        logger.error('-------getScene sceneId:', sceneId, [...this.scenes])
        return this.scenes.get(sceneId)
    }
}

module.exports = Instance;