//==============================================================================
// import
//==============================================================================
var FishModel = require('./src/mgr/FishModel');
let fm = new FishModel(function (name, data) {
    console.log('--------evtname = ', name, data);
});
fm.init('scene_mutiple_1');

let fish_dt = 5; //秒
setInterval(function () {
    fm.checkNewFish(fish_dt);
}, fish_dt*1000);

