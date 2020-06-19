const { resolve } = require('path');
const browserSync = require('browser-sync').create();
const { parallel, series, task, watch } = require('gulp');
const rimraf = require('rimraf');

const assets = require('./tasks/assets');
const js = require('./tasks/js');
const libs = require('./tasks/libs');
const nunjucks = require('./tasks/nunjucks');
const sass = require('./tasks/sass');

const FRONTEND_SRC = resolve(__dirname, 'frontend');

task('clean', function(cb) {
  rimraf(resolve(__dirname, 'dist'), cb);
});

task('build', parallel(assets, js, libs, nunjucks, sass));

task('serv', function() {
  browserSync.init({
    browser: [],
    server: {
      baseDir: './dist',
    },
    reloadDebounce: 5000,
  });

  watch(FRONTEND_SRC + '/assets/**/*.*', parallel(assets)).on('change', browserSync.reload);
  watch(FRONTEND_SRC + '/js/**/*.*', parallel(js)).on('change', browserSync.reload);
  watch(FRONTEND_SRC + '/libs/**/*.*', parallel(libs)).on('change', browserSync.reload);
  watch(FRONTEND_SRC + '/templates/**/*.*', parallel(nunjucks)).on('change', browserSync.reload);
  watch(FRONTEND_SRC + '/scss/**/*.*', parallel(sass)).on('change', browserSync.reload);
});


task('dev', series('clean', 'build', 'serv'));

task('build', series('clean', 'build'));
