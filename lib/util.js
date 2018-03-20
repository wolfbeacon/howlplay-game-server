// Internal utilities
const util = {
    /**
     * Build payload to be sent by WebSocket
     * @param opcode
     * @param payload
     * @returns {*}
     */
    buildPayload: function(opcode, payload = ""){
        let operation = new Uint8Array([opcode]);
        let newPayload = new Uint8Array(this.stringToArrayBuffer(payload));
        return this.concatTypedArrays(operation, newPayload).buffer;
    },

    /**
     * Convert a string to ArrayBuffer using our custom SINU encoder
     * https://wolfbeacon.atlassian.net/wiki/spaces/WG/pages/409534465/HowlPlay+WebSocket+Sub-Protocol+Specification
     * @param str
     * @returns {ArrayBuffer}
     */
    stringToArrayBuffer: function(str){
        let buf = new ArrayBuffer(str.length);
        let bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    },

    /**
     * Convert an ArrayBuffer back to string
     * @param buf
     * @returns {string}
     */
    arrayBufferToString: function(buf){
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    },

    /**
     * Concat two typed arrays, and returns array in type of 'a'
     * @param a
     * @param b
     * @returns {*}
     */
    concatTypedArrays: function(a, b) { // a, b TypedArray of same type
        let c = new (a.constructor)(a.length + b.length);
        c.set(a, 0);
        c.set(b, a.length);
        return c;
    }
};

module.exports = util;
