const fs = require('fs');
const path = require('path');

let fileArr = [];
function readFile(read_url, name){
    console.log('read_url:',read_url);
    fs.readdir(read_url, function(err, files){
        if(err){console.log(err);return;}
        files.forEach(function(filename){
            fs.stat(path.join(read_url, filename), (err, stats)=>{
                if(err) throw err;
                if(stats.isFile()){
                    let newUrl = `\'upload/${name}/${filename}\',`;
                    console.log('newUrl:', newUrl);
                    console.log('filename:', filename);
                    // fileArr.push(newUrl);
                    writeFile(newUrl);
                }else if(stats.isDirectory()){
                    // var dirName = filename;
                    // readFile(path.join(readurl,filename),name+'/'+dirName);
                    //利用arguments.callee(path.join())这种形式利用自身函数，会报错
                    //arguments.callee(path.join(readurl,filename),name+'/'+dirName);
                }
            })
        })
    })
}

function writeFile(data){
    fs.appendFile('./figure_url_girls.js', data, function(err){
        if(err) throw err;
        console.log('写入成功');
    })
}

readFile('./upload/girls/', 'girls');