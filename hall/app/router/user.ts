// import { Application } from 'egg';

export default (app)=>{
    const controller = app.controller;
    // app.middlewares;
    // console.log(app.middleware.values())
    app.router.get('/user/login', app.middleware.uppercase,controller.user.login);
}