////////////////////////////////////////////////////////////////////////////////
// 后台管理页面的前端路由
////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var router = express.Router();

// 登录页面
router.use('/pages-signin.html', require('./admin/pages_signin'));

// 管理页面
router.use('/index.html', require('./admin/index'));

router.use('/pages-realtime.html', require('./admin/pages_real_time'));
router.use('/pages-online.html', require('./admin/pages_online'));
router.use('/pages-register.html', require('./admin/pages_register'));
router.use('/pages-active.html', require('./admin/pages_active'));
router.use('/pages-payuser.html', require('./admin/pages_payuser'));
router.use('/pages-retention.html', require('./admin/pages_retention'));
router.use('/pages-log.html', require('./admin/pages_log'));

router.use('/pages-gm-data.html', require('./admin/pages_gm_data'));
router.use('/pages-gm-match.html', require('./admin/pages_gm_match'));
router.use('/pages-gm-update.html', require('./admin/pages_gm_update'));
router.use('/pages-gm-broadcast.html', require('./admin/pages_gm_broadcast'));
router.use('/pages-gm-mail.html', require('./admin/pages_gm_mail'));
router.use('/pages-gm-active.html', require('./admin/pages_gm_active'));

router.use('/pages-om-query.html', require('./admin/pages_om_query'));
router.use('/pages-om-change-in-kind.html', require('./admin/pages_om_change_in_kind'));
router.use('/pages-om-compensate.html', require('./admin/pages_om_compensate'));
router.use('/pages-om-control.html', require('./admin/pages_om_control'));

router.use('/pages-tm-tool.html', require('./admin/pages_tm_tool'));

router.use('/pages-am-auth.html', require('./admin/pages_am_auth'));
router.use('/pages-am-role.html', require('./admin/pages_am_role'));
router.use('/pages-am-user.html', require('./admin/pages_am_user'));
router.use('/pages-am-log.html', require('./admin/pages_am_log'));
router.use('/pages-am-server.html', require('./admin/pages_am_server'));
router.use('/pages-am-devtest.html', require('./admin/pages_am_devtest'));
router.use('/pages-am-backdoor.html', require('./admin/pages_am_backdoor'));

module.exports = router;