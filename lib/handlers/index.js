const NicknameHandler = require('./NicknameHandler');
const PingHandler = require('./PingHandler');
const QuizHandler = require('./QuizHandler');
const QuizAnswerHandler = require('./QuizAnswersHandler');
const GameDetailsHandler = require('./GameDetailsHandler');

const handlerWrapper = {
    _validatePayload: (connection, data, storage, ...next) => {
        if (data.slice(1).length === 0) {
            console.log("Payload Not Provided");
            return new Promise((resolve, reject) => reject("Payload not defined"));
        } else {
            return next.shift()(connection, data, storage, ...next);
        }
    },

    _validateNickname: async (connection, data, storage, ...next) => {
        let successful = false;
        try {
            let nickname = await storage.data.participants.findOne({_id: connection.id});
            if (nickname !== undefined && nickname !== null) {
                return next.shift()(connection, data, storage, ...next);
            }
            console.log("Nickname Does Not Exist");
            return new Promise((resolve, reject) => reject("Nickname Not Set"));
        } catch (err) {
            console.log("Could not query DB", err);
            return new Promise((resolve, reject) => reject("Nickname Not Set"));
        }
    },

    _validateQuizHash: async(connection, data, storage, ...next) => {
        let successful = false;
        try {
            let doc = await storage.data.participants.findOne({_id: connection.id});
            if (doc !== undefined && doc !== null && doc.quizValidated === true) {
                return next.shift()(connection, data, storage, ...next);
            }
            console.log("Quiz Hash Not Validated");
            return new Promise((resolve, reject) => reject("Quiz Hash Not Validated"));
        } catch (err) {
            console.log("Could not query DB", err);
            return new Promise((resolve, reject) => reject("Quiz Hash Not Validated"));
        }
    },

    pingHandler: PingHandler,

    nicknameHandler: (...args) => {
        return handlerWrapper._validatePayload(...args, NicknameHandler);
    },

    quizHandler: (...args) => {
        return handlerWrapper._validateNickname(...args, handlerWrapper._validatePayload, QuizHandler);
    },

    quizAnswersHandler: (...args) => {
        return handlerWrapper._validateQuizHash(...args, handlerWrapper._validateNickname, handlerWrapper._validatePayload, QuizAnswerHandler);
    },

    gameDetailsHandler: (...args) => {
      return handlerWrapper._validatePayload(...args, GameDetailsHandler);
    }
};

module.exports = handlerWrapper;
