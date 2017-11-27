import { Context, Service } from 'egg';

class User extends Service {
    constructor(ctx: Context) {
        super(ctx);
    }

    getConfig() {
        // return this.app.config.facebook;
    }

    public async login(openid: string, api: string, opts?: object) {

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

export default User;