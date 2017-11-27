exports.static = true;
exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
}
exports.mysql = {
    enable: true,
    package: 'egg-mysql',
}

exports.sequelize = {
    enable: false,
    package: 'egg-sequelize'
}