const util = require('../util');
const queue = require('../functionQueue');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function GameDetailsHandler (connection, data, storage) {
     function getGameDetails(connection, data, storage) {
         return new Promise((resolve, reject) => {
           storage.data.participants.find({})
               .then((users) => {
                   resolve(users);
               })
               .catch(e => {
                  reject("Failed to retrieve users in game");
               });
         });
    }
    console.log("Recieved Nickname");

    return queue.addToQueue(getGameDetails.bind(this), connection, data, storage).promise;
}

module.exports = gameDetailsHandler;
