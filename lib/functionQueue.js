/**
 * Promise that is deferred for later
 */
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject)=> {
            this.reject = (params) => {reject(params)};
            this.resolve = (params) => {resolve(params)};
        });
    }
}

class Queue {
    constructor() {
        this.queue = [];
        this.started = false;
    }

    addToQueue (func, ...params) {
        let funcObject = {
            func: func,
            params: params,
            promise: new Deferred()
        };
        this.queue.push(funcObject);
        this.startQueue();
        return funcObject.promise;
    }

    async startQueue() {
        if (!this.started) {
            this.started = true;
            let i = 0;
            while (i < this.queue.length) {
                let curr = this.queue[i];
                try {
                    let res  = await curr.func(...curr.params);
                    curr.promise.resolve(res);
                } catch (err) {
                    curr.promise.reject(err);
                }
                i++;
            }
            this.queue = [];
            this.started = false;
        }
    }

}

module.exports = new Queue();
