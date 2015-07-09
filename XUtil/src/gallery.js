/**
 * Created by Ellery1 on 15/7/9.
 */
XUtil.gallery = function (option) {

    var isIE6 = navigator.userAgent.search('MSIE 6.0') !== -1,
        isIE7 = navigator.userAgent.search('MSIE 7.0') !== -1;

    //安全事件,在一个固定时间段内只允许触发一次的事件
    var safeEvent = XUtil.helpers.safeEvent;

    //获取用户配置
    //目标dom
    var renderTo = $(option.renderTo),
    //images数组,元素格式为
    // {
    // link:原图片url,
    // text:图片说明文字,
    // title:图片标题,
    // data:可以为图片绑定data(使用的是jquery数据缓存)
    // }
    // 也可以缺省,将会从目标dom中寻找所有img标签并读取img元素上的对应html属性
        images = option.images || [],
    //在加载图片完成前显示的loading图片
        loadingImg = option.loadingImg || 'http://www.51pptmoban.com/d/file/2013/01/15/e5b91925a8b2f56d69ec4c0cb492d5c1.jpg',
    //一开始显示第N张图片,默认为0即第一张
        initial = option.initialIndex || 0,
    //控件宽度
        width = option.width || 1000,
    //控件高度
        height = option.height || 600,
    //动画效果,可设置为default(无动画),fade(淡入)和slide(滑动)
    //格式为一字符串'default','fade','slide'
    //或者参数对象
    // {
    // type:动画效果名
    // duration:持续时间(毫秒),默认为400毫秒
    // }
        animation = option.animation || {
                type: 'default',
                duration: 0
            },
    //图片onclick事件回调,接收三个参数:当前图片的index,当前图片dom元素和dom元素上绑定的data
        onclick = $.isFunction(option.onclick) ? option.onclick : function (index, img, data) {

            window.console && console.log('img ' + index + ' clicked.');
            window.console && console.log(img);
        },
    //是否自动翻页,如果是0则关闭,非0则设为自动翻页间隔时间
        autoScroll = parseInt(option.auto, 10) || 0,
    //保存动画效果名的变量
        animationType,
    //保存动画效果时间的变量
        animationTime = 0;

    if (typeof animation === 'string') {

        animationType = animation;
        animationTime = 400;
    }
    else {

        animationType = animation.type || 'default';
        animationTime = animation.duration || 400;
    }

    if (!renderTo.eq(0)) {

        throw new Error('gallery组件: renderTo属性不能为空!');
    }

    //控件dom
    var domNode = $("<div class='pic_gallery'>" +
            "<ul class='gal_ctrl_list'>" +
            "</ul>" +
            "<div class='img_container'></div>" +
            "<a href='javascript:void 0;' class='prev'><div class='icon-left_arrow'></div></a>" +
            "<a href='javascript:void 0' class='next'><div class='icon-right_arrow'></div></a>" +
            "<div class='pg_text_box'>" +
            "<h3 class='pg_img_title'></h3>" +
            "<p class='pg_img_text'></p>" +
            "</div>" +
            "</div>"),
        container = domNode.find('.img_container'),
        ctrlUl = domNode.find('.gal_ctrl_list'),
        prev = domNode.find('.prev'),
        next = domNode.find('.next'),
        titleDom = domNode.find('.pg_img_title'),
        textDom = domNode.find('.pg_img_text'),
        textBox = domNode.find('.pg_text_box');

    //常量
    //控制条li元素在点击状态下的className
    var ACT_CLASS = 'icon-li_active',
    //li元素在hover状态下的className
        HOVER_CLASS = 'icon-li_hover',
    //翻页按钮的top
        buttonTop = height / 2 - 33;

    //私有属性
    //保存控件中img元素的数组
    var imgArr,
    //下方控制条li元素的数组
        ctrlLiArr,
    //上一张图片index
        old,
    //当前图片index
        current,
    //图片总数
        size,
    //自动翻页计时器id
        intervalId;

    //私有方法
    //将一个原始img元素转变为控件中使用的img
    //并且生成对应的控制条圆点
    var _getImgDom = function (img, i) {

        var li = $('<li>', {
            'class': 'ctrl_li icon-li',
            'li-index': i
        }).appendTo(ctrlUl);

        $(img)
            .attr('img-index', i)
            .attr('loaded', 0)
            .prop('src', loadingImg)
            .css({
                width: width,
                height: height
            })
            .appendTo(container);

        ctrlLiArr.push(li[0]);
    };

    //加载图片
    //在加载图片完成前显示loading图片,完成后重置src属性为原图片src
    var _loadImg = function (img, callback) {

        var tmp,
            src = img.getAttribute('real-src'),
            loaded = parseInt(img.getAttribute('loaded'), 10) === 1,
            index = img.getAttribute('img-index');

        //ie6和ie7有奇特bug,可能是因为cloneNode复
        if (!loaded || isIE6 || isIE7) {

            tmp = $(new Image());

            tmp.on('load', function () {

                $(img).attr({
                    src: src,
                    loaded: 1
                });

                callback && callback();
                tmp.remove();
            })
                .attr('src', src);
        }
    };

    //设置自动翻页
    var _setAutoScroll = function () {

        clearInterval(intervalId);
        intervalId = setInterval(function () {

            toNext();
        }, autoScroll);
    };

    //刷新自动翻页(在用户手动翻页时调用)
    var _refreshAutoScroll = function () {

        if (autoScroll) {

            clearInterval(intervalId);

            setTimeout(function () {

                _setAutoScroll();
            }, autoScroll);
        }
    };

    //针对不同动画的修正对象
    //每个动画对应一个对象,分别有init和turn两个方法
    //init方法在控件初始化时调用,turn方法在翻页时调用
    var _hooks = {
        'default': {
            turn: function (target) {

                $(imgArr).hide();
                target.show();
            }
        },
        'fade': {
            turn: function (target, notAnimated) {

                $(imgArr).hide();
                notAnimated ? target.show() : target.fadeIn(animationTime);
            }
        },
        'slide': {
            init: function () {

                var before = $(imgArr[size - 1]).clone(true, true)[0],
                    after = $(imgArr[0]).clone(true, true)[0];

                imgArr.before = before;
                imgArr.after = after;

                //slide动画 直接加载头尾
                _loadImg(before);
                _loadImg(after);

                $(container)
                    .prepend(before)
                    .append(after)
                    .css({
                        width: width * (size + 2),
                        height: height,
                        position: 'absolute',
                        left: 0
                    });

                $(container).find('img').css({
                    'float': 'left'
                });
            },
            turn: function (_, byBtn, notAnimated) {

                var lastToFirst = byBtn && (old === size - 1 && current === 0),
                    firstToLast = byBtn && (old === 0 && current === size - 1),
                    targetLeft,
                    commonLeft = -width * (current + 1);

                if (lastToFirst) {

                    targetLeft = -width * (size + 1);
                }
                else if (firstToLast) {

                    targetLeft = 0;
                }
                else {

                    targetLeft = commonLeft;
                }

                container.animate({
                    left: targetLeft
                }, notAnimated ? 0 : animationTime)
                    .promise()
                    .done(function () {

                        if (lastToFirst || firstToLast) {

                            container.css('left', commonLeft);
                        }
                    });
            }
        }
    };

    //实例方法
    //翻到第x张图片,接受三个参数
    //imgNum:图片index
    //byBtn:是否由toPrev/toNext方法触发
    //notAnimated:是否取消翻页动画效果
    var toImage = function (imgNum, byBtn, notAnimated) {

        current = parseInt(imgNum, 10);

        if (current >= 0 && current <= size - 1) {

            var targetImg = $(imgArr[current]),
                targetLi = $(ctrlLiArr[current]),
                title = targetImg.attr('title'),
                text = targetImg.attr('text');

            var turnFunc = _hooks[animationType].turn;

            current - 1 >= 0 && _loadImg(imgArr[current - 1]);
            current + 1 <= size - 1 && _loadImg(imgArr[current + 1]);

            $(ctrlLiArr).removeClass(ACT_CLASS);
            targetLi.addClass(ACT_CLASS);
            titleDom.text(title);
            textDom.text(text);
            textBox.attr('img_index', current);

            _loadImg(imgArr[current]);
            turnFunc(targetImg, byBtn, notAnimated);
        }
    };

    //上一张图片
    var toPrev = function () {

        var isFirst = current === 0;

        old = current;

        isFirst ? toImage(size - 1, true) : toImage(--current, true);
    };

    //下一张图片
    var toNext = function () {

        var isLast = current === size - 1;

        old = current;

        isLast ? toImage(0, true) : toImage(++current, true);
    };

    //初始化控件
    var init = function () {

        var initHook = _hooks[animationType].init || $.noop;

        imgArr = [];
        ctrlLiArr = [];

        if (images.length === 0) {

            imgArr = renderTo.find('img').toArray();
        }
        else {

            for (var i = 0; i < images.length; i++) {

                var imgObj = images[i];

                var title = imgObj.title || '',
                    text = imgObj.text || '',
                    link = imgObj.link,
                    data = imgObj.data || {},
                    imgDom = $('img', {
                        'link': link,
                        'title': title,
                        'text': text
                    }).data('img-data', data).eq(0);

                imgArr.push(imgDom);
            }
        }

        size = imgArr.length;

        $.each(imgArr, function (i) {

            _getImgDom(this, i);
        });

        prev.css({
            'position': 'absolute',
            'top': buttonTop,
            'display': 'block',
            'left': 0
        });

        next.css({
            'position': 'absolute',
            'top': buttonTop,
            'display': 'block',
            'right': 0
        });

        domNode.css({
            width: width,
            height: height,
            position: 'relative',
            overflow: 'hidden'
        });

        //事件绑定
        (function bindEvent() {

            var _safeNext = safeEvent(function () {

                toNext();
            }, window, animationTime);

            var _safePrev = safeEvent(function () {

                toPrev();
            }, window, animationTime);

            ctrlUl.off('mouseenter', 'li')
                .off('mouseout', 'li')
                .on('mouseenter', 'li', function () {

                    $(this).addClass(HOVER_CLASS);
                })
                .on('mouseleave', 'li', function () {

                    $(this).removeClass(HOVER_CLASS);
                });

            ctrlUl.off('click', 'li')
                .on('click', 'li', function () {

                    var index = this.getAttribute('li-index');

                    _refreshAutoScroll();
                    toImage(index, false);
                });

            prev.off('click')
                .on('click', function () {

                    _refreshAutoScroll();
                    _safePrev();
                });

            next.off('click')
                .on('click', function () {

                    _refreshAutoScroll();
                    _safeNext();
                });

            $.merge($(imgArr), $(textBox)).off('click.pic_gal')
                .on('click', function () {

                    var self = this,
                        imgDom = imgArr[current],
                        imgData = $(imgDom).data();

                    onclick.apply(self, [current, imgDom, imgData]);
                });
        })();

        //确保第一张图片加载完成后初始化
        _loadImg(imgArr[initial], function () {

            //调用hook.init方法
            initHook();

            renderTo.empty().append(domNode);
            toImage(initial, false, true);

            if (autoScroll) {

                _setAutoScroll();
            }
        });
    };

    init();

    //暴露实例对象
    return {
        init: init,
        toImage: toImage,
        toPrev: toPrev,
        toNext: toNext
    };
};