const DataStore = require('nedb-promise');
const md5 = require('md5');

class Storage {
    constructor() {
        this.data = {
            connections: {},
            participants: new DataStore()
        };
        this.data.participants.ensureIndex({fieldName: 'nickname', unique: true}, (err) => {});
        this.quiz = {quizData: null, quizHash: md5("abc")};
    }

    /**
     * Sets the quiz in storage
     * @param quiz - a string representation of the quiz
     */
    setQuiz(quiz) {
        this.quiz.quizData = quiz;
        this.quiz.quizHash = md5(quiz)
    }

}

module.exports = Storage;