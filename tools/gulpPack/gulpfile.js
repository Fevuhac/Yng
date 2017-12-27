const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const git = require('gulp-git');
const uglify = require('gulp-uglify'); //混淆、压缩
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint'); //代码语法检查
const concat = require('gulp-concat'); //合并代码，即将项目中各种JS合并成一个JS文件
const zip = require('gulp-zip'); //zip压缩
const scp = require('gulp-scp2');

const runSequence = require('run-sequence');
const argv = require('minimist')(process.argv.slice(2)); //读取命令行参数
const fs = require('fs');
const path = require('path');
const del = require('del');
const moment = require('moment');

const config = require('./pack.config');

const exclude = new Set(['node_modules', 'dist']);

const DEST_DIR = 'dist/';
const ORIGIN_DIR = 'origin/';
const SRC_MAP = 'src-map';

let pkgName = '';

//gulp checkout --tag v1.0.0
gulp.task('checkout', ['commit'], function () {
  let gitTag = argv.tag || config.gitTag;
  git.checkout(gitTag, function (err) {
    if (err) throw err;
  });
});

gulp.task('prod', function (cb) {
  // runSequence('clean', 'eslint', ['mix', 'copy'], 'zip', 'scp', cb);
  // runSequence('clean', ['mix', 'copy'], 'zip', 'scp', cb);
  // runSequence('clean', ['mix', 'copy'],'copyCfg', 'zip','scp', cb);
  // runSequence('mix', ['copy'], 'zip', cb);
  // runSequence('copy', ['zip'], cb);
  // runSequence('copyCfg', cb);
  // runSequence('clean', ['mix', 'copy'], cb);
  runSequence('zip', 'scp', cb);
  // runSequence('eslint', cb);
});

gulp.task('clean', function () {
  return del([
    //删除
    'dist/**/*',
    //保留
    '!dist/**/*.json'
  ]);
});

gulp.task('copyCfg', function(){

  let output_cfgs = config.output.cfgs;
  let t = null;
  output_cfgs.forEach(function(cfg){
    t = gulp.src(config.input.cfgs)
    .pipe(gulp.dest(cfg));
  });

  return t;
});

gulp.task('copy', function () {
  return gulp.src(config.input.plugins)
    .pipe(gulp.dest(config.output.plugins));
});

gulp.task('commit', function () {
  return gulp.src(SRC_DIR)
    .pipe(git.add())
    .pipe(git.commit());
});

// 监视文件变化，自动执行任务
gulp.task('watch', function () {
  return gulp.watch(config.input.js, ['mix']);
});

gulp.task('zip', function () {
  let timeStamp = moment().format("YYYYMMDHHmmss");
  pkgName = `fishjoy${timeStamp}.zip`;
  console.log('pkgName:', pkgName);
  return gulp.src(config.input.zip)
    .pipe(zip(pkgName))
    .pipe(gulp.dest(config.output.zip));
});

gulp.task('scp', function () {
  return gulp.src(config.output.zip + pkgName)
    .pipe(scp({
      host: config.scp.host,
      username: config.scp.username,
      password: config.scp.password,
      dest: config.scp.remotePath
    }))
    .on('error', function (err) {
      console.log(err);
    });
});

gulp.task('eslint', function () {
  return gulp.src(config.input.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('error', function (err) {
      console.log('eslint error:', err.stack);
      gulp.emit('end');
    });
});

gulp.task('map', function () {
  return gulp.src(config.input.js)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: [
        ["transform-runtime", {
          "polyfill": false,
          "regenerator": true
        }]
      ]
    }))
    .pipe(sourcemaps.write(config.output.sourcemap))
    .on('error', function (err) {
      console.log('eslint error:', err.stack);
      gulp.emit('end');
    });
});


gulp.task('mix', function () {
  return gulp.src(config.input.js)
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: [
        ["transform-runtime", {
          "polyfill": false,
          "regenerator": true
        }]
      ]
    }))
    // 压缩混淆
    .pipe(uglify())
    //重命名
    // .pipe(rename({ extname: '.min.js' }))
    //合并成一个文件
    // .pipe(concat('index.min.js'))
    // 3\. 另存压缩后的文件
    .pipe(gulp.dest(config.output.dist))
    .on('error', function (err) {
      console.log(err.stack);
      gulp.emit('end');
    });
});