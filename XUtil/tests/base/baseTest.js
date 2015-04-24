/**
 * Created by Ellery1 on 15/4/7.
 */
$(function () {

    var bind = XUtil.helpers.bindInput;

    bind('#test1', 'hahaha');
    bind('#test2');

    bind('[name=radioTest]');
    bind('#vTest3',1235);

    //console=undefined;

    //XUtil.helpers.shimConsole();

    //console.log('failed!');
    //
    //var pubsub={},
    //    $pubsub=$(pubsub);
    //
    //$pubsub.on('ready',function(){
    //    console.log('test triggered');
    //})
    //    .trigger('ready');
    //
    //console.log($.event.special)
    //
    //console.log($._data(pubsub,'events'));

    var script=document.createElement('script');

    document.head.appendChild(script);
    script.type='text';

    script.src='http://sjs2.sinajs.cn/video/volunteer/js/core/core.js?ver=0.0';
    script.type='text/javascript';
});