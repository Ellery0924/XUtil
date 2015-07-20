/**
 * Created by Ellery1 on 15/7/19.
 */
var Promise = XUtil.Promise;
var p = new Promise();

var foo = function () {

    setTimeout(function () {

        p.resolve('promise1 resolved!');
    }, 1000);

    return p;
};

var bar = function () {

    var p2 = new Promise();

    setTimeout(function () {

        p2.reject('promise2 rejected!');
    }, 1000);

    return p2;
};

var baz = function () {

    var p3 = new Promise();

    setTimeout(function () {

        p3.reject('promise3 rejected!');
    }, 1000);

    return p3;
};

foo().then(function (str,p) {

    console.log(str,p);
    return bar();
}).then(function (str) {

    console.log(str);
    return baz();
},function(err){

    console.log(err);
}).then(function (str) {

    console.log(str);
}, function (err) {

    console.log(err);
}).then(function(){

    console.log('ended!');
});

console.log(p.status);

setTimeout(function () {

    console.log(p.status);
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