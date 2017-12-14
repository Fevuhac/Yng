"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return async function uppercase(ctx, next) {
        // ctx.logger.info('before ',ctx.query.name);
        // ctx.query.name = ctx.query.name && ctx.query.name.toUpperCase();
        ctx.logger.info('after uppercase');
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBwZXJjYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBwZXJjYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0JBQWUsR0FBRSxFQUFFO0lBQ2YsTUFBTSxDQUFDLEtBQUssb0JBQW9CLEdBQVcsRUFBRSxJQUFRO1FBQ2pELDZDQUE2QztRQUM3QyxtRUFBbUU7UUFDbkUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNuQyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2YsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFBIn0=