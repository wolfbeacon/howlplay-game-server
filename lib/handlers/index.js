const NicknameHandler = require('./NicknameHandler');
const PingHandler = require('./PingHandler');
const QuizHandler = require('./QuizHandler');


const handlerWrapper = {
    _validatePayload: (connection, data, storage, ...next) => {
        if (data.slice(1).length === 0) {
            console.log("Payload Not Provided");
            return new Promise((resolve, reject) => {
                reject("Payload not defined");
            })
        } else {
            return next.shift()(connection, data, storage, ...next);
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
        } finally {
            if (successful) {
                return next.shift()(connection, data, storage, ...next);
            } else {
                console.log("Nickname Does Not Exist");
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