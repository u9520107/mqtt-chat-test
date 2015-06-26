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
    console.log(packet, client.username);


  }
});


//setInterval(() => {
//  server.publish({
//    topic: 'chat/merchant/' + uuid.v4(),
//    qos: 1,
//    payload: 'test'
//  });
//}, 1000);

//merchant => shopper : /chat/merchant/shopper/msg
//payload: {
//  sender: 'merchant',
//  msg: 'msg'
//};
//
//  /chat/merchant/shopper/ack
//  payload: {
//    sender: 'shopper',
//    msgId: 'msgId'
//  }


const broker = {
};

export default broker;
