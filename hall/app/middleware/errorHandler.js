'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return async function errorHandler(ctx, next) {
        try {
            await next();
        }
        catch (err) {
            // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
            ctx.app.emit('error', err, this);
            if (err.code && err.code >= 1000) {
                ctx.status = 200;
                ctx.body = { code: err.code, desc: ctx.__(err.code.toString()) };
            }
            else {
                const status = err.status || 500;
                // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
                const error = status === 500 && ctx.app.config.env === 'prod'
                    ? 'Internal Server Error'
                    : err.message;
                // 从 error 对象上读出各个属性，设置到响应中
                ctx.body = { error };
                ctx.status = status;
            }
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixrQkFBZSxHQUFHLEVBQUU7SUFDbEIsTUFBTSxDQUFDLEtBQUssdUJBQXVCLEdBQVcsRUFBRSxJQUFRO1FBQ3RELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDZixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNiLHlDQUF5QztZQUN6QyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO2dCQUMvQixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDakIsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLElBQUksRUFBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQ2hFLENBQUM7WUFBQSxJQUFJLENBQUEsQ0FBQztnQkFDRixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztnQkFDakMsd0NBQXdDO2dCQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxNQUFNO29CQUM3RCxDQUFDLENBQUMsdUJBQXVCO29CQUN6QixDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQkFDZCwyQkFBMkI7Z0JBQzNCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFDckIsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDeEIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMifQ==