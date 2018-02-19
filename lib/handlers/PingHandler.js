async function pingHandler(connection, data, storage) {
    console.log("Ping Received");
    connection.lastPing = new Date();
    return new Promise((resolve, reject) => { resolve(null); });
}

module.exports = pingHandler;