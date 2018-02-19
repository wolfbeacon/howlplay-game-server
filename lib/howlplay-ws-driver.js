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
         * @returns {*}
         */
        pingEmitter: function(connection, storage){
            return new Promise((resolve, reject) => {
                resolve(util.buildPayload(0));
            });
        },
        confirmNicknameEmitter: function (connection, storage) {
            return new Promise((resolve => {
                resolve(util.buildPayload(2));
            }))
        },
        rejectNicknameEmitter: function (connection, storage) {
            return new Promise((resolve => {
                resolve(util.buildPayload(3));
            }))
        }
    },

};

module.exports = Driver;