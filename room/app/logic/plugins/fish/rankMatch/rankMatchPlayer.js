const Player = require('../../../base/player');
const consts = require('../consts');
const configReader = require('../configReader');
const SECONDS_IN_ONE_DAY = 86400;
const ACCOUNTKEY = require('../../../../utils/import_def').ACCOUNTKEY;

class RankMatchPlayer extends Player {
    /**
     * {
     * kindId:0,
     * sid:0,
     * uid:0,
     * account:{}
     * ready:false
     * 
     * }
     * @param {*} opts 
     */
    constructor(opts) {
        super(opts);
        this._ready = false;
        this._over = false;
        this._serverId = '0';

        if(opts.kindId == consts.ENTITY_TYPE.ROBOT){
            this._ready = true;
        }
        this.account = opts.account;

        logger.error('account ======= ', this.account);
        this._statistics = {
            score: 0, //当前总得分
            fire: 0, //剩余子弹数
            fish_account: {}, //普通开炮打死什么鱼，得多少分
            nuclear_fish_count: -1, //核弹打死条数,-1默认取消核弹，核弹可能存在打不死鱼
            nuclear_score: -1, //核弹打死鱼总得分
            firetime: 0, //统计时间戳
        };
        this._pointChange = 0; //点数变化值
        this._winStreak = this.account.match_winning_streak; //连胜次数
        this._win = this.account.match_win; //胜利次数
        this._fail = this.account.match_fail; //失败次数
        this._charmPoint = this.account.charm_point; //魅力点数
        this._charmRank = this.account.charm_rank; //魅力等级
        this._matchRank = this.account.match_rank; //排位赛段位
        this._rankChange = 0; //段位变化
        this._firstWinBox = null; //首胜宝箱id
        this._box = null; //本次获得宝箱
        this._seasonWin = this.account.match_season_win; //赛季胜利次数

        logger.error('sdfsd-- account = ', this.account);

    }

    set serverId (val) {
        this._serverId = val;
    }
    
    get serverId () {
        return this._serverId;
    }

    get statistics () {
        return this._statistics;
    }

    get nbomb_cost () {
        return configReader.getValue('rank_rankgame_cfg', this.account.match_rank).nbgold;
    }

    /**
     * 存档，持久化到redis中
     * TODO: 
     * 1、排位赛日志如何写到数据库
     * 2、连胜公告如何同步到数据服
     */
    save () {
        //获得一个宝箱
        if (this._box) {
            let boxes = this.account.match_box_list;
            let boxesStamp = this.account.match_box_timestamp;
            let boxIdx = this._box.idx;
            boxes[boxIdx] = this._box.id;
            boxesStamp[boxIdx] = -1;
            this.account.match_box_list = boxes;
            this.account.match_box_timestamp = boxesStamp;
        }

        //首胜宝箱获得
        if (this._firstWinBox) {
            let firstBox = this.account.match_1st_box;
            firstBox.id = this._firstWinBox;
            firstBox.stat = 2;
            this.account.match_1st_box = firstBox;
            this.account.match_season_1st_win ++;
        }

        this.account.match_season_count += 1;
        this.account.match_unfinish = 0; //已查看结算结果标记
        this.account.match_season_win = this._seasonWin;
        this.account.match_rank = this._matchRank;
        this.account.match_points = Math.max(0, this.account.match_points + this._pointChange);
        this.account.match_winning_streak = this._winStreak;
        this.account.match_win = this._win;
        this.account.match_fail = this._fail;
        this.account.charm_point = this._charmPoint;
        this.account.charm_rank = this._charmRank;
        this.account.commit();
    }

    /**
     * 胜负结果处理
     *  // 积分变化
        // (1)根据双方段位的value参数值计算积分
        // (2)胜方增加：max(败方参数-胜方参数 + 20，5)
        // (3)败方减少：max(胜方参数-败方参数 + 20，5)
        // 分数相同且不为0, 比较firetime
     */
    setResult (p2) {
        let winner = 0; //0平局 1赢了 2输了
        let score1 = this.statistics.score;
        let score2 = p2.statistics.score;
        if (score1 === 0 && score2 === 0) {
            winner = 0;
        }else {
            if (score1 > score2) {
                winner = 1; 
            }else if (score1 < score2) {
                winner = 2;
            }else {
                if (this.statistics.firetime <= p2.statistics.firetime) {
                    winner = 1;
                }else {
                    winner = 2;
                }
            }
        }

        if (winner === 0) {
            const PC = 5;
            this._pointChange = -PC * this.getAddPoint();
        }else {
            let value1 = this.getValue();
            let value2 = p2.getValue();
            let pc = 0;
            if (winner === 1) {
                pc = Math.max(value2 - value1 + 20, 5);
                pc = pc * this.getAddPoint() + this.handleWinningStreak();
                this._pointChange = pc;
                this._win ++;
                this._seasonWin ++;
            } else {
                pc = Math.max(value1 - value2 + 20, 5);
                pc = pc * this.getAddPoint();
                this._pointChange = -pc;
                this._fail ++;
                this._winStreak  = 0; //输了之后，连胜次数重置
            }
        }

        let points = Math.max(0, this.account.match_points + this._pointChange);
        let charm = 0;
        let matchRank = this._matchRank;
        let treasure2 = null; //普通宝箱配置
        let treasure1 = null; //首胜宝箱id
        const cfg = GAMECFG.rank_rankgame_cfg;
        let i = cfg.length;
        while (i > 0 && i--) {
            let rank_info = cfg[i];
            if (points >= rank_info.integral) {
                matchRank = rank_info.id;
                charm = rank_info.charm;
                treasure2 = rank_info.treasure2;
                treasure1 = rank_info.treasure1;
                break;
            }
        }
        this._charmPoint += charm;
        this._rankChange = matchRank - this._matchRank;
        this._matchRank = matchRank; //注意这个段位不是准确的，实际需求是需要根据排名和点数共同决定

        //赢家获得宝箱
        if (winner === 1) {
            this._box = this.newBox(treasure2);
            this._firstWinBox = this._newFirstWinBoxEnabled(matchRank) ? treasure1 : null;
        }
    }

    /**
     * 根据权重，确定一个宝箱id
     * cfgs : [[10,670],[11,240],[12,60],[13,30]],   
     */
    _findTreasureId (cfgs) {
        let total = 0;
        for (let i = 0; i < cfgs.length; i ++) {
            let temp = cfgs[i];
            total += temp[1];
        }
        let rand = Math.floor(Math.random() * total);
        total = 0;
        for (let i = 0; i < cfgs.length; i ++) {
            let temp = cfgs[i];
            total += temp[1];
            if (total >= rand) {
                return temp[0];
            }
        }
        return -1;
    }

    /**
     * 放置一个新的宝箱到玩家数据中
     */
    newBox (treasure2) {
        let old_box = this.account.match_box_list;
        let id = -1;// 没有设置位
        let idx = 0;
        for (let i = 0; i < old_box.length; i++) {
            if (old_box[i] == 0) {
                id = this._findTreasureId(treasure2);
                idx = i;
                break;
            }
        }
        if (id !== -1) {
            return {
                id: id,
                idx: idx,
            };
        }
        return null;
    }

    /**
     * 判断玩家是否可以获得首胜宝箱
     */
    _newFirstWinBoxEnabled () {
        let first_box = this.account.match_1st_box;
        // 1. id = 0
        if (first_box.id != 0) {
            return false;
        }
        // 2. 倒计时结束
        let lefttime = this._getFirstBoxLefttime(first_box.timestamp);
        if (lefttime > 0) {
            return false;
        }
        // 3. stat状态
        if (first_box.stat != consts.BOX_STAT.NULL) {
            return false;
        }
        return true;
    }

    /**
     * 获取首胜宝箱的剩余开启时间.
     */
    _getFirstBoxLefttime (timestamp) {
        let pasttime = (new Date().getTime() - timestamp) / 1000;
        let needtime = SECONDS_IN_ONE_DAY;
        let lefttime = needtime - pasttime;
        if (lefttime < 0) {
            lefttime = 0;
        }
        return Math.round(lefttime);
    }

    /**
     * 获取玩家参数来改变积分
     */
    getValue () {
        return configReader.getValue('rank_rankgame_cfg', this.account.match_rank).value;
    }

    /**
     * 积分加成
     * TASK223: 每个赛季前10场分值变化量*5.
     */
    getAddPoint () {
        if (this.account.match_season_count < 10) {
            return 5;
        }
        return 1;
    }

    /**
     * 计算胜率
     * 注意该字段不会持久化，而是及时计算所得
     * -1标识无胜率
     */
    genWinRate () {
        let winning_rate = -1;
        let win = this._win;
        let fail = this._fail;
        let total = win + fail;
        if (total > 0) {
            winning_rate = win / total * 100;
            winning_rate = Math.round(winning_rate * 100) / 100;
        }
        return winning_rate;
    }

    /**
     * 连胜处理
     * TODO：全服广播连胜公告
     */
    handleWinningStreak () {
        let ret = 0;
        this._winStreak ++;
        if (this._winStreak >= GAMECFG.common_const_cfg.RMATCH_VICTORS) {
            let nickname = this.account.nickname;
            let content = {
                txt: '玩家' + nickname + '连胜' + this._winStreak + '局',
                times: 1 ,
                type: consts.GAME_EVENT_TYPE.VICTORS,
                params: [nickname, this._winStreak, this.account.vip],
                platform: this.account.platform,
            };
            ret = this._winStreak * GAMECFG.common_const_cfg.RMATCH_VICTORSADD;
        }
        return ret;
    }

    /**
     * 返回个人私有数据：因本次比赛而改变的数据
     */
    getPrivateDetail () {
        let data = {
            uid: this.account.uid,
            finish: true, //是否有比赛结果了
            point_change: this._pointChange, //点数变化，不可能为0，>0 赢了，反之输了
            box: this._box, //宝箱为null，有两种情况：输了，赢了但是该宝箱已获得
            rank_change: this._rankChange, //段位变化，!= 0, >0 上升，反之下降
            charm_point: this.account.charm_point,
            charm_rank: this.account.charm_rank,
            match_winning_streak: this._winStreak, //连胜次数
            match_info: null,
        };
        return data;
    }

    /**
     * 返回比赛结算详情
     */
    getRMatchDetail() {
        let detail = {
            uid: this.account.uid,
            nickname: this.account.nickname,
            figure_url: this.account.figure_url,
            winning_rate: this.genWinRate(), 
            rank: this.account.match_rank, 
            fish_account: this.statistics.fish_account,
            nuclear_fish_count: this.statistics.nuclear_fish_count,
            nuclear_score: this.statistics.nuclear_score,
        };
        return detail;
    }

    /**
     * 核弹开炮结果
     */
    useNbomb (data) {
        this.statistics.firetime = new Date().getTime();
        this.statistics.score = data.score;
        this.statistics.fire = 0;
        this.statistics.nuclear_fish_count = data.nbomb.num;
        this.statistics.nuclear_score = data.nbomb.point;
        this._over = true;
    }

    /**
     * 取消核弹使用
     */
    cancelNbomb () {
        this.statistics.firetime = new Date().getTime();
        this._over = true;
    }

    /**
     * 普通开炮结果
     * @param {*} data 
     */
    setFightInfo (data) {
        this.statistics.firetime = new Date().getTime();
        this.statistics.fire = data.fire;
        this.statistics.score = data.score;
        for (let k in data.fish_list) {
            let temp = data.fish_list[k];
            this.statistics.fish_account[k] = {
                num: temp.num,
                point: temp.point,
            };
        }
    }

    set ready(value) {
        this._ready = value;
    }

    get ready() {
        return this._ready;
    }

    isOver () {
        return  this.ready && this._over && this.statistics.fire === 0;
    }

    static sBaseField() {
        const baseField = [
            ACCOUNTKEY.NICKNAME,
            ACCOUNTKEY.WEAPON_SKIN,
            ACCOUNTKEY.FIGURE_URL,
            ACCOUNTKEY.MATCH_RANK,
            ACCOUNTKEY.MATCH_POINTS,
            ACCOUNTKEY.MATCH_WIN,
            ACCOUNTKEY.MATCH_FAIL,
            ACCOUNTKEY.MATCH_SEASON_COUNT,
            ACCOUNTKEY.MATCH_WINNING_STREAK,
            ACCOUNTKEY.MATCH_BOX_LIST,
            ACCOUNTKEY.MATCH_BOX_TIMESTAMP,
            ACCOUNTKEY.MATCH_1ST_BOX,
            ACCOUNTKEY.MATCH_SEASON_1ST_WIN,
            ACCOUNTKEY.MATCH_UNFINISH,
            ACCOUNTKEY.MATCH_SEASON_WIN,
            ACCOUNTKEY.PLATFORM,
            ACCOUNTKEY.VIP,
            ACCOUNTKEY.CHARM_POINT,
            ACCOUNTKEY.CHARM_RANK,
        ];
        return baseField;
    }

}

module.exports = RankMatchPlayer;