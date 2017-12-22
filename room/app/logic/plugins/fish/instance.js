const Scene = require('./scene');
const Entry = require('./entry');
const robotController = require('./robot/robotController');
const config = require('./config');
const consts = require('./consts');
const PlayerFactory = require('./entity/playerFactory');
const fishCmd = require('../../../cmd/fishCmd');

class Instance {
    constructor() {
        this.scenes = new Map();
        this.uids = new Map();
        this._entry = new Entry();
        this._vacancyQueryTimer = null;
        this._kickOfflineTimer = null;
    }


    start() {
        if (!this._vacancyQueryTimer) {
            this._vacancyQueryTimer = setInterval(this.assignRobot.bind(this), config.ROBOT.VACANCY_QUERY_TIMEOUT);
        }
        robotController.run();

        if (!this._kickOfflineTimer) {
            this._kickOfflineTimer = setInterval(this.kick_offline_player.bind(this), config.PLAYER.KICK_OFFLINE_CHECK_TIMEOUT);
        }

        this._entry.start();
    }

    stop() {
        this._entry.stop();
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

    kick_offline_player() {
        for (let scene of this.scenes.values()) {
            let scene_uids = scene.kickOfflinePlayer();
            for (let uid of scene_uids) {
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

    getScene(sceneId) {
        return this.scenes.get(sceneId);
    }

    remoteRpc(method, data, cb){
        if(!this[method]){
            cb(CONSTS.SYS_CODE.NOT_SUPPORT_SERVICE);
            return;
        }

        this[method](data, function (err, result) {
            utils.invokeCallback(cb, err, result);
        });
    }

    async rpc_enter_game(data, cb) {
        if (data.gameMode === undefined || !data.sceneId || !data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        if (this.uids.has(data.uid)) {
            this.rpc_leave_game(data);
        }

        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            scene = new Scene(data.sceneId);
            let err = scene.start()
            if (err) {
                utils.invokeCallback(cb, err);
                return;
            }
            this.scenes.set(data.sceneId, scene);
        }

        try {
            data.kindId = consts.ENTITY_TYPE.PLAYER; //通过该方法创建的玩家都是真实玩家
            let player = await PlayerFactory.createPlayer(data);
            if (!!player) {
                let [err, roomId] = scene.joinGame(data.gameMode, player);
                if (err) {
                    utils.invokeCallback(cb, err);
                    return
                }
                this.uids.set(data.uid, scene);
                utils.invokeCallback(cb, null, roomId);
            } else {
                utils.invokeCallback(cb, CONSTS.SYS_CODE.PLAYER_CREATE_FAILED);
            }
        } catch (err) {
            utils.invokeCallback(cb, err);
        }
    }
    // uid, sceneId
    rpc_leave_game(data, cb) {
        let scene = this.scenes.get(data.sceneId)
        if (!scene) {
            utils.invokeCallback(cb, null);
            return
        }

        logger.error('---------------------------------------离开游戏');
        let data1 = scene.leaveGame(data.uid);
        this.uids.delete(data.uid);
        utils.invokeCallback(cb, null, data1);
    }

    rpc_player_connect_state(data, cb) {
        if (!data.uid || !data.sid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        logger.error('#########################333:', [...this.uids]);
        let scene = this.scenes.get(data.sceneId);
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS)
            return
        }
        let room = scene.getSceneRoom(data.uid);
        if (!!room && room.setPlayerState(data.uid, data.state, data.sid)) {
            utils.invokeCallback(cb, null, room.roomId);
        } else {
            logger.error('setPlayerState dat222a - ', data, room);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS);
        }
    }

    rpc_match_start(data, cb) {
        if (!data.uid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let scene = this.uids.get(data.uid);
        logger.error('#########################333: rpc_match_start ');
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS)
            return
        }

        let room = scene.getSceneRoom(data.uid);
        if (room) {
            let player = room.getPlayer(data.uid);
            player && player.startRmatch(data);
            utils.invokeCallback(cb, null);
        }
    }

    rpc_match_finish(data, cb) {
        if (!data.uid) {
            utils.invokeCallback(cb, CONSTS.SYS_CODE.ARGS_INVALID);
            return;
        }

        let scene = this.uids.get(data.uid);
        logger.error('#########################333: rpc_match_finish ');
        if (!scene) {
            logger.error('setPlayerState data - ', data);
            utils.invokeCallback(cb, CONSTS.SYS_CODE.PALYER_GAME_ROOM_DISMISS)
            return
        }

        let room = scene.getSceneRoom(data.uid);
        if (room) {
            let player = room.getPlayer(data.uid);
            player && player.clearRmatch();
            utils.invokeCallback(cb, null);
        }
    }


}

module.exports = Instance;