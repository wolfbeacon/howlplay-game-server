const WebSocket = require('ws');
const Storage   = require('./lib/storage');
const Driver    = require('./lib/howlplay-ws-driver');

const config    = require('./config/config');

// Initialize variables
let storage              = new Storage();
let connectionId         = 0;
storage.data.connections = {};

const wss = new WebSocket.Server({ port: config.port });


wss.on('connection', (ws) => {
    console.log("New connection ...");
    // Push this socket to connection pool
    let currentId = connectionId;
    let currentConnection = {
        ws: ws,
        lastPing: new Date(),
        dead: false
    };
    storage.data.connections[connectionId] = currentConnection;
    connectionId++;

    ws.on('message', (data) => {
        let dataView = new Uint8Array(data);
        switch(dataView[0]){
            case 0:
                Driver.handlers.pingHandler(currentConnection, data, storage).then(()=>{}).catch(()=>{})
                break
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