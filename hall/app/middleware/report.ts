import {Context} from 'egg';
export default ()=>{
    return async function(ctx:Context,next) {
        const startTime = Date.now();
        await next();
        ctx.body;
        console.log(Date.now() - startTime);
    }
}