/**
 * Handle ping response
 * @param connection
 * @param data
 * @param storage
 */
async function pingHandler(connection, data, storage) {
    connection.lastPing = new Date();
    return new Promise(resolve => resolve(null));
}

module.exports = pingHandler;