'use strict';
require("dotenv").config();

var gulp        	= require('gulp'),
     sass         = require('gulp-sass'),
		 cssnano 			= require('gulp-cssnano'),
     plumber      = require('gulp-plumber'),
     concat       = require('gulp-concat'),
     minify 			= require('gulp-minify'),
     imagemin     = require('gulp-imagemin'),
     sourcemaps   = require('gulp-sourcemaps'),
	 rename 				= require("gulp-rename"),
     notify       = require('gulp-notify'),
		 exec 				= require('child_process').exec,
			fs 					= require('fs'),
			awspublish = require('gulp-awspublish');


var themes = {
	main: './web/css/**/main.scss', 
	scss: './web/css/scss/**/*.scss',
	css: './web/css/',
	js: './web/js/main.js',
	destination: '../../../pub/static/frontend/vendor/theme/en_US/css/'
}
 // Error message
 var onError = function (err) {
     notify.onError({
         title   : 'Gulp',
         subtitle: 'Failure!',
         message : 'Error: <%= error.message %>',
         sound   : 'Beep'
     })(err);

     this.emit('end');
 };


gulp.task('styles', function () {
    return gulp.src([themes.main])
				.pipe(plumber({errorHandler: onError}))
				.pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
				.pipe(gulp.dest(themes.css))
				.pipe(gulp.dest(themes.destination))
        .pipe(cssnano({
            discardComments: {removeAll: true},
						autoprefixer: {browsers: ['> 1%', 'last 2 versions', 'Firefox >= 20'], add: true}
        }))
        //.pipe(sourcemaps.write('.'))
        
				.pipe(rename({
  			  suffix: ".min"
  			}))
				.pipe(gulp.dest(themes.css));
});

gulp.task('production', function () {
    return gulp.src([themes.main])
				.pipe(plumber({errorHandler: onError}))
				.pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(cssnano({
            discardComments: {removeAll: true},
						autoprefixer: {browsers: ['> 1%', 'last 2 versions', 'Firefox >= 20'], add: true}
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(themes.css))
				//.pipe(rename({
  			//  prefix: "base-",
  			//  suffix: ".min"
  			//}))
				.pipe(gulp.dest(themes.destination));
});

// Publish to AWS S3
gulp.task('publish', function() {
	var publisher = awspublish.create({
	"region": process.env.REGION,
  "params": {
    "Bucket": process.env.BUCKET
  },
  "credentials": {
    "accessKeyId": process.env.ACCESSKEYID,
    "secretAccessKey": process.env.SECRETEACCESSKEY,
    "signatureVersion": "v3"
  }
});
	  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };
  return gulp.src('./web/css/main.min.css')
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('publish-js', function() {
	var publisher = awspublish.create({
	"region": process.env.REGION,
  "params": {
    "Bucket": process.env.BUCKET
  },
  "credentials": {
    "accessKeyId": process.env.ACCESSKEYID,
    "secretAccessKey": process.env.SECRETEACCESSKEY,
    "signatureVersion": "v3"
  }
});
	  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };
  return gulp.src('./web/js/main.js')
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});


// Copy all static images 
gulp.task('images', function() {
  return gulp.src('./web/images/*')
    // Pass in options to the task 
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('./web/images/'));
});

gulp.task('js', function() {
  return gulp.src('./web/js/main.js')
			.pipe(rename({
  			  suffix: ".min"
  			}))
    .pipe(gulp.dest('./web/js/'));
});

// Rerun the task when a file changes 
gulp.task('watch', function() {
  gulp.watch([themes.main, themes.scss, themes.js], ['styles', 'js'])
	.on('change', function(event){
		console.log('File' + event.path + ' was ' + event.type + ', running tasks...');
		console.log(themes.name);
	});
});


// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['styles', 'js', 'watch']);

gulp.task('minify', ['production', 'compile']);
