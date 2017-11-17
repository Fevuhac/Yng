class Cron{
    constructor(app){
        this.app = app;
    }

    update(){
        // console.log('Cron test call');
    }
}

module.exports = function (app) {
    return new Cron(app);
}