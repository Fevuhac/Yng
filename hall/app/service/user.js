"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class User extends egg_1.Service {
    constructor(ctx) {
        super(ctx);
    }
    getConfig() {
        // return this.app.config.facebook;
    }
    async login(openid, api, opts) {
        const dataList = {
            list: [
                { id: 1, title: openid, url: api, opt: opts },
                { id: 1, title: openid, url: api, opt: opts },
            ]
        };
        return dataList;
        //    const options = Object.assign({
        //        dataType:'json',
        //        timeout:['30s','30s']
        //    }, opts);
        //    const result = await this.ctx.curl(`${this.getConfig().serverUrl}/${api}`,options);
        //    try{
        //     const result1 = await this.request('top.json', {
        //         data:{
        //             orederyBy:'"$key"',
        //             startAt:`"${pageSize * (page - 1)}"`,,
        //             endAt:`"${pageSize * page - 1}"`
        //         }
        //     });
        //     return Object.keys(result).map((key) => result[key]);
        //    }catch(e){
        //     this.ctx.logger.error(e);
        //     return [];
        //    }
        //    return result.data;
    }
}
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUM7QUFFdkMsVUFBVyxTQUFRLGFBQU87SUFDdEIsWUFBWSxHQUFZO1FBQ3BCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFTO1FBQ0wsbUNBQW1DO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBYTtRQUV6RCxNQUFNLFFBQVEsR0FBRztZQUNiLElBQUksRUFBRTtnQkFDRixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7Z0JBQzdDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTthQUNoRDtTQUNKLENBQUM7UUFFRixNQUFNLENBQUMsUUFBUSxDQUFDO1FBRWhCLHFDQUFxQztRQUNyQywwQkFBMEI7UUFDMUIsK0JBQStCO1FBQy9CLGVBQWU7UUFFZix5RkFBeUY7UUFDekYsVUFBVTtRQUNWLHVEQUF1RDtRQUN2RCxpQkFBaUI7UUFDakIsa0NBQWtDO1FBQ2xDLHFEQUFxRDtRQUNyRCwrQ0FBK0M7UUFDL0MsWUFBWTtRQUNaLFVBQVU7UUFDViw0REFBNEQ7UUFDNUQsZ0JBQWdCO1FBQ2hCLGdDQUFnQztRQUNoQyxpQkFBaUI7UUFDakIsT0FBTztRQUVQLHlCQUF5QjtJQUM3QixDQUFDO0NBQ0o7QUFFRCxrQkFBZSxJQUFJLENBQUMifQ==