import gulp from 'gulp';
import co from 'co';
import * as gb from 'greasebox';
import path from 'path';
import plumber from 'gulp-plumber';
import * as config from './config';
import { spawnServer, killServer} from './server';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';




const sourceDir = path.resolve(__dirname, `../${config.paths.source}`) + path.sep;
const sourceDirCheck = new RegExp('^' + escapeRegExp(sourceDir.replace('/', '\/')), 'i');
const jsCheck = /\.(js|jsx)$/i;
const stylusCheck = /\.styl$/i;
const jsonCheck = /\.json$/i;
function escapeRegExp(str) {
  return str.replace(/([.*+?^${}|\[\]\/\\])/g, "\\$1");
}

function isSource(path) {
  return sourceDirCheck.test(path);
}

function isJavascript(path) {
  return jsCheck.test(path);
}

function isStylus(path) {
  return stylusCheck.test(path);
}

function isJSON(path) {
  return jsonCheck.test(path);
}

gulp.task('watch', ['server'], () => {
  gulp.watch(`${config.paths.source}/**`)
    .on('change', (change) => {
        if(isSource(change.path) &&
          (change.type === 'renamed' || change.type === 'added' || change.type === 'changed')) {
          if(isJavascript(change.path)) {
            killServer();
            console.log(`building: ${change.path}`);
            co(function * () {
              yield new Promise((resolve) => {
                gulp.src(change.path, {
                  base: sourceDir
                })
                .pipe(plumber({
                  errorHandler: (err) => {
                    console.log(err);
                    resolve();
                  }
                }))
                .pipe(sourcemaps.init())
                .pipe(babel(config.babelOptions))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(config.paths.build))
                .on('end', resolve);
              });
              spawnServer();
            });
          } else if(isJSON(change.path)) {
            //usually configs
            killServer();
            console.log(`copy: ${change.path}`);
            co(function * () {
              yield new Promise((resolve) => {
                gulp.src(change.path, {
                  base: sourceDir
                })
                .pipe(plumber({
                  errorHandler: (err) => {
                    console.log(err);
                    resolve();
                  }
                }))
                .pipe(gulp.dest(config.paths.build))
                .on('end', resolve);
              });
              spawnServer();
            });
          } else {
            console.log(`copy: ${change.path}`);
            killServer();
            co(function * () {
              yield new Promise((resolve) => {
                gulp.src(change.path, {
                  base: sourceDir
                })
                .pipe(plumber({
                  errorHandler: (err) => {
                    console.log(err);
                    resolve();
                  }
                }))
                .pipe(gulp.dest(config.paths.build))
                .on('end', resolve);
              });
              spawnServer();
            });
          }
        }
    })
    .on('error', console.log);
});
