var	social_guerdon_cfg = 
[
	{
		id : 1,    //--id
		name : "guerdon_name_1",    //--类型名称
		reward : [["i001",1000],["i001",10000],["i001",100000]],    //--奖励内容
		price : [1,10,100],    //--购买价格
		viplevel : [0,0,0],    //--需要vip等级
		notice : [0,0,1],    //--是否公告
	},
	{
		id : 2,    //--id
		name : "guerdon_name_2",    //--类型名称
		reward : [["i015",1],["i016",1],["i017",1]],    //--奖励内容
		price : [50,150,500],    //--购买价格
		viplevel : [3,3,3],    //--需要vip等级
		notice : [1,1,1],    //--是否公告
	},
	{
		id : 3,    //--id
		name : "guerdon_name_3",    //--类型名称
		reward : [["i400",1],["i400",9],["i400",99]],    //--奖励内容
		price : [10,90,990],    //--购买价格
		viplevel : [0,0,0],    //--需要vip等级
		notice : [0,1,1],    //--是否公告
	},
];
module.exports = social_guerdon_cfg;