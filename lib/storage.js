const DataStore = require('nedb-promise');
const md5 = require('md5');

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

class Storage {
    constructor() {
        this.data = {
            connections: {},
            participants: new DataStore()
        };
        this.data.participants.ensureIndex({fieldName: 'nickname', unique: true}, (err) => {});
        this.quiz = {quizData: null, quizHash: md5("abc")};
        this.queue = {
            funcs: [],
            started: false,
        }
    }

    /**
     * Sets the quiz in storage
     * @param quiz - a string representation of the quiz
     */
    setQuiz(quiz) {
        this.quiz.quizData = quiz;
        this.quiz.quizHash = md5(quiz)
    }

    addToQueue (func, ...params) {
        let funcObject = {
            func: func,
            params: params,
            promise: new Deferred()
        };
        this.queue.funcs.push(funcObject);
        this.startQueue();
        return funcObject.promise;
    }

    async startQueue() {
        if (!this.queue.started) {
            this.queue.started = true;
            let i = 0;
            while (i < this.queue.funcs.length) {
                let curr = this.queue.funcs[i];
                try {
                    let res  = await curr.func(...curr.params);
                    console.log(res);
                    curr.promise.resolve(res);
                } catch (err) {
                    curr.promise.reject(err);
                }
                i++;
            }
            this.queue.funcs = [];
            this.queue.started = false;
        }
    }

    async _updateAnswers(id, index, answers) {
        try {
            let doc = await this.data.participants.findOne({_id: id});
            let currAnswers = doc.answers;
            for (let i = 0; i < (answers.length); i++) {
                if (i + index < currAnswers.length) {
                    currAnswers[i + index] = answers[i];
                } else {
                    currAnswers.push(answers[i]);
                }
            }
            await this.data.participants.update({_id: id}, {$set: {answers: currAnswers}});
            return new Promise(resolve => resolve(currAnswers));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(answers));
        }
    }

    updateAnswers(id, index, answers) {
        return this.addToQueue(this._updateAnswers.bind(this), id, index, answers).promise;
    }

    async _addNickname(nickname, id) {
        try {
            if (nickname.match(/^[a-z0-9]+$/i) !== null) {
                await this.data.participants.insert({_id: id, nickname: nickname, quizValidated: false, answers: [-1]});
                return new Promise(resolve => resolve(nickname));
            }
            return new Promise((resolve, reject) => reject("Could Not Add Nickname"));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(CouldNotAddNickname));
        }
    }

    addNickname(nickname, id) {
        return this.addToQueue(this._addNickname.bind(this), nickname, id).promise;
    }

    async _addQuiz(sentHash, storedHash, id) {
        try {
            if (sentHash === storedHash) {
                await this.data.participants.update({_id: id}, {$set: {quizValidated: true}});
                return new Promise(resolve => resolve(sentHash));
            }
            return new Promise((resolve, reject) => reject(new Error("Hashes did not match")));
        } catch (err) {
            console.log(err);
            return new Promise((resolve, reject) => reject(new Error("Hashes did not match")));
        }
    }

    addQuiz(sentHash, storedHash, id) {
        return this.addToQueue(this._addQuiz.bind(this), sentHash, storedHash, id).promise;
    }
}

module.exports = Storage;