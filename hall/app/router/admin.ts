import { Application } from 'egg';
export default (app:Application)=>{
    const controller = app.controller;
    app.router.post('/admin/login',controller.admin.login);
    app.router.get('/admin/logout',controller.admin.logout);
    app.router.get('/admin/modify',controller.admin.modify);
    app.router.resources('players', '/admin/players', controller.players);
}