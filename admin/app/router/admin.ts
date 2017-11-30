import { Application } from 'egg';
export default (app:Application)=>{
    const controller = app.controller;
    app.router.get('/', controller.admin.index);    
    app.router.post('/home',controller.admin.home);
    

    app.router.post('/login',controller.admin.login);
    app.router.post('/admin_api/mgmt/signin',controller.admin.login);

    app.router.get('/logout',controller.admin.logout);
    app.router.get('/modify',controller.admin.modify);
    app.router.post('/realtime',controller.admin.realtime);
    app.router.post('/online',controller.admin.online);
    app.router.post('/register',controller.admin.register);
    app.router.post('/active',controller.admin.active);
    app.router.post('/payuser',controller.admin.payuser);
    app.router.post('/retention',controller.admin.retention);
    app.router.post('/log',controller.admin.log);
    app.router.post('/gain',controller.admin.gain);
    app.router.post('/loss',controller.admin.loss);
    app.router.resources('players', '/players', controller.players);
}