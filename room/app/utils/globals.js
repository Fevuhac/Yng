global.utils = require('./utils');
global.dataformat = require('./dataformat');
global.CONSTS = require('../consts');
global.answer = require('./answer');
global.packMsg = require('./packMsg')
global.dispatcher = require('./dispatcher');
// const dbclient = require('../../../database').dbclient;
global.dbConsts = require('../../../database').dbConsts;
// global.mysqlClient = new dbclient.MysqlConnector();
// global.redisClient = new dbclient.RedisConnector();
// global.dbUtils = require('../../../database').dbUtils;

global.logBuilder = require('../../../logSync').logBuilder;

global.GAMECFG = require('../../../cfgs');
global.sysConfig = require('../../config/sysConfig');

