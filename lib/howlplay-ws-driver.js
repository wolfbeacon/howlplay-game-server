const util = require('./util');
const handlers = require('./handlers/index');

let Driver = {
    handlers: {
        pingHandler: handlers.pingHandler,
        nicknameHandler: handlers.nicknameHandler,
        quizHandler: handlers.quizHandler,
        quizAnswersHandler: handlers.quizAnswersHandler
    },

    emitters: {
        /**
         * Emit a ping event
         * @returns Promise which has an arraybuffer with statuscode 0 as its payload
         */
        pingEmitter: function(payload) {
            return new Promise(resolve => resolve(util.buildPayload(0)));
        },

        /**
         * Emit a nickname accepted event
         * @returns Promise which has an arraybuffer with statuscode 2 as its payload
         */
        confirmNicknameEmitter: function (payload) {
            return new Promise(resolve => resolve(util.buildPayload(2)));
        },

        /**
         * Emit a nickname rejected event, a nickname is rejected if it already exists or is not
         * alpahnumeric
         * @returns Promise which has an arraybuffer with statuscode 3 as its payload
         */
        rejectNicknameEmitter: function (payload) {
            return new Promise(resolve => resolve(util.buildPayload(3)));
        },

        confirmQuizEmitter: function (payload) {
            return new Promise(resolve => resolve(util.buildPayload(5)));
        },

        rejectQuizEmitter: function (payload) {
            return new Promise(resolve => resolve(util.buildPayload(6)));
        },

        /**
         * Sends an answers accepted event
         * @param payload an array with the first index representing the answer index and second index is number of answers
         * @returns Promise which has an array buffer of statuscode 3
         */
        confirmAnswersEmitter(payload) {
            let fullPayload = util.concatTypedArrays(new Uint8Array([9]), new Uint8Array(payload));
            return new Promise(resolve => resolve(fullPayload.buffer));
        },

        rejectAnswersEmitter(payload) {
            let fullPayload = util.concatTypedArrays(new Uint8Array([10]), new Uint8Array([0, 0]));
            return new Promise(resolve => resolve(fullPayload));
        }
    },

};

module.exports = Driver;