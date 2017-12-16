const redis = require('redis');
const utils = require('../../../base/utils/utils');

class Connector {
    constructor() {
        this.cmd_client = null;
        this.sub_client = null;
        this.pub_client = null;
        this.events = {};
        this.opts = null;
    }

    start(opts, cb) {
        return new Promise(function (resolve, reject) {
            if (!opts.enable) {
                utils.invokeCallback(cb, null);
                resolve(false);
                return;
            }

            this.opts = opts;
            this.cmd_client = redis.createClient({
                host: opts.server.host,
                port: opts.server.port,
                db: opts.server.database,
                prefix: opts.server.prefix
            });

            if (opts.server.auth) {
                this.cmd_client.auth(opts.server.pwd);
            }

            this.cmd_client.on('connect', function (err) {
                if (err) {
                    console.log('redis 连接异常', err);
                    utils.invokeCallback(cb, err);
                    resolve(false);
                }
                else {
                    console.log('redis 连接成功');
                }
            });

            this.cmd_client.on('ready', function (err) {
                if (err) {
                    console.log('redis 数据库准备未就绪');
                    utils.invokeCallback(cb, err);
                    resolve(false);
                }
                else {
                    console.log('redis 数据库准备就绪');
                    global.redisConnector = this;
                    utils.invokeCallback(cb, null, this);
                    resolve(true);
                }
            }.bind(this));

            this.cmd_client.on('error', function (err) {
                console.log('redis 数据库错误' + err);
            });
        }.bind(this));
    }

    stop() {
        if (!!this.cmd_client) {
            this.cmd_client.end();
            this.cmd_client = null;
        }
        if (!!this.sub_client) {
            this.sub_client.end();
            this.sub_client = null;
        }
        if (!!this.pub_client) {
            this.pub_client.end();
            this.pub_client = null;
        }
    }

    get cmd() {
        return this.cmd_client;
    }

    pub(event, msg) {
        if (!this.pub_client) {
            this._createPub();
        }

        try {
            this.pub_client.publish(event, JSON.stringify(msg));
        } catch (err) {
            if (err) {
                console.log('redis pub err:', err);
            }
        }

    }

    sub(event, cb) {
        if (!this.sub_client) {
            this._createSub();
        }
        this.sub_client.subscribe(event);
        this.events[event] = cb;
    }

    _createSub() {
        this.sub_client = redis.createClient({
            host: this.opts.server.host,
            port: this.opts.server.port,
            db: this.opts.server.database + 1,
            prefix: this.opts.server.prefix
        });

        if (this.opts.server.auth) {
            this.sub_client.auth(this.opts.server.pwd);
        }

        this.sub_client.on('error', function (err) {
            console.log('redis sub client connect err:', err);
        });

        this.sub_client.on('message', function (event, msg) {
            try {
                utils.invokeCallback(this.events[event], JSON.parse(msg));
            } catch (err) {
                if (err) {
                    console.log('redis sub msg err:', err);
                }
            }

        }.bind(this));
    }

    _createPub() {
        this.pub_client = redis.createClient({
            host: this.opts.server.host,
            port: this.opts.server.port,
            db: this.opts.server.database + 1,
            prefix: this.opts.server.prefix
        });

        if (this.opts.server.auth) {
            this.pub_client.auth(this.opts.server.pwd);
        }

        this.pub_client.on('error', function (err) {
            console.log('redis pub client connect err:', err);
        });
    }
}


module.exports = Connector;