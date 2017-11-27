exports.static = true;
exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
}
exports.mysql = {
    enable: false,
    package: 'egg-mysql',
}

exports.sequelize = {
    enable: false,
    package: 'egg-sequelize'
}