/**
 * 过滤未登陆用户请求
 */

class DecryptFilter {
    constructor() {}

    before(msg, session, next) {
        let route = msg.__route__;

        if (route.search(/^connector\.entryHandler\.c_login$/i) == -1) {
            if (!session.uid) {
                next(CONSTS.SYS_CODE.PALYER_NOT_IN_SCENE);
                return;
            }
        }

        next();
    }

}

module.exports = new DecryptFilter;