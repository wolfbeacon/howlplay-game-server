const util = require('../util');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function quizHandler (connection, data, storage) {
    console.log("Recieved quiz hash");
    let successful = false;
    let sentHash = util.arrayBufferToString(data.slice(1));
    let storedHash = storage.quiz.quizHash;
    console.log(sentHash, storedHash);
    try {
        if (sentHash === storedHash) {
            await storage.data.participants.update({_id: connection.id}, {quizValidated: true});
            successful = true;
        }
    } catch (err) {
        console.log(err);
    } finally {
        return new Promise((resolve, reject) => {
            if (successful) {
                resolve(sentHash);
            } else {
                reject(new Error("Hashes did not match"));
            }
        });
    }
}

module.exports = quizHandler;