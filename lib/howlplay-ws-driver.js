const util = require('./util');
const NicknameHandler = require('./handlers/NicknameHandler');
const PingHandler = require('./handlers/PingHandler');

let Driver = {
    handlers: {
        /**
         * Handle ping response
         * @param connection
         * @param data
         * @param storage
         */
        pingHandler: PingHandler,
        nicknameHandler: NicknameHandler
    },

    emitters: {
        /**
         * Emit a ping event
         * @param connection
         * @param storage
         * @returns A promise which has an arraybuffer with statuscode 0 as its payload
         */
        pingEmitter: function(connection, storage){
            return new Promise((resolve, reject) => {
                resolve(util.buildPayload(0));
            });
        },

        /**
         * Emit a nickname accepted event
         * @param connection
         * @param storage
         * @returns A promise which has an arraybuffer with statuscode 2 as its payload
         */
        confirmNicknameEmitter: function (connection, storage) {
            return new Promise((resolve => {
                resolve(util.buildPayload(2));
            }))
        },

        /**
         * Emit a nickname rejected event, a nickname is rejected if it already exists or is not
         * alpahnumeric
         * @param connection
         * @param storage
         * @returns A promise which has an arraybuffer with statuscode 3 as its payload
         */
        rejectNicknameEmitter: function (connection, storage) {
            return new Promise((resolve => {
                resolve(util.buildPayload(3));
            }))
        }
    },

};

module.exports = Driver;