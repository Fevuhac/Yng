'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// import * as assert from 'assert';
// import * as cheerio from 'cheerio';
const mm = require("egg-mock");
describe('test/app/controller/user.test.ts', () => {
    const app = mm.app();
    before(async () => {
        await app.ready();
    });
    after(() => app.close());
    afterEach(mm.restore);
    it('should GET /user/login', async () => {
        // const result = await app.httpRequest().get('/user/login').expect(200);
        // const $ = cheerio.load(result.text);
        // const listItem = $('.news-view .item');
        // assert(listItem.length === app.config.login_platform.facebook);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixvQ0FBb0M7QUFDcEMsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUUvQixRQUFRLENBQUMsa0NBQWtDLEVBQUMsR0FBRSxFQUFFO0lBQzVDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNyQixNQUFNLENBQUMsS0FBSyxJQUFFLEVBQUU7UUFDWixNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQTtJQUNGLEtBQUssQ0FBQyxHQUFFLEVBQUUsQ0FBQSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN2QixTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXRCLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLElBQUUsRUFBRTtRQUNsQyx5RUFBeUU7UUFDekUsdUNBQXVDO1FBQ3ZDLDBDQUEwQztRQUMxQyxrRUFBa0U7SUFDdEUsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQSJ9