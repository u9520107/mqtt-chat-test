import mosca from 'mosca';
import * as config from './config';
import IoRedis from 'ioredis';
import chalk from 'chalk';
import uuid from 'uuid';
import rdbdash from 'rethinkdbdash';

const rdb = rdbdash(config.rdb);

const moscaSettings = {
  port: config.broker.port || 1883,
  http: {
    port: 3000
  },
  backend: {
    type: 'redis',
    redis: IoRedis,
    db: 12,
    port: config.redis.port || 6379,
    return_buffers: true,
    host: config.redis.host || 'localhost'
  },
  persistence: {
    factory: mosca.persistence.Redis
  }
};
const redis = new IoRedis({
  host: '192.168.56.11'
});
const server = new mosca.Server(moscaSettings);

server.authentication = (client, username, password, cb) => {
  if(username !== void 0) {
    client.username = username;
    return cb(null, true);
  }
};

server.on('ready', () => {
  console.log(`${chalk.cyan('[mosca]')} listening to ${moscaSettings.port}`);
});

server.on('published', (packet, client) => {
  if(client) {

    let topic = packet.topic;
    let payload = JSON.parse(packet.payload.toString());

    let action = topic.split('/').pop();
    let merchant = 'merchant';
    let shopper = topic.split('/')[2];

    //let data = {
    //  id: merchant,
    //  chats: {}
    //};
    //data.chats[shopper] = {};

    //if(action === 'msg') {
    //  payload.read = false;
    //  payload.sent = true;
    //  data.chats[shopper][payload.id] = payload;

    //  rdb.branch(
    //    rdb.db('chat_server').table('chats').get(merchant),
    //    rdb.db('chat_server').table('chats').update(data),
    //    rdb.db('chat_server').table('chats').insert(data)
    //  ).run();

    //} else if(action === 'ack') {

    //  payload.id.forEach(id => {
    //    data.chats[shopper][id] = {
    //      read: true
    //    };
    //  })
    //  rdb.db('chat_server').table('chats').get(merchant).update(data).run();
    //}

    if(action === 'msg') {
      payload.read = false;
      payload.sent = true;
      payload.merchant = merchant;
      payload.shopper = shopper;

      rdb.db('chat_server').table('msgs').insert(payload).run();

    } else if(action === 'ack') {

      rdb.db('chat_server').table('msgs').getAll(...payload.id).update({
        read: true
      }).run();
    }

  }
});




const broker = {
};

export default broker;
