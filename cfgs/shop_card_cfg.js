var	shop_card_cfg = 
[
	{
		id : 100,    //--月卡类型
		funid : 9067,    //--玩吧id
		funidiOS : 9488,    //--玩吧idiOS
		price : 30,    //--价格¥
		diamond : 300,    //--一次性赠送钻石
		everyday : [["i001",50000],["i011",2],["i002",30],["i012",2]],    //--每日领取
		hitrate : 1,    //--捕鱼命中系数
	},
	{
		id : 101,    //--月卡类型
		funid : 9068,    //--玩吧id
		funidiOS : 9489,    //--玩吧idiOS
		price : 120,    //--价格¥
		diamond : 1200,    //--一次性赠送钻石
		everyday : [["i015",1],["i011",5],["i013",5],["i001",100000],["i002",60],["i012",5]],    //--每日领取
		hitrate : 1.025,    //--捕鱼命中系数
	},
];
module.exports = shop_card_cfg;