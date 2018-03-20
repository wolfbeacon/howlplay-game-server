const util = require('../util');
const queue = require('../functionQueue');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function nicknameHandler (connection, data, storage) {
    async function addNickname(connection, data, storage) {
        let nickname = util.arrayBufferToString(data.slice(1));
        let successful = false;
        try {
            if (nickname.match(/^[a-z0-9]+$/i) !== null) {
                await storage.data.participants.insert({_id: connection.id, nickname: nickname, quizValidated: false, answers: [-1], sentIndex: 0});
                return new Promise(resolve => resolve(nickname));
            }
            return new Promise((resolve, reject) => reject("Could Not Add Nickname"));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(CouldNotAddNickname));
        }
    }
    console.log("Recieved Nickname");

    return queue.addToQueue(addNickname.bind(this), connection, data, storage).promise;
}

module.exports = nicknameHandler;
