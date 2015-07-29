/**
 * Created by Ellery1 on 15/7/29.
 */
(function (global) {

    function Observable(obj) {

        this.attrs = [];
        this.callbacks = {};

        var watchedObj = this;

        Object.keys(obj).forEach(function (key) {

            var value = obj[key],
                isIgnored = key.charAt(0) === '$';

            Object.defineProperty(watchedObj, key, {
                configurable: true,
                enumerable: true,
                get: function () {

                    return watchedObj['$' + key];
                },
                set: function (v) {

                    var oldV = watchedObj[key];

                    Object.defineProperty(watchedObj, '$' + key, {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: v
                    });

                    watchedObj._trigger('changed/' + key, v, oldV, key);
                }
            });

            watchedObj[key] = value;

            if (!isIgnored) {

                watchedObj.attrs.push(key);
            }
        });
    }

    var fn = Observable.prototype;

    //fn.apply = function (attrs) {
    //
    //};

    fn.watch = function (attrs, callback) {

        var bindedAttrs = this.attrs,
            self = this;

        attrs = attrs.replace(/\s+/, '').split(',');

        bindedAttrs.forEach(function (attr) {

            if (attrs[0] === 'all' || attrs.indexOf(attr) !== -1) {

                self._on('changed/' + attr, callback);
            }
        });
    };

    fn._on = function (evName, callback) {

        var evCallbacks = this.callbacks[evName];

        if (!evCallbacks) {

            evCallbacks = this.callbacks[evName] = [];
        }

        evCallbacks.push(callback);
    };

    fn._trigger = function (evName) {

        var callbacks = this.callbacks[evName],
            args = Array.prototype.slice.call(arguments, 1);

        callbacks && callbacks.forEach(function (cb) {

            cb.apply(this, args);
        })
    };

    global.Observable = Observable;
})(window);