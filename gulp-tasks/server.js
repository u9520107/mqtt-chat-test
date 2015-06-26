import gulp from 'gulp';
import cp from 'child_process';
import * as config from './config';

let _p;

gulp.task('server', ['build'], () => {
  spawnServer();
});

export function spawnServer() {
  if(_p) {
    _p.kill();
  }
  _p = cp.spawn('node', ['--harmony', `${config.paths.build}/server`], {
    stdio: 'inherit'
  });
}

export function killServer() {
  if(_p) {
    _p.kill();
  }
}
process.on('exit', killServer);
