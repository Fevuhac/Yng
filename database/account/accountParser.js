const accountConf = require('./accountConf');

class AccountParser {
    /**
     * 序列化对象为redis value
     * @param key
     * @param value
     * @returns {*}
     */
    serializeValue(key, value, isDefault) {
        isDefault = isDefault || true;
        let serialVal = null;
        let typeInfo = accountConf.getFieldDef(key);
        if (!typeInfo) {
            console.log('非法字段，请检查字段名是否正确', __filename, key)
            return '';
        }

        if ((null == value || undefined == value || '' == value) && isDefault) {
            serialVal = typeInfo.def;
        }

        switch (typeInfo.type) {
            case 'float':
            case 'number':{
                if(value.toString == undefined){
                    logger.error('---------serializeValue-------',key, value,);
                }
                serialVal = value.toString();
            }
                break;
            case 'string':
            case 'timestamp': {
                if (typeof value === 'object') {
                    serialVal = JSON.stringify(value);
                }
                else {
                    serialVal = value;
                }
            }
                break;
            case 'object': {
                if (typeof value === 'string') {
                    serialVal = value;
                }
                else {
                    serialVal = JSON.stringify(value);
                }
            }
                break;
            default:
                break;
        }

        return serialVal || '';
    }

    /**
     * 解析redis数据
     * @param key
     * @param val
     * @returns {null}
     */
    parseValue(key, value, isDefault) {
        if(key == 'cash'){
            console.log('aaaaaa');
        }

        isDefault = isDefault || true;
        let serialVal = null;
        let typeInfo = accountConf.getFieldDef(key);
        if (!typeInfo) {
            console.log('解析redis数据失败，非法字段，请检查字段名是否正确', __filename, key)
            return null;
        }

        if ((null == value || undefined == value || '' == value) && isDefault) {
            serialVal = typeInfo.def;
        }

        switch (typeInfo.type) {
            case 'float':
            case 'number': {
                if (isNaN(Number(value))) {
                    serialVal = 0;
                }
                else {
                    serialVal = Number(value);
                }
            }
                break;
            case 'string':
            case 'timestamp': {
                serialVal = value;
            }
                break;
            case 'object': {
                try {
                    if (typeof value === 'object') {
                        serialVal = value;
                    }
                    else {
                        serialVal = JSON.parse(value);
                    }
                } catch (err) {
                    console.log("---can not JSON.parse ", key, value);
                }
            }
                break;
            default:
                break;
        }

        return serialVal;
    }
}


module.exports = new AccountParser();