import gulp from 'gulp';
import cp from 'child_process';
import path from 'path';
import co from 'co';
import cofs from 'greasebox/cofs';
import * as config from './config';


gulp.task('bundle', ['clean:bundle'], (cb) => {

  co(function * () {
    let configPath = path.resolve(__dirname, '../jspm_packages/config.js');
    if(!(yield cofs.exists(path.resolve(__dirname, '../bundle')))) {
      yield cofs.mkdir(path.resolve(__dirname, '../bundle'));
    }
    if(yield cofs.exists(configPath)) {
      if(/^win/i.test(process.platform)) {
        cp.execSync('jspm unbundle', {
          stdio: 'inherit'
        });
        //console.log(yield exec('jspm unbundle'));
      } else {
        yield new Promise((resolve, reject) => {
          cp.spawn('jspm', ['unbundle'], {
            stdio: 'inherit'
          }).on('err', reject)
            .on('exit', () => {
              resolve();
            });
        });
      }
      //bundle
      let bundledModules = [];

      for(let bundle in config.bundles) {
        let exp = config.bundles[bundle].join(' + ');
        if(bundledModules.length > 0) {
          exp += ` - ${bundledModules.join(' - ')}`;
        }
        config.bundles[bundle].forEach((b) => {
          if(bundledModules.indexOf(b) === -1) {
            bundledModules.push(b);
          }
        });

        let fname = path.resolve(config.paths.bundle, `${bundle}.js`);
        if(/^win/i.test(process.platform)) {
          cp.execSync(`jspm bundle ${exp} ${fname} --inject`, {
            stdio: 'inherit'
          });
        } else {
          yield new Promise((resolve, reject) => {

            cp.spawn('jspm', ['bundle', exp, fname, '--inject'], {
              stdio: 'inherit'
            }).on('err', reject)
            .on('exit', ()=> {
              resolve();
            });
          });
        }
      }

    }
  }).then(cb)
    .catch(cb);
});
