const figure_url = require('./res/figure_url');
const nickname_boys = require('./res/nickname_boys');
const nickname_girls = require('./res/nickname_girls');

const configs = [{
    nickname: nickname_boys,
    head_url: figure_url.boys
}, {
    nickname: nickname_girls,
    head_url: figure_url.girls
}];

function random_int(begin, end) {
    var num = begin + Math.random() * (end - begin + 1);
    num = Math.floor(num);
    if (num > end) {
        num = end;
    }
    return num;
}

module.exports = () => {
    let sex = random_int(0, configs.length - 1);
    let data = configs[sex];
    let nickname = data.nickname[random_int(0, data.nickname.length - 1)];
    let head_url = data.head_url[random_int(0, data.head_url.length - 1)];
    return {
        sex: sex,
        nickname: nickname,
        head_url: head_url
    }
}