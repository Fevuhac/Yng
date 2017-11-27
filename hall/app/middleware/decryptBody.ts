import { Context } from 'egg';
const CryptoJS = require('crypto-js');

export default () => {
    return async function decryptBody(ctx: Context, next: any) {
        let body:any = ctx.request.body;
        console.log(ctx.app.config.keys);
        if (!!body && body.enc) {
            let bytes = CryptoJS.AES.decrypt(decodeURIComponent(body.data), ctx.app.config.keys);
            let data = bytes.toString(CryptoJS.enc.Utf8);
            try {
                ctx.request.body = JSON.parse(data);
            } catch (err) {
                ctx.logger.error('请求数据格式异常', err);
                ctx.throw({
                    code:ctx.app.config.ErrorCode.PARAM_ERROR,
                });
            }
        }
        await next();
    };
}