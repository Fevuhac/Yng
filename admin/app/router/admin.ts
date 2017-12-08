import { Application } from 'egg';
export default (app: Application) => {
    const controller = app.controller;
    app.router.get('/', controller.admin.index);
    app.router.post('/index.html', controller.admin.home);
    app.router.get('/index.html', controller.admin.home);

    app.router.post('/login', controller.admin.login);
    app.router.post('/admin_api/mgmt/signin', controller.admin.login);

    app.router.post('/pages-realtime.html', controller.admin.pageRealtime);
    app.router.post('/pages-active.html', controller.admin.pageActive);
    app.router.post('/pages-online.html', controller.admin.pageOnline);
    app.router.post('/pages-register.html', controller.admin.pageRegister);
    app.router.post('/pages-retention.html', controller.admin.pageRetention);
    app.router.post('/pages-log.html', controller.admin.pageLog);
    app.router.post('/pages-payuser.html', controller.admin.pagePayuser);

    app.router.post('/pages-gm-update.html', controller.admin.pageGmUpdate);
    app.router.post('/pages-gm-data.html', controller.admin.pageGmData);
    app.router.post('/pages-gm-broadcast.html', controller.admin.pageGmBroadcast);
    app.router.post('/pages-gm-mail.html', controller.admin.pageGmMail);
    app.router.post('/pages-gm-active.html', controller.admin.pageGmActive);
    app.router.post('/pages-gm-match.html', controller.admin.pageGmMatch);

    app.router.post('/pages-om-query.html', controller.admin.pageOmQuery);
    app.router.post('/pages-om-cik.html', controller.admin.pageOmCik);
    app.router.post('/pages-om-control.html', controller.admin.pageOmControl);
    app.router.post('/pages-om-warning.html', controller.admin.pageOmWarning);

    app.router.post('/pages-am-auth.html', controller.admin.pageAmAuth);
    app.router.post('/pages-am-role.html', controller.admin.pageAmRole);
    app.router.post('/pages-am-user.html', controller.admin.pageAmUser);
    app.router.post('/pages-am-server.html', controller.admin.pageAmServer);
    app.router.post('/pages-am-log.html', controller.admin.pageAmLog);
    app.router.post('/pages-am-backdoor.html', controller.admin.pageAmBackdoor);

    app.router.get('/pages-realtime.html', controller.admin.pageRealtime);
    app.router.get('/pages-active.html', controller.admin.pageActive);
    app.router.get('/pages-online.html', controller.admin.pageOnline);
    app.router.get('/pages-register.html', controller.admin.pageRegister);
    app.router.get('/pages-retention.html', controller.admin.pageRetention);
    app.router.get('/pages-log.html', controller.admin.pageLog);
    app.router.get('/pages-payuser.html', controller.admin.pagePayuser);

    app.router.get('/pages-gm-update.html', controller.admin.pageGmUpdate);
    app.router.get('/pages-gm-data.html', controller.admin.pageGmData);
    app.router.get('/pages-gm-broadcast.html', controller.admin.pageGmBroadcast);
    app.router.get('/pages-gm-mail.html', controller.admin.pageGmMail);
    app.router.get('/pages-gm-active.html', controller.admin.pageGmActive);
    app.router.get('/pages-gm-match.html', controller.admin.pageGmMatch);

    app.router.get('/pages-om-query.html', controller.admin.pageOmQuery);
    app.router.get('/pages-om-cik.html', controller.admin.pageOmCik);
    app.router.get('/pages-om-control.html', controller.admin.pageOmControl);
    app.router.get('/pages-om-warning.html', controller.admin.pageOmWarning);

    app.router.get('/pages-am-auth.html', controller.admin.pageAmAuth);
    app.router.get('/pages-am-role.html', controller.admin.pageAmRole);
    app.router.get('/pages-am-user.html', controller.admin.pageAmUser);
    app.router.get('/pages-am-server.html', controller.admin.pageAmServer);
    app.router.get('/pages-am-log.html', controller.admin.pageAmLog);
    app.router.get('/pages-am-backdoor.html', controller.admin.pageAmBackdoor);

    app.router.get('/logout', controller.admin.logout);
    app.router.get('/modify', controller.admin.modify);
    app.router.post('/gain', controller.admin.gain);
    app.router.post('/loss', controller.admin.loss);

    app.router.post('/admin_api/get_realtime_data', controller.admin.realtime);
    app.router.post('/admin_api/get_online_status', controller.admin.online);
    app.router.post('/admin_api/get_register_data', controller.admin.register);
    app.router.post('/admin_api/get_active_data', controller.admin.active);
    app.router.post('/admin_api/get_payuser_data', controller.admin.payuser);
    app.router.post('/admin_api/get_retention_data', controller.admin.retention);
    app.router.post('/admin_api/get_paylog_data', controller.admin.log);
    app.router.post('/data_api/set_broadcast', controller.admin.broadcast);//公告
    app.router.post('/admin_api/send_mail', controller.admin.mail);//邮件
    app.router.post('/admin_api/get_ca', controller.admin.getAccount);
    app.router.post('/admin_api/generate_retention', controller.admin.generateRetention);
    app.router.post('/admin_api/shutdown_by_update', controller.admin.restart);

    //游戏管理
    app.router.post('/admin_api/get_data_water', controller.admin.getDataWater);

    //权限管理
    app.router.post('/admin_api/mgmt/get_auth', controller.admin.getAuth);//
    app.router.post('/admin_api/mgmt/add_auth', controller.admin.addAuth);//添加权限页面
    app.router.post('/admin_api/mgmt/delete_auth', controller.admin.deleteAuth);//删除权限页面
    app.router.post('/admin_api/mgmt/valid_auth', controller.admin.validAuth);//激活权限页面
    app.router.post('/admin_api/mgmt/edit_auth', controller.admin.editAuth);//编辑权限页面

    //角色管理
    app.router.post('/admin_api/mgmt/get_role', controller.admin.getRole);//
    app.router.post('/admin_api/mgmt/add_role', controller.admin.addRole);//添加角色页面
    app.router.post('/admin_api/mgmt/delete_role', controller.admin.deleteRole);//禁止角色页面
    app.router.post('/admin_api/mgmt/valid_role', controller.admin.validRole);//激活角色页面
    app.router.post('/admin_api/mgmt/edit_role', controller.admin.editRole);//编辑角色页面

    //用户管理
    app.router.post('/admin_api/mgmt/get_user', controller.admin.getUser);//
    app.router.post('/admin_api/mgmt/add_user', controller.admin.addUser);//添加用户页面
    app.router.post('/admin_api/mgmt/delete_user', controller.admin.deleteUser);//禁止用户页面
    app.router.post('/admin_api/mgmt/valid_user', controller.admin.validUser);//激活用户页面
    app.router.post('/admin_api/mgmt/edit_user', controller.admin.editUser);//编辑用户页面

    // 预警参数相关
    app.router.post('/getCoefficiency', controller.admin.getCoefficiency);
    app.router.post('/setCoefficiency', controller.admin.setCoefficiency);
    app.router.post('/delCoefficiency', controller.admin.delCoefficiency);

    // 提现相关实现
    app.router.post('/admin_api/get_change_order',controller.admin.queryChangeOrder);
    app.router.post('/admin_api/get_operation_cfgs',controller.admin.getOperationCfgs);
    app.router.post('/admin_api/modify_cfgs',controller.admin.modifyCfgs);

    //日志查询
    app.router.post('/admin_api/query_log',controller.admin.queryLog);
    app.router.post('/admin_api/get_daily_statistics',controller.admin.getDailyStatistics);

    // 奖池相关实现
    app.router.post('/admin_api/query_jackpot',controller.admin.queryJackpot);
    app.router.post('/admin_api/query_player',controller.admin.queryPlayer);
    app.router.post('/admin_api/query_profit',controller.admin.queryProfit);
    app.router.post('/admin_api/change_rate',controller.admin.changeRate);

    app.router.resources('players', '/players', controller.players);
}