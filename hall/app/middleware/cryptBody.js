"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = require('crypto-js');
exports.default = () => {
    return async function cryptBody(ctx, next) {
        await next();
        console.log(ctx.body);
        let body = ctx.body;
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
                }
                catch (err) {
                    ctx.logger.error('响应数据格式异常', err);
                    ctx.throw({
                        code: ctx.app.config.ErrorCode.PARAM_ERROR,
                        desc: ctx.__(ctx.app.config.ErrorCode.PARAM_ERROR.toString())
                    });
                }
            }
            else {
                if (body.error && body.error.code) {
                    ctx.body.error.desc = ctx.__(body.error.code.toString());
                }
            }
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRCb2R5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3J5cHRCb2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRXRDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLENBQUMsS0FBSyxvQkFBb0IsR0FBWSxFQUFFLElBQVM7UUFDbkQsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUViLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLENBQUM7b0JBQ0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ1QsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2hDLENBQUM7d0JBQ0QsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNuRSxJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNqRCxDQUFDO2dCQUVMLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDWCxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQ04sSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXO3dCQUMxQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO3FCQUNoRSxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDNUQsQ0FBQztZQUNMLENBQUM7UUFFTCxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFBIn0=