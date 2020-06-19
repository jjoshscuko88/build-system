const { resolve } = require('path');
const { src, dest, series, task } = require('gulp');
const nunjucks = require('gulp-nunjucks');
const ext_replace = require('gulp-ext-replace');

const SRC = resolve(__dirname, '../frontend/templates/*.njk');
const DIST = resolve(__dirname, '../dist');

task('nunjucks', function() {
  return src(SRC)
    .pipe(nunjucks.compile())
    .pipe(ext_replace('.html'))
    .pipe(dest(DIST))
});

module.exports = series('nunjucks');
