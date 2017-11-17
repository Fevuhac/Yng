function ChatRemote(app) {
    this.app = app;
}

ChatRemote.prototype.enter = function (uid, cb) {

};

ChatRemote.prototype.leave = function (uid, cb) {

};

module.exports = function (app) {
    return new ChatRemote(app);
}