/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

//import path from 'path';
import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
//import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {output as pagespeed} from 'psi';
//import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const runSequence = require('run-sequence');
const babel = require('gulp-babel');
const gulpIf = require('gulp-if');

// changes for sw idb import
gulp.task('sw', () => {
  const b = browserify({
    debug: true
  });
  return b
  .transform(babelify)
  .require('app/sw.js', {entry:true})
  .bundle()
  .pipe(source('sw.js'))
  .pipe(gulp.dest(".tmp"))
  .pipe(gulp.dest("./dist"))
});

// changes for sw dbhelper import
gulp.task('dbhelper', () => {
  const b = browserify({
    debug: true
  });
  return b
  .transform(babelify)
  .require('app/js/dbhelper.js', {entry:true})
  .bundle()
  .pipe(source('dbhelper.js'))
  .pipe(gulp.dest(".tmp"))
  .pipe(gulp.dest("./dist"))
});

// Lint JavaScript
gulp.task('lint', () =>
   gulp.src(['app/js/**/*.js','app/sw.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

gulp.task('lint-fix', () =>{
  return gulp.src(['app/sw.js', 'app/js/dbhelper.js', '!node_modules/**'])
  .pipe($.eslint({
    fix: true,
  }))
  .pipe($.eslint.format())
  .pipe(gulpIf(isFixed, gulp.dest('dist')))
  .pipe($.eslint.failAfterError())
});

// Optimize images
 gulp.task('images', () =>
  gulp.src('app/img/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'image'}))
); 

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/css/**/*.scss',
    'app/css/**/*.css'
  ])
    .pipe($.newer('.tmp/css'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'css'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('.tmp/css'));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts', () =>
    gulp.src(['./app/js/**/*.js'])
      .pipe($.newer('.tmp/js'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/js'))
      .pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'js'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/js'))
      .pipe(gulp.dest('.tmp/js'))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['js', 'css', 'sw'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/css/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/js/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['app/img/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'copy',
    ['lint', 'html', 'styles','scripts', 'sw', 'images'],
    //'lint-fix',
    //'generate-service-worker',
    cb
  )
);

// Run PageSpeed Insights
gulp.task('pagespeed', cb =>
  // Update the below URL to the public URL of your site
  pagespeed('example.com', {
    strategy: 'mobile'
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb)
);

