const util = require('../util');

/**
 *
 * @param connection
 * @param data
 * @param storage
 * @returns {Promise<any>}
 */
async function quizAnswersHandler (connection, data, storage) {
    console.log("Recieved answers");
    let successful = false;
    let dataView = new Uint8Array(data);
    let answers = {
        index: dataView[1],
        answers: Array.from(dataView.slice(1))
    };

    //todo validate answers (dependent on quiz object being implemented)
    try {
        await storage.data.participants.update({_id: connection.id}, {answers: answers});
        console.log(answers)
        return new Promise(resolve => resolve(answers));
    } catch (err) {
        console.log(err);
        return new Promise(((resolve, reject) => reject("Could Not Add Answers")));
    }
}

module.exports = quizAnswersHandler;