import gulp from 'gulp';
import co from 'co';
import path from 'path';
import plumber from 'gulp-plumber';
import * as gb from 'greasebox';
import * as config from './config';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

const jsFiles = `${config.paths.source}/**/*.js`;
const copyFiles = [`${config.paths.source}/**`, `!${jsFiles}`];


gulp.task('build', ['build:js', 'build:copy', 'bundle'], () => {});

gulp.task('build:js', ['clean'], (cb) => {
  gulp.src(jsFiles)
    .pipe(plumber({
      errorHanlder: cb
    }))
    .pipe(sourcemaps.init())
    .pipe(babel(config.babelOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.build))
    .on('end', cb);
});

//mainly configs in json format
gulp.task('build:copy', ['clean'], (cb) => {
  gulp.src(copyFiles)
    .pipe(plumber({
      errorHanlder: cb
    }))
    .pipe(gulp.dest(config.paths.build))
    .on('end', cb);
});

