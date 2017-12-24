var	common_mathadjust_const_cfg =  {
		A : 20000,    //--roiPCT参数
		ROIPCT : 0.95,    //--roiPCT倍率
		LONG : 300,    //--roiPCT时间秒
		RMAX : 1,    //--参数
		RMIN : 1,    //--参数1
		NEWCOMERLV : 10,    //--新手保护等级
		NEWCOMERPCT : 0.8,    //--新手保护几率
		MAGMAUP : 100,    //--火焰旋涡
		PICHANGE : 0.10471975511966,    //--弧度转化,圆周率/180°扩大6倍
		DIVERGE : 0,    //--偏振常数
		DRATIO : 1,    //--偏振系数
		HEARTMAX : 180,    //--心跳上限
		HRATIO : 5,    //--心跳+1需要金币系数
		HVALUE : 0.5,    //--心跳参数
		extract : 0.05,    //--抽水
		time1 : 900,    //--重置间隔
		addvalue : 1.2,    //--出分加成
		time2 : 300,    //--出分时长
		reducevalue : 0.8,    //--吃分加成
		time3 : 300,    //--吃分时长
	};
module.exports = common_mathadjust_const_cfg;