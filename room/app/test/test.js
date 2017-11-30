class pp{
    constructor(){

    }

    say(name, age){
        console.log('sya');
    }
}


function test(age,name, other) {
    let p = new pp();
    let func = p['say'];
    func.apply(this, Array.prototype.slice.call(arguments, 2))
}


// test();


const moment = require('moment')


function _genNow() {
    return moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //坑爹：注意此处格式化，否则数据库可能写入失败
}

console.log(_genNow());

const EventEmitter = require('events').EventEmitter;
const event = new EventEmitter();

event.on(100, function(value){
    console.log(100, value);

    let a = 100.01;
    let b = 23.32;
    console.log(100, value, 'a+b', a+b);
})

setInterval(function(){
    event.emit(100, 'helllo');
}, 100);



