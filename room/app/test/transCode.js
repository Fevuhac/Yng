let fishCode = require('../logic/plugins/fish/fishCode');
let tcKey = [];
let tcDes = [];
function tans(obj, name) {
    for (let k in obj) {
        let tt = obj[k];
        let tk = name + tt.code;
        tcKey.push(tk);
        tcDes.push(tt.desc);
    }
}
tans(fishCode, 'sf_code_')

console.log(tcKey, tcDes);