/**
 * 过滤未登陆用户请求
 */

class Filter {
    constructor() {}

    before(msg, session, next) {
        let route = msg.__route__;

        if (route.search(/^connector\.entryHandler\.c_login$/i) == -1 &&
            route.search(/^gate\.gateHandler\.queryEntry$/i) == -1) {
            if (!session.uid) {
                next(CONSTS.SYS_CODE.PLAYER_NOT_LOGIN);
                return;
            }
        }

        next();
    }

}

module.exports = new Filter;