import { Context} from 'egg';

export default ()=>{
    return async function uppercase(ctx:Context, next:any) {
        ctx.logger.info('before ',ctx.query.name);
        ctx.query.name = ctx.query.name && ctx.query.name.toUpperCase();
        ctx.logger.info('after ',ctx.query.name);
        await next();
      };
}