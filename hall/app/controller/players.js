"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class PlayerController extends egg_1.Controller {
    async index() {
        this.ctx.body = `/players index`;
    }
    async new() {
        this.ctx.body = `/players/new new`;
    }
    async show() {
        this.ctx.body = `/players/:id show`;
    }
    async edit() {
        this.ctx.body = `/players/:id/edit edit`;
    }
    async create() {
        this.ctx.body = `/players create`;
    }
    async update() {
        this.ctx.body = `/players/:id update`;
    }
    async destroy() {
        this.ctx.body = `/players/:id destroy`;
    }
}
exports.default = PlayerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBsYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBaUM7QUFFakMsc0JBQXNDLFNBQVEsZ0JBQVU7SUFDL0MsS0FBSyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHO1FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7SUFDckMsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJO1FBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7SUFDdEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJO1FBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsd0JBQXdCLENBQUM7SUFFM0MsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO0lBRXBDLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTTtRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQztJQUV4QyxDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU87UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsc0JBQXNCLENBQUM7SUFFekMsQ0FBQztDQUVGO0FBakNELG1DQWlDQyJ9