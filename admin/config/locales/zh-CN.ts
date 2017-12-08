module.exports = {
  //错误码定义
  1000: '成功',
  1001: '参数错误',
  1002: '回应数据错误',
  1003: '用户名或者密码错误',
  1004: '数据库错误',

  TXT_COMMON: JSON.stringify(require('./cst/common').TXT_CONTENT_CN),

  TXT_SIDEBAR: JSON.stringify(require('./cst/admin').TXT_CONTENT_CN),
  TXT_ADMIN_REALTIME: JSON.stringify(require('./cst/admin_realtime').TXT_CONTENT_CN),
  TXT_ADMIN_ACTIVE: JSON.stringify(require('./cst/admin_active').TXT_CONTENT_CN),
  TXT_ADMIN_ONLINE: JSON.stringify(require('./cst/admin_online').TXT_CONTENT_CN),
  TXT_ADMIN_REGISTER: JSON.stringify(require('./cst/admin_register').TXT_CONTENT_CN),
  TXT_ADMIN_RETENTION: JSON.stringify(require('./cst/admin_retention').TXT_CONTENT_CN),
  TXT_SM_LOG: JSON.stringify(require('./cst/sm_log').TXT_CONTENT_CN),
  TXT_SM_PAYUSER: JSON.stringify(require('./cst/sm_payuser').TXT_CONTENT_CN),

  TXT_GM_ACTIVE: JSON.stringify(require('./cst/gm_active').TXT_CONTENT_CN),
  TXT_GM_BROADCAST: JSON.stringify(require('./cst/gm_broadcast').TXT_CONTENT_CN),
  TXT_GM_DATA: JSON.stringify(require('./cst/gm_data').TXT_CONTENT_CN),
  TXT_GM_MAIL: JSON.stringify(require('./cst/gm_mail').TXT_CONTENT_CN),
  TXT_GM_MATCH: JSON.stringify(require('./cst/gm_match').TXT_CONTENT_CN),
  TXT_GM_UPDATE: JSON.stringify(require('./cst/gm_update').TXT_CONTENT_CN),

  TXT_AM_AUTH: JSON.stringify(require('./cst/am_auth').TXT_CONTENT_CN),
  TXT_AM_ROLE: JSON.stringify(require('./cst/am_role').TXT_CONTENT_CN),
  TXT_AM_USER: JSON.stringify(require('./cst/am_user').TXT_CONTENT_CN),
  TXT_AM_SERVER: JSON.stringify(require('./cst/am_server').TXT_CONTENT_CN),
  TXT_AM_LOG: JSON.stringify(require('./cst/am_log').TXT_CONTENT_CN),
  TXT_AM_BACKDOOR: JSON.stringify(require('./cst/am_backdoor').TXT_CONTENT_CN),

  TXT_OM_CIK: JSON.stringify(require('./cst/om_cik').TXT_CONTENT_CN),
  TXT_OM_QUERY: JSON.stringify(require('./cst/om_query').TXT_CONTENT_CN),
  TXT_OM_CONTROL: JSON.stringify(require('./cst/om_control').TXT_CONTENT_CN),
  TXT_OM_WARNING: JSON.stringify(require('./cst/om_warning').TXT_CONTENT_CN),

  email1: '邮箱'
};