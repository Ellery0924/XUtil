/**
 * Created by Ellery1 on 15/7/19.
 */
var Promise = XUtil.Promise;
var p = new Promise();
console.log('the initial status of p is:' + p.status);

var foo = function () {

    setTimeout(function () {

        p.resolve('p resolved!');
    }, 1000);

    return p;
};

var bar = function () {

    var p2 = new Promise();

    setTimeout(function () {

        p2.resolve('p2 resolved!');
    }, 1000);

    return p2;
};

var baz = function () {

    var p3 = new Promise();

    setTimeout(function () {

        p3.resolve('p3 resolved!');
    }, 1000);

    return p3;
};

var isSequence = window.location.href.search('isSeq') !== -1;

console.log(isSequence);

if (isSequence) {

    foo().then(function (str, p) {

        console.log(str);
        return bar();
    }).then(function (str) {

        console.log(str);
        return baz();
    }, function (err) {

        console.log(err);
    }).then(function (str) {

        console.log(str);
    }, function (err) {

        console.log(err);
    }).then(function () {

        console.log('ended!');
    });

    setTimeout(function () {

        console.log('the final status of p is:' + p.status);
        console.log('now we are going to try to bind new done callbacks to p,');
        console.log('which should be called immediately here...');
        p.then(function () {

            console.log('success callback1 called!');
        }, function () {

            console.log('rejected callback1 called!')
        }).then(function () {

            console.log('success callback2 called!');
        }, function () {

            console.log('rejected callback2 called!');
        })
    }, 4000);
}
else {

    XUtil.when(foo().then(function () {

        var p4 = new Promise();

        setTimeout(function () {

            p4.resolve('p4 resolved!');
        }, 1000);

        return p4;
    }), bar(), baz())
        .then(function (results) {

            console.log('all done!');
            console.log(results);
        }, function (err) {

            console.log(err);
        });
}