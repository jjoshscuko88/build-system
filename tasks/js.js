const { resolve } = require('path');
const { src, dest, series, task } = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

const SCRIPTS = [
  'features/Modal/index.js',
  'app.js',
];

const SRC = resolve(__dirname, '../frontend/js');
const DIST = resolve(__dirname, '../dist/js');

task('js', function() {
  return src(SCRIPTS.map(script => resolve(SRC, script)))
    .pipe(concat('app.js'))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(dest(DIST));
});

module.exports = series('js');
