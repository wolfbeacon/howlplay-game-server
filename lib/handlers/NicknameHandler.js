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
    try {
        if (nickname.match(/^[a-z0-9]+$/i) !== null) {
            await storage.data.participants.insert({_id: connection.id, nickname: nickname, quizValidated: false, answers: null});
            return new Promise(resolve => resolve());
        }
        return new Promise((resolve, reject) => reject(new Error("Could not add nickname")));
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => reject(new Error("Could not add nickname")));
    }
}

module.exports = nicknameHandler;