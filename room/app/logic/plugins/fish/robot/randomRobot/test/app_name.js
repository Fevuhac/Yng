const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');
// const girls = require('./nickname/girls');

// girls.forEach(function(item){
// 	console.log(item);
// })
// return;
// let queryHref = "http://www.wangmingdaquan.cc/youxi/"; 	// 设置被查询的目标网址
// let queryHref = "http://www.wangmingdaquan.cc/wenyi/"; 	// 设置被查询的目标网址
// let queryHref = "http://www.wangmingdaquan.cc/weimei/"; 	// 设置被查询的目标网址
let queryHref = "http://www.wangmingdaquan.cc/nvsheng/"; 	// 设置被查询的目标网址
// let queryHref = "http://www.wangmingdaquan.cc/nansheng/"; 	// 设置被查询的目标网址

let url_config
let querySearch = 1;								// 设置分页位置
let urls = [];

let sumConut = 0;
let reptCount = 0;		// 重复的
let downCount = 0;		// 实际下载的

let pagemax = 873;		// 获取到多少页的内容
let startindex = 1;		// 从多少页开始获取

/**
 * 根据url和参数获取分页内容
 * @param {String}： url
 * @param {int}： serach
 */
var iconv = require('iconv-lite'); 



function getHtml(href, serach) {

var htmlData = [];
var htmlDataLength = 0;

	console.log("正在获取第 "+serach + " 页的图片");
	var pageData = "";
	var req = http.get(href + `list_1_${serach}.html`, function(res) {
		// res.setEncoding('utf8');	
		res.on('data', function(chunk) {
			//pageData += chunk;

			htmlData.push(chunk);
			htmlDataLength += chunk.length;
		});

		res.on('end', function() {
			var bufferHtmlData = Buffer.concat(htmlData,htmlDataLength);
			$ = cheerio.load(iconv.decode(bufferHtmlData, 'gbk').toString());
            var html = $(".home .list ul li p");
			// console.log('----html', html);
			for(var i = 0; i < html.length; i++) {
				if(html[i].children[0]){
					var src = html[i].children[0].data;
					urls.push(src)
				}

			}
			// 递归调用
			if (serach < pagemax) {
				getHtml(href, ++serach);
			}else{

				fs.appendFileSync('./nickname/girls.js', JSON.stringify(urls));
			}
		});
	});
}

function start(){
	console.log("开始获取图片连接");
	getHtml(queryHref, startindex);
}

start();

