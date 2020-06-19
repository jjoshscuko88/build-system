const { resolve } = require('path');
const { src, dest, parallel, task } = require('gulp');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const SRC = resolve(__dirname, '../frontend/scss');
const DIST = resolve(__dirname, '../dist/styles');


task('sass', function() {
    return src(resolve(SRC, 'app.scss'))
        .pipe(sass())
        .pipe(dest(resolve(DIST)));
});

task('sass-images', function() {
    return src(resolve(SRC, 'images/**/*.+(gif|jpg|jpeg|png|svg)'))
        .pipe(imagemin())
        .pipe(dest(resolve(DIST, 'images')));
})

module.exports = parallel('sass', 'sass-images');
