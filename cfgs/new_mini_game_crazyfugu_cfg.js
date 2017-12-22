var	new_mini_game_crazyfugu_cfg = 
[
	{
		id : 1001,    //--编号
		desc_picture : "picture",    //--玩法说明图片
		cd : 60,    //--游戏时间秒
		fugu_1 : {"score" : 100,"chance":70,"sound":"minigame_fugu_good"},    //--绿色河豚，得分，权重
		fugu_2 : {"score" : -500,"chance":30,"sound":"minigame_fugu_bad", "hitsound": "minigame_fugu_hit"},    //--红色河豚，得分，权重
		interval : [0.6,0.003,0.2],    //--刷新间隔
		holdon : [1,0.003,0.6],    //--停留间隔
		base_multiple : 1,    //--基础倍率
		scene_multiple : 0.005,    //--场景倍率系数
		maxscore : 17000,    //--最大分
	},
];
module.exports = new_mini_game_crazyfugu_cfg;