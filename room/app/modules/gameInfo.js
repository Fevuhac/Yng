const logger = require('pomelo-logger').getLogger(__filename);

module.exports = function (opts) {
    return new Module(opts);
}

module.exports.moduleId = 'gameInfo';

let Module = function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg) {
    if(this.app.getServerType() !== 'game') {
        logger.error('not support type: %j', agent.id);
        return;
    }
    let game = require('../logic/game/game');
    let loadInfo = game.getLoadInfo();
    agent.notify(module.exports.moduleId, {serverId: agent.id,
            playerLoad:loadInfo.playerCount,
            roomLoad:loadInfo.roomCount
        });
};

Module.prototype.masterHandler = function(agent, msg) {
    if(!msg) {
        // pull interval callback
        let list = agent.typeMap['game'];
        if(!list || list.length === 0) {
            return;
        }
        agent.notifyByType('game', module.exports.moduleId);
        return;
    }
    let data = agent.get(module.exports.moduleId);
    if(!data) {
        data = {};
        agent.set(module.exports.moduleId, data);
    }
    data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function(agent, msg, cb) {
    cb && cb(null, agent.get(module.exports.moduleId));
};