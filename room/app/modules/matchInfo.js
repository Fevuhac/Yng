const logger = require('pomelo-logger').getLogger(__filename);

module.exports = function (opts) {
    return new Module(opts);
}

module.exports.moduleId = 'rankMatchInfo';

let Module = function (opts) {
    opts = opts || {};
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function (agent, msg) {
    if (this.app.getServerType() !== 'rankmatch') {
        logger.error('not support type: %j', agent.id);
        return;
    }
    let rankMatch = require('../logic/rankMatch/rankMatch');
    let loadInfo = rankMatch.getLoadInfo();
    agent.notify(module.exports.moduleId, {
        serverId: agent.id,
        load: loadInfo
    });
};

Module.prototype.masterHandler = function (agent, msg) {
    if (!msg) {
        let list = agent.typeMap['rankMatch'];
        if (!list || list.length === 0) {
            return;
        }
        agent.notifyByType('rankMatch', module.exports.moduleId);
        return;
    }
    let data = agent.get(module.exports.moduleId);
    if (!data) {
        data = {};
        agent.set(module.exports.moduleId, data);
    }
    data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function (agent, msg, cb) {
    cb && cb(null, agent.get(module.exports.moduleId));
};