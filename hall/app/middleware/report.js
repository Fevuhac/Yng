"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return async function (ctx, next) {
        const startTime = Date.now();
        await next();
        ctx.body;
        console.log(Date.now() - startTime);
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0JBQWUsR0FBRSxFQUFFO0lBQ2YsTUFBTSxDQUFDLEtBQUssV0FBVSxHQUFXLEVBQUMsSUFBSTtRQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0IsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUE7QUFDTCxDQUFDLENBQUEifQ==