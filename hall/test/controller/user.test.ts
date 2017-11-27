'use strict';

import * as assert from 'assert';
import * as cheerio from 'cheerio';
import * as mm from 'egg-mock';

describe('test/app/controller/user.test.ts',()=>{
    const app = mm.app();
    before(async()=>{
        await app.ready();
    })
    after(()=>app.close());
    afterEach(mm.restore);

    it('should GET /user/login', async()=>{
        const result = await app.httpRequest().get('/user/login').expect(200);
        const $ = cheerio.load(result.text);
        const listItem = $('.news-view .item');
        assert(listItem.length === app.config.login_platform.facebook);
    });
})