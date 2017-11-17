//游戏物品ID定义
let GoodType = {
    Cherry: 1, //樱桃
    Orange: 2, //橙子
    Pineapple: 3, //菠萝
    Watermelon: 4, //西瓜
    Starfish: 5, //海星
    CoffeeChip: 6, //咖啡色筹码
    RedChip: 7, //红色筹码
    BlueChip: 8, //蓝色筹码
    Crown: 9, //皇冠
    Rectangle1: 10, //矩形物品1
    Rectangle2: 11, //矩形物品2
    Rectangle3: 12, //矩形物品3
};

//道具ID定义
let Props = {
    WhiteFinger: 1, //白色手指
    PinkFinger: 2, //粉色手指
    BlueFinger: 3, //蓝色手指
    GoldRightFoot: 4,//黄金右脚
};

//9宫格连续编码定义
let LinesCode9 = [123, 456, 789, 147, 258, 369, 159, 357];

let GoodsId = [
    GoodType.Cherry,  //水果
    GoodType.Orange,
    GoodType.Pineapple,
    GoodType.Watermelon,

    GoodType.Starfish,

    GoodType.CoffeeChip,//筹码
    GoodType.RedChip,
    GoodType.BlueChip,

    GoodType.Crown,
    GoodType.Rectangle1,
    GoodType.Rectangle2,
    GoodType.Rectangle3,

]

//中奖类型
let WinType = {
    Cherry: 0, //樱桃x3 或者全屏
    Orange: 1, //橙子x3 或者全屏
    Pineapple: 2, //菠萝x3或者全屏
    Watermelon: 3, //西瓜x3或者全屏
    Starfish: 4,//海星x3或者全屏
    CoffeeChip: 5, //咖啡色筹码x3或者全屏
    RedChip: 6, //红色筹码x3或者全屏
    BlueChip: 7, //蓝色筹码x3或者全屏

    AnyChip: 8, //任意筹码x3或者全屏
    AnyFruit: 9, //任意水果x3或者全屏

    CrownXN: 10 //皇冠x2以上
};

let WinTypeMapping ={}
WinTypeMapping[GoodType.Cherry] = WinType.Cherry
WinTypeMapping[GoodType.Orange] = WinType.Orange
WinTypeMapping[GoodType.Pineapple] = WinType.Pineapple
WinTypeMapping[GoodType.Watermelon] = WinType.Watermelon
WinTypeMapping[GoodType.Starfish] = WinType.Starfish
WinTypeMapping[GoodType.CoffeeChip] = WinType.CoffeeChip
WinTypeMapping[GoodType.RedChip] = WinType.RedChip
WinTypeMapping[GoodType.BlueChip] = WinType.BlueChip


//中奖赔率定义
let Rate = {};
Rate[WinType.Cherry] = {line: 10, full: {base: 27, ext: 12}};
Rate[WinType.Orange] = {line: 10, full: {base: 36, ext: 16}};
Rate[WinType.Pineapple] = {line: 14, full: {base: 45, ext: 20}};
Rate[WinType.Watermelon] = {line: 20, full: {base: 54, ext: 24}};
Rate[WinType.Starfish] = {line: 18, full: {base: 36, ext: 16}};
Rate[WinType.CoffeeChip] = {line: 30, full: {base: 54, ext: 24}};
Rate[WinType.RedChip] = {line: 50, full: {base: 63, ext: 28}};
Rate[WinType.BlueFinger] = {line: 70, full: {base: 72, ext: 32}};
Rate[WinType.AnyChip] = {line: 0, full: {base: 27, ext: 12}};
Rate[WinType.AnyFruit] = {line: 0, full: {base: 12, ext: 10}};
Rate[WinType.CrownXN] = [0, 2, 5, 20, 30, 40, 60, 80, 90];

//奖池滚动速度定义
let RollSpeed = {
    Err: -1,
    V1: {
        index: 0,
        min: 20,
        max: 50
    },
    V2: {
        index: 1,
        min: 51,
        max: 100
    },
    V3: {
        index: 2,
        min: 101
    }
};

let RollParam = {};
RollParam[RollSpeed.V1] = {time: 3000, chips: 10};
RollParam[RollSpeed.V2] = {time: 2000, chips: 10};
RollParam[RollSpeed.V3] = {time: 1000, chips: 10};
RollParam.getSpeed = function (persons) {
    let index = RollSpeed.Err;
    if (persons >= RollSpeed.V1.min && persons <= RollSpeed.V1.max) {
        index = RollSpeed.V1.index;
    } else if (persons >= RollSpeed.V2.min && persons <= RollSpeed.V2.max) {
        index = RollSpeed.V2.index;
    } else if (persons >= RollSpeed.V3.min) {
        index = RollSpeed.V3.index;
    }
    return index;
};

//筹码类型定义
let ChipType = {
    YellowChip: 1,
    PurpleChip: 2
};

let CoinMapping = {}
CoinMapping[ChipType.YellowChip] = 'card'
CoinMapping[ChipType.PurpleChip] = 'coin'

module.exports.GoodType = GoodType;
module.exports.Props = Props;
module.exports.WinType = WinType;
module.exports.Rate = Rate;
module.exports.RollSpeed = RollSpeed;
module.exports.RollParam = RollParam;
module.exports.ChipType = ChipType;
module.exports.CoinMapping = CoinMapping
module.exports.LinesCode9 = LinesCode9
module.exports.GoodsId = GoodsId
module.exports.WinTypeMapping = WinTypeMapping

