/**
 * ͳ���յ����ʻ�����
 * Created by zhenghang on 2017/9/21.
 */
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

var DEBUG = 0;
var TAG = "��buzz_receive_people��";

exports.flower_receive = flower_receive;

/**
 * @param uid
 * @param item [['i001',100]]
 */
function flower_receive(uid, item, cb) {
    const FUNC = TAG + "flower_receive() --- ";
    if (DEBUG)console.log(FUNC + "CALL---");
    var itemid = item[0][0];
    if (itemid != 'i410')return;
    var itemcount = item[0][1];
    RedisUtil.hincrby(PAIR.UID_FLOWER_RECEIVE, uid, itemcount);
    RedisUtil.hincrby(PAIR.UID_FLOWER_RECEIVE_WEEKLY, uid, itemcount,function(err,week_data) {
        cb && cb(week_data);
    });

}