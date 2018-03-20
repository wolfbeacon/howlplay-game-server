const queue = require('../functionQueue');
const util = require('../util');


/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function quizAnswersHandler (connection, data, storage) {
    async function updateAnswers(connection, data, storage) {
        let successful = false;
        let dataView = new Uint8Array(data);
        let index = dataView[1];
        let answers = Array.from(dataView.slice(2));
        console.log("Recieved answers", answers);
        try {
            let doc = await storage.data.participants.findOne({_id: connection.id});
            let currAnswers = doc.answers;
            for (let i = 0; i < (answers.length); i++) {
                if (i + index < currAnswers.length) {
                    currAnswers[i + index] = answers[i];
                } else {
                    currAnswers.push(answers[i]);
                }
            }
            console.log(currAnswers);
            await storage.data.participants.update({_id: connection.id}, {$set: {answers: currAnswers}});
            return new Promise(resolve => resolve({index: index, answers: answers}));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(answers));
        }
    }


    //todo validate answers (dependent on quiz object being implemented)
    return queue.addToQueue(updateAnswers.bind(this), connection, data, storage);
}

module.exports = quizAnswersHandler;
