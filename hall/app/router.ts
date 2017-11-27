import { Application } from 'egg';
// import user from './router/user';
import admin from './router/admin';
export default (app:Application)=>{
    // user(app);
    admin(app);
}

// module.exports = app => {
//     const gzip = app.middlewares.uppercase();
//     app.router.get('/user/login', gzip, app.controller.user.login);
//   };