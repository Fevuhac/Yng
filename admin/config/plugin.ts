exports.static = true;
// exports.nunjucks = {
//     enable: true,
//     package: 'egg-view-nunjucks',
// }

exports.ejs = {
    enable: true,
    package: 'egg-view-ejs',
}

exports.mysql = {
    enable: true,
    package: 'egg-mysql',
}

exports.redis = {
    enable: true,
    package: 'egg-redis',
}

exports.sequelize = {
    enable: false,
    package: 'egg-sequelize'
}