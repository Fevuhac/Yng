
function AuthRemote(app) {
    this.app = app;
}

AuthRemote.prototype.authenticate = function (token, cb) {
    this.app.auth.authenticate(token, cb);
};

module.exports = function (app) {
    return new AuthRemote(app);
};