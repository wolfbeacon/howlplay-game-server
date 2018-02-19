const NicknameHandler = require('./NicknameHandler');
const PingHandler = require('./PingHandler');
const QuizHandler = require('./QuizHandler');


const handlerWrapper = {
    _validatePayload: (connection, data, storage, ...next) => {
        console.log(data.slice(1));
        if (data.slice(1) === null) {
            return new Promise((resolve, reject) => {
                reject("Payload not defined");
            })
        } else {
            return next[0](connection, data, storage, ...next.slice(1));
        }
    },

    _validateNickname: async (connection, data, storage, ...next) => {
        let successful = false;
        try {
            let nickname = await storage.data.participants.find({_id: connection.id});
            if (nickname !== undefined && nickname !== null) {
                successful = true;
            }
        } catch (err) {
            console.log(err);
            successful = false;
        } finally {
            if (successful) {
                return next[0](connection, data, storage, ...next.slice(1));
            } else {
                return new Promise((resolve, reject) => {
                    reject("Nickname Not Set");
                });
            }
        }
    },

    pingHandler: PingHandler,

    nicknameHandler: (...args) => {
        return handlerWrapper._validatePayload(...args, NicknameHandler);
    },

    quizHandler: (...args) => {
        return handlerWrapper._validateNickname(...args, handlerWrapper._validatePayload, QuizHandler);
    }
};

module.exports = handlerWrapper;