const util = require('../util');
const queue = require('../functionQueue');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function quizHandler (connection, data, storage) {
    async function addQuiz(connection, data, storage) {
        let successful = false;
        let sentHash = util.arrayBufferToString(data.slice(1));
        let storedHash = storage.quiz.quizHash;
        console.log(sentHash, storedHash);
        try {
            if (sentHash === storedHash) {
                await storage.data.participants.update({_id: connection.id}, {$set: {quizValidated: true}});
                let quiz = storage.quiz;
                return new Promise(resolve => resolve(quiz));
            }
            return new Promise((resolve, reject) => reject(new Error("Hashes did not match")));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(new Error("Hashes did not match")));
        }
    }
    return await queue.addToQueue(addQuiz.bind(this), connection, data, storage);
}

module.exports = quizHandler;
