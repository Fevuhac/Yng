////////////////////////////////////////////////////////////////////////////////
// API及对应的记录ID

/**
 * 以10000开头.
 */
const ADMIN_API = {
    
};

/**
 * 以20000开头.
 */
const ACCOUNT_API = {
    channel_login : { flag:20001, desc:"渠道中用户点击按钮刚进入游戏登陆页面时发送此消息", record:1 },
    get_temp_account : { flag:20011, desc:"创建临时账户", record:1 },
    login_temp_account : { flag:20021, desc:"使用临时账户登录", record:1 },
    signup_channel_account : { flag:20051, desc:"注册渠道账户", record:1 },
    login_channel_account : { flag:20061, desc:"登录渠道账户", record:1 },
    logout_account : { flag:20081, desc:"退出当前账户", record:1 },
    token_4_daily_reset : { flag:20101, desc:"处理每日重置后的token重新拉取和玩家最新数据的返回", record:1 },
    // 20111~20200
    // TODO: 有时间再做
    call_sdk_api : { flag:20111, desc:"处理第三方SDK数据", record:1 },
    call_sdk_api_user_getinfo : { flag:20112, desc:"获取玩家信息", record:1 },
    call_sdk_api_user_islogin : { flag:20113, desc:"获取玩家是否已经登录的状态", record:1 },
    call_sdk_api_relation_getappfriends : { flag:20114, desc:"获取游戏中玩家的好友列表", record:1 },
    call_sdk_api_user_getmultiinfo : { flag:20115, desc:"查询好友信息", record:1 },
    call_sdk_api_user_sendgamebarmsg : { flag:20116, desc:"排行变化通知好友", record:1 },
};

/**
 * 以30000开头.
 */
const DATA_API = {
    get_invite_progress : { flag:30001, desc:"", record:1 },
    get_share_status : { flag:30002, desc:"", record:1 },
    get_enshrine_status : { flag:30003, desc:"", record:1 },
    invite_success : { flag:30004, desc:"", record:1 },
    share_success : { flag:30005, desc:"", record:1 },
    enshrine_success : { flag:30007, desc:"", record:1 },
    get_social_reward : { flag:30006, desc:"", record:1 },
    check_network : { flag:30008, desc:"", record:0 },
    get_adv_gift : { flag:30009, desc:"", record:1 },
    get_god_data : { flag:30010, desc:"", record:1 },
    get_god_week_top1 : { flag:30011, desc:"", record:0 },
    load_web_img : { flag:30012, desc:"", record:1 },
    rankgame_result : { flag:30013, desc:"获取排位赛结果", record:1 },
    rankgame_info : { flag:30047, desc:"获取排位赛信息", record:1 },
    rankgame_box : { flag:30048, desc:"排位赛宝箱操作相关", record:1 },
    get_season_reward : { flag:30049, desc:"获取赛季奖励", record:1 },
    challenge_god : { flag:30050, desc:"挑战女神", record:1 },
    goddess_reward_times: { flag:30051, desc:"女神结算时返回奖励倍数", record:1 },
    rankgame_ising: { flag:30052, desc:"获取是否有正在进行中的比赛", record:1 },
    player_propose: { flag:30053, desc:"玩家留言", record:1 },
    query_msgboard: { flag:30054, desc:"留言查询", record:1 },
    like_msgboard: { flag:30055, desc:"玩家点赞", record:1 },
    del_msgboard: { flag:30056, desc:"刪除留言", record:1 },

    add_gold_log : { flag:30028, desc:"", record:1 },
    add_pearl_log : { flag:30029, desc:"", record:1 },
    
    // 31000全部为update_account(可细分到每一种更新类型)
    update_account : { flag:31000, desc:"", record:1 },
    update_account_mission_daily_reset : { flag:31003, desc:"", record:1 },
    update_account_mission_only_once : { flag:31004, desc:"", record:1 },
    update_account_heart_beat : { flag:31007, desc:"", record:1 },
    update_account_achieve_point : { flag:31008, desc:"", record:1 },
    update_account_gold_shopping : { flag:31009, desc:"", record:1 },
    update_account_weapon_skin : { flag:31010, desc:"", record:1 },
    update_account_bonus : { flag:31011, desc:"", record:1 },
    update_account_vip_gift : { flag:31014, desc:"", record:1 },
    update_account_weapon_energy : { flag:31015, desc:"", record:1 },
    update_account_pirate : { flag:31016, desc:"", record:1 },
    update_account_get_card : { flag:31017, desc:"", record:1 },
    update_account_first_buy_gift : { flag:31018, desc:"", record:1 },
    update_account_package : { flag:31019, desc:"", record:1 },
    update_account_all : { flag:31020, desc:"", record:1 },
    update_account_guide : { flag:31021, desc:"", record:1 },
    update_account_active : { flag:31022, desc:"", record:1 },
    update_account_poipct_time : { flag:31023, desc:"", record:1 },
    update_account_defend_goddess : { flag:31024, desc:"", record:1 },

    upgrade_petfish : { flag:30014, desc:"", record:1 },
    put_petfish : { flag:30015, desc:"", record:1 },
    reward_petfish : { flag:30016, desc:"", record:1 },
    put_goddess : { flag:30017, desc:"", record:1 },
    get_aquarium : { flag:30018, desc:"", record:1 },
    mail_list : { flag:30019, desc:"", record:1 },
    read_mail : { flag:30020, desc:"", record:1 },
    get_draw : { flag:30021, desc:"", record:1 },

    get_activity_reward : { flag:30022, desc:"", record:1 },
    show_me_activity : { flag:30023, desc:"", record:1 },
    use_cdkey : { flag:30024, desc:"", record:1 },
    set_broadcast : { flag:30026, desc:"", record:1 },
    get_broadcast : { flag:30027, desc:"", record:1 },
    add_shop_log : { flag:30030, desc:"", record:1 },
    add_skill_log : { flag:30031, desc:"", record:1 },
    add_weapon_log : { flag:30032, desc:"", record:1 },
    get_cfg_list : { flag:30033, desc:"", record:0 },
    get_cfg_file : { flag:30034, desc:"", record:0 },
    get_day_reward : { flag:30035, desc:"", record:1 },
    get_bankruptcy_compensation : { flag:30036, desc:"", record:1 },
    get_online_time : { flag:30037, desc:"", record:1 },
    buy : { flag:30038, desc:"", record:1 },
    get_game_order : { flag:30039, desc:"获取游戏订单号(测试用直接购买成功)", record:1 },
    check_order_status : { flag:30040, desc:"", record:1 },
    simulate_egret_pay : { flag:30041, desc:"", record:0 },
    callback_egret_pay : { flag:30042, desc:"", record:0 },
    get_friends_ranking : { flag:30044, desc:"", record:1 },
    get_ranking : { flag:30045, desc:"", record:1 },
    update_ai : { flag:30046, desc:"", record:1 },
    
    // 新接口, 领取相关
    open_box: { flag:30101, desc:"开宝箱", record:1 },
    open_box_as_drop: { flag:30102, desc:"开宝箱(掉落处理)", record:1 },
    turntable_draw: { flag:30103, desc:"转盘抽奖", record:1 },
    minigame_reward: { flag:30104, desc:"小游戏结算", record:1 },
    use_skill: { flag:30105, desc:"使用技能", record:1 },

    pack_mix: { flag:30106, desc:"背包合成", record:1 },
    daily_reward: { flag:30107, desc:"日常领奖", record:1 },
    achieve_reward: { flag:30108, desc:"成就领奖", record:1 },
    daily_sign: { flag:30109, desc:"每日签到", record:1 },
    weapon_up: { flag:30110, desc:"武器升级", record:1 },
    buy_vip_gift: { flag:30111, desc:"购买VIP礼包", record:1 },
    change_in_kind: { flag:30112, desc:"实物兑换", record:1 },
    get_cik_log: { flag:30113, desc:"实物兑换记录查询", record:1 },
    get_cik_info: { flag:30114, desc:"实物兑换信息查询", record:1 },
    guide_reward: { flag:30115, desc:"完成强制引导领奖", record:1 },
    month_sign: { flag:30116, desc:"查询月签状态", record:1 },
    mission_reward: { flag:30117, desc:"任务领奖", record:1 },
    active_reward: { flag:30118, desc:"活跃领奖", record:1 },
    goddess_unlock: { flag:30119, desc:"女神解锁", record:1 },
    goddess_levelup: { flag:30120, desc:"女神升级", record:1 },
    weapon_buy_skin: { flag:30121, desc:"武器皮肤购买", record:1 },
    weapon_equip: { flag:30122, desc:"武器皮肤装备", record:1 },
    cancel_cik: { flag:30123, desc:"实物兑换取消", record:1 },
    onekey_reward: { flag:30124, desc:"一键领取", record:1 },
    god_week_reward: { flag:30125, desc:"领取保卫女神周排名奖励", record:1 },
    goddess_query_week_reward: { flag:30126, desc:"查询当前有无保卫女神周奖励", record:1 },
    level_up: { flag:30126, desc:"玩家升级", record:1 },
    get_huafeiquan: { flag:30127, desc:"获取话费券数量", record:1 },
    get_user_rank: { flag:30128, desc:"获取玩家历史排名", record:1 },
    get_chart_reward: { flag:30129, desc:"获取玩家排行榜奖励", record:1 },
    add_bp_log: { flag:30130, desc:"记录玩家的捕鱼积分", record:1 },
    query_weekend_reward: { flag:30131, desc:"查询周末狂欢互动数据", record:1 },
    get_weekend_reward: { flag:30132, desc:"领取周末狂欢互动奖励", record:1 },
    upload_hweekend_fishing: { flag:30133, desc:"周末狂欢捕鱼任意条进度", record:1 },
    get_horn_flower: { flag:30134, desc:"获取喇叭使用、收到鲜花数量", record:1 },
    get_item_limit_time: { flag:30135, desc:"查询指定某个道具剩余过期时间", record:1 },
    get_item_limit_got_time: { flag:30136, desc:"查询玩家限时道具获得时间", record:1 },

    weapon_skin_upstar: { flag:30137, desc:"皮肤升星", record:1 },
    weapon_skin_vote: { flag:30138, desc:"皮肤支持率投票", record:1 },
    query_skin_vote: { flag:30139, desc:"查询投票排行榜", record:1 },
    vip_daily_reward: { flag:30140, desc:"VIP每日奖励领取", record:1 },
    buy_month_card: { flag:30141, desc:"使用金币购买月卡", record:1 },
};

exports.ADMIN_API = ADMIN_API;
exports.ACCOUNT_API = ACCOUNT_API;
exports.DATA_API = DATA_API;