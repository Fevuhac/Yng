var	new_mini_game_coincatch_cfg = 
[
	{
		id : 1001,    //--编号
		desc_picture : "picture",    //--玩法说明图片
		cd : 90,    //--游戏时间秒
		coin_1 : {"mt" : 5.5, "score" : 10,"chance":73, "sound":"minigame_coin"},    //--银币，mt下落时间，单位秒，下同
		coin_2 : { "mt" : 5.1, "score" : 100, "chance":10, "sound":"minigame_coin"},    //--金币，chance权重，上下同
		coin_3 : {"mt" : 5.3, "score" : -100,"chance":7, "sound":"minigame_coin_bad"},    //--炸弹，score分值，上下同
		coin_4 : { "mt" : 4.7, "doubletime" : 5,"chance":3,"sound":"minigame_coin_good"},    //--奖励翻倍，doubletime持续时间
		coin_5 : {"mt" : 4.9, "speedtime" : 10,"chance":5,"sound":"minigame_coin_good"},    //--盆子移速增加50%，speedtime持续时间
		coin_6 : { "mt" : 4.5, "addtime" : 3,"chance":2,"sound":"minigame_coin_good"},    //--加时间
		interval : [0.57,0.002,0.007],    //--刷新间隔
		speed_add : [1,0.02,10],    //--下落速度加成倍数
		speed : 400,    //--盆子初始速度，像素
		base_multiple : 1,    //--基础倍率
		scene_multiple : 0.005,    //--场景倍率系数
		maxscore : 30000,    //--最大分
	},
];
module.exports = new_mini_game_coincatch_cfg;