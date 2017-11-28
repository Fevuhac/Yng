import { Application } from 'egg';
export default (app:Application)=>{
    const controller = app.controller;
    app.router.get('/login', controller.admin.index);
    app.router.post('/login',controller.admin.login);
    app.router.get('/logout',controller.admin.logout);
    app.router.get('/modify',controller.admin.modify);
    app.router.resources('players', '/players', controller.players);
}