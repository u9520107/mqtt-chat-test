import router from 'koa-router';
import rdbdash from 'rethinkdbdash';
import * as config from './config';

const rdb = rdbdash(config.rdb);

const api = router();



api.get('/chat-history/:merchantId', function * () {
  let data = yield rdb.db('chat_server').table('msgs').getAll(this.params.merchantId, {
    index: 'merchant'
  }).run();
  this.body = {
    data
  };
});

api.get('/chat-history/:merchantId/:shopperId', function * () {
  let data = yield rdb.db('chat_server').table('msgs').getAll([this.params.merchantId, this.params.shopperId], {
    index: 'merchantAndShopper'
  }).run();
  this.body = {
    data
  };

});


export default api;
