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
        answers: Array.from(dataView.slice(2))
    };

    //todo validate answers (dependent on quiz object being implemented)
    try {
        let res= await storage.updateAnswers(connection.id, answers.index, answers.answers);
        return new Promise(resolve => resolve(answers));
    } catch (err) {
        console.log(err);
        return new Promise(((resolve, reject) => reject("Could Not Add Answers")));
    }
}

module.exports = quizAnswersHandler;