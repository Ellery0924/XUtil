/**
 * Created by Ellery1 on 15/7/29.
 */
var testObj = {
    a: 1,
    b: 2,
    c: 3,
    $d: function () {
        console.log('hi!');
    }
};

var watchObj = new Observable(testObj);

watchObj.watch('all', function (now, prev, key) {

    console.log('watch all:' + now, prev, key);
});

watchObj.watch('a', function (now, prev, key) {

    console.log('watch a:' + now, prev, key);
});

watchObj.watch('b', function (now, prev, key) {

    console.log('watch b:' + now, prev, key);
});

watchObj.a = 123;
watchObj.b = function () {
    console.log('hihihi there!');
};
watchObj.b = 'hihihi!';