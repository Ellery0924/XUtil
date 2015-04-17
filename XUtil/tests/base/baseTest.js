/**
 * Created by Ellery1 on 15/4/7.
 */
$(function () {

    var bind = XUtil.helpers.bindInput;

    bind('#test1', 'hahaha');
    bind('#test2');

    bind('[name=radioTest]');
});