const WebSocket = require('ws');
const Storage   = require('./lib/storage');
const Driver    = require('./lib/howlplay-ws-driver');
const Queue     = require('./lib/functionQueue');
const config    = require('./config/config');
const util      = require('./lib/util');

// Initialize variables
let storage              = new Storage();
let connectionId         = 0;
let startTime            = new Date();

const port = process.env.port  || config.port;
const wss = new WebSocket.Server({ port: port}, ()=> {
    console.log("Started Listening On Port:", port);
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
        // console.log(dataView[0]);
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
            case 12:
                console.log("LET ZE GAMES BEGIN!");
                wss.broadcast((client) => { 
                    Driver.emitters.startGameEmitter().then((buf) => { client.send(buf) });
                });
                break;
            case 13:
                console.log("End Ze Game!");
                wss.broadcast((client) => { 
                    Driver.emitters.endGameEmitter().then((buf) => { client.send(buf) }); 
                });
                break;
            case 14:
                console.log("Distribute game details");
                Driver.handlers.gameDetailsHandler(currentConnection, data, storage).then((users) => {
                  var buffer = util.stringToArrayBuffer(JSON.stringify(users));
                  Driver.emitters.gameDetailsEmitter(buffer).then((buf) => {
                    console.log("Sending buf");
                    ws.send(buf);
                  });
                }).catch(() => {
                  ws.send("Failed to retrieve players");
                });
                break;
            case 15:
                console.log("Return the start datetime (Should be made to be dependent on protocol 12)");
                var buffer = util.stringToArrayBuffer(String(startTime));
                Driver.emitters.gameStartTimeEmitter(buffer).then((buf) => {
                  ws.send(buf);
                });
            default:
                break;
        }
    });

    ws.on('error', (e) => {
        console.log("Websocket error", e)
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
wss.broadcast = function broadcast(callback) {
  wss.clients.forEach(function each(client) {
    callback(client);
  });
};
