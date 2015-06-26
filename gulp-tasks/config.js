import gulp from 'gulp';


export const paths =  {
  source: 'source',
  build: 'build',
  bundle: 'bundle'
};

export const babelOptions = {
  modules: 'common',
  optional: ['runtime'],
  stage: 0
};


export const bundles = {
  // 'base': [
  //   'react',
  //   'co',
  //   'meepworks/client-app-driver',
  //   'meepworks/dispatcher',
  //   'meepworks/store-base',
  //   'meepworks/action-base',
  //   'meepworks/locale',
  //   'meepworks/tmpl',
  //   'meepworks/styles',
  //   'greasebox',
  //   'css'
  // ]
};

gulp.task('config', ()=>{
  console.log(JSON.stringify({
    paths,
    babelOptions,
    bundles
  }, null, 2));
});
