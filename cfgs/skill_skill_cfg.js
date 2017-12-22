var	skill_skill_cfg = 
[
	{
		id : 1,    //--id
		name : "skill_name_1",    //--技能名称
		description : "skill_desc_1",    //--技能描述
		pos : 1,    //--节点下标,-1无意义
		skill_icon : "skill_02",    //--技能图标
		skill_sound : "skill_1",    //--技能音效
		skill_duration : 5,    //--技能时间
		skill_range : 0,    //--释放范围
		cost : 3,    //--价格
		ratio : 1,    //--倍率
		hitrate : 1,    //--命中系数
		skill_immune : [5],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
	{
		id : 2,    //--id
		name : "skill_name_2",    //--技能名称
		description : "skill_desc_2",    //--技能描述
		pos : 0,    //--节点下标,-1无意义
		skill_icon : "skill_01",    //--技能图标
		skill_sound : "skill_2",    //--技能音效
		skill_duration : 10,    //--技能时间
		skill_range : 0,    //--释放范围
		cost : 3,    //--价格
		ratio : 1,    //--倍率
		hitrate : 1,    //--命中系数
		skill_immune : [],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
	{
		id : 3,    //--id
		name : "skill_name_3",    //--技能名称
		description : "skill_desc_3",    //--技能描述
		pos : 2,    //--节点下标,-1无意义
		skill_icon : "skill_04",    //--技能图标
		skill_sound : "skill_3",    //--技能音效
		skill_duration : 1,    //--技能时间
		skill_range : 0,    //--释放范围
		cost : 3,    //--价格
		ratio : 1,    //--倍率
		hitrate : 1,    //--命中系数
		skill_immune : [],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : ["hujing_jj_zh","dapanyu_jj_zh","moguiyu_jj_zh","haigui_jj_zh","suolianyu_jj_zh","cheqiyu_jj_zh","haitun_jj_zh","sanshengyu_jj_zh","shuimu_jj_zh","shuangshengyu_jj_zh"],    //--召唤物
	},
	{
		id : 4,    //--id
		name : "skill_name_4",    //--技能名称
		description : "skill_desc_4",    //--技能描述
		pos : -1,    //--节点下标,-1无意义
		skill_icon : "skill_05",    //--技能图标
		skill_sound : "skill_4",    //--技能音效
		skill_duration : 1,    //--技能时间
		skill_range : 0,    //--释放范围
		cost : 0,    //--价格
		ratio : 1,    //--倍率
		hitrate : 100,    //--命中系数
		skill_immune : [2],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
	{
		id : 8,    //--id
		name : "skill_name_8",    //--技能名称
		description : "skill_desc_8",    //--技能描述
		pos : 5,    //--节点下标,-1无意义
		skill_icon : "hedan1",    //--技能图标
		skill_sound : "skill_8",    //--技能音效
		skill_duration : 2,    //--技能时间
		skill_range : 200,    //--释放范围
		cost : 50,    //--价格
		ratio : 400,    //--倍率
		hitrate : 125,    //--命中系数
		skill_immune : [2],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
	{
		id : 9,    //--id
		name : "skill_name_9",    //--技能名称
		description : "skill_desc_9",    //--技能描述
		pos : 4,    //--节点下标,-1无意义
		skill_icon : "hedan2",    //--技能图标
		skill_sound : "skill_8",    //--技能音效
		skill_duration : 2,    //--技能时间
		skill_range : 250,    //--释放范围
		cost : 150,    //--价格
		ratio : 1000,    //--倍率
		hitrate : 150,    //--命中系数
		skill_immune : [2],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
	{
		id : 10,    //--id
		name : "skill_name_10",    //--技能名称
		description : "skill_desc_10",    //--技能描述
		pos : 3,    //--节点下标,-1无意义
		skill_icon : "hedan3",    //--技能图标
		skill_sound : "skill_8",    //--技能音效
		skill_duration : 2,    //--技能时间
		skill_range : 300,    //--释放范围
		cost : 500,    //--价格
		ratio : 2500,    //--倍率
		hitrate : 200,    //--命中系数
		skill_immune : [2],    //--免疫列表,对应display_type
		skill_unlock : 0,    //--需要等级
		summon_type : 0,    //--召唤物
	},
];
module.exports = skill_skill_cfg;