import { Application } from 'egg';
import user from './router/user';
import news from './router/news';
export default (app:Application)=>{
    user(app);
    news(app);
}

// module.exports = app => {
//     const gzip = app.middlewares.uppercase();
//     app.router.get('/user/login', gzip, app.controller.user.login);
//   };