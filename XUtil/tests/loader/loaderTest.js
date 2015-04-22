/**
 * Created by Ellery1 on 15/4/22.
 */

$(function () {

    var loader = XUtil.loader;

    loader.config({
        isSync: true,
        root: "http://localhost:63342/XUtil/XUtil/tests/loader/"
    });

    loader.load([
        {path: 'testFiles/jquery.js', 'data-main': "try"},
        'testFiles/jquery-ui.js',
        'testFiles/css1.css',
        'testFiles/css2.css'
    ],function(){
        console.log($().dialog);
    });

    loader.config({isSync:false});
    loader.load(['testFiles/js1.js','testFiles/js2.js']);
});
