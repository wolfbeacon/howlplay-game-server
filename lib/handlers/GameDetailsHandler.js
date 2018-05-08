const util = require('../util');
const queue = require('../functionQueue');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function gameDetailsHandler (connection, data, storage) {
     function getGameDetails(connection, data, storage) {
         return new Promise((resolve, reject) => {
           storage.data.participants.find({})
               .then((users) => {
                  console.log(users);
                   resolve(users);
               })
               .catch(e => {
                  reject("Failed to retrieve users in game");
               });
         });
    }
    console.log("Game details sent");


    return queue.addToQueue(getGameDetails.bind(this), connection, data, storage).promise;
}

module.exports = gameDetailsHandler;
