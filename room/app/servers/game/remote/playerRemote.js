function PlayerRemote(app) {
    this.app = app;
}

PlayerRemote.prototype.enter = function (data, cb) {
    logger.info('game enter................', data);
    this.app.game.onPlayerJoin(data, cb);
};

PlayerRemote.prototype.leave = function (uid, cb) {
    logger.info('game leave................', uid);
    logger.info('game leave................', cb);
    this.app.game.onPlayerLeave(uid, cb);
};

PlayerRemote.prototype.syncUserData = function (data, cb) {

};

module.exports = function (app) {
    return new PlayerRemote(app);
}