import router from 'koa-router';
import rdbdash from 'rethinkdbdash';
import * as config from './config';

const rdb = rdbdash(config.rdb);

const api = router();




export default api;
