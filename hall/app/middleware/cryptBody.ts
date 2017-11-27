import { Context } from 'egg';
const CryptoJS = require('crypto-js');

export default () => {
    return async function cryptBody(ctx: Context, next: any) {
        await next();

        console.log(ctx.body);
        let body: any = ctx.body;
        if (!!body) {
            if (body.enc) {
                try {
                    let data = body.data;
                    if (!!data) {
                        if (typeof data == 'object') {
                            data = JSON.stringify(data);
                        }
                        let encrypt_data = CryptoJS.AES.encrypt(data, ctx.app.config.keys);
                        body.data = encodeURIComponent(encrypt_data);
                    }

                } catch (err) {
                    ctx.logger.error('响应数据格式异常', err);
                    ctx.throw({
                        code: ctx.app.config.ErrorCode.PARAM_ERROR,
                        desc: ctx.__(ctx.app.config.ErrorCode.PARAM_ERROR.toString())
                    });
                }
            } else {
                if (body.error && body.error.code) {
                    ctx.body.error.desc = ctx.__(body.error.code.toString())
                }
            }

        }
    };
}