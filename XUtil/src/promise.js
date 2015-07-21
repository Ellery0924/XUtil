/**
 * Created by Ellery1 on 15/7/19.
 */
(function (global) {

    function Promise() {

        this.queue = [];
        this.status = "pending";
        this.isPromise = true;
        this.parentPromise = null;
    }

    var fn = Promise.prototype;

    fn._setFinalStatus = function (status) {

        var rootPromise = this.parentPromise;

        while (rootPromise.parentPromise) {

            rootPromise = rootPromise.parentPromise;
        }

        this.status = status;
        rootPromise && (rootPromise.status = status);

        return rootPromise;
    };

    fn.then = function (done, fail) {

        var status = this.status;

        if (status === "pending") {

            this.queue.push({
                done: done,
                fail: fail
            });
        }
        else if (status === 'resolved') {

            console.log('This promise has been resolved, done callback should be called immediately here.');
            done && done.apply(global);
        }
        else if (status === 'rejected') {

            console.log('This promise has been rejected, fail callback should be called immediately here.');
            fail && fail.apply(global);
        }

        return this;
    };

    fn.resolve = function () {

        var next,
            nextDone,
            args,
            returned;

        next = this.queue.shift();

        if (next && this.status === 'pending') {

            nextDone = next.done;
            args = Array.prototype.slice.call(arguments).concat(this);
            returned = nextDone.apply(global, args);

            if (returned && returned.isPromise) {

                returned.queue = this.queue;
                returned.parentPromise = this;
            }
            else {

                this.resolve(returned);
            }
        }
        else if (!next) {

            console.log('all callbacks called!');
            this._setFinalStatus("resolved");
        }
        else {

            console.log('This promise has been resolved/rejected!');
        }
    };

    fn.reject = function () {

        var next, nextFail, args, rootPromise;

        next = this.queue.shift();

        if (next) {

            nextFail = next.fail;

            if (nextFail) {

                args = Array.prototype.slice.call(arguments).concat(this);
                nextFail.apply(global, args);
            }
        }

        this.queue = [];
        rootPromise = this._setFinalStatus("rejected");
        rootPromise && (rootPromise.queue = []);
    };

    XUtil.Promise = Promise;
})(window);