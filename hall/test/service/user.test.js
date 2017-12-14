'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mm = require("egg-mock");
describe('test/app/service/user.test.ts', () => {
    const app = mm.app();
    let ctx;
    before(async () => {
        await app.ready();
        ctx = app.mockContext();
    });
    after(() => app.close());
    afterEach(mm.restore);
    it('getTopStories', async () => {
        const list = await ctx.service.user.login();
        assert(list.length === 30);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixpQ0FBaUM7QUFFakMsK0JBQStCO0FBRS9CLFFBQVEsQ0FBQywrQkFBK0IsRUFBQyxHQUFFLEVBQUU7SUFDekMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLElBQUksR0FBVyxDQUFDO0lBRWhCLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNkLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xCLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDekIsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV0QixFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQSJ9