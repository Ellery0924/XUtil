/**. * Cr
 eated by Ellery1
 on 15/7/17 */

XUtil.lazyLoad = function (opt) {

    var loadImg = XUtil.helpers.loadImg;

    opt = opt || {};

    //偏移量,浏览器视口下边缘往上
    var offset = opt.offset || 20,
        loadingImg = opt.loadingImg || '//www.baidu.com/img/bdlogo.png',
        eventName = opt.eventName || 'scroll.lazyLoad';

    //图片cache
    var imgCache = [],
    //下标,记录当前已经加载的图片在数组中的index
        loadedIndex;

    //滚动条事件handler
    //工作原理如下:
    //当滚动条向下运动时,实时获取window的scrollTop(windowTop),并将警戒线设为windowTop+windowHeight+offset,
    //从loadedIndex+1遍历缓存数组,将windowTop与缓存中的元素对比
    //如果图片在警戒线以上,则加载该图片,并将loadedIndex加1
    //否则结束循环
    //这样回避了大量的选择器操作,并且每次只需要遍历数组中头几个很少的元素
    var doScrollLoad = function () {

        var start, end, consoleDiv;

        consoleDiv = $('#console');

        start = new Date().valueOf();

        var windowTop = $(window).scrollTop(),
            watchLine = windowTop + $(window).height() + offset;

        for (var i = loadedIndex + 1; i < imgCache.length; i++) {

            var imgObj = imgCache[i],
                img = imgCache[i].dom,
                imgTop = imgObj.top;

            if (imgTop < watchLine) {

                loadImg(img);
                loadedIndex++;
            }
            else {

                break;
            }
        }

        end = new Date().valueOf();
        consoleDiv.html(Number(consoleDiv.html()) + end - start);

        return this;
    };

    //刷新cache,在页面图片数量发生变动时应该调用这个方法
    var refresh = function (dom) {

        //这里只做一次选择器操作
        var lazyDom = $('[lazyload],[lazyLoad]', dom || document);

        imgCache = [];

        loadedIndex = -1;

        //将需要lazyload的图片加入缓存
        //这里需一次性计算图片的top并存储
        //对于定位不能确定的图片(比如一直在屏幕中移动),无法应用这个方法
        $(lazyDom).each(function () {

            //如果dom本身是一个img,则将dom加入缓存
            if (this.nodeName.toLowerCase() === 'img' && this.getAttribute('loaded') !== '1') {

                imgCache.push({
                    dom: this,
                    top: $(this).offset().top
                });

                loadingImg && $(this).prop('src', loadingImg);
            }
            //否则将该dom所有的img子孙元素加入缓存
            else {

                $('img[real-src]', this).not('[loaded=1]').each(function () {

                    imgCache.push({
                        dom: this,
                        top: $(this).offset().top
                    });

                    loadingImg && $(this).attr('src', loadingImg);
                });
            }
        });

        //将缓存中的图片按top排序
        imgCache.sort(function (first, second) {

            return first.top - second.top;
        });

        //加载当前屏幕中的图片
        doScrollLoad();
    };

    (function bindEvent() {

        $(window)
            .off(eventName)
            .on(eventName, doScrollLoad);
    })();

    return {
        refresh: refresh
    };
};

