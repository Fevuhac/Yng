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


test();



