var REDIS_KEYS = {
    CHANNEL: {
        BROADCAST_SERVER: "channel:broadcast:server",
        BROADCAST_GAME_EVENT: "channel:broadcast:gameevent",
        BROADCAST_FAMOUS_ONLINE: "channel:broadcast:famousonline",
        BROADCAST_DRAW: "channel:broadcast:draw",
        BROADCAST_REWARD_PEOPLE:"channel:broadcast:rewardpeople",

        MAIL_SEND: "channel:mail:send",
        MAIL_RANK: "channel:mail:rank",
        MAIL_RELOAD: "channel:mail:reload",

        WORLD_CHAT: "channel:chat:world",
        PRIVATE_CHAT: "channel:chat:private",

        // 主服生成排行榜发送消息
        CHART_GOLD: "channel:chart:gold",
        CHART_ACHIEVE: "channel:chart:achieve",
        CHART_GODDESS: "channel:chart:goddess",
        CHART_MATCH: "channel:chart:match",
        CHART_AQUARIUM: "channel:chart:aquarium",
        CHART_CHARM: "channel:chart:charm",
        CHART_BP: "channel:chart:bp",
        CHART_FLOWER: "channel:chart:flower",

        // 主服生成排行榜发送消息
        CHART_GOLD_YD: "channel:chart:gold:yesterday",
        CHART_ACHIEVE_YD: "channel:chart:achieve:yesterday",
        CHART_GODDESS_YD: "channel:chart:goddess:yesterday",
        CHART_MATCH_YD: "channel:chart:match:yesterday",
        CHART_AQUARIUM_YD: "channel:chart:aquarium:yesterday",
        CHART_CHARM_YD: "channel:chart:charm:yesterday",
        CHART_BP_YD: "channel:chart:bp:yesterday",
        CHART_FLOWER_YD: "channel:chart:flower:yesterday",
    },

    PAIR: {
        OPENID_UID: "pair:openid:uid",
        /** uid-platform 玩家平台记录 */
        UID_PLATFORM: "pair:uid:platform",
        /** uid-name 玩家昵称记录 */
        UID_NAME: "pair:uid:nickname",
        /** uid-points 玩家胜点记录 */
        UID_POINTS: "pair:uid:points",
        /** uid-rank 玩家段位记录 */
        UID_RANK: "pair:uid:rank",

        //--------------------------------------------------
        // 充值用户相关(Vip & Rmb)
        /** uid-vip 玩家VIP记录 */
        UID_VIP: "pair:uid:vip",
        /** uid-rmb 玩家RMB记录, 单位为分 */
        UID_RMB: "pair:uid:rmb",

        //--------------------------------------------------
        // 武器相关(Weapon)
        /** uid-weapon 玩家武器倍率记录 */
        UID_WEAPON: "pair:uid:weapon",
        /** uid-weapon_skin_own 玩家拥有武器皮肤记录 */
        UID_WEAPON_SKIN_OWN: "pair:uid:weapon:skin:own",
        /** uid-rank_skin_equip 玩家装备武器皮肤记录 */
        UID_WEAPON_SKIN_EQUIP: "pair:uid:weapon:equip",
        /** uid-weapon_energy 玩家武器充能 */
        UID_WEAPON_ENERGY: "pair:uid:weapon:energy",

        /** uid-figure 玩家头像*/
        UID_FIGURE:"pair:uid:figure",
        /** uid-exp 玩家经验*/
        UID_EXP:"pair:uid:exp",
        /** uid-level 玩家等级*/
        UID_LEVEL:"pair:uid:level",
        /** uid-sex 玩家性别*/
        UID_SEX:"pair:uid:sex",
        /** uid-city 玩家城市*/
        UID_CITY:"pair:uid:city",

        //--------------------------------------------------
        // 社交(Social)
        /** uid-jointype 加入类型码*/
        UID_JOINTYPE:"pair:uid:jointype",
        /** uid-who_invite_me 邀请我的好友ID, 为0表示没有好友邀请我*/
        UID_WHO_INVITE_ME:"pair:uid:who_invite_me",
        /** uid-who_share_me 我点击了谁的分享链接, 为0表示我不是分享而来*/
        UID_WHO_SHARE_ME:"pair:uid:who_share_me",
        /** uid-rank_in_friends 当前在朋友中的排名, 如果查询好友排行榜时值比这个小则通知客户端*/
        UID_RANK_IN_FRIENDS:"pair:uid:rank_in_friends",
        /** uid-over_me_friends 排名超过了自己的好友openid，查询好友排名时会把当时超过的好友列表返回*/
        UID_OVER_ME_FRIENDS:"pair:uid:over_me_friends",

        //--------------------------------------------------
        // 登录相关(Login, Logout)
        /** uid-login_count 用户总的登录次数*/
        UID_LOGIN_COUNT:"pair:uid:login_count",
        /** uid-logout_count 用户总退出次数*/
        UID_LOGOUT_COUNT:"pair:uid:logout_count",

        //--------------------------------------------------
        // 时间相关(Time)
        /** uid-created_at 账户创建时间*/
        UID_CREATE_TIME:"pair:uid:create_time",
        /** uid-updated_at 记录更新时间*/
        UID_UPDATE_TIME:"pair:uid:update_time",
        /** uid-last_online_time 用户上次在线时间，缓存清理以此为基础*/
        UID_LAST_ONLINE_TIME:"pair:uid:last_online_time",
        /** uid-pfft_at 首次付费时间(Pay For the First Time)*/
        UID_PFFT:"pair:uid:pfft",

        //--------------------------------------------------
        // 安全相关(Security)
        /** uid-salt 盐*/
        UID_SALT:"pair:uid:salt",
        /** uid-token */
        UID_TOKEN:"pair:uid:token",
        /** uid-password */
        UID_PWD:"pair:uid:pwd",

        //--------------------------------------------------
        // 魅力相关(Charm)
        /** uid-charm_rank 魅力等级*/
        UID_CHARM_RANK:"pair:uid:charm:rank",
        /** uid-charm_point 魅力值 */
        UID_CHARM_POINT:"pair:uid:charm:point",

        //--------------------------------------------------
        // 鲜花(flower)
        /** 收到的鲜花*/
        UID_FLOWER_RECEIVE:"pair:uid:flower_receive",

        //--------------------------------------------------
        // 金币和钻石(Gold & Diamond)
        /** uid-gold 金币*/
        UID_GOLD:"pair:uid:gold",
        /** uid-pearl 钻石 */
        UID_DIAMOND:"pair:uid:diamond",

        //--------------------------------------------------
        // 技能和背包(Skill & Package)
        /** uid-skill 技能*/
        UID_SKILL:"pair:uid:skill",
        /** uid-package 钻石 */
        UID_PACK:"pair:uid:pack",

        //--------------------------------------------------
        // 礼包(Gift)
        /** uid-broke_times 破产次数*/
        UID_BROKE_TIMES:"pair:uid:broke_times",
        /** uid-first_login 当日首次登录登记*/
        UID_FIRST_LOGIN:"pair:uid:first_login",
        /** uid-day_reward 每日领取奖励*/
        UID_DAY_REWARD:"pair:uid:day_reward",
        /** uid-day_reward_adv 每日广告礼包领取*/
        UID_DAY_REWARD_ADV:"pair:uid:day_reward_adv",
        /** uid-new_reward_adv 新手礼包领取*/
        UID_NEW_REWARD_ADV:"pair:uid:new_reward_adv",
        /** uid-day_reward_weekly 每日奖励周领取*/
        UID_DAY_REWARD_WEEKLY:"pair:uid:day_reward_weekly",
        /** uid-vip_daily_fill VIP每日补满*/
        UID_VIP_DAILY_FILL:"pair:uid:vip_daily_fill",
        /** uid-first_buy 首充数据*/
        UID_FIRST_BUY:"pair:uid:first_buy",
        /** uid-activity_gift 活动礼包(9元充值)*/
        UID_ACTIVITY_GIFT:"pair:uid:activity_gift",
        /** uid-first_buy_gift 首充大礼包是否已经领取(0|1)*/
        UID_FIRST_BUY_GIFT:"pair:uid:first_buy_gift",

        //--------------------------------------------------
        // 渠道(Channel)
        /** uid-channel 用户渠道*/
        UID_CHANNEL_FLAG:"pair:uid:channel:flag",
        /** uid-channel_account_id 用户渠道ID*/
        UID_CHANNEL_UID:"pair:uid:channel_account_id",
        /** uid-channel_account_name 用户渠道昵称*/
        UID_CHANNEL_NAME:"pair:uid:channel:name",
        /** uid-channel_account_info 用户渠道信息*/
        UID_CHANNEL_INFO:"pair:uid:channel:info",

        //--------------------------------------------------
        // 任务(Mission)
        /** uid-mission_daily_reset 日常任务*/
        UID_MISSION_DAILY:"pair:uid:mission:daily",
        /** uid-mission_only_once 成就任务*/
        UID_MISSION_ACHIEVE:"pair:uid:mission:achieve",
        /** uid-pirate 海盗任务 */
        UID_MISSION_PIRATE:"pair:uid:mission:pirate",

        //--------------------------------------------------
        // 心跳(heartbeat)
        /** uid-heartbeat 心跳，由客户端更新，每日凌晨重置为0 */
        UID_HEARTBEAT:"pair:uid:heartbeat",
        /** uid-heartbeat_min_cost 心跳期间最低消耗, 每日重置 */
        UID_HEARTBEAT_MIN_COST:"pair:uid:heartbeat:min_cost",

        //--------------------------------------------------
        // 成就(achieve)
        /** uid-achieve_point 玩家成就点 */
        UID_ACHIEVE:"pair:uid:achieve",

        //--------------------------------------------------
        // 奖金鱼(bonus)
        /** uid-bonus 为奖金鱼开发的一个字段({fish_count:1, gold_count:1, got:true|false}) */
        UID_BONUS:"pair:uid:bonus",

        //--------------------------------------------------
        // 金币购买次数(gold_shopping)
        /** uid-gold_shopping 金币购买次数 */
        UID_GOLD_SHOPPING:"pair:uid:gold_shopping",

        //--------------------------------------------------
        // 掉落(drop)
        /** uid-drop_reset 金币购买次数 */
        UID_DROP_RESET:"pair:uid:drop:reset",
        /** uid-drop_once 金币购买次数 */
        UID_DROP_ONCE:"pair:uid:drop:once",

        //--------------------------------------------------
        // 购买相关(Buy)
        /** uid-comeback 翻盘购买记录，需要每日重置 */
        UID_COMEBACK:"pair:uid:comeback",
        /** uid-vip_gift vip礼包的购买情况 */
        UID_VIP_GIFT:"pair:uid:vip_gift",

        //--------------------------------------------------
        // 女神相关(Goddess)
        /** uid-goddess 女神数据 */
        UID_GODDESS:"pair:uid:goddess",
        /** uid-goddess_free 每日女神免费次数 */
        UID_GODDESS_FREE:"pair:uid:goddess:free",
        /** uid-goddess_ctimes 每日女神挑战次数记录 */
        UID_GODDESS_CTIMES:"pair:uid:goddess:ctimes",
        /** uid-goddess_crossover 女神挑战的跨天次数*/
        UID_GODDESS_CROSSOVER:"pair:uid:goddess:crossover",
        /** uid-goddess_ongoing 保卫女神是否进行中, 1表示进行中, 0表示没有保卫女神 */
        UID_GODDESS_ONGOING:"pair:uid:goddess:ongoing",

        //--------------------------------------------------
        // 女神相关(Goddess)
        /** uid-active 活动记录 */
        UID_ACTIVE:"pair:uid:active",
        /** uid-active_daily_reset 需要每日重置的活动任务 */
        UID_ACTIVE_DAILY:"pair:uid:active:daily",
        /** uid-active_stat_once 活动领取记录(一次领取) */
        UID_ACTIVE_STAT_ONCE:"pair:uid:active:stat:once",
        /** uid-active_stat_reset 活动领取记录(需要每日重置) */
        UID_ACTIVE_STAT_RESET:"pair:uid:active:stat:reset",

        //--------------------------------------------------
        // 引导相关(Guide)
        /** uid-guide 强引导(0|1) */
        UID_GUIDE_STRONG:"pair:uid:guide:strong",
        /** uid-guide_weak 玩家弱引导完成状态 */
        UID_GUIDE_WEAK:"pair:uid:guide:weak",

        //--------------------------------------------------
        // 月卡相关(Card)
        /** uid-card 月卡购买情况 */
        UID_CARD_BUY:"pair:uid:card:buy",
        /** uid-get_card 月卡奖励领取情况 */
        UID_CARD_GET:"pair:uid:card:get",

        //--------------------------------------------------
        // 剩下的(Left)
        /** uid-mail_box 玩家的邮箱*/
        UID_MAIL_BOX:"pair:uid:mail_box",
        /** uid-free_draw 剩余免费抽奖次数, 需要每日重置({"gold":1,"diamond":0}) */
        UID_DRAW_FREE:"pair:uid:draw:free",
        /** uid-total_draw 今日玩家抽奖总次数, 需要每日重置({"gold":0,"diamond":0}) */
        UID_DRAW_TOTAL:"pair:uid:draw:total",
        /** uid-roipct_time 时间戳(new Date().getTime()) */
        UID_ROIPCT_TIME:"pair:uid:roipct_time",
        /** uid-aquarium_petfish 水族馆宠物鱼 */
        UID_AQUARIUM_PETFISH:"pair:uid:aquarium:petfish",
        /** uid-aquarium_goddess 水族馆女神 */
        UID_AQUARIUM_GODDESS:"pair:uid:aquarium:goddess",
        /** uid-redress_no 防重名编号 */
        UID_REDRESS_NO:"pair:uid:redress_no",
        /** uid-test 是否测试人员(0:不是,1:是) */
        UID_TEST:"pair:uid:test",

        //--------------------------------------------------
        // 其他表(Other Tables)
        // tbl_account_sign
        /** uid-month_sign 玩家当月签到状态记录 */
        UID_SIGN_MONTH:"pair:uid:sign:month",
        
        // tbl_goddess
        /** uid-max_wave 最大波数, 每周会重置 */
        UID_GODDESS_MAX_WAVE:"pair:uid:goddess:max_wave",
        /** uid-goddess_balance_time 女神最大波数结算时间 */
        UID_GODDESS_BALANCE_TIME:"pair:uid:goddess:balance_time",
        /** uid-week_reward 女神周奖励领取状态(0:不可领取,1:可领取,2:已领取) */
        UID_GODDESS_WEEK_REWARD_STAT:"pair:uid:goddess:week_reward_stat",
        /** uid-week_rank 女神上周名次(默认值0, 1~1000可领取奖励) */
        UID_GODDESS_LAST_WEEK_RANK:"pair:uid:goddess:last_week_rank",
        
        // tbl_switch
        /** uid-match_on 是否开启排位赛功能, 1表示开启, 0表示禁止 */
        UID_SWITCH_MATCH:"pair:uid:switch:match",
        /** uid-cik_on 是否开启实物奖励, 1表示开启, 0表示关闭 */
        UID_SWITCH_CIK:"pair:uid:switch:cik",
        /** uid-cdkey_on 是否开启兑换码功能, 1表示开启, 0表示禁止 */
        UID_SWITCH_CDKEY:"pair:uid:switch:cdkey",
        /** uid-msgboard_mgmt 是否可以管理留言, 1表示可以管理, 0表示不能管理 */
        UID_SWITCH_MSGBOARD_MGMT:"pair:uid:switch:msgboard_mgmt",
        
        // tbl_aquarium
        /** uid-petfish_recent_time 宠物鱼最近更新时间 */
        UID_PETFISH_RECENT_TIME:"pair:uid:petfish:recent_time",
        /** uid-petfish_total_level 宠物鱼总等级 */
        UID_PETFISH_TOTAL_LEVEL:"pair:uid:petfish:total_level",

        // tbl_rankgame
        /** uid-match_recent_time 玩家最近一次比赛的时间 */
        UID_MATCH_RECENT_TIME:"pair:uid:match:recent_time",
        /** uid-match_win 胜利场次 */
        UID_MATCH_WIN:"pair:uid:match:win",
        /** uid-match_fail 失败场次 */
        UID_MATCH_FAIL:"pair:uid:match:fail",
        /** uid-match_unfinish 记录玩家没有结算的排位赛ID */
        UID_MATCH_UNFINISH:"pair:uid:match:unfinish",
        /** uid-match_box_list 玩家当前拥有的宝箱列表, 0表示宝箱位空着, 可以插入一个宝箱 */
        UID_MATCH_BOX_LIST:"pair:uid:match:box:list",
        /** uid-match_box_timestamp 宝箱获取的时间戳, 0表示没有宝箱, 领取后重置 */
        UID_MATCH_BOX_TIMESTAMP:"pair:uid:match:box:timestamp",
        /** uid-match_1st_box 首胜宝箱数据, timestamp为开启宝箱时间, stat为宝箱状态, 0为未获取, 1为获取, 2为领取 */
        UID_MATCH_1ST_BOX:"pair:uid:match:box:1st",
        /** uid-match_season_count 当前赛季进行了多少场比赛 */
        UID_MATCH_SEASON_COUNT:"pair:uid:match:season:count",
        /** uid-match_season_win 本赛季胜利次数 */
        UID_MATCH_SEASON_WIN:"pair:uid:match:season:win",
        /** uid-match_season_box 本赛季开启宝箱次数 */
        UID_MATCH_SEASON_BOX:"pair:uid:match:season:box",
        /** uid-match_season_1st_win 本赛季的首胜次数 */
        UID_MATCH_SEASON_1ST_WIN:"pair:uid:match:season:1st_win",
        /** uid-match_got_season_reward 本赛季奖励是否已经领取,1表示不可领取, 0表示可以领取 */
        UID_MATCH_SEASON_REWARD:"pair:uid:match:season:reward",
        /** uid-match_winning_streak 连胜记录,只要是胜利就加1, 失败就重置为0 */
        UID_MATCH_WINNING_STREAK:"pair:uid:match:winning_streak",

        // tbl_gold
        /** uid-total_gain 获得金币总量 */
        UID_GOLD_TOTAL_GAIN:"pair:uid:gold:total:gain",
        /** uid-total_cost 消费金币总量 */
        UID_GOLD_TOTAL_COST:"pair:uid:gold:total:cost",
        /** uid-shop_count 商场购买金币次数 */
        UID_GOLD_SHOP_COUNT:"pair:uid:gold:shop:count",
        /** uid-shop_amount 商场购买金币数量 */
        UID_GOLD_SHOP_AMOUNT:"pair:uid:gold:shop:amount",

        // tbl_pearl
        /** uid-total_gain 获得钻石总量 */
        UID_DIAMOND_TOTAL_GAIN:"pair:uid:diamond:total:gain",
        /** uid-total_cost 消费钻石总量 */
        UID_DIAMOND_TOTAL_COST:"pair:uid:diamond:total:cost",
        /** uid-shop_count 商场购买钻石次数 */
        UID_DIAMOND_SHOP_COUNT:"pair:uid:diamond:shop:count",
        /** uid-shop_amount 商场购买钻石数量 */
        UID_DIAMOND_SHOP_AMOUNT:"pair:uid:diamond:shop:amount",

        // tbl_social
        /** uid-invite_friends 邀请到的用户ID列表 */
        UID_SOCIAL_INVITE_FRIENDS:"pair:uid:social:invite_friends",
        /** uid-share_friends 分享邀请的用户列表 */
        UID_SOCIAL_SHARE_FRIENDS:"pair:uid:social:share_friends",
        /** uid-invite_daily_state 每日邀请的状态 */
        UID_SOCIAL_INVITE_DAILY:"pair:uid:social:invite_daily_state",
        /** uid-invite_progress 邀请进度, 是invite_friends字段朋友的个数, 此为冗余字段, 目的是方便查询和统计 */
        UID_SOCIAL_INVITE_PROGRESS:"pair:uid:social:invite_progress",
        /** uid-invite_reward 邀请奖励的领取进度, 存储social_friends_cfg中的id */
        UID_SOCIAL_INVITE_REWARD:"pair:uid:social:invite_reward",
        /** uid-share_status_0 分享状态(不重复) */
        UID_SOCIAL_SHARE_STAT_0:"pair:uid:social:share_status_0",
        /** uid-share_status_1 分享状态(每日重复) */
        UID_SOCIAL_SHARE_STAT_1:"pair:uid:social:share_status_1",
        /** uid-share_status_2 分享状态(每周重复) */
        UID_SOCIAL_SHARE_STAT_2:"pair:uid:social:share_status_2",
        /** uid-enshrine_status 收藏状态 */
        UID_SOCIAL_ENSHRINE_STAT:"pair:uid:social:enshrine_status",
        /** uid-share_top_gold 世界首富且金币不低于500万 */
        UID_SOCIAL_SHARE_TOP_GOLD:"pair:uid:social:share_top_gold",
        /** uid-share_top_rank 排位赛获得最强王者段位 */
        UID_SOCIAL_SHARE_TOP_RANK:"pair:uid:social:share_top_rank",

        /** uid-qq-friend QQ好友*/
        UID_QQ_FRIEND:"pair:uid:friend:qq",
        /** uid-game-friend 游戏好友*/
        UID_GAME_FRIEND:"pair:uid:friend:game",

        /** uid-bp 捕鱼积分(Bonus Point)*/
        UID_BP:"pair:uid:bp",
    },

    RANK: {
        GOLD: "rank:gold",
        ACHIEVE: "rank:achieve",
        GODDESS: "rank:goddess",
        MATCH: "rank:match",
        AQUARIUM: "rank:aquarium",
        CHARM: "rank:charm",
        BP: "rank:bp",
        FLOWER: "rank:flower",

        GOLD_TIMESTAMP: "rank:gold:timestamp",
        ACHIEVE_TIMESTAMP: "rank:achieve:timestamp",
        GODDESS_TIMESTAMP: "rank:goddess:timestamp",
        MATCH_TIMESTAMP: "rank:match:timestamp",
        AQUARIUM_TIMESTAMP: "rank:aquarium:timestamp",
        CHARM_TIMESTAMP: "rank:charm:timestamp",
        BP_TIMESTAMP: "rank:bp:timestamp",
        FLOWER_TIMESTAMP: "rank:flower:timestamp",
    },

    MSG:{
        PRIVATE_MSG:"msg:private",
        IS_REWARD_PEOPLE:"msg:isrewardpeople",
	ASK_FRIEND:"msg:askfriend",
    },

    CHART:{
        // 当前排行榜
        GOLD:"chart:gold",
        ACHIEVE:"chart:achieve",
        GODDESS:"chart:goddess",
        MATCH:"chart:match",
        AQUARIUM:"chart:aquarium",
        CHARM:"chart:charm",
        BP:"chart:bp",
        FLOWER:"chart:flower",

        // 昨日排行榜
        GOLD_YD:"chart:gold:yesterday",
        ACHIEVE_YD:"chart:achieve:yesterday",
        GODDESS_YD:"chart:goddess:yesterday",
        MATCH_YD:"chart:match:yesterday",
        AQUARIUM_YD:"chart:aquarium:yesterday",
        CHARM_YD:"chart:charm:yesterday",
        BP_YD:"chart:bp:yesterday",
        FLOWER_YD:"chart:flower:yesterday",

        // 上周排行榜
        GODDESS_LW:"chart:goddess:lastweek",

        // 上月排行榜
        MATCH_LM:"chart:match:lastmonth",
    },
};

exports.REDIS_KEYS = REDIS_KEYS;