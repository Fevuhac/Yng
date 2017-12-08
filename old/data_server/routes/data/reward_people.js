/**
 * 打赏
 * Created by zhenghang on 2017/9/7.
 */
var data_util = require('../../routes/data/data_util');
var buzz_reward_people = require('../../src/buzz/buzz_reward_people');
var TAG = "【data/reward_people】";
var DEBUG=0;

function reward_people(req, res) {
    const FUNC = TAG + "reward_people() --- ";
    const HINT = "打赏";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_reward_people.give_reward(req, dataObj, function (err,result) {
        if(DEBUG)console.log(FUNC+"--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

exports.reward_people = reward_people;