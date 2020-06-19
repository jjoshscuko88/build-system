const { resolve } = require('path');
const { src, dest, parallel, task } = require('gulp');
const imagemin = require('gulp-imagemin');

const SRC = resolve(__dirname, '../frontend/assets/**/*.+(gif|jpg|jpeg|png|svg)');
const DIST = resolve(__dirname, '../dist/assets');

task('assets', function() {
  return src(SRC)
    .pipe(imagemin())
    .pipe(dest(DIST));
});

module.exports = parallel('assets');
