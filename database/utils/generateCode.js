module.exports.genAccount = function () {

    function generateCode(key, tag) {
        fs.appendFile('code.js', `set ${key}(value){
        this._modify(account_def.${tag}.${key}.name, value);
    }
    get ${key}(){
        return this._value(account_def.${tag}.${key}.name);
    }`)
    }

}