const SysCode = require('../../../consts/sysCode')

class FishCode extends SysCode{
    constructor(){
        super()
        this.GOLD_NOT_ENOUTH = {
            code:'3000',
            desc:'金币不足'
        };
        this.WEAPON_LEVEL_LOW = {
            code:'3001',
            desc:'武器等级不够'
        };
        this.NOT_SUPPORT_ROOMMODE = {
            code:'3002',
            desc:'不支持的房间模式'
        };
        this.NOT_SUPPORT_SCENETYPE = {
            code:'3003',
            desc:'不支持的场景类型'
        };

        this.NOT_MATCH_WEAPON = {
            code:'3004',
            desc:'武器皮肤或等级不匹配'
        };

        this.INVALID_SKILL = {
            code:'3005',
            desc:'非法技能调用'
        };

        this.INVALID_SKILL_STATE = {
            code:'3006',
            desc:'技能状态匹配'
        };
        
        this.LOCK_FAILD = {
            code:'3007',
            desc:'锁定鱼不存在'
        };

        this.INVALID_SKILL_ING = {
            code:'3008',
            desc:'技能进行中'
        };
        this.NOT_SUPPORT_OPERATE = {
            code:'3009',
            desc:'场景不支持此操作'
        };
        this.INTERFACE_DEVELOPPING = {
            code:'3010',
            desc:'接口开发中'
        };
        
        this.INVALID_WP_LASER = {
            code: '3011',
            desc: '激光能不足'
        };
        this.INVALID_WP_SKIN = {
            code: '3012',
            desc: '无此皮肤，疑似作弊'
        };
    }
}

module.exports = new FishCode();