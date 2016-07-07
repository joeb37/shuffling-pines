var gulp = require('gulp');
var distributionDir = 'dist';

// Microtasks
var concat = require("gulp-concat");
var jshint = require("gulp-jshint");
var uglify = require("gulp-uglify");
var minifycss = require("gulp-minify-css");
var connect = require('gulp-connect');
var Server = require('karma').Server;

// **********************************************************

gulp.task('buildApp', function(){
  return gulp.src(['src/js/**/*.js'])
  .pipe(concat("application.js"))
  .pipe(uglify())
  .pipe(gulp.dest(distributionDir))
  .pipe(connect.reload());
});

gulp.task('buildVendor', function(){
  return gulp.src(['bower_components/jquery/dist/jquery.min.js',
                   'bower_components/bootstrap/dist/js/bootstrap.min.js',
                   'bower_components/angular/angular.min.js'])
  .pipe(concat("vendors.js"))
  .pipe(uglify())
  .pipe(gulp.dest(distributionDir));
});

gulp.task('buildCSS', function(){
  return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css',
                   'src/css/**/*.css'])
  .pipe(concat('styles.css'))
  .pipe(minifycss())
  .pipe(gulp.dest(distributionDir))
  .pipe(connect.reload());;
});

gulp.task('moveHTML', function(){
  return gulp.src('./src/**/*.html')
  .pipe(gulp.dest(distributionDir))
  .pipe(connect.reload());;
});

gulp.task('build', ['buildApp', 'buildVendor', 'buildCSS', 'moveHTML']);

// **********************************************************

gulp.task('karma', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('jshint', function(){
  return gulp.src(['src/js/**/*.js', 'src/tests/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['karma', 'jshint']);

// **********************************************************

gulp.task('connect', function(){
  connect.server({
    root: distributionDir,
    livereload: true
  });
});

gulp.task('watch', function(){
  gulp.watch('src/tests/**/*.js', ['test']);
  gulp.watch('src/js/**/*.js', ['test', 'buildApp']);
  gulp.watch('src/css/**/*.css', ['buildCSS']);
  gulp.watch('src/**/*.html', ['test', 'moveHTML']);
});

// **********************************************************

gulp.task('zip', function(){
  var zip = require("gulp-zip");
  return gulp.src(['!bower_components', '!bower_components/**',
                   '!node_modules', '!node_modules/**',
                   '!dist', '!dist/**',
                   '**', '.jshintrc', '.gitignore'])
    .pipe(zip('shuffling-pines.zip'))
    .pipe(gulp.dest(distributionDir));
});

// **********************************************************

gulp.task('default', ['build', 'test', 'watch', 'connect']);
