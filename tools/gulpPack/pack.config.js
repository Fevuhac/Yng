module.exports = {
    gitTag: 'v1.0.0',
    input: {
        js: ['../../**/*.js', '!../../database/tests/**/*', '!../../room/tests/**/*', '!../../admin/**/*', '!../../doc/**/*', '!../../hall/**/*', '!../../loginAuth/**/*',
            '!../../node_modules/**/*', '!../../rankSync/**/*', '!../../tools/**/*', '!../../web/**/*',
            '../../../fishjoy_server/chat_server*/**/*.js',
            '../../../fishjoy_server/data_server*/**/*.js',
            '../../../fishjoy_server/resource_server*/**/*.js',
            '../../../fishjoy_server/server_balance*/**/*.js'],
        plugins: [
            // '../../cfgs*/**/*.json', '../../cfgs*/**/*.cfg',
            '../../database*/**/*.json','../../database*/**/*.sql',
            '../../playerSync*/**/*.json',
            '../../room*/**/*.json',
            '../../../fishjoy_server/data_server*/views*/**/*.js',
            '../../../fishjoy_server/data_server*/public*/**/*',
            // '../../../fishjoy_server/resource_server*/public*/**/*',
            '../../*.json',
            // '../../admin*/**/*'
        ],
        zip: './dist/**/*.*',
        cfgs:'../../../../doc/fishjoy_design/data_table_js-越南版/服务器导出/**/*',
    },
    output: {
        dist: './dist',
        origin: 'origin',
        sourcemap: 'map',
        plugins: './dist',
        zip: './',
        cfgs:['./dist/cfgs/','./dist/chat_server/cfgs/','./dist/data_server/cfgs/','./dist/resource_server/public/cfgs']
    },
    scp: {
        host: '119.28.176.122',
        username: 'root',
        password: 'Chufeng123456',
        remotePath: '/home/publish/'
    }
}