// let fishCode = require('../logic/plugins/fish/fishCode');
// let tcKey = [];
// let tcDes = [];
// function tans(obj, name) {
//     for (let k in obj) {
//         let tt = obj[k];
//         let tk = name + tt.code;
//         tcKey.push(tk);
//         tcDes.push(tt.desc);
//     }
// }
// tans(fishCode, 'sf_code_')

// console.log(tcKey, tcDes);


class A {
    constructor () {

    }

    static sBaseField() {
        return [
            1,2,3
        ]
    }

    getBaseField () {
        return A.sBaseField();
    }
}

class B extends A {
    constructor() {
        super();
    }

    static sBaseField() {
        let a = A.sBaseField();
        let b = [4, 5, 6];
        return a.concat(b);
    }

    getBaseField () {
        return B.sBaseField();
    }
}

let a = new A();
let b = new B();
console.log('A = ', a.getBaseField());
console.log('B = ', b.getBaseField());