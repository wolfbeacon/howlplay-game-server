const queue = require('../functionQueue');

async function clearStorageHandler(storage) {
    function clearStorage(storage) {
        return new Promise((resolve) => {
            storage.data.participants.remove({}, { multi: true }, function (err, numRemoved) {
                if (err) { console.log(err) }
                else { console.log(`${numRemoved} users cleared`) } 
            });
            const count = Object.keys(storage.data.connections).length;
            storage.data.connections = {};
            console.log(`${count} connections cleared`);
            resolve();
        });
    }

    return queue.addToQueue(clearStorage.bind(this), storage).promise;
}

module.exports = clearStorageHandler;