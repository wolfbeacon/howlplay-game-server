const WebSocket = require('ws');
const Storage   = require('./lib/storage');
const Driver    = require('./lib/howlplay-ws-driver');
const Queue     = require('./lib/functionQueue');
const config    = require('./config/config');

// Initialize variables
let storage              = new Storage();
let connectionId         = 0;

const wss = new WebSocket.Server({ port: config.port }, ()=> {
    console.log("Started Listening On Port:", config.port);
});

wss.on('connection', (ws) => {
    console.log("New connection ...");
    // Push this socket to connection pool
    let currentId = connectionId;
    let currentConnection = {
        id: connectionId,
        lastPing: new Date(),
        dead: false,
        ws: ws
    };

    storage.data.connections[connectionId] = currentConnection;
    connectionId++;

    ws.on('message', (data) => {
        let dataView = new Uint8Array(data);
        switch(dataView[0]){
            case 0:
                Driver.handlers.pingHandler(currentConnection, data, storage).then(()=>{}).catch(()=>{});
                break;
            case 1:
                console.log("Request to set nickname");
                Driver.handlers.nicknameHandler(currentConnection, data, storage).then((nickname) => {
                    console.log("Nickname set", nickname);
                    Driver.emitters.confirmNicknameEmitter(null).then((buf) => ws.send(buf));
                }).catch(() => {
                    Driver.emitters.rejectNicknameEmitter(null).then((buf) => ws.send(buf));
                });
                break;
            case 4:
                Driver.handlers.quizHandler(currentConnection, data, storage).then((quiz) => {
                    let payload = [quiz.quizDuration];
                    Driver.emitters.confirmQuizEmitter(null).then((buf) => ws.send(buf));
                    Driver.emitters.gameDetailsEmitter(payload).then((buf) => ws.send(buf));
                }).catch(() => {
                    Driver.emitters.rejectQuizEmitter(null).then((buf) => ws.send(buf));
                });
                break;
            case 7:
                Driver.handlers.quizAnswersHandler(currentConnection, data, storage).then((answers) => {
                    let payload = [answers.index, answers.answers.length];
                    Driver.emitters.confirmAnswersEmitter(payload).then(buf => ws.send(buf));
                }).catch(() => {
                    Driver.emitters.rejectAnswersEmitter(null).then(buf => ws.send(buf));
                });
                break;
            case 14:
                console.log("Distribute game details");
                
                break;
            default:
                break;
        }
    });

    ws.on('close', async () => {
        console.log("Connection " + currentId + " is dead.");
        currentConnection.dead = true;
        await storage.data.participants.remove({_id: currentId});
    });

    // Continue to ping the client
    let pingInterval = setInterval(async () => {
        // If we haven't seen a ping in 4 seconds, set it to dead, and stop ping.
        let now = new Date();
        if((now.getTime() - currentConnection.lastPing.getTime()) > 4000) {
            clearInterval(pingInterval);
            currentConnection.ws.close();
            return;
        }
        // Otherwise, we emit ping
        Driver.emitters.pingEmitter(currentConnection, storage).then((buff) => {
            ws.send(buff);
        }).catch(() => {});
    }, 1000);
});

// Broadcasting function
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    Driver.emitters.scoreGameEmitter(data.slice(1)).then((buff) => {
      client.send(buff);
    }).catch((err) => {
      console.log(err);
    });
  });
};

async function batchHandler() {
  async function buildBatch() {
    let payload = [];
    let data = [];
    await storage.data.participants.find({}).then((docs, err) => {
      if (err) {
        console.log(err);
      } else {
        data = docs;
      }
    });

    // Go through all users, and get the new answers, move pointer to indicate checked
    console.log(data);
    for (index in data) {
      let user = data[index];
      let i = user.sentIndex;
      let answers = user.answers;
      let nickname = [];
      for (let j = 0, strLen = user.nickname.length; j < strLen; j++) {
          nickname.push(user.nickname.charCodeAt(j));
      }
      // If there are more answers for user, put into payload
      if (i != answers.length) {

        payload = payload.concat([255], Array.from(nickname), [255, i], answers.slice(i));
        await storage.data.participants.update({_id: user._id}, {$inc: { sentIndex: answers.length }});
      }
    }

    console.log("payload built");
    return new Promise(resolve => resolve(payload));
  }

  return Queue.addToQueue(buildBatch.bind(this));
}

let batchInterval = setInterval(async () => {
    // If we haven't seen a ping in 4 seconds, set it to dead, and stop ping.
    batchHandler().then(function(payload) {
      console.log("payload: " + payload);
      if (payload != []) {
        console.log("BROADCASTING");
        wss.broadcast(new Uint8Array(payload));
      }
    });
}, 5000);
