var utils = require('../buzz/utils');
var DaoUtil = require('./dao_utils');
var DaoAccount = require('./dao_account');
var DaoAccountServer = require('./dao_account_server');
var DaoAccountRanking = require('./account/ranking');
var DaoGold = require('./dao_gold');
var DaoPearl = require('./dao_pearl');
var DaoShop = require('./dao_shop');
var DaoSkill = require('./dao_skill');
var DaoLevelRole = require('./dao_level_role');
var DaoWeapon = require('./dao_weapon');
var DaoStatistics = require('./dao_statistics');
var DaoStatisticsHour = require('./dao_statistics_hour');
var DaoStatisticsDay = require('./dao_statistics_day');
var DaoAdminRealtime = require('./dao_admin_realtime');
var DaoAdminOnline = require('./admin/online');
var DaoAdminRegister = require('./dao_admin_register');
var DaoAdminActive = require('./dao_admin_active');
var DaoAdminRetention = require('./dao_admin_rettention');
var DaoAdminPayuser = require('./dao_admin_payuser');
var DaoAdminFillData = require('./dao_admin_fill_data');
var DaoAuth = require('./dao_am_auth');
var DaoRole = require('./dao_am_role');
var DaoUser = require('./dao_am_user');
var DaoActivity = require('./dao_activity');
var DaoAi = require('./dao_ai');
var DaoComeback = require('./account/update/comeback');
var DaoCdKey = require('./dao_cdkey');
var DaoMail = require('./dao_mail');
var DaoServer = require('./dao_server');
var DaoDraw = require('./dao_draw');
var DaoImage = require('./dao_image');
var DaoGoddess = require('./dao_goddess');
var DaoAquarium = require('./dao_aquarium');
var DaoRank = require('./account/ranking');
var DaoReward = require('./dao_reward');
var DaoRankgame = require('./dao_rankgame');
var DaoBackdoor = require('./dao_backdoor');
var DaoSocial = require('./dao_social');
var DaoLink = require('./dao_link');
var DaoFeedback = require('./dao_feedback');
var DaoChange = require('./dao_change');
var DaoOperation = require('./dao_operation');

var AccountCommon = require('./account/common');

//==============================================================================
// 调试变量.
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao】";

//==============================================================================
// 
//==============================================================================

function _findAccountByToken(pool, token, cb) {
    var sql = 'SELECT `id`,`tempname`,`created_at`,`updated_at` FROM `tbl_account` WHERE `token`=?';
    pool.query(sql, [token], cb);
}

exports.withDbPool = function (_pool) {
    var pool = {
        query: function (sql, values, cb) {
            // _pool.query(sql, values, cb);
            _pool.getConnection(function(err,conn){
                const FUNC = TAG + "getConnection() --- ";
                if (err) {
                    if (ERROR) console.error(FUNC + "create err:\n", err);
                    cb(err);
                    return;
                }
                if (!conn) {
                    var msg = "Can't create more database connection";
                    if (ERROR) console.error(FUNC + msg);
                    cb({code:1002, msg:msg});
                    return;
                }
                try {
                    conn.query(sql, values, function(err, data){
                        conn.release(); //释放连接
                        cb(err, data);
                    });
                }
                catch(err) {
                    if (ERROR) console.error(FUNC + "query err:\n", err);
                    cb(err);
                }
            });
        }
    };
    return {
        
        findAccountByToken: function (token, cb) {
            _findAccountByToken(pool, token, cb);
        },
        
        getAccountByToken: function (token, cb) {
            AccountCommon.getAccountByToken(pool, token, cb);
        },

        // utils ==========================================
        
        //!!!
        setField: function (data, cb) {
            DaoUtil.setField(pool, data, cb);
        },

        // Account ==========================================

        //!!!
        channelLogin: function (data, cb) {
            DaoAccount.channelLogin(pool, data, cb);
        },
        
        //!!!
        checkAccountPassword: function (data, cb) {
            DaoAccount.checkAccountPassword(pool, data, cb);
        },
        
        //!!!
        createTempAccount: function (cb) {
            DaoAccount.createTempAccount(pool, cb);
        },
        
        //!!!
        createChannelAccount: function (data, cb) {
            DaoAccount.createChannelAccount(pool, data, cb);
        },
        
        //!!!
        checkChannelAccountSignupStatus: function (channel, chunk, cb) {
            DaoAccount.checkChannelAccountSignupStatus(pool, channel, chunk, cb);
        },
        
        //!!!
        loginTempAccount: function (data, cb) {
            DaoAccount.loginTempAccount(pool, data, cb);
        },
        
        //!!!
        loginChannelAccount: function (data, cb) {
            DaoAccount.loginChannelAccount(pool, data, cb);
        },
        
        //!!!
        logout: function (data, cb) {
            DaoAccount.logout(pool, data, cb);
        },
        
        //!!!
        getDayReward: function (data, cb) {
            DaoAccount.getDayReward(pool, data, cb);
        },
        
        //!!!
        resetDayInfoForAll: function (id_list, cb) {
            DaoAccount.resetDayInfoForAll(pool, id_list, cb);
        },

        resetDayInfoForDailyRewardAdv: function (cb) {
            DaoAccount.resetDayInfoForDailyRewardAdv(pool, cb);
        },
        
        //!!!
        resetWeeklyInfoForAll: function (id_list, cb) {
            DaoAccount.resetWeeklyInfoForAll(pool, id_list, cb);
        },

        //!!!
        resetDaillyShare: function (id_list, cb) {
            DaoSocial.resetDaillyShare(pool, id_list, cb);
        },
        
        //!!!
        updateAccount: function (data, account, cb) {
            DaoAccount.updateAccount(pool, data, account, cb);
        },

        //!!!
        genCharts: function (cb) {
            DaoAccountRanking.genCharts(pool, cb);
        },
        
        //!!!
        getCharts: function (data, cb) {
            DaoAccount.getCharts(pool, data, cb);
        },

        getFriendsCharts: function (data, cb) {
            DaoAccount.getFriendsCharts(pool, data, cb);
        },

        token4DailyReset: function (data, cb) {
            DaoAccount.token4DailyReset(pool, data, cb);
        },
        
        // Account for statistics ==========================

        //!!!
        genStatistics: function (cb) {
            DaoStatistics.genStatistics(pool, cb);
        },
        
        //!!!
        getDailyStatistics: function (data, cb) {
            DaoStatistics.getDailyStatistics(pool, data, cb);
        },
        
        // Data for gold ===================================
        
        //!!!
        addGoldLog: function (data, cb) {
            DaoGold.addGoldLog(pool, data, cb);
        },
        
        getBankruptcyCompensation: function (data, cb) {
            DaoAccount.getBankruptcyCompensation(pool, data, cb);
        },
        
        // Data for pearl ===================================
        
        //!!!
        addPearlLog: function (data, cb) {
            DaoPearl.addPearlLog(pool, data, cb);
        },
        
        // Data for shop ===================================
        
        //!!!
        addShopLog: function (data, account, cb) {
            DaoShop.addShopLog(pool, data, account, cb);
        },
        
        //!!!
        getGameOrder: function (data, cb) {
            DaoShop.getGameOrder(pool, data, cb);
        },
        
        //!!!
        checkOrderStatus: function (data, cb) {
            DaoShop.checkOrderStatus(pool, data, cb);
        },
        
        //!!!
        changeOrderStatus: function (data, cb) {
            DaoShop.changeOrderStatus(pool, data, cb);
        },
        
        //!!!
        setOrderFail: function (data, cb) {
            DaoShop.setOrderFail(pool, data, cb);
        },
        
        
        // Data for Reward ===============================
        
        //通用获取奖励的方法
        getCommonReward: function (data, cb) {
            DaoReward.getCommonReward(pool, data, cb);
        },
        //通用消耗的方法
        rewardCost: function (data, cb) {
            DaoReward.costCommon(pool, data, cb);
        },
        
        
        // Data for activity ===============================
        
        //!!!
        getReward: function (data, cb) {
            DaoActivity.getReward(pool, data, cb);
        },
        
        //!!!
        showMeActivity: function (data, cb) {
            DaoActivity.showMeActivity(pool, data, cb);
        },
        
        //!!!
        updateGift: function (cb) {
            DaoActivity.updateGift(pool, cb);
        },
        
        
        // Data for skill ===================================
        
        //!!!
        addSkillLog: function (data, cb) {
            DaoSkill.addSkillLog(pool, data, cb);
        },
        
        // Data for weapon ===================================
        
        //!!!
        addWeaponLog: function (data, cb) {
            DaoWeapon.addWeaponLog(pool, data, cb);
        },
        
        // Data for online ===================================
        
        //!!!
        getOnlineTime: function (data, cb) {
            DaoGold.getOnlineTime(pool, data, cb);
        },
        
        // Statistics ========================================
        //!!!
        sumUpLastHour: function (data, cb) {
            DaoStatisticsHour.sumUpLastHour(pool, data, cb);
        },
        
        sumUpLastDay: function (cb) {
            DaoStatisticsDay.sumUpLastDay(pool, cb);
        },

        getOnlineStatus: function (data, cb) {
            DaoAdminOnline.getOnlineStatus(pool, data, cb);
        },

        getRealtimeData: function (data, cb) {
            DaoAdminRealtime.getRealtimeData(pool, data, cb);
        },

        getRegisterData: function (data, cb) {
            DaoAdminRegister.getRegisterData(pool, data, cb);
        },
        
        getActiveData: function (data, cb) {
            DaoAdminActive.getActiveData(pool, data, cb);
        },
        
        getRetentionData: function (data, cb) {
            DaoAdminRetention.getRetentionData(pool, data, cb);
        },

        getOrderList: function (data, cb) {
            DaoAdminPayuser.getOrderList(pool, data, cb);
        },
        
        getPayUserData: function (data, cb) {
            DaoAdminPayuser.getPayUserData(pool, data, cb);
        },
        
        getUserPayData: function (data, cb) {
            DaoAdminPayuser.getUserPayData(pool, data, cb);
        },
        
        getCardUserList: function (data, cb) {
            DaoAdminPayuser.getCardUserList(pool, data, cb);
        },
        
        getPayLogData: function (data, cb) {
            DaoAdminPayuser.getPayLogData(pool, data, cb);
        },
        
        getQueryPay: function (data, cb) {
            DaoAdminPayuser.getQueryPay(pool, data, cb);
        },

        fillDayData: function (data, cb) {
            DaoAdminFillData.fillDayData(pool, data, cb);
        },
        
        updateAi: function (data, cb) {
            DaoAi.updateAi(pool, data, cb);
        },
        
        makeNewAi: function (cb) {
            DaoAi.makeNewAi(pool, cb);
        },
        
        // App Mgmt ========================================
        
        //----------------------Ȩ��------------------------

        //��ȡȨ���б�
        getAuthList: function(data, cb) {
            DaoAuth.getAuthList(pool, data, cb);
        },
        
        //����Ȩ�޼�¼
        addAuth: function (data, cb) {
            DaoAuth.addAuth(pool, data, cb);
        },

        //����Ȩ�޲�����(����������ɾ������Ȩ�޼�¼)
        deleteAuth: function (data, cb) {
            DaoAuth.deleteAuth(pool, data, cb);
        },
        
        //����Ȩ��
        validAuth: function (data, cb) {
            DaoAuth.validAuth(pool, data, cb);
        },
        
        //�༭Ȩ��
        editAuth: function (data, cb) {
            DaoAuth.editAuth(pool, data, cb);
        },
        
        //----------------------��ɫ------------------------
        
        //��ȡ��ɫ�б�
        getRoleList: function (data, cb) {
            DaoRole.getRoleList(pool, data, cb);
        },
        
        //���ӽ�ɫ��¼
        addRole: function (data, cb) {
            DaoRole.addRole(pool, data, cb);
        },
        
        //���ý�ɫ������
        deleteRole: function (data, cb) {
            DaoRole.deleteRole(pool, data, cb);
        },
        
        //������ɫ
        validRole: function (data, cb) {
            DaoRole.validRole(pool, data, cb);
        },
        
        //�༭��ɫ
        editRole: function (data, cb) {
            DaoRole.editRole(pool, data, cb);
        },
        
        //----------------------�û�------------------------
        
        //��ȡ�û��б�
        getUserList: function (data, cb) {
            DaoUser.getUserList(pool, data, cb);
        },
        
        //�����û���¼
        addUser: function (data, cb) {
            DaoUser.addUser(pool, data, cb);
        },
        
        //�����û�������
        deleteUser: function (data, cb) {
            DaoUser.deleteUser(pool, data, cb);
        },
        
        //�����û�
        validUser: function (data, cb) {
            DaoUser.validUser(pool, data, cb);
        },
        
        //�༭�û�
        editUser: function (data, cb) {
            DaoUser.editUser(pool, data, cb);
        },
        
        //�û���¼
        userSignin: function (data, cb) {
            DaoUser.userSignin(pool, data, cb);
        },
        
        //��ȡ�û�Ȩ��
        getUserAuth: function (data, cb) {
            DaoUser.getUserAuth(pool, data, cb);
        },
        
        //��ȡ�û���Ϣ
        getUserInfo: function (data, cb) {
            DaoUser.getUserInfo(pool, data, cb);
        },
        
        //---------------------CD-Key------------------------
        generateCdKey: function (data, cb) {
            DaoCdKey.generate(pool, data, cb);
        },

        listCdKey: function (data, cb) {
            DaoCdKey.list(pool, data, cb);
        },

        useCdKey: function (data, cb) {
            DaoCdKey.use(pool, data, cb);
        },

        showCdkeyDetail: function (data, cb) {
            DaoCdKey.detail(pool, data, cb);
        },
        
        //---------------------Dao-Mail------------------------
        sendMail:function (data,cb) {
            DaoMail.sendMail(pool,data,cb);
        },

        readMail: function (data, cb) {
            DaoMail.readMail(pool, data, cb);
        },

        clearMail: function (cb) {
            DaoMail.clearMail(pool, cb);
        },

        mailList: function (data, cb) {
            DaoMail.mailList(pool, data, cb);
        },

        //---------------------Dao-Server------------------------
        saveAll: function (cb) {
            DaoServer.saveAll(pool, cb);
        },
        
        //---------------------Dao-Draw------------------------
        getDraw: function (data, cb) {
            DaoDraw.getDraw(pool, data, cb);
        },
        
        //---------------------Dao-Image------------------------
        getUrlFromWeb2Local: function (data, cb) {
            DaoImage.getUrlFromWeb2Local(pool, data, cb);
        },

        createImage: function (data, cb) {
            DaoImage.create(pool, data, cb);
        },
        
        //---------------------Goddess------------------------
        // getDefend: function (data, cb) {
        //     DaoGoddess.getDefend(pool, data, cb);
        // },

        getGoddessTop1: function (platform, cb) {
            DaoRank.getGoddessTop1(pool, platform, cb);
        },
        
        //---------------------Aquarium------------------------
        updateTableAquarium: function (account_id, aquarium, cb) {
            DaoAquarium.updateTableAquarium(pool, account_id, aquarium, cb);
        },

        //---------------------Rankgame------------------------
        getRankgame: function (data, cb) {
            DaoRankgame.getRankgame(pool, data, cb);
        },

        rankgameInfo: function (data, account, cb) {
            DaoRankgame.rankgameInfo(pool, data, account, cb);
        },

        rankgameBox: function (data, account, cb) {
            DaoRankgame.rankgameBox(pool, data, account, cb);
        },

        seasonEnd: function (cb) {
            DaoRankgame.seasonEnd(pool, cb);
        },

        //---------------------后门----------------------------
        modifyUserData: function (data, cb) {
            DaoBackdoor.modifyUserData(pool, data, cb);
        },

        kickUser: function (data, cb) {
            DaoBackdoor.kickUser(pool, data, cb);
        },

        accountForbidden: function (data, cb) {
            DaoBackdoor.accountForbidden(pool, data, cb);
        },

        accountAuth: function (data, cb) {
            DaoBackdoor.accountAuth(pool, data, cb);
        },

        switchMatch: function (data, cb) {
            DaoBackdoor.switchMatch(pool, data, cb);
        },

        switchCik: function (data, cb) {
            DaoBackdoor.switchCik(pool, data, cb);
        },

        //---------------------Social--------------------------
        getInviteProgress: function (data, cb) {
            DaoSocial.getInviteProgress(pool, data, cb);
        },
        
        getShareStatus: function (data, cb) {
            DaoSocial.getShareStatus(pool, data, cb);
        },

        getEnshrineStatus: function (data, cb) {
            DaoSocial.getEnshrineStatus(pool, data, cb);
        },
        
        inviteSuccess: function (data, cb) {
            DaoSocial.inviteSuccess(pool, data, cb);
        },
        
        shareSuccess: function (data, cb) {
            DaoSocial.shareSuccess(pool, data, cb);
        },
        
        getSocialReward: function (data, cb) {
            DaoSocial.getSocialReward(pool, data, cb);
        },

        getInviteDailyReward: function (data, cb) {
            DaoSocial.getInviteDailyReward(pool, data, cb);
        },
        
        enshrineSuccess: function (data, cb) {
            DaoSocial.enshrineSuccess(pool, data, cb);
        },

        //---------------------Cache 2 DB--------------------------
        writeSkillLog: function (cb) {
            DaoSkill.write(pool, cb);
        },

        writeLinkLog: function (cb) {
            DaoLink.write(pool, cb);
        },
        
        sumPlayer: function (cb) {
            DaoLink.sumPlayer(pool, cb);
        },
        
        writeGoldLog: function (cb) {
            DaoGold.timing(pool, cb);
        },
        
        writePearlLog: function (cb) {
            DaoPearl.timing(pool, cb);
        },
        
        writeWeaponLog: function (cb) {
            DaoWeapon.timing(pool, cb);
        },

        writeUserException: function (cb) {
            DaoGold.writeUserException(pool, cb);
        },

        writeLogMailReward: function (cb) {
            DaoMail.writeLogMailReward(pool, cb);
        },
        
        // flushAccountServer: function (cb) {
        //     DaoAccountServer.flushAccountServer(pool, cb);
        // },

        addChangeLog: function (data, cb) {
            DaoChange.insert(pool, data, cb);
        },

        updateOperation: function (data, cb) {
            DaoOperation.update(pool, data, cb);
        },

        //---------------------Feedback--------------------------
        insertMsg: function (uid, text, cb) {
            DaoFeedback.insertMsg(pool, uid, text, cb);
        },

        loadUserInfo: function (uid, cb) {
            DaoFeedback.loadUserInfo(pool, uid, cb);
        },

        delMsgboard: function (mid, cb) {
            DaoFeedback.del(pool, mid, cb);
        },

        cancelCik: function (orderid, cb) {
            DaoChange.cancelCik(pool, orderid, cb);
        },

        updateShipTime: function (params, cb) {
            DaoChange.updateShipTime(pool, params, cb);
        },

        updateStutus: function (params, cb) {
            DaoChange.updateStutus(pool, params, cb);
        },

        updateWay: function (params, cb) {
            DaoChange.updateWay(pool, params, cb);
        },


    }
};