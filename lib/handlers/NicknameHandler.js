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
     function addNickname(connection, data, storage) {
         return new Promise((resolve, reject) => {
             let nickname = util.arrayBufferToString(data.slice(1));
             if (nickname.match(/^[a-z0-9]+$/i) !== null) {
                 storage.data.participants.insert({_id: connection.id, nickname: nickname, quizValidated: false, answers: [-1], sentIndex: 0})
                     .then(() => {
                         resolve(nickname);
                     })
                     .catch(e => {
                        reject("Could not add nickname");
                     });
             } else {
                 reject("Could not add nickname");
             }
         });
    }
    console.log("Recieved Nickname");

    return queue.addToQueue(addNickname.bind(this), connection, data, storage).promise;
}

module.exports = nicknameHandler;
