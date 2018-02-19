const WebSocket = require('ws');
const Storage   = require('./lib/storage');
const Driver    = require('./lib/howlplay-ws-driver');

const config    = require('./config/config');

const Datastore = require('nedb-promise');

// Initialize variables
let storage              = new Storage();
let connectionId         = 0;
storage.data.connections = {};
storage.data.db = new Datastore();

storage.data.db.ensureIndex({fieldName: 'nickname', unique: true}, (err) => {});

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
                Driver.handlers.nicknameHandler(currentConnection, data, storage).then(() => {
                    Driver.emitters.confirmNicknameEmitter(currentConnection, storage).then((buf) => {
                        ws.send(buf);
                    })
                }).catch(() => {
                    Driver.emitters.rejectNicknameEmitter(currentConnection, storage).then((buf) => {
                        ws.send(buf);
                    });
                });
                break;
        }
    });

    // Continue to ping the client
    let pingInterval = setInterval(() => {
        // If we haven't seen a ping in 4 seconds, set it to dead, and stop ping.
        let now = new Date();
        if((now.getTime() - currentConnection.lastPing.getTime()) > 4000){
            currentConnection.dead = true;
            console.log("Connection " + currentId + " is dead.");
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