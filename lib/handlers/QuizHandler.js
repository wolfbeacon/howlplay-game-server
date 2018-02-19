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
    let sentHash = null;
    if (data !== undefined) {
        sentHash = util.arrayBufferToString(data.slice(1));
    }
    let storedHash = storage.quiz.quizHash;
    console.log(sentHash, storedHash);
    return new Promise((resolve, reject) => {
        if (sentHash !== undefined && sentHash !== null && sentHash === storedHash) {
            resolve(sentHash);
        } else {
            reject(new Error("Hashes did not match"));
        }
    });
}

module.exports = quizHandler;