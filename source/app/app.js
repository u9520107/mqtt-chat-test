import React from 'react';
import Application from 'meepworks/application';
import Component from 'meepworks/component';
import mqtt from 'mqtt';
import 'normalize.css/normalize.css!';
import uuid from 'uuid';


export default class App extends Application {
  constructor(...args) {
    super(...args);
    this.state = {
      shoppers: []
    };
  }
  static title() {
    return 'Chat Demo';
  }
  render() {


    //add merchant

    //add shoppers

    return (
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          height: 44,
          width: '100%',
          top: 0,
          left: 0,
          backgroundColor: 'cornflowerblue',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Chat Demo
        </div>
        <Merchant />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexBasis: 44,
          flexShrink: 0,
          width: '100%',
          borderBottom: '1px solid gray'
        }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>Store</div>
      <AddStore onAddStore={id => {
        let list = this.state.shoppers;
        list.push({
          uuid: uuid.v4(),
          id
        });
        this.setState({
          shopper: list
        });
      }}/>
        </div>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          width: '100%',
          flex: 1
        }}>{this.state.shoppers.map((s, idx) => {
          return (
            <Shopper key={s.uuid} id={s.id} onClose={() => {
              this.state.shoppers.splice(idx, 1);
              this.setState({
                shoppers: this.state.shoppers
              });
            }}/>
          );
        })}</div>
          </div>
        </div>
    );
  }
}


class Merchant extends Component {
  constructor(props, context) {
    super(props, context);
    this.state =  {
      client: null,
      chats: {},
      counts: {},
      map: {},
      view: '',
      val: ''
    }
  }
  componentDidMount() {
    let client = mqtt.connect({
      port: 3000,
      keepalive: 60,
      username: 'merchant',
      password: '123456'
    });
    client.on('connect', () => {
      //subscribe after successful (re)connection
      client.subscribe('chat/merchant/#');

    });


    client.on('message', (topic, payload) => {
      payload = JSON.parse(payload.toString());
      let action = topic.split('/').pop();

      switch(action) {
        case 'msg':
          if(payload.sender === 'merchant') {
            if(!this.state.map[payload.id]) {
              //if the same user sends message from a different client
              this.state.chats[payload.receiver].push(payload);
              this.state.map[payload.id] = payload;
            }
            this.state.map[payload.id].sent = true;
            this.setState({
              map: this.state.map,
              chats: this.state.chats
            });

          } else {
            if(!this.state.chats[payload.sender]) {
              this.state.chats[payload.sender] = [];
              this.state.counts[payload.sender] = 0;
            }
            this.state.chats[payload.sender].push(payload);
            if(payload.sender === this.state.view ) {
              payload.read = true;
              client.publish(`chat/merchant/${payload.sender}/ack`, JSON.stringify({
                id: [payload.id],
                sender: 'merchant'
              }));
            } else {
              this.state.counts[payload.sender]++;
            }
            this.setState({
              chats: this.state.chats,
              counts: this.state.counts
            });

          }
          break;
        case 'ack':
          let changed = false;
          if(payload.sender !== 'merchant') {
            payload.id.forEach(id => {
              if(!this.state.map[id].read) {
                this.state.map[id].read = true;
                changed = true;
              }
            });
          }
          if(changed) {
            this.setState({
              chats: this.state.chats,
              map: this.state.map
            });
          }
          break;

      }
    });

    //client.on('message', (topic, payload) => {
    //  console.log(topic, payload.toString());
    //});
    this.setState({
      client
    });
  }
  sendMessage() {
    if(this.state.view === '') {
      return;
    }
    let val = this.state.val;
    let msg = {
      id: uuid.v4(),
      timestamp: new Date().getTime(),
      sender: 'merchant',
      receiver: this.state.view,
      msg: val
    };
    this.state.client.publish(`chat/merchant/${this.state.view}/msg`, JSON.stringify(msg));
    msg.sent = false;
    msg.read = false;
    this.state.map[msg.id] = msg;
    this.state.chats[this.state.view].push(msg);
    this.setState({
      chats: this.state.chats,
      map: this.state.map,
      val: ''
    });

  }
  render() {
    return (
      <div style={{
        borderBottom: '1px solid gray',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
      <header style={{
        width: '100%',
        flexBasis: 44,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid gray'
      }}>Merchant</header>
      <div style={{
        flex: 1,
        display: 'flex'
      }}>
      <aside style={{
        overflowY: 'auto',
        flexBasis: 200,
        flexShrink: 0,
        borderRight: '1px solid gray'
      }}>{Object.keys(this.state.chats).map( id => {
        let count = this.state.counts[id];
        return (
          <div style={{
            width: '100%',
            height: 34,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: this.state.view === id ? 'lightgray' : 'white'
          }}
          key={id}
          onClick={() => {
            let ackIds = [];
            this.state.chats[id].forEach(m => {
              if(!m.read) {
                m.read = true;
                ackIds.push(m.id);
              }
            });
            if(ackIds.length > 0) {
              this.state.counts[id] = 0;
              this.state.client.publish(`chat/merchant/${id}/ack`, JSON.stringify({
                id: ackIds,
                sender: 'merchant'
              }));
            }

            this.setState({
              view: id,
              chats: this.state.chats,
              counts: this.state.counts,
              val: ''
            });
          }}>{id}{count > 0 && `(${count})`}</div>
        );
      })}
    </aside>
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
    <div style={{
      flex: 1,
      overflowY: 'auto'
    }}>{this.state.view !== '' &&
      this.state.chats[this.state.view].map(m => {
        let color, status = '';
        if(m.sender === 'merchant') {
          if(m.read) {
            color = 'black';
            status = '(read)';
          } else if(m.sent) {
            color = 'gray';
            status = '(sent)';
          } else {
            color = 'lightgray'
          }

        } else {
          color = 'black'
        }


        return (
          <div style={{
            color
          }} key={m.id}>{`${m.sender}: ${m.msg}  ${status}`}
          </div>
        );
      })
    }</div>
  <input
    style={{
      flexShrink: 0
    }}
      ref="input"
      value={this.state.val}
      disabled={this.state.view === ''}
      onChange={(e) => {
        this.setState({
          val: e.currentTarget.value
        });
      }}
      onKeyDown={(e) => {
        if(e.keyCode === 13) {
          this.sendMessage();
        }
      }}
    />
    </div>

      </div>

      </div>
    );
  }
}

class Shopper extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      msgs: [],
      map: {},
      client: null,
      val: ''
    };
  }
  componentDidMount() {
    this.connect();
  }
  connect() {
    let client = mqtt.connect({
      port: 3000,
      username: this.props.id,
      password: '123456',
      keepalive: 60
    });
    client.on('connect', () => {
      client.subscribe(`chat/merchant/${this.props.id}/#`);

    });

    client.on('message', (topic, payload) => {
      payload = JSON.parse(payload.toString());
      let action = topic.split('/').pop();
      switch(action) {
        case 'msg':
          if(payload.sender === this.props.id) {
            if(!this.state.map[payload.id]) {
              //if the same user sends message from a different client
              this.state.msgs.push(payload);
              this.state.map[payload.id] = payload;
            }
            this.state.map[payload.id].sent = true;
            this.setState({
              map: this.state.map,
              msgs: this.state.msgs
            });
          } else {
            this.state.msgs.push(payload);

            payload.read = true;
            setTimeout(() => {
              client.publish(`chat/merchant/${this.props.id}/ack`, JSON.stringify({
                id: [payload.id],
                sender: this.props.id
              }));

            }, 1000);
            this.setState({
              chats: this.state.chats,
              counts: this.state.counts
            });

          }
          break;
          case 'ack':
            let changed = false;
            if(payload.sender !== this.props.id) {
              payload.id.forEach(id => {
                if(!this.state.map[id].read) {
                  this.state.map[id].read = true;
                  changed = true;
                }
              });
            }
            if(changed) {
              this.setState({
                map: this.state.map,
                msgs: this.state.msgs
              });
            }
            break;
      }
    });

    this.setState({
      client
    });

  }
  sendMessage() {
    let val = this.state.val;
    let msg = {
      id: uuid.v4(),
      timestamp: new Date().getTime(),
      sender: this.props.id,
      receiver: 'merchant',
      msg: val
    };
    this.state.client.publish(`chat/merchant/${this.props.id}/msg`, JSON.stringify(msg));
    msg.sent = false;
    msg.read = false;
    this.state.map[msg.id] = msg;
    this.state.msgs.push(msg);
    this.setState({
      msgs: this.state.msgs,
      map: this.state.map,
      val: ''
    });

  }
  componentWillUnmount() {
    if(this.state.client) {
      this.state.client.end();
    }
  }
  render() {
    return (
      <div style={{
        flexBasis: 300,
        flexShrink: 0,
        boxSizing: 'border-box',
        border: '1px solid gray',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          width: '100%',
          flexBasis: 44,
          borderBottom: '1px solid gray',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>Shopper [{this.props.id}]</div>
        <button
          style={{marginRight: 10}}
          onClick={() => {
            if(typeof this.props.onClose === 'function') {
              this.props.onClose();
            }
          }}>x</button>
      </header>
      <section style={{
        flex: 1,
        overflowY: 'auto'
      }}>
      {this.state.msgs.map(m => {
        let color;
        let status = '';
        if(m.sender === this.props.id) {
          if(m.read) {
            color = 'black';
            status = '(read)';
          } else if(m.sent) {
            color = 'gray';
            status = '(sent)';
          } else {
            color = 'lightgray';
          }
        } else {
          color = 'black';
        }
        return (
          <div style={{
            color
          }} key={m.id}>{`${m.sender}: ${m.msg}  ${status}`}
          </div>
        );
      })}
      </section>
      <input
        style={{
          flexShrink: 0
        }}
        ref="input"
        onChange={(e) => {
          let val = e.currentTarget.value;
          this.setState({
            val
          });
        }}
        onKeyDown={(e) => {
          if(e.keyCode === 13) {
            this.sendMessage();
          }
        }}
        value={this.state.val}
        />


      </div>
    );
  }
}

class AddStore extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      val: ''
    };
  }
  componentDidMount() {
    let val = React.findDOMNode(this.refs.input).value;
    this.setState({
      val
    });
  }
  validate() {
    if(this.state.val === '') {
      return false;
    }
    return /^[0-9A-Z]*$/i.test(this.state.val);
  }
  add() {
    if(!this.validate()) {
      alert('store id must be alphanumeric values only');
      return;
    }
    if(typeof this.props.onAddStore === 'function') {
      this.props.onAddStore(this.state.val);
    }
    this.setState({
      val: ''
    });
  }
  render() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}><input ref="input" value={this.state.val} onChange={(e) => {
        let val = e.currentTarget.value;
        this.setState({
          val
        });
      }}
      onKeyDown={(e) => {
        if(e.keyCode === 13) {
          this.add();
        }
      }}
      />
    <button
      disabled={!this.validate()}
      onClick={::this.add}>+</button>
      </div>
    );
  }
}
