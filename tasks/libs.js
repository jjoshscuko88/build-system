const { resolve } = require('path');
const { src, dest, series, task } = require('gulp');

const SRC = resolve(__dirname, '../frontend/libs/**/*.*');
const DIST = resolve(__dirname, '../dist/libs');

task('libs', function() {
  return src(SRC).pipe(dest(DIST));
});

module.exports = series('libs');
