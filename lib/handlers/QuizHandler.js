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
    return storage.addQuiz(sentHash, storedHash, connection.id);

}

module.exports = quizHandler;