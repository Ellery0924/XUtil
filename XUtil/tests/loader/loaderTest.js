/**
 * Created by Ellery1 on 15/4/22.
 */


var loader = XUtil.loader;

loader.config({
    mod: 'async noteval',
    root: "http://localhost:63342/XUtil/XUtil/tests/loader/"
});

loader.load([
    {
        'path': 'http://localhost:63342/XUtil/XUtil/tests/loader/testFiles/jquery.js',
        'data-main': "try",
        '   src   ': "failed",
        'type': "failed"
    },
    'testFiles/jquery-ui.js',
    'testFiles/js1.js',
    'testFiles/js2.js',
    'testFiles/css1.css',
    'testFiles/css2.css'
], function (scripts) {

    console.log(scripts);

    console.log('is jquery undefined? '+(window.$ === undefined));

    for (var i = 0; i < scripts.length; i++) {

        loader.globalEval(scripts[i]);
    }

    console.log(window.$, window.$().dialog, a, b);
});
