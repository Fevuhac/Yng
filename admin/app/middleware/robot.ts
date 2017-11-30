// import { Context, Application } from 'egg';

// export default (options:object, app:Application)=>{
//     return async function robotMiddleware(ctx:Context, next:any) {
//         const source = ctx.get('user-agent') || '';
//         const match = options.ua.some(ua => ua.test(source));
//         if (match) {
//           ctx.status = 403;
//           ctx.message = 'Go away, robot.';
//         } else {
//           await next();
//         } 
//     }
// }