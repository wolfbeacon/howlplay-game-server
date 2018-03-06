const util = require('../util');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function nicknameHandler (connection, data, storage) {
    console.log("Recieved Nickname");
    let nickname = util.arrayBufferToString(data.slice(1));
    let successful = false;
    return storage.addNickname(nickname, connection.id);
}

module.exports = nicknameHandler;