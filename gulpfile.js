var gulp = require('gulp')
var stylus = require('gulp-stylus')
var uglify = require('gulp-uglify')
var watch = require('gulp-watch')
var concat = require('gulp-concat')
var notify = require('gulp-notify')
var jshint = require('gulp-jshint')
var bowerfiles = require('main-bower-files')
var sourcemaps = require('gulp-sourcemaps')
var order = require('gulp-order')
var debug = require('gulp-debug');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var fs = require('fs')


var APP_DIR = "./app";
var WWW_DIR = "./public";

gulp.task('hello', function(){
  console.log("Hello from gulp!");
});

/*
 * For Angular templates
 */
// gulp.task('templates', function() {
//     gulp.src([APP_DIR+'/**/*.html','!*/index.html'])
//     // .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))    
//     .pipe(templateCache({standalone:true}))
//     .pipe(gulp.dest(WWW_DIR+"/js"));
// });

gulp.task('copy-assets', function() {
    console.log("copy-assets");
    // gulp.src(APP_DIR+'/index.html')
    gulp.src(APP_DIR+'/static/**')
    .pipe(gulp.dest(WWW_DIR));
});

gulp.task('stylus', function () {
  var safe_stylus = stylus().on('error', function (e){
    console.log(e.plugin, e.name);
    console.log(e.message);
    console.log(e.plugin, "aborted");
    safe_stylus.end();
  });

  gulp.src(APP_DIR+'/styles/*.styl')
    .pipe(order(['style.styl','*.styl']))
    .pipe(safe_stylus)
    .pipe(concat("style.css"))
    .pipe(cleanCSS())    
    .pipe(gulp.dest(WWW_DIR+'/css'));
});

gulp.task('lint', function() {
  return gulp.src(APP_DIR+'/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('js', function() {
  gulp.src( APP_DIR+'/**/*.js' )
  .pipe(order(['js/app.js','*.js']))
  // .pipe(sourcemaps.init())  
  .pipe(concat("app.min.js"))
  // .pipe(uglify())
  // .pipe(sourcemaps.write('./'))  
  .pipe(gulp.dest(WWW_DIR+'/js'));
});

gulp.task('vendorjs', function() {
  return gulp.src(bowerfiles('**/*.js'))
    // .pipe(sourcemaps.init())  
    .pipe(concat('vendor.min.js'))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./'))  
    .pipe(gulp.dest(WWW_DIR+'/js'))
})

gulp.task('vendorcss', function() {
  return gulp.src(bowerfiles('**/*.css'))
    .pipe(order(['reset.css','*.css']))
    .pipe(concat('vendor.css'))
    .pipe(cleanCSS())    
    .pipe(gulp.dest(WWW_DIR+'/css'))
    // .pipe(rename(function(path) {
    //   if (~path.dirname.indexOf('fonts')) {
    //     path.dirname = '/fonts'
    //   }
    // }))
    // .pipe(gulp.dest(dist.vendor))
})



gulp.task('watch-public', function() {
  // gulp.watch(APP_DIR+'/styles/*.styl', ['stylus'] );
  // gulp.watch(APP_DIR+'/**/*.js', ['lint','js'] );
  gulp.watch(APP_DIR+'/**/*.html', ['copy-assets'] );
  // watch(WWW_DIR+'/**/*.*').pipe(connect.reload());
});

gulp.task('browsersync', ['nodemon'], function() {
  browserSync({
    proxy: "localhost:8081",  // local node app address
    port: 8080,  // use *different* port than above
    notify: true
  });
});

gulp.task('nodemon', function (cb) {
  var called = false;
  // server restarts on server changes
  return nodemon({
    script: 'server/server.js',
    watch: 'server/'
  })
  .on('start', function () {
    // prevent from being called multiple times
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    // activate browsersync on server restart
    setTimeout(function () {
      browserSync.reload({ stream: false });
    }, 500);
  });
});

gulp.task('content-reload', function() {
  browserSync.reload({ stream: false });
})

gulp.task('build', ['hello','js','lint','stylus','copy-assets','vendorjs','vendorcss',]);

gulp.task('default', ['hello','js','lint','stylus','copy-assets','vendorjs','vendorcss','browsersync'], function() {
  gulp.watch(APP_DIR+'/styles/*.styl', ['stylus', 'content-reload'] );
  gulp.watch(APP_DIR+'/**/*.js', ['lint','js','content-reload'] );
  gulp.watch(APP_DIR+'/**/*.html', ['copy-assets','content-reload'] );
});
