/**
 * Created by Ellery1 on 15/7/24.
 */

var loadImg = XUtil.helpers.loadImg;

var start, end;

$(function () {

    var consoleDiv = $('#console');

    function oldLoad () {

        start = new Date().valueOf();

        var imgArr = $('[lazyLoad]'),
            watchLine = $(window).scrollTop() + $(window).height() + 20;

        imgArr.each(function () {

            var img = this,
                top = $(this).offset().top;

            if (top < watchLine) {

                loadImg(img);
            }
        });

        end = new Date().valueOf();
        consoleDiv.html(Number(consoleDiv.html()) + end - start);
    }

    var isNew = window.location.href.search('isNew') !== -1,
        interval;

    if (!isNew) {

        $(window).on('scroll', function () {

            oldLoad();
        });
    }
    else {

        var lazyload = XUtil.lazyLoad();
        lazyload.refresh();
    }

    $(window).scrollTop(0);

    $('#start').click(function () {

        interval = setInterval(function () {

            $(window).scrollTop($(window).scrollTop() + 1000);
        }, 100);
    });

    $('#stop').click(function () {

        $(window).scrollTop(0);
        window.clearInterval(interval);
    });
    //setTimeout(function(){
    //
    //    setInterval(function(){
    //
    //        $(window).scrollTop($(window).scrollTop()+1000);
    //    },100);
    //},100);
});