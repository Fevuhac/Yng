module.exports = {
    gitTag: 'v1.0.0',
    input: {
        js: ['./src/**/*.js'],
        plugins:['./*.sql'],
        zip:'./dist/**/*.*'
    },
    output: {
        dist: 'dist',
        origin:'origin',
        sourcemap: 'map',
        plugins:'./dist/sql',
        zip:'.'
    },
    scp:{
        host:'119.28.176.122',
        username:'root',
        password:'Chufeng123456',
        remotePath:'/home/fishjoy'
    }
}