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
    let nickname = null;
    if (data !== undefined) {
        nickname = util.arrayBufferToString(data.slice(1));
    }
    let successful = false;
    try {
        if (nickname !== null && nickname !== undefined && nickname.match(/^[a-z0-9]+$/i) !== null) {
            await storage.data.participants.insert({_id: connection.id, nickname: nickname});
            successful = true;
        }
    } catch (err) {
        console.log(err);
    } finally {
        return new Promise((resolve, reject) => {
            if (successful) {
                console.log("Added nickanme");
                resolve();
            } else {
                reject(new Error("Could not add nickname"));
            }
        });
    }
}

module.exports = nicknameHandler;