//类UMD模式的包装器，包装源代码以支持AMD和全局变量模式
(function(factory) {
	// 对AMD的支持
	if (typeof define === "function" && define.amd) {

		// 在这里修改jquery-ui的模块名称
		define([ 'jquery', 'jquery-ui' ], factory);
	}
	// 对全局变量的支持
	else {

		factory(jQuery);
	}
})(function($) {

"use strict";

/*
 * 一个依赖于jquery和jquery-ui-dialog的js widget库
 * 支持IE10以上的IE浏览器，谷歌浏览器，火狐浏览器
 * 目前包括：拥有增删改查功能，以及过滤，排序，分页，定制等功能的表格，关键字过滤器，弹出框，可以动态修改树结构的树型结构菜单，
 * 		   一个可以绑定在鼠标右键或者dom元素上的悬浮菜单，以及一个工具函数集
 *
 * Author: Ellery Shen
 * Date: 12-17-2014
 * 
 * 这个库使用了grunt进行自动化构建，本文件由src目录下所有js文件合并而成，详见Gruntfile.js中的配置
 * 可以单独引入某个组件，但必须先引入base.js，然后引入单个js文件
 * 
 * 15-01-2015更新：新增瀑布式布局组件
 * 29-01-2015更新：新增dialog和accordion组件，增加了测试文件夹和对waterfall, dialog和accordion的测试文件
 * 02-10-2015更新：修改了popout组件
 * 02-11-2015更新：模拟UMD包装模式，解决之前AMD模块加载中的bug
 * 02-16-2015更新：实现了文件监控服务器，使用了socket.io实现文件监控+自动刷新，酷炫！
 * 				  在XUtil-dev下运行sudo node server.js即可启动服务
 */

//源文件：src/base.js
//全局变量
var XUtil = {};

//window的引用
var exports = window;

/*
 * 配置参数
 * 包括: rootPath:本库文件所在目录。每次使用库前需要修改config.rootPath
 */
XUtil.config = {
    rootPath: "XUtil"
};

//工具函数集
XUtil.helpers = {

    //本库内部使用的控制台函数
    log: function () {

        var args = Array.prototype.slice.apply(arguments, []);
        args.unshift('(XUtil) ');
        console.log.apply(console, args);
    },

    //内部使用的异常工厂函数
    error: function () {

        if (arguments[0]) {

            var newStr = '(XUtil) ' + arguments[0].toString();
            return new Error(newStr);
        }
    },

    //修正不支持console的浏览器
    shimConsole: function () {

        var noop = function () {
        };

        if (!window.console) {

            window.console = {
                log: noop,
                error: noop,
                warn: noop
            };
        }
    },
    //为某个元素添加一层半透明遮罩，用来屏蔽该元素以及内部元素的响应事件
    //接收三个参数targetDiv(目标div), opacity(透明度)和zIndex(z-index的值)
    //返回遮罩元素
    addShield: function (targetDiv, opacity, zIndex) {
        var top, left, width, height;
        var targetZIndex = zIndex || 10000;
        var shield;

        !targetDiv && (targetDiv = document.body);
        targetDiv = $(targetDiv);

        top = targetDiv.offset().top;
        left = targetDiv.offset().left;
        width = targetDiv.outerWidth();
        height = targetDiv.outerHeight();

        if (targetDiv[0] === document.body) {

            width = "100%";
            height = "100%";
        }

        if (!$.isNumeric(opacity)) {

            opacity = 0.3;
        }

        shield = $("<div class='XUtil-pageShield'></div>");

        shield.css('position', 'absolute')
            .css('z-index', targetZIndex)
            .css('background', '#000')
            .css('opacity', opacity)
            .css('top', top)
            .css('left', left)
            .css('width', width)
            .css('height', height)
            .appendTo(document.body);

        return shield;
    },

    //清除遮罩
    //接收遮罩元素作为参数，如果无参数则清除页面中的所有遮罩
    removeShield: function (shield) {

        shield ? $('.XUtil-pageShield').remove() : $(shield).remove();
    },

    //一个异常处理工具函数，
    //可以在指定的dom元素周围显示一个错误提示
    //接收三个参数：
    //element:目标dom的引用
    //msg:需要显示的提示信息
    //style:为提示添加附加样式
    showErrorHint: function (element, msg, className) {

        var parent = $(element.parentNode),
            errorHint = $("<span class='errorHint'>* " + msg + "</span>");

        if (parent.find('.errorHint').length === 0) {

            errorHint.insertAfter(element);
        }

        if (className) {

            errorHint.addClass(className);
        }

        return errorHint;
    },

    //清除错误提示的工具函数
    //接收一个参数element,清除加在指定元素上的提示
    //如果不传参数则清除页面上的所有错误提示
    clearErrorHint: function (element) {

        element ? $($(element).parent()).find('.errorHint').remove() : $('.errorHint').remove();
    },

    //解析url后返回一个url参数对象的工具函数
    getUrlArgs: function () {

        var args = {},
            location = window.location || location;
        var query = location.search.substring(1);
        var pairs = query.split('&');
        var i, pos, name, value;

        for (i = 0; i < pairs.length; i++) {

            pos = pairs[i].indexOf('=');
            if (pos === -1) continue;
            name = pairs[i].substring(0, pos);
            value = decodeURI(pairs[i].substring(pos + 1));
            args[name] = value;
        }
        return args;
    },

    toQuery: function (obj) {

        var query = '?';

        for (var name in obj) {

            if (obj.hasOwnProperty(name)) {

                query += name + '=' + obj[name] + '&';
            }
        }

        return query;
    },

    getUrl: function (url, args) {

        var self = helpers;
        return encodeURI(url + self.toQuery(args));
    },

    //guid生成工具
    //Author: Robert Kieffer
    guid: function () {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {

            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0 & 3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },

    //预加载图片方法
    //可接收不定数量的参数，参数为图片的url
    preloadImages: function () {

        var i;
        for (i = 0; i < arguments.length; i++) {
            (new Image()).src = arguments[i].toString();
        }
    },

    //安全事件
    safeEvent: function (origHandler, context, gap, endGap) {

        var lastTriggerTime,
        //这个变量用来保存当前的实参
            args,
        //这个变量用于判断是否是首次触发
        //如果orgHandler尚未被触发过，则直接触发
            hasTriggered = false;

        context = context || window;

        if (gap && gap < 50) {

            window.console && console.warn('safeEvent: 设置的间隔值过小!自动调整为50ms');
            gap = 50;
        }

        if (endGap && endGap < gap) {

            window.console && console.warn('safeEvent: 设置的endGap过小!自动调整为一倍gap');
            endGap = gap;
        }

        //工具函数，在context上触发orgHandler并且重置lastTriggerTime
        var trigger = function (now, trigger) {

            lastTriggerTime = now;
            trigger && origHandler.apply(context, args);
        };

        return function () {

            var now = new Date().valueOf(),
            //用于监控结束时刻的定时器
                endWatcher;

            args = Array.prototype.slice.apply(arguments);

            if (hasTriggered) {

                if (now - lastTriggerTime > gap) {

                    trigger(now, gap);
                }
            }
            else {

                hasTriggered = true;
                trigger(now, gap);

                if (endGap) {

                    endWatcher = setInterval(function () {

                        var now = new Date().valueOf();

                        if (now - lastTriggerTime >= endGap) {

                            trigger(now, endGap);
                            clearInterval(endWatcher);
                            hasTriggered = false;
                        }
                    }, 50);
                }
            }
        };
    },

    //加载图片
    loadImg: function (img, callback) {

        var isIE6 = navigator.userAgent.search('MSIE 6.0') !== -1,
            isIE7 = navigator.userAgent.search('MSIE 7.0') !== -1;

        var tmp,
            src = img.getAttribute('real-src'),
            loaded = img.getAttribute('loaded') === '1',
            index = img.getAttribute('img-index');

        //ie6和ie7有奇特bug,可能是因为cloneNode复
        if (!loaded || isIE6 || isIE7) {

            tmp = new Image();

            tmp.onload = function () {

                img.setAttribute('src', src);
                img.setAttribute('loaded', '1');

                callback && callback();
                tmp = null;
            };
            tmp.src = src;
        }
    },

    numToHan: function (num) {
        var unitHan = ['', '十', '百', '千', '万'],
            numHan = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
            LING = '零';

        num = num + "";
        var len = num.length, str = '';

        for (var i = len - 1; i >= 0; i--) {

            var j = len - i - 1,
                singleNum = num.charAt(j);

            var singleUnit = unitHan[i];

            if (singleNum === 0) {

                singleUnit = LING;
            }

            str += singleNum === 0 ? LING : (numHan[singleNum] + singleUnit);
        }

        return str
            .replace(/零+$|^零+/, '')
            .replace(/零+/g, LING);
    }
};

//修正console对象
XUtil.helpers.shimConsole();

/**
 * 源文件：src/accordion.js
 * Accordion组件
 * 效果与大多数js库的accordion组件类似
 * 可以在组织好结构的dom上初始化，详见test/accordionTest.html
 * 或者调用append方法手动添加标签
 * 可配置属性：
 * id：组件id，默认为自动生成的guid
 * renderTo: 目标dom的id
 * titles: 每个标签的title，接收一个字符串数组
 * 每个标签的title也可以用dom的xa-title属性来设置，详见test/accordionTest.html
 * animated: 打开/关闭是否有slide动画效果，默认为false,无动画
 * onShow: 展开标签时的回调函数，接收一个参数，为展开标签的模型对象
 * onRemove: 删除一个标签时的回调，同样接收标签的模型对象为参数
 * closable: 标签是否可以移除，默认为false
 * className, iconClass: 可以自定义组件的className，可以定制标签头部的icon的className
 */

XUtil.XAccordion = function (option) {

    var error = XUtil.helpers.error;
    var log = XUtil.helpers.log;

    var containers = [];

    var that = {};

    var titles = option.titles || [],
        id = option.id || 'XAccordion-' + XUtil.helpers.guid(),
        animated = option.animated || false,
        onShow = $.isFunction(option.onShow) ? option.onOpen : function (container) {
            log('XAccordion: Container ' + container.index + ' is open');
        },
        onRemove = $.isFunction(option.onRemove) ? option.onRemove : function (container) {
            log('XAccordion: Container ' + container.index + ' is removed.');
            return true;
        },
        renderTo,
        closable = option.closable || false,
        className = option.className || '',
        iconClass = option.iconClass || '';

    if (!('renderTo' in option) || !$(option.renderTo)[0]) {
        throw error('XAccordion: 目标div不合法，请检查option.renderTo属性！');
    }
    else {
        renderTo = option.renderTo;
    }

    var target = $(renderTo);

    var append = function (dom, title) {

        var container,
            titleNode,
            contentNode,
            domNode;

        var titleTmpl = "<div class='XAccordion-title'>" +
                "<span class='icon'></span>" +
                "<span class='titleText'></span>" +
                "<span class='closebtn'></span>" +
                "</div>",
            contentTmpl = "<div xa-title='" + title + " 'class='XAccordion-content'></div>",
            domTmpl = "<div class='XAccordion-container'></div>";

        dom = $(dom)[0];

        if (dom) {

            container = {
                title: title,
                titleNode: undefined,
                contentNode: undefined,
                domNode: undefined,
                opened: false
            };

            contentNode = $(contentTmpl).append(dom);
            titleNode = $(titleTmpl);
            titleNode.find('.titleText').html(title);
            domNode = $(domTmpl).append(titleNode).append(contentNode);

            container.titleNode = titleNode;
            container.contentNode = contentNode;
            container.domNode = domNode;

            containers.push(container);
        }
        else {
            throw error('XAccordion.append: 要添加的dom元素不合法，请检查！');
        }
    };

    var children = target.children();
    var i;
    var child,
        titleText;

    for (i = 0; i < children.length; i++) {
        child = children[i];
        titleText = titles[i] === '' ? $(child).attr('xa-title') : titles[i];
        $(child).removeAttr('xa-title');
        append(child, titleText);
    }

    target.on('click', '.titleText', function () {
        var index = $(this.parentNode.parentNode).attr('xa-index');
        that.show(index);
    });

    target.on('click', '.closebtn', function () {
        var index = $(this.parentNode.parentNode).attr('xa-index');
        that.remove(index);
    });

    that.containers = containers;
    that.titles = titles;

    that.set = function (attrs) {
        ('animated' in attrs) && (animated = Boolean(attrs.animated));
        ($.isFunction(attrs.onShow)) && (onShow = attrs.onShow);
        ($.isFunction(attrs.onRemove)) && (onRemove = attrs.onRemove);
        ('closable' in attrs) && (closable = Boolean(attrs.closable));
        ('className' in attrs) && (className = attrs.className);
        ('iconClass' in attrs) && (iconClass = attrs.iconClass);
        ('id' in attrs) && (id = attrs.id);

        return that;
    };

    that.show = function (index) {

        var i;
        for (i = 0; i < containers.length; i++) {
            if (i !== parseInt(index)) {
                that.hide(i);
            }
        }

        if (!containers[index].opened) {

            animated ? containers[index].contentNode.slideDown('fast') : containers[index].contentNode.show();
            containers[index].opened = true;
            containers[index].domNode.addClass('opened');
            onShow(containers[index]);
        }

        return that;
    };

    that.hide = function (index) {

        containers[index].opened = false;
        animated ? containers[index].contentNode.slideUp('fast') : containers[index].contentNode.hide();
        containers[index].domNode.removeClass('opened');

        return that;
    };

    that.remove = function (index) {

        if (onRemove(containers[index])) {

            containers.splice(index, 1);
            that.init();
        }

        return that;
    };

    that.append = function (dom, title) {

        append(dom, title);
        that.init();

        return that;
    };

    that.init = function () {

        target.empty();
        target.addClass('XAccordion')
            .addClass(className)
            .attr('xa-id', id);

        if (containers.length > 0) {

            for (i = 0; i < containers.length; i++) {
                target.append(containers[i].domNode);
                containers[i].domNode.attr('xa-index', i);
                containers[i].index = i;

                if (i !== 0) {
                    containers[i].contentNode.hide();
                    containers[i].opened = false;
                }
            }

            if (!closable) {
                target.find('.closebtn').hide();
            }

            target.find('.icon').addClass(iconClass);

            containers[0].contentNode.show();
            containers[0].opened = true;
            containers[0].domNode.addClass('opened');
        }

        return that;
    };

    that.init();

    return that;
};

/**
 * 源文件：src/dialog.js
 * 对话框组件
 * 在页面上生成一个对话框，并且支持拖动
 * 可配置选项：
 * id: 组件的id, 默认为自动生成的guid
 * width, height:对话框内容区的宽度和高度，默认为auto，最小宽高均为200
 * top, left:对话框的位置，以对话框正中心为基准，默认为50%，即屏幕正中
 * closable, onClose: 是否在标题栏添加关闭按钮，默认为无按钮，onClose为关闭时的回调函数
 * onOpen: 打开对话框的回调
 * autoOpen: 对话框是否处于默认打开状态，默认为false
 * zIndex: 对话框的z-index, 默认为1000
 * draggable：对话框是否可以拖动，默认为false, 不可拖动
 * animated: 打开/关闭时是否有动画效果，默认为false, 无动画
 * content: 可以给这个属性传入html字符串或者dom元素来设置内容区的html
 */

XUtil.XDialog = function (option) {
    var helpers = XUtil.helpers;
    var log = helpers.log;

    var width = option.width || 'auto',
        height = option.height || 'auto',
        top = option.top || 0.5,
        left = option.left || 0.5,
        closable = option.closable || false,
        onClose = $.isFunction(option.onClose) ? option.onClose : function () {
            log('XDialog: XDialog is closed.');
        },
        onOpen = $.isFunction(option.onOpen) ? option.onOpen : function () {
            log('XDialog: XDialog is opened.');
        },
        autoOpen = false,
        id = option.id || 'XDialog-' + helpers.guid(),
        className = option.className || '',
        title = option.title || 'XDialog',
        zIndex = option.zIndex || 1000,
        draggable = option.draggable || false,
        animated = option.animated || false,
        content = option.content || '';

    var initialOpen = true;

    var offsetWidth,
        offsetHeight;

    var domNode,
        contentNode,
        closeBtn,
        titleBar;

    var opened = false;

    var dragStart = false,
        prevX,
        prevY,
        shield;

    var that = {};

    if ('autoOpen' in option && option.autoOpen === true) {
        autoOpen = true;
    }

    domNode = $("<div class='XDialog' id='" + id + "'>" +
    "<div class='XDialogTitle'>" +
    "<span class='titleText'></span>" +
    "<span class='closeBtn'></span>" +
    "</div>" +
    "<div class='XDialogContent'></div>" +
    "</div>")[0];

    contentNode = $(domNode).find('.XDialogContent')[0];

    closeBtn = $(domNode).find('.closeBtn')[0];

    titleBar = $(domNode).find('.titleText')[0];

    $(document.body)
        .append(domNode)
        .css('position', 'relative');

    $(closeBtn).click(function (event) {
        event.stopPropagation();
        that.close();
    });

    that.domNode = domNode;
    that.contentNode = contentNode;
    that.closeBtn = closeBtn;

    that.init = function () {

        $(domNode).css('position', 'fixed')
            .css('top', top)
            .css('left', left)
            .css('z-index', zIndex)
            .hide()
            .addClass(className);

        $(contentNode).css('min-width', '200px')
            .css('min-height', '200px')
            .css('height', height)
            .css('width', width)
            .html(content);

        $(domNode).find('.closeBtn').hide();

        offsetWidth = $(domNode).outerWidth();
        offsetHeight = $(domNode).outerHeight();

        $(domNode).css('margin-top', -offsetHeight / 2)
            .css('margin-left', -offsetWidth / 2);

        $(domNode).find('.titleText').html(title);

        if (autoOpen) {
            that.open();
        }

        if (closable) {
            $(domNode).find('.closeBtn').show();
        }

        //拖拽功能
        if (draggable) {

            $(titleBar).css('cursor', 'move');

            $(titleBar).on('mousedown.' + id, function (e) {
                if (e.which === 1) {
                    dragStart = true;
                    prevX = e.pageX;
                    prevY = e.pageY;
                }
            });

            $(document).on('mousemove.' + id, function (e) {
                var currentX, currentY, deltaX, deltaY;
                if (dragStart) {
                    titleBar.onselectstart = function () {
                        return false;
                    };

                    currentX = e.pageX;
                    currentY = e.pageY;
                    deltaX = currentX - prevX;
                    deltaY = currentY - prevY;

                    top += +deltaY;
                    left += deltaX;
                    $(domNode).css('top', top)
                        .css('left', left);

                    prevX = currentX;
                    prevY = currentY;
                }
            });

            $(document).on('mouseup.' + id, function () {
                dragStart = false;
                titleBar.onselectstart = function () {
                    return true;
                };
            });
        }

        return that;
    };

    that.set = function (attrs) {

        ('width' in attrs) && (width = attrs.width);
        ('height' in attrs) && (height = attrs.height);
        ('top' in attrs) && (top = attrs.top);
        ('left' in attrs) && (left = attrs.left);
        ('title' in attrs) && (title = attrs.title);
        ('className' in attrs) && (className = attrs.className);
        ('closable' in attrs) && (closable = Boolean(attrs.closable));
        ('onClose' in attrs && $.isFunction(attrs.onClose)) && (onClose = attrs.onClose);
        ('onOpen' in attrs && $.isFunction(attrs.onOpen)) && (onOpen = attrs.onOpen);
        ('autoOpen' in attrs) && (autoOpen = Boolean(attrs.autoOpen));
        ('zIndex' in attrs && $.isNumeric(attrs.zIndex)) && (zIndex = attrs.zIndex);
        ('draggable' in attrs) && (draggable = attrs.draggable);
        ('animated' in attrs) && (animated = Boolean(attrs.animated));
        ('content' in attrs) && (content = attrs.content.toString());

        return that;
    };

    that.open = function () {

        if (!opened) {

            animated ? $(domNode).fadeIn('fast') : $(domNode).show();
            opened = true;
            shield = helpers.addShield(document.body, 0.5, zIndex - 1);
            onOpen();

            if (initialOpen) {

                top = $(window).height() * top - $(domNode).outerHeight() / 2;
                left = $(window).width() * left - $(domNode).outerWidth() / 2;

                $(domNode).css('top', top)
                    .css('left', left)
                    .css('margin-top', 0)
                    .css('margin-left', 0);

                initialOpen = false;
            }
        }

        return that;
    };

    that.close = function () {
        if (opened) {

            animated ? $(domNode).fadeOut('fast') : $(domNode).hide();
            opened = false;
            helpers.removeShield();
            onClose();
        }

        return that;
    };

    that.init();

    return that;
};

/**
 * Created by Ellery1 on 15/7/9.
 */
XUtil.gallery = function (option) {

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
    var _loadImg = XUtil.helpers.loadImg;
    //安全事件,在一个固定时间段内只允许触发一次的事件
    var _safeEvent = XUtil.helpers.safeEvent;

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

            var _safeNext = _safeEvent(function () {

                toNext();
            }, window, animationTime);

            var _safePrev = _safeEvent(function () {

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
/**
 * Created by shenjiao on 15/2/28.
 * 一种JS类实现，借鉴了Spine.js中类的实现并做了一些小改动（加入了父类原型属性和父类init方法的引用以及guid）
 */
XUtil.Class = function (parent) {

    var sub;

    function Class() {

        this.init.apply(this, arguments);
        Class.instances[XUtil.helpers.guid()] = this;
    }

    Class.instances = {};

    Class.find = function (id) {

        if (id && Class.instances[id]) {

            return Class.instances[id];
        }
    };

    if (parent) {

        sub = function () {
        };
        sub.prototype = parent.prototype;
        Class.prototype = new sub();
        Class.parent = parent;
        Class.parentProto = parent.prototype;
        Class.parentInit = parent.prototype.init;
    }

    Class.prototype.init = function () {
    };

    Class.prototype.constructor = Object;

    Class.include = function (mixin) {

        var key;

        for (key in mixin) {

            if (mixin.hasOwnProperty(key)) {

                Class.prototype[key] = mixin[key];
            }
        }
    };

    Class.extend = function (mixin) {

        var key;

        for (key in mixin) {

            if (mixin.hasOwnProperty(key)) {

                Class[key] = mixin[key];
            }

        }
    };

    return Class;
};
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


/*
 * 脚本/css/html文件加载器，支持加载js和css文件并解析
 * 其中js有异步和同步两种模式，异步模式下有两种子模式：异步下载并解析，异步下载但不解析
 * 三种模式的实现方式分别是：
 * 同步：同步ajax请求获取脚本文本+全局eval，之后向document.head中插入script标签但阻止浏览器自动解析
 * 异步解析：script标签
 * 异步下载不解析：异步ajax请求获取脚本文本，之后向document.head中插入script标签但阻止浏览器自动解析（计划以此为基础实现CommonJS加载器）
 *
 * 接受一个数组作为参数，如果数组中的元素是对象，则会根据对象的path属性加载文件，并且将对象其他的属性设为script/link标签的html属性
 * 如果是一个字符串，则只加载文件
 * 接受的第二个参数为结束回调，接受一个数组为参数，在同步和普通异步模式下，该数组保存的是添加到页面中的所有script标签
 * 在异步下载但不解析模式下，该数组保存了所有下载的脚本的text
 * */
/*
 * 脚本/css文件加载器，支持加载js和css文件并解析，为XRequire提供底层支持，也可以单独使用
 * 其中js有异步和同步两种模式，异步模式下有两种子模式：异步下载并解析，异步下载但不解析
 * 三种模式的实现方式分别是：
 * 同步：同步ajax请求获取脚本文本+全局eval，之后向document.head中插入script标签但阻止浏览器自动解析
 * 异步解析：script标签
 * 异步下载不解析：异步ajax请求获取脚本文本，之后向document.head中插入script标签但阻止浏览器自动解析（计划以此为基础实现CommonJS加载器）
 *
 * 接受一个数组作为参数，如果数组中的元素是对象，则会根据对象的path属性加载文件，并且将对象其他的属性设为script/link标签的html属性
 * 如果是一个字符串，则只加载文件
 * 接受的第二个参数为结束回调，接受一个数组为参数，在同步和普通异步模式下，该数组保存的是添加到页面中的所有script标签
 * 在异步下载但不解析模式下，该数组保存了所有下载的脚本的text
 *
 * 加载css文件：简单的创建一个link标签后插入head
 * 加载html文件：发送一个同步ajax请求，返回获得的responseText，只能一次加载一个html文件
 */
XUtil.loader = (function () {

    //私有的option对象
    var option = {
        root: "",
        mod: 'async'
    };

    //正则表达式
    var rinvalidAttr = /^\s*(src|href|type|path|rel)\s*$/,
    //是否为绝对路径
        rabsoluteUrl = /^\s*(?:http[s]?:\/\/|\/|\.\/|\.\.\/)/,
        rlastSlash = /\/$/;

    var head = document.head || document.getElementsByTagName('head')[0];

    //config方法，设置option对象，实例方法
    var config = function (opt) {

        for (var key in opt) {

            if (opt.hasOwnProperty(key) && option.hasOwnProperty(key)) {

                option[key] = opt[key];
            }
        }

        return this;
    };

    //全局eval，实例方法
    //如果使用了jshint来校验，需要手动设置忽略eval规则，否则会报错
    //copy了jQuery.globalEval的实现，确保在全局作用域下执行
    var globalEval = function (text) {

        (window.execScript || function (text) {

            window['eval'].call(window, text);
        })(text);
    };

    //工具函数，向document.head中插入一个script标签，但阻止浏览器自动解析其中的js代码
    var insertScriptNotEval = function (script, src, scriptText) {

        head.appendChild(script);

        //制止浏览器自动执行script标签中的js代码，所以临时将type设为text之后插入文本
        script.type = "text";
        script.text = scriptText;

        //由于谷歌浏览器在修改script标签的src属性时依然会执行js代码，因此先设置src，后更改type
        script.src = src;
        //将type重置为text/javascript，不会执行其中的代码，在ff/chrome/ie7+下测试通过
        script.type = "text/javascript";
    };

    //判断是否为绝对路径或者以http://开头的url
    //如果是以上两种情况，忽略root而直接使用传入的绝对路径
    //如果不是，则在所有传入的路径前加上root
    var modifyPath = function (path) {

        var root = option.root ? option.root.replace(rlastSlash, '') + "/" : "",
            isAbsoluteUrl = rabsoluteUrl.test(path);

        return isAbsoluteUrl ? path : root + path;
    };

    //工具函数，为script/link标签设置附加属性
    var setAttr = function (file, script, isJs) {

        for (var attr in file) {

            if (file.hasOwnProperty(attr) && !rinvalidAttr.test(attr)) {

                script.setAttribute(attr, isJs && attr === 'data-main' ? modifyPath(file[attr]) : file[attr]);
            }
        }
    };

    //工具函数，发送一个同步ajax请求
    var sendSyncRequest = function (src) {

        var xhrSync = new XMLHttpRequest();
        xhrSync.open("GET", src, false);
        xhrSync.send();

        if (xhrSync.status !== 200) {

            throw new Error(src + ':' + xhrSync.status + ' ' + xhrSync.statusText);
        }

        return xhrSync.responseText;
    };

    //加载js文件，实例方法
    var load = function () {

        //获取加载模式
        var mod = option.mod,
        //同步模式
            isSync = mod.search('async') === -1,
        //普通异步模式
            isAsync = mod.search('async') !== -1 && mod.search('noteval') === -1,
        //特殊异步模式，下载脚本但不解析
            isAsyncNotEval = mod.search('async') !== -1 && mod.search('noteval') !== -1;

        //需要加载的文件数组，循环中对数组中每一个元素的引用，是否为绝对url
        var files = arguments[0], file,
        //js脚本加载完成后执行的回调
            callback = arguments[1] || function () {
                    console.log('all loaded');
                };

        //计数器，在异步加载模式下使用
        //scripts中存放了加载完成后的一些数据，根据模式的不同会议
        var count = 0, scripts = [];

        //在循环中使用的变量
        var script, src, resText;

        for (var i = 0; i < files.length; i++) {

            file = files[i];

            //修正file对象
            file = typeof file === 'object' ? file : {path: file};
            //修正src
            src = modifyPath(file.path);
            script = document.createElement('script');

            //同步加载模式
            //通过同步ajax请求获得script标签的内容，然后用eval执行
            //之后插入script标签，并且通过一些很奇怪的方法阻止浏览器自动解析新插入的script标签
            if (isSync) {

                resText = sendSyncRequest(src);

                //手动解析js代码
                globalEval(resText);

                insertScriptNotEval(script, src, resText);

                scripts.push(script);

                setAttr(file, script, true);
            }
            //异步加载
            else {

                //普通异步模式，异步下载并解析脚本
                if (isAsync) {

                    script.src = src;
                    count++;

                    script.onload = script.onreadystatechange = function () {

                        if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {

                            //每一个js完成解析后会将计数器减1
                            //当计数器为0时触发结束回调
                            if (--count === 0) {

                                callback(scripts);
                            }
                        }
                    };

                    head.appendChild(script);

                    scripts.push(script);

                    setAttr(file, script, true);
                }
                //特殊模式，异步下载脚本但不解析
                else if (isAsyncNotEval) {

                    count++;
                    //创造一个局部作用域，消除可能的闭包导致的引用问题
                    (function () {

                        var xhr = new XMLHttpRequest();
                        //这里给xhr设置src和file是为了消除闭包导致的引用问题
                        xhr.src = src;
                        xhr.file = file;
                        xhr.open("GET", src);

                        xhr.onreadystatechange = function () {

                            var script;

                            if (this.readyState == 4) {

                                if (this.status === 200) {

                                    //将获取的脚本文本加入scripts数组
                                    scripts.push(this.responseText);

                                    //向head插入一个script标签但制止浏览器自动解析脚本
                                    script = document.createElement('script');
                                    insertScriptNotEval(script, this.src, this.responseText);

                                    //所有脚本下载完成后触发回调
                                    if (--count === 0) {

                                        callback(scripts);
                                    }

                                    setAttr(this.file, script, true);
                                }
                                else {

                                    throw new Error(this.src + ':' + this.status + ' ' + this.responseText);
                                }
                            }
                        };

                        xhr.send();
                    })();
                }
            }
        }

        if (option.mod === 'sync') {

            callback(scripts);
        }
    };

    var loadCss = function (file) {

        file = typeof file === 'object' ? file : {path: file};

        var link = document.createElement('link'),
            rel = file.rel || "stylesheet";

        link.href = modifyPath(file.path);
        link.rel = rel;

        setAttr(file, link, false);

        head.appendChild(link);
    };

    return {
        config: config,
        load: load,
        loadCss: loadCss,
        globalEval: globalEval
    };
})();
/*
 * 源文件：src/menu.js
 * 树结构菜单
 * 可以通过给Menu实例附加(调用append方法)不同类型的MenuItem(简单Item和拥有子菜单的Item)来逐步构造菜单的树结构,
 * 或者直接将一个描述树结构的JSON赋给menuSrc属性，之后调用init方法来初始化Menu
 * 可以动态修改菜单的树结构，详见MenuItem
 * 菜单拥有两种展示形式：垂直vertical（类似windows资源管理器的树形展开菜单）和水平horizontal（类似点击鼠标右键后出现的悬浮菜单）
 * 拥有以下实例方法：
 * append:为菜单添加一个菜单项，可以是simpleItem或者popupItem,
 * open:将菜单展开至某个位置，接收一个位置字符串作为参数，例如0-2就是 展开第一个子菜单后，展开第一个子菜单的第二个子菜单
 * init:初始化/刷新菜单
 * closeAll:关闭所有打开的子菜单
 */
XUtil.XMenu = function (option) {
    //控制台函数的引用
    var log = XUtil.helpers.log;

    //类的私有成员
    var id = option.id || 'XMenu-' + XUtil.helpers.guid(),
        renderTo = option.renderTo,
        mMenuClass = option.menuClass || '',
        mTextClass = option.textClass || '',
        mIconClass = option.iconClass || '',
        mLabelClass = option.labelClass || '',
        mIconRightClass = option.iconRightClass || '',
        subMenuMargin = option.subMenuMargin || 20;

    var simpleItems = [],
        popups = [],
        allItems = [];

    //构建SimpleItem,内部使用
    var initSimpleItem = function (simpleItem, targetDiv) {
        var simpleItemId = simpleItem.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid();

        var simpleItemDiv = $("<li class='XMenuItem XMenuSimpleItem' id='" + simpleItemId + "'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            labelSpan = $("<div class='XMenuItemLabel simpleItemLabel'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var label = simpleItem.label;

        var onClick = simpleItem.onClick || function (simpleItemData, simpleItem, simpleItemDiv) {
                log(simpleItemData);
            };

        var iconClass = simpleItem.iconClass || mIconClass,
            iconRightClass = simpleItem.iconRightClass || mIconRightClass,
            textClass = simpleItem.textClass || mTextClass,
            labelClass = simpleItem.labelClass || mLabelClass;

        simpleItems.push(simpleItem);

        //给simpleItem添加一个到它的dom的引用
        simpleItem.domNode = simpleItemDiv;

        simpleItemDiv.data('itemData', simpleItem.itemData);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(simpleItemDiv);

        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        simpleItemDiv.click(function () {
            onClick(simpleItem.data, simpleItem, simpleItemDiv);
        });

        if (that.type === 'horizontal') {
            simpleItemDiv.bind('mouseenter', function () {
                var siblings;
                if (simpleItem.parent.subMenu) {
                    siblings = simpleItem.parent.subMenu;
                }
                else {
                    siblings = simpleItem.parent.menuSrc;
                }

                siblings.forEach(function (sib) {
                    sib.close && sib.close();
                });
            });
        }

        $(targetDiv).append(simpleItemDiv);
    };

    //构建PopupItem,内部使用
    var initPopupItem = function (popupItem, targetDiv) {

        var label = popupItem.label;

        var popupId = popupItem.id || 'XMenu-PopupItem-' + XUtil.helpers.guid(),
            popupItemDiv = $("<div class='XMenuItem XMenuPopupItem' id='" + popupId + "'></div>");

        var subMenu,
            subMenuDiv = $("<ul class='XMenuSubMenu'></ul>"),
            labelSpan = $("<li class='XMenuItemLabel popupItemLabel' style='cursor:pointer;'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var textClass = popupItem.textClass || mTextClass,
            iconClass = popupItem.iconClass || mIconClass,
            labelClass = popupItem.labelClass || mLabelClass,
            subMenuClass = popupItem.subMenuClass || mMenuClass,
            iconRightClass = popupItem.iconRightClass || mIconRightClass;

        var onClick = popupItem.onClick || function (popupItemData, popupItem, popupItemDiv) {
                log(popupItemData);
            };

        popups.push(popupItem);

        //给popupItem添加一个到它的dom的引用
        popupItem.domNode = popupItemDiv;
        //给popupItem的dom元素绑定一个data属性
        popupItemDiv.data('itemData', popupItem.data);

        $(targetDiv).append(popupItemDiv);
        subMenuDiv.hide();
        if (that.type === 'horizontal') {
            subMenuDiv.css('position', 'absolute');
        }

        subMenuDiv.addClass(subMenuClass);
        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(popupItemDiv);

        labelTextSpan.click(function () {
            onClick(popupItem.data, popupItem, popupItemDiv);
        });

        subMenu = popupItem.subMenu;
        //递归调用，构建子树
        subMenu.forEach(function (subItem) {
            var itemClass = subItem.itemClass;
            subItem.parent = popupItem;
            if (itemClass === 'simple') {
                initSimpleItem(subItem, subMenuDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(subItem, subMenuDiv);
            }
        });
        subMenuDiv.appendTo(popupItemDiv);

        //打开popupItem
        var openPopup = function () {

            var baseWidth, borderLeftWidth, borderTopWidth;
            var left, top;
            var openDirection = that.openDirection;

            baseWidth = parseInt(popupItemDiv.css('width'));
            //在ff下使用border-width取不到值，在ie下可以，这里必须使用border-left-width
            borderLeftWidth = isNaN(parseInt(subMenuDiv.css('border-left-width'))) ? 0 : parseInt(subMenuDiv.css('border-left-width'));
            borderTopWidth = isNaN(parseInt(subMenuDiv.css('border-top-width'))) ? 0 : parseInt(subMenuDiv.css('border-top-width'));

            if (that.type === 'vertical') {
                if (that.animated === true) {
                    subMenuDiv.slideDown('fast');
                }
                else {
                    subMenuDiv.show();
                }
                subMenuDiv
                    .css('margin-left', subMenuMargin)
                    .css('width', baseWidth - subMenuMargin - 2 * borderLeftWidth);
            }
            else {
                //悬浮菜单模式下针对四种不同打开方向的配置
                if (openDirection === 'bottomRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'bottomLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }
                else if (openDirection === 'topRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();

                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'topLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();
                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }

                if (that.animated === true && that.type === 'horizontal') {
                    subMenuDiv.fadeIn('fast');
                }
                else {
                    subMenuDiv.show();
                }

            }

            labelSpan.find('.XMenuItemIconRight').addClass('rotate');
            labelSpan.addClass('opened');
            labelSpan.attr('opened', 'opened');
            iconRightSpan.addClass('subExpanded');
            popupItem.isOpened = true;
        };

        //关闭popupItem,将会递归地关闭它的所有子孙popupItem
        var closePopup = function () {

            var subMenuDiv = this.domNode.find('.XMenuSubMenu'),
                labelSpan = this.domNode.find('.XMenuItemLabel'),
                iconRightSpan = this.domNode.find('.XMenuItemIconRight');

            subMenuDiv.find('.XMenuPopupItem').removeAttr('opened');

            iconRightSpan.removeClass('rotate');

            if (that.animated === true && that.type === 'vertical') {
                subMenuDiv.slideUp('fast');
            }
            else if (that.animated === true && that.type === 'horizontal') {
                subMenuDiv.fadeOut('fast');
            }
            else {
                subMenuDiv.hide();
            }

            //递归关闭所有子孙popupItem
            this.subMenu.forEach(function (sub) {
                if (sub.itemClass === 'popupItem') {
                    $.proxy(closePopup, sub)();
                }
            });

            labelSpan.removeClass('opened');
            labelSpan.attr('opened') && labelSpan.removeAttr('opened');
            iconRightSpan.removeClass('subExpanded');
            this.isOpened = false;
        };

        popupItem.open = openPopup;
        popupItem.close = closePopup;
        popupItem.isOpened = false;

        if (that.type === 'vertical') {
            iconRightSpan.click(function () {
                var opened = $(this.parentNode).attr('opened');
                if (opened === 'opened') {
                    popupItem.close();
                }
                else {
                    popupItem.open();
                }
            });
        }
        else {
            popupItemDiv.bind('mouseenter', function () {
                //在鼠标放在item 0.4秒后展开子菜单
                var self = this,
                    opened,
                    siblings;

                if (popupItem.parent.subMenu) {
                    siblings = popupItem.parent.subMenu;
                }
                else {
                    siblings = popupItem.parent.menuSrc;
                }

                $(self).find('.XMenuItemLabel').attr('opened', 'opened');

                siblings.forEach(function (sib) {
                    if (sib !== popupItem)
                        sib.close && sib.close();
                });

                //为了提高用户体验而设置的延迟
                setTimeout(function () {
                    opened = $(self).find('.XMenuItemLabel').attr('opened');

                    if (opened) {
                        popupItem.open();
                    }
                }, 400);
            });
        }

    };

    //私有，获取一个menuItem的location
    var getLocation = function (item) {
        var locationArr = [];
        var self = item;
        var subStr;
        while (self.parent !== undefined && self.parent.subMenu !== undefined) {
            subStr = self.parent.subMenu.indexOf(self);
            locationArr.push(subStr);
            self = self.parent;
        }
        locationArr.push(self.parent.menuSrc.indexOf(self));

        return locationArr.reverse().join('-');
    };

    //在悬浮菜单模式下，鼠标左键点击菜单外将会关闭整个菜单中的所有popupItem
    $(document).click(function (event) {
        var target = event.target;
        if (that.type === 'horizontal') {
            if (!$(that.domNode).find(target)[0]) {
                that.closeAll();
            }
        }
    });

    //在悬浮菜单模式下，当鼠标处在菜单范围外，将会关闭鼠标X坐标右边（或左边，根据展开方向确定）的所有菜单
    //这种行为与OS X中的系统悬浮菜单一致
    $(document).bind('mousemove', function (event) {
        var mouseX;
        var popupItemDiv, popupX;
        var target = event.target;
        mouseX = event.pageX;
        if (!$(that.domNode).find(target)[0] && that.type === 'horizontal') {
            that.allItems.forEach(function (item) {
                if (item.itemClass === 'popup' && item.isOpened === true) {
                    popupItemDiv = item.domNode;
                    popupX = $(popupItemDiv).offset().left;
                    if (that.openDirection.toLowerCase().search('right') !== -1) {
                        if (popupX > mouseX) {
                            item.close();
                        }
                    }
                    else if (that.openDirection.toLowerCase().search('left') !== -1) {
                        if (popupX + $(popupItemDiv).outerWidth() < mouseX) {
                            item.close();
                        }
                    }
                }
            });
        }
    });

    //类的实例成员
    var that = {};
    //菜单类型
    that.type = option.type || 'vertical';
    //是否开启动画
    that.animated = false;
    if ('animated' in option && option.animated === true) {
        that.animated = true;
    }
    //描述树结构的数组
    that.menuSrc = [];
    //保存所有节点的数组
    that.allItems = [];
    //打开菜单的方向，可以设为左上，左下，右上，右下
    that.openDirection = option.openDirection || 'bottomRight';
    //这个属性记录了树结构的级数
    that.maxLevel = 0;

    //给菜单添加菜单项
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.menuSrc.push(item);
            item.parent = that;
        }
        return that;
    };

    //将菜单展开至某个特定位置
    that.open = function (location) {
        var locationArr = location.split('-'),
            self = that.menuSrc[locationArr[0]];
        var i, target;

        if (self.open) {
            self.open();
        }
        else {
            return self;
        }

        for (i = 1; i < locationArr.length; i++) {
            target = locationArr[i];
            self.subMenu[target] && self.subMenu[target].open && self.subMenu[target].open();
            self = self.subMenu[target];
        }

        return self;
    };

    //关闭所有打开的popupItem
    that.closeAll = function () {
        that.menuSrc.forEach(function (sub) {
            if (sub.itemClass === 'popup') {
                sub.close();
            }
        });

        return that;
    };

    //初始化/刷新菜单UI
    that.init = function () {
        var rootDiv = $("<div class='XMenu' id='" + id + "'></div>")[0];
        var renderToDiv = $(renderTo)[0];

        if ($(renderTo).length > 1) {
            throw error('XMenu: option.renderTo属性设置有误！');
        }

        $(rootDiv).addClass(mMenuClass).css('position', 'relative');
        $(renderToDiv)
            .empty()
            .append(rootDiv);

        //构建树型结构菜单
        that.menuSrc.forEach(function (menuItem) {
            var itemClass = menuItem.itemClass;
            menuItem.parent = that;
            if (itemClass === 'simple') {
                initSimpleItem(menuItem, rootDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(menuItem, rootDiv);
            }
        });

        allItems = simpleItems.concat(popups);
        allItems.forEach(function (item) {
            var level;
            item.location = getLocation(item);
            item.rootMenu = that;
            //计算树结构的级数
            level = item.location.split('-').length;
            if (level > that.maxLevel) {
                that.maxLevel = level;
            }
        });

        that.domNode = rootDiv;
        that.allItems = allItems;

        $(rootDiv).children().addClass('firstLevelItem');
        that.type === 'vertical' ? $(rootDiv).addClass('vertical') : $(rootDiv).addClass('horizontal');

        return that;
    };
    return that;
};

/*
 * 简单MenuItem，同时作为popupItem的基类
 * 可以定制菜单项的文本，以及各个部分的className
 * 可以添加onclick回调
 * 拥有三个实例方法：
 * 		remove:将item从树结构中移除
 *      appendTo:将item和他的子孙节点添加至某个节点（形成一棵以目标节点为根节点的新的子树）
 *      		 ，如果目标节点是simpleItem，则将其转化为一个popupItem后添加
 *      		 （注意：父节点不能被添加到它的子节点中，叶子节点可以任意移动）
 *      insertAt:将item插入它同级节点中的某个位置
 * */
XUtil.MenuItem = function (option) {
    return {
        itemClass: 'simple',
        label: option.label || '空',
        onClick: option.onClick || function (itemData, item, itemDom) {
            var log = XUtil.helpers.log;
            log(itemData);
        },
        option: option,
        iconClass: option.iconClass || '',
        labelClass: option.labelClass || '',
        id: option.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid(),
        textClass: option.textClass || '',
        iconRightClass: option.iconRightClass || '',
        data: option.data || {},
        //父节点的引用，在构建树结构时初始化
        parent: undefined,
        //从目录树中移除本节点
        remove: function () {
            var targetIndex;
            //从父节点的子节点数组中移除本节点
            if (this.parent.subMenu) {
                targetIndex = this.parent.subMenu.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.subMenu.splice(targetIndex, 1);
                }
            }
            else if (this.parent.menuSrc) {
                targetIndex = this.parent.menuSrc.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.menuSrc.splice(this.parent.menuSrc.indexOf(this), 1);
                }
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            //将指向父元素的引用置为undefined
            //这一步已经被取消
            //因为在menu的init方法中将会初始化每个子节点的父元素，因此没有必要在此处重置parent属性
            //this.parent=undefined;

            return this;
        },
        appendTo: function (item) {
            if (item === undefined || item.parent === undefined) {
                return this;
            }

            if (this.parent === item) {
                return this;
            }

            //从原树结构中移除本节点
            this.remove();

            //如果目标是一个popupItem/menu
            //则向其添加本节点
            if (item.append) {
                item.append(this);
            }
            //如果目标是一个simpleItem
            //则将其转化为popupItem
            //然后构建以它为根节点的新子树
            else {
                //将item转化为一个空的popupItem
                item.itemClass = 'popup';
                item.subMenu = [];
                item.subMenuClass = '';
                item.append = function (i) {
                    if (i && i.itemClass && (i.itemClass === 'popup' || i.itemClass === 'simple')) {
                        this.subMenu.push(i);
                        i.parent = this;
                    }

                    //刷新菜单
                    this.rootMenu && this.rootMenu.init && this.rootMenu.init();
                    //支持级联调用
                    return this;
                };

                //插入节点
                item.append(this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            return this;
        },
        insertAt: function (itemIndex) {
            this.remove();

            if (this.parent.subMenu) {
                this.parent.subMenu.splice(itemIndex, 0, this);
            }
            else {
                this.parent.menuSrc.splice(itemIndex, 0, this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            return this;
        }
    };
};

/*
 * 拥有子菜单项的MenuItem，继承自SimpleMenuItem，扩展了一个append方法
 * 用来为其附加一个或多个SimpleMenuItem或者PopupItem
 * */
XUtil.PopupMenuItem = function (option) {
    //继承SimpleMenuItem
    var that = XUtil.MenuItem(option);
    //为PopupItem定制属性
    that.id = option.id || 'XMenu-PopupItem-' + XUtil.helpers.guid();
    that.itemClass = 'popup';
    //保存子菜单项的数组
    //子菜单项可以是SimpleItem,也可以是PopupItem
    that.subMenu = [];
    that.subMenuClass = option.subMenuClass || '';
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.subMenu.push(item);
            item.parent = that;
        }

        //刷新菜单
        that.rootMenu && that.rootMenu.init && that.rootMenu.init();

        //支持级联调用
        return that;
    };
    //打开/关闭子菜单，这两个方法将在menu初始化的时候定义
    that.open = function () {
    };
    that.close = function () {
    };
    return that;
};

//基于Menu组件的悬浮菜单组件
//可以将它绑定在一个/多个dom元素上，在鼠标右键点击的位置打开
//offset: x,y偏移，用来调整打开菜单的位置
//animation: 动画效果
XUtil.XSuspendedMenu = function (option) {
    var error = XUtil.helpers.error;

    var id = 'XSuspendedMenuContainer-' + XUtil.helpers.guid();

    var bindTo = option.bindTo || 'mouse',
        offset = option.offset || {top: 0, left: 0},
        animated = option.animated || false,
        menuAnimated;

    if (animated) {
        menuAnimated = true;
    }
    else {
        menuAnimated = false;
    }

    var container = $("<div class='XSuspendedMenuContainer'></div>");

    var that = {};

    container.css('position', 'absolute')
        .attr('id', id)
        .attr('opened', 'false')
        .appendTo(document.body)
        .hide();

    option.renderTo = '#' + id;
    option.animated = menuAnimated;
    option.type = 'horizontal';
    //内部包装的菜单组件
    that.menu = XUtil.XMenu(option);
    that.menu.init();
    //包装菜单的dom
    that.container = container;
    //绑定的目标dom，一个jQuery对象
    that.bindToDom = undefined;
    //保存菜单是否打开的属性
    that.isOpened = false;
    //指向当前展开的菜单所绑定的目标dom的引用
    that.target = undefined;

    if ($(bindTo)[0]) {
        that.bindToDom = $(bindTo);
    }
    else {
        throw error('XSuspendedMenu: 目标dom不存在，请检查option.bindTo属性.');
    }

    that.show = function (posX, posY) {
        var rightLimit, bottomLimit;
        var xDirection, yDirection, direction;

        rightLimit = $(document).outerWidth() - that.menu.maxLevel * container.outerWidth();
        bottomLimit = $(document).outerHeight() - that.menu.maxLevel * container.outerHeight();

        if (posX < rightLimit) {
            container.css('left', posX + 3 + offset.left);
            xDirection = 'Right';
        }
        else {
            container.css('left', posX - container.outerWidth() - 3 + offset.left);
            xDirection = 'Left';
        }

        if (posY < bottomLimit) {
            container.css('top', posY + 3 + offset.top);
            yDirection = 'bottom';
        }
        else {
            container.css('top', posY - container.outerHeight() - 3 + offset.top);
            yDirection = 'top';
        }

        direction = yDirection + xDirection;
        that.menu.openDirection = direction;
        that.menu.init();

        if (!animated) {
            container.show();
        }
        else {
            container.fadeIn(150);
        }
        container.attr('opened', 'true');
        that.isOpened = true;

        return that;
    };

    that.init = that.menu.init;

    that.hide = function () {
        if (!animated) {
            container.hide();
        }
        else {
            container.fadeOut(150);
        }
        container.attr('opened', 'false');
        that.target = undefined;
        that.isOpened = false;

        return that;
    };

    //在绑定dom中单击鼠标右键时打开菜单
    $(that.bindToDom).bind("contextmenu", function (event) {
        var posX = event.pageX;
        var posY = event.pageY;

        event.preventDefault();
        event.stopPropagation();

        if (that.isOpened) {
            that.hide();
            //target为触发事件的dom
            that.target = event.currentTarget;

            setTimeout(function () {
                that.show(posX, posY);
            }, 150);

        }
        else {
            that.show(posX, posY);
        }
    });

    //关闭菜单
    $(document.body).bind('click', function (event) {
        var target = event.target;
        //如果没有在container中点击左键，关闭菜单
        if (event.button === 0 && !container.find(target)[0] && container.attr('opened') === 'true') {
            that.hide();
        }
    });

    return that;
};

/**
 * Created by Ellery1 on 15/7/9.
 */
/**
 * Created by Ellery1 on 15/7/6.
 */

XUtil.paginator = function (opt) {

    var renderTo = opt.renderTo,
        total = opt.pageCount || 12,
        range = opt.range || 5,
        callback = opt.callback || function (pageNum, prevPage) {

                window.console && console.log('rendering ' + pageNum + "," + prevPage);
            };

    var currentPage = opt.defaultPage || 1,
        prevPage = -1;

    var controllerTmpl = "<div class='paginator_ctrl'></div>",
        commonBtnWrapTmpl = "<table class='commonBtnWrap'>" +
            "<tr></tr>" +
            "</table>",
        pageBtnTmpl = "<td class='pageBtnTd'>" +
            "<a href='javascript:void 0;' class='pageBtn common_btn' pageIndex='{{pageNum}}'>{{pageNum}}</a>" +
            "</td>",
        firstBtnTmpl = "<a pageIndex='1' href='javascript:void 0;' class='pageBtn to_first'>1</a>",
        lastBtnTmpl = "<a pageIndex='" + total + "' href='javascript:void 0;' class='pageBtn to_last'>" + total + "</a>",
        emmiterTmpl = "<span class='emmiter'>...</span>",
        nextPageTmpl = "<a href='javascript:void 0;' class='pageBtn to_next'>下一页</a>",
        prevPageTmpl = "<a href='javascript:void 0;' class='pageBtn to_prev'>上一页</a>",
        clearTmpl = "<div style='clear:both'></div>";

    var ctrlDom = $(controllerTmpl);

    var getCurrentPage = function () {

        return currentPage;
    };

    var getPrevPage = function () {

        return prevPage;
    };

    var toPage = function (pageNum) {

        var renderCtrlBar = function () {

            var getPageBtn = function (num) {

                commonBtnWrap.find('tr').append(pageBtnTmpl.replace(/\{\{pageNum}}/g, num));
            };

            var status = -1,
                i;

            var commonBtnWrap = $(commonBtnWrapTmpl);

            if (pageNum < range && pageNum > 0)
                status = 0;

            else if (pageNum >= range && pageNum <= total - range + 1)
                status = 1;

            else if (pageNum > total - range + 1 && pageNum <= total)
                status = 2;

            if (status === 0) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(commonBtnWrap);

                for (i = 1; i <= range; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(emmiterTmpl)
                    .append(lastBtnTmpl)
                    .append(nextPageTmpl);

                if (pageNum === 1) {

                    ctrlDom.find('.to_prev').hide();
                }
            }

            else if (status === 1) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(firstBtnTmpl)
                    .append(emmiterTmpl)
                    .append(commonBtnWrap);

                for (i = pageNum - 2; i <= pageNum + 2; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(emmiterTmpl)
                    .append(lastBtnTmpl)
                    .append(nextPageTmpl);
            }

            else if (status === 2) {

                ctrlDom.empty();
                ctrlDom.append(prevPageTmpl)
                    .append(firstBtnTmpl)
                    .append(emmiterTmpl)
                    .append(commonBtnWrap);

                for (i = total - 4; i <= total; i++) {

                    getPageBtn(i);
                }

                ctrlDom.append(nextPageTmpl);

                if (pageNum === total) {

                    ctrlDom.find('.to_next').hide();
                }
            }

            ctrlDom.append(clearTmpl);

            ctrlDom.find('[pageIndex=' + pageNum + ']').addClass('current');
        };

        prevPage = currentPage;
        currentPage = pageNum;

        renderCtrlBar();
        callback(pageNum, prevPage);
    };

    var toPrev = function () {

        //为了记录前一页的index,这么做是必须的
        var pageNum = currentPage - 1;
        toPage(pageNum);
    };

    var toNext = function () {

        var pageNum = currentPage + 1;
        toPage(pageNum);
    };

    var init = function () {

        $(renderTo).append(ctrlDom).append(clearTmpl);

        (function bindEvent() {

            var commonBtnSel = '.pageBtn.common_btn,.pageBtn.to_first,.pageBtn.to_last',
                prevSel = '.pageBtn.to_prev',
                nextSel = '.pageBtn.to_next';

            $(ctrlDom)
                .off('click', commonBtnSel)
                .on('click', commonBtnSel, function () {

                    var pageIndex = parseInt(this.getAttribute('pageIndex'), 10);
                    toPage(pageIndex);
                });

            $(ctrlDom)
                .off('click', prevSel)
                .on('click', prevSel, function () {

                    toPrev();
                });

            $(ctrlDom)
                .off('click', nextSel)
                .on('click', nextSel, function () {

                    toNext();
                });
        })();

        toPage(1);
    };

    init();

    return {
        ctrl: ctrlDom,
        init: init,
        toPage: toPage,
        toPrev: toPrev,
        toNext: toNext,
        getCurrentPage: getCurrentPage,
        getPrevPage: getPrevPage
    };
};


/*
 * 源文件：src/popout.js
 * 一个辅助输入控件容器，通常绑定在一个textbox上，在单击或者focus这个textbox时展开并提供辅助输入选项
 * 这个类只生成一个空白的容器，所需的辅助输入dom需要自行添加
 * 以后可能在这个类的基础上做出新的辅助输入UI控件
 * 接收以下参数
 * renderTo:绑定的目标dom，必需
 * popoutId:控件的id，可选
 * width:控件的宽度，可选，默认为400
 * height:控件的高度，可选，默认为auto
 * animation:展开时的动画效果，可选，有三个可选配置项：default为默认情况，没有动画；fade为淡入/淡出效果，slide为向下展开/向上收起效果
 * position:控件的位置，可选，有四个可选配置项：lowerLeft(左下),lowerRight(右下),upperLeft(左上),upperRight(右上)，默认为左下
 * autoOpen:设置控件是否自动展开，可选，默认为false,
 * onOpen,onClose:控件打开/关闭事件，可选，默认为空函数，接收一个免费参数popout，为控件的dom对象
 */
XUtil.XPopout = function (option) {
    var error = XUtil.helpers.error;

    //用来返回的实例对象
    var that = {};

    //初始化私有成员
    //	目标dom的id
    var renderTo = option.renderTo,
    //	附给popout的id
        id = option.id || 'XPopout-' + XUtil.helpers.guid(),
    //	popout的宽度
        width = option.width || 'auto',
    //	popout的高度
        height = option.height || 'auto',
    //	打开popout时的动画，默认为无动画
        animation = option.animation || "default",
    //	popout出现的位置
        position = option.position || "lowerLeft",
    //	目标dom
        targetDiv = $(renderTo)[0],
    //	设置是否自动打开popout
        autoOpen = false,
        className = option.className || '',
        content = option.content || '',
        triggerBy = option.triggerBy || 'click',
        pOffset = option.offset || {top: 0, left: 0},
        onOpen = option.onOpen || function (xPopout) {
            },
        onClose = option.onClose || function (xPopout) {
            };

    //popout窗体
    var popout = $("<div class='xPopout' id='" + id + "'></div>");

    if (option.autoOpen !== undefined && option.autoOpen === true) {
        autoOpen = true;
    }
    //遇到非法配置参数时抛出异常
    if (targetDiv === undefined) {
        throw error("XPopout: 配置参数有误，请检查option.renderTo属性");
    }

    if (animation === 'slide' && (position === 'upperLeft' || position === 'upperRight')) {
        animation = 'default';
    }

    //生成弹出框
    popout.append(content).addClass(className);
    popout.appendTo(document.body);
    popout.css("position", "absolute")
        .css("height", height || "auto")
        .css("width", width || 'auto')
        .css('display', "none")
        .css('background-color', '#fff')
        .css('padding', '10px');

    //初始化实例成员
    //绑定dom的引用
    that.bindDom = targetDiv;
    //弹出框dom的引用
    that.popout = popout[0];

    //初始化实例方法
    //设置popout的position
    that.setPosition = function (position) {
        //目标dom的坐标，宽度，高度
        var offset = $(targetDiv).offset();
        var targetDivWidth = targetDiv.offsetWidth;
        var targetDivHeight = targetDiv.offsetHeight;

        //四种位置的坐标
        var llPosition = {
            top: offset.top + targetDivHeight + Number(pOffset.top),
            left: offset.left + pOffset.left
        };

        var lrPosition = {
            top: offset.top + targetDivHeight + Number(pOffset.top),
            left: offset.left + targetDivWidth - popout.outerWidth() + Number(pOffset.left)
        };

        var ulPosition = {
            top: offset.top - popout.outerHeight() + Number(pOffset.top),
            left: offset.left + Number(pOffset.left)
        };

        var urPosition = {
            top: offset.top - popout.outerHeight() + Number(pOffset.top),
            left: offset.left + targetDivWidth - popout.outerWidth() + Number(pOffset.left)
        };

        //私有方法，根据坐标对象设置popout的位置
        var setPos = function (posObj) {
            popout.css('top', posObj.top);
            popout.css('left', posObj.left);
        };

        if (position === "lowerLeft") {
            setPos(llPosition);
            that.position = position;
        }
        else if (position === "lowerRight") {
            setPos(lrPosition);
            that.position = position;
        }
        else if (position === "upperLeft") {
            setPos(ulPosition);
            that.position = position;
        }
        else if (position === "upperRight") {
            setPos(urPosition);
            that.position = position;
        }
        else {
            setPos(llPosition);
            that.position = "lowerLeft";
        }

        return that;
    };

    //公有方法，打开popout
    that.open = function () {
        if (that.status === "closed") {
            onOpen(popout[0]);

            that.setPosition(position);

            if (animation === "fade") {
                popout.fadeIn('fast');
            }
            else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
                popout.slideDown('fast');
            }
            else {
                popout.show();
            }

            that.status = "opened";
        }

        return that;
    };

    //公有方法，关闭popout
    that.close = function () {
        if (that.status === "opened") {
            onClose(popout[0]);
            if (animation === "fade") {
                popout.fadeOut('fast');
            }
            else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
                popout.slideUp('fast');
            }
            else {
                popout.hide();
            }

            that.status = "closed";
        }

        return that;
    };

    that.setPosition(position);

    //根据用户配置确定是否自动打开
    if (autoOpen === false) {
        that.status = "closed";
    }
    else {
        that.status = "opened";
        that.open();
    }

    //初始化响应事件
    //点击目标dom时展开控件
    (function () {
        //延迟开启/关闭使用的布尔值
        var openning = false;

        var closeHandler = function (e, immediate) {
            var target;

            e.stopPropagation();
            target = e.target;

            if (popout.children().length !== 0 &&
                target !== popout[0] &&
                target !== targetDiv &&
                popout.find(target)[0] === undefined ||

                popout.children().length === 0 &&
                target !== targetDiv &&
                target !== popout[0]) {

                openning = false;

                if (triggerBy === 'hover' && !immediate) {

                    setTimeout(function () {
                        if (!openning && that.status === 'opened') {
                            that.close();
                        }
                    }, 400);
                }
                else {
                    that.close();
                }
            }
            else {
                openning = true;
            }

        };

        if (triggerBy === 'hover') {

            $(targetDiv).on('mouseenter.XPopoutOpen', function () {
                openning = true;
                setTimeout(function () {
                    if (openning) {
                        that.open();
                    }
                }, 350);
            });

            $(document).on('mouseover.XPopoutClose', function (e) {
                closeHandler.call(this, e);
            });

            $(document).on('click.XPopoutClose', function (e) {
                closeHandler.call(this, e, true);
            });
        }
        else {
            $(targetDiv).on('click.XPopoutOpen', function () {
                that.open();
            });

            $(document).on('click.XPopoutClose', function (e) {
                closeHandler.call(this, e);
            });
        }

    })();

    return that;
};

/**
 * Created by Ellery1 on 15/7/19.
 * 符合Promise/A标准的Promise实现
 * 不支持progress方法
 * 支持链式调用的then方法,即多个异步过程串行执行
 * 不依赖Deferred来resolve/reject
 *
 * P.S.:出于对大多数人使用习惯的尊重,作者很不情愿地使用了传统的JavaScript模拟类实现
 */
(function (global) {

    function Promise() {

        this.queue = [];
        this.status = "pending";
        this.isPromise = true;
        this.parentPromise = null;
    }

    var fn = Promise.prototype;

    fn._setFinalStatus = function (status) {

        var rootPromise = this;

        while (rootPromise.parentPromise) {

            rootPromise = rootPromise.parentPromise;
        }

        this.status = status;
        rootPromise.status = status;

        return rootPromise;
    };

    fn.then = function (done, fail) {

        switch (this.status) {
            case 'pending':
                this.queue.push({
                    done: done,
                    fail: fail
                });
                break;
            case 'resolved':
                done && done.apply(global);
                break;
            case 'rejected':
                fail && fail.apply(global);
                break;
            default :
                break;
        }

        return this;
    };

    fn.resolve = function () {

        var next,
            nextDone,
            args,
            returned;

        next = this.queue.shift();

        if (next && this.status === 'pending') {

            nextDone = next.done;
            args = Array.prototype.slice.call(arguments).concat(this);
            returned = nextDone.apply(global, args);

            if (returned && returned.isPromise) {

                returned.queue = this.queue;
                returned.parentPromise = this;
            }
            else {

                this.resolve(returned);
            }
        }
        else if (!next) {

            this._setFinalStatus("resolved");
        }
        else if (this.status !== 'pending') {

            console.log('this promise has been resolved/rejected!');
        }
    };

    fn.reject = function () {

        var next, nextFail, args, rootPromise;

        next = this.queue.shift();

        if (next) {

            nextFail = next.fail;

            if (nextFail) {

                args = Array.prototype.slice.call(arguments).concat(this);
                nextFail.apply(global, args);
            }
        }

        this.queue = [];
        rootPromise = this._setFinalStatus("rejected");
        rootPromise && (rootPromise.queue = []);
    };

    XUtil.Promise = Promise;

    XUtil.when = function () {

        var whenPromise = new Promise();

        var taskArr = Array.prototype.slice.call(arguments),
            results = [],
            count = taskArr.length;

        var i, task;

        for (i = 0; i < taskArr.length; i++) {

            task = taskArr[i];

            if (task.isPromise) {

                task.then(function (result) {

                    results.push(result);

                    if (!--count) {

                        whenPromise.resolve(results);
                    }
                }, function (err) {

                    whenPromise.reject(err);
                });
            }
        }

        return whenPromise;
    };
})(window);
/*
 * 源文件：src/table.js
 * 表格widget，将一个JSON数组以表的形式展示，支持对表格数据进行增删改操作，以及分页，排序，选择，编辑，关键字过滤等多种功能
 *
 * 接收一个参数对象option，包含以下内容：
 *
 * renderTo: 目标div的id，必需
 *
 * id:widget的id，如果不设置，则会调用guid函数生成一个随机id
 *
 * src:源JSON数组，必需
 *
 * fontSize:字体大小，默认12px，非必需
 *
 * colEditable:是否设置列的可见性，默认true
 *
 * hasFilter:表是否可过滤，默认true，可以对每一列分别定制过滤功能，详见column的设置
 *
 * editable:表是否可编辑，默认不可编辑
 * showEditCol:是否显示包含编辑按钮的列，默认为隐藏
 * beforeEdit:编辑操作保存之前调用
 * editCallback:编辑操作后的回调函数，在表被设置为可编辑的情况下配置，默认为一空函数，
 * 拥有免费参数editedObj，为被编辑的行的原始数据obj，以及row，为当前被编辑的列
 *
 * selectable:表的行是否可选，默认可选
 * beforeSelect,beforeDeselect:select和deselect前调用
 * selectCb,deselectCb:select和deselect过后的callback
 *
 * deletable: 行是否可删除，默认不可删除
 * beforeDelete:delete操作前调用
 * deleteCb: 删除操作后的回调函数，接收两个参数: data为删除的行对应的源数据对象，orgSrc为整个表对应的数据对象
 *
 * columns:定制列属性的数组，可对表格中的每一列进行定制，每个数组成员对象包含以下属性：
 *      name: 列名，必需
 *      width: 列宽度（单位为px或者百分数，非必需），
 *      data: 列展示的数据（即该列对应源JSON的属性，必需），
 *      hasFilter: 本列是否包含过滤器（可省略，默认包含），
 *      sortable: 本列是否可排序（可省略，默认可排序。注意：对于中文字符串的排序使用了String.prototype.localeCompare函数,
 *      对于不同的浏览器，其实现方式并不一致.例如chrome会进行按拼音的排序,而FF则会根据笔画数进行排序），
 *      visible: 本列是否可见（可省略，默认可见）
 *      editable:本列是否可编辑（可省略，在option.editable=true的情况下，默认为可编辑）
 *
 * filterType: 过滤器类别，值可为1或者2（可省略，默认为1，拆字匹配，如输入"北大"即可匹配到"北京大学";
 * 若置为2则进行连续字符串的匹配，例如"北京"能匹配到"北京大学"，而"北大"则不能）
 *
 * pageSizes:一个包含每页显示条目数的数组，例如[5,10,50,100]（代表四个可选项，每页显示5，10，50，100条数据），非必需
 *
 * linkCols:可以将某列的数据变成超链接/button，可以通过renderer定制超链接的href，或者通过onclick属性定制点击事件，非必需
 */
XUtil.XTable = function (option) {
    //控制台和异常函数的引用
    var log = XUtil.helpers.log;
    var error = XUtil.helpers.error;

    //用来返回的对象，类的公有成员集合
    var that = {};

    //开始初始化类的私有成员
    //id
    var id = option.id || 'XTable-' + XUtil.helpers.guid();

    if (!option.src) {
        throw error('XTable: 配置参数有误，请检查src属性是否为合法的JSON数据');
    }
    //开始初始化配置属性
    var root = XUtil.config.rootPath;
    if (!root || root === "") {
        throw error("XTable: 配置参数有误，请检查myUtil.config对象");
    }

    //配置是否可以显示/隐藏列
    var colEditable = true;
    if ('colEditable' in option && option.colEditable === false) {
        colEditable = false;
    }

    //配置表是否可过滤
    var hasFilter = true;
    if ('hasFilter' in option && option.hasFilter === false) {
        hasFilter = false;
    }

    //过滤器类型
    var filterType = option.filterType || 1;

    var targetDiv = $(option.renderTo)[0];
    if (!targetDiv || $(option.renderTo).length > 1) {
        throw error('XTable: 配置参数有误，请检查option.renderTo属性');
    }

    //根据配置，设置表字体大小
    var fontSize = option.fontSize || "14px";
    $(targetDiv).empty().css('font-size', fontSize);

    //初始化每个列的配置
    //	列名
    var columns = [],
    //	源数据到列的映射关系
        dataMap = [],
    //	保存列宽度配置的数组
        columnWidth = [],
    //	保存列可见性配置的数组
        visibleCols = [],
    //	保存列是否可过滤配置的数组
        hasFilters = [],
    //	保存列是否可排序配置的数组
        sortable = [];

    //根据option的配置初始化以上几个数组
    option.columns.forEach(function (col) {
        columns.push(col.name);
        if (hasFilter === true) {
            if (!("hasFilter" in col) || col.hasFilter === true) {
                hasFilters.push(true);
            }
            else if ("hasFilter" in col && col.hasFilter === false) {
                hasFilters.push(false);
            }
        }
        else {
            hasFilters.push(false);
        }
        if (!("sortable" in col) || col.sortable === true) {
            sortable.push(true);
        }
        else if ("sortable" in col && col.sortable === false) {
            sortable.push(false);
        }
        if (!("data" in col)) {
            throw error("XTable.js: 配置参数有误，请检查option.column的data属性。");
        }
        dataMap.push(col.data);
        columnWidth.push(col.width);
        if (!("visible" in col) || col.visible === true) {
            visibleCols.push(col.data);
        }
    });

    //配置选择功能
    //	selectable参数，默认为true
    var selectable = true,
    //	用来保存选中的列的index的数组
        selectedIndexes = [],
        beforeSelect = option.beforeSelect || function (selectedData, row) {
            },
        selectCb = option.selectCb || function (selectedData, row) {
            },
        beforeDeselect = option.beforeDeselect || function (selectedData, row) {
            },
        deselectCb = option.deselectCb || function (selectedData, row) {
            };

    if ("selectable" in option && option.selectable === false) {
        selectable = false;
    }

    //配置删除功能
    var deletable,
        beforeDelete = option.beforeDelete || function (selectedData, orgSrc) {
                return true;
            },
        deleteCb = option.deleteCb || function (selectedData, orgSrc) {
            };

    if ("deletable" in option && option.deletable === true) {
        deletable = true;
    }
    else {
        deletable = false;
    }

    //配置编辑功能
    //	editable参数，默认为false
    var editable = option.editable || false;
    //	是否显示编辑/保存按钮
    var showEditCol = option.showEditCol || false;
    //	保存编辑过的行的数组
    var editedIndexArr = [],
    //	当前打开编辑功能的列数量
        editingRowCount = 0,
    //	editCallback函数,在edit操作过后执行
        editCb = editable && option.editCb || function (eObj, row) {
            },
        beforeEdit = editable && option.beforeEdit || function (eObj, row) {
            };

    var controllerPosition = 'top';
    if ('controllerPosition' in option && option.controllerPosition === 'bottom') {
        controllerPosition = 'bottom';
    }

    //	可选的pagesize
    var pageSizes = option.pageSizes || [10, 20, 50, 100, 200],
    //	默认的初始pageSize
        pageSize = parseInt(pageSizes[0]);

    //超链接列
    var linkCols = option.linkCols;
    //保存分页后的源数据的数组
    var pages = [];

    //开始生成基本控制界面
    var table = $("<div class='xTable-table'></div>"),
        controller = $("<div class='xTable-controller'></div>"),
        pageController = $("<div class='xTable-pageController'></div>"),
        pageSizeController = $("<div class='xTable-pageSizeController'></div>"),
        prevButton = $("<li class='functionButton prevButton ui-state-default ui-corner-all'>" +
        "<span class='ui-icon ui-icon-seek-prev'></span>" +
        "</li>"),
        nextButton = $("<li class='functionButton nextButton ui-state-default ui-corner-all'>" +
        "<span class='ui-icon ui-icon-seek-next'></span>" +
        "</li>"),
        firstButton = $("<li class='functionButton firstButton ui-state-default ui-corner-all'>" +
        "<span class='ui-icon ui-icon-seek-first'></span>" +
        "</li>"),
        lastButton = $("<li class='functionButton lastButton ui-state-default ui-corner-all'>" +
        "<span class='ui-icon ui-icon-seek-end'></span>" +
        "</li>"),
        gotoBox = $("<input type='text' class='xTable-gotoBox' value='1'/>"),
        maxPageSpan = $("<span class='xTable-maxPage'></span>"),
        view = $("<table class='xTable-view' border='1' width='100%'></table>"),
        pageSizeSelector = $("<select class='xTable-pageSizeSelector'></select>");

    pageSizes.forEach(function (size) {
        pageSizeSelector.append("<option value='" + size + "'>" + size + "</option>");
    });

    pageController
        .append(firstButton)
        .append(prevButton)
        .append(gotoBox)
        .append(maxPageSpan)
        .append(nextButton)
        .append(lastButton);

    controller
        .append(pageController)
        .append(pageSizeController);

    if (controllerPosition === 'top') {
        table
            .append(controller)
            .append(view);
    }
    else {
        table
            .append(view)
            .append(controller);
    }

    $(targetDiv)
        .append(table);

    //全选checkbox
    var selectAll = $("<input class='xTable-selectAll' type='checkbox'/>"),
        selectAllTd = $("<td class='xTable-selectAllTd' class='xTable-selectAllTd'></td>");

    selectAllTd.append(selectAll);
    view.empty();

    //初始化表头
    //存储表头的数组
    var headers = [];
    var tableHeader = $("<tr class='xTable-Header'></tr>");

    //如果option.selectable为true，则插入全选checkbox
    if (selectable) {
        tableHeader.append(selectAllTd);
    }

    columns.forEach(function (colName, i) {
        var nameTd = $("<td class='colName' colName='" + colName + "'>" +
        "<div class='colNameText'>" + colName + "</div>" +
        "</td>");
        tableHeader.append(nameTd);
        headers.push(nameTd);
        //配置列的可过滤属性
        if (hasFilters[i]) {
            $("<li class='openFilterLi ui-state-default ui-corner-all' title='.ui-icon-search'>" +
            "<span class='ui-icon ui-icon-search'></span>" +
            "</li>").appendTo(nameTd);
        }
        //配置列的可排序属性
        if (sortable[i]) {
            var orderTag = $("<div class='orderTag'></div>");
            nameTd.attr("sortable", "true").append(orderTag);
        }
        else {
            nameTd.attr("sortable", "false");
        }
    });
    //如果表格可编辑，增加一包含编辑按钮的列
    if (editable) {
        var editHeader = $("<td class='editHeader' colName='edit'>编辑</td>");
        tableHeader.append(editHeader);
        if (!showEditCol) {
            editHeader.hide();
        }
    }

    //设置列的宽度
    columnWidth.forEach(function (width, i) {
        if (headers[i]) {
            headers[i].css("width", width);
        }
    });

    //给表头中的每个cell绑定一个srcName属性，这个属性指向与该列关联的源数据对象的属性名
    dataMap.forEach(function (name, i) {
        if (headers[i]) {
            headers[i].attr("srcName", name);
        }
    });
    view.append(tableHeader);

    //为打开过滤器按钮载入jquery-ui风格
    $(targetDiv).find('li').hover(function () {
        $(this).addClass("ui-state-hover");
        $(this).css("cursor", "pointer");
    }, function () {
        $(this).removeClass("ui-state-hover");
        $(this).css("cursor", "default");
    });

    //设置显示的列面板
    $('#' + id + '-setVCols', table).remove();
    var vcolsDialog = $("<div id='" + id + "-setVCols'></div>");

    vcolsDialog.dialog({
        autoOpen: false,
        width: 400,
        resizable: false,
        title: "设置显示的列",
        buttons: [
            {
                text: "确定",
                id: id + "-submitVCols",
                click: function () {

                }
            },
            {
                text: "取消",
                id: id + "-closeSetVCols",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ],
        position: {
            my: "top+10%",
            at: "top+10%",
            of: window
        },
        open: function () {
            XUtil.helpers.addShield(document.body);
        },
        close: function () {
            XUtil.helpers.removeShield();
        }
    });

    $(table).append(vcolsDialog.parent());

    //设置可见列按钮
    var openSetV = $("<input type='button' value='设置' class='openSetV'/>");
    if (colEditable) {
        openSetV.insertAfter(lastButton);
        openSetV.button();
    }

    var showAllCol = $("<input type='checkbox' class='showAllCol' checked='true'/>");
    var showAllColSpan = $("<div class='subVCol showAllColSpan'></div>");
    showAllColSpan
        .append(showAllCol)
        .append('全部')
        .appendTo(vcolsDialog);

    option.columns.forEach(function (col) {
        var subVCol = $("<div class='subVCol'></div>"),
            colCb = $("<input type='checkbox' class='vColCb' srcName='" + col.data + "' colName='" + col.name + "'/>");

        subVCol.append(colCb).append(col.name);
        if (!("visible" in col) || col.visible === true) {
            colCb.prop("checked", true);
        }
        else {
            colCb.prop("checked", false);
            showAllCol.prop('checked', false);
        }

        vcolsDialog.append(subVCol);
    });

    //全选当前页按钮
    var selectCurrentPage = $("<input type='button' value='全选当前页' class='funcButton'/>");
    if (selectable) {
        selectCurrentPage.appendTo(pageController);
        selectCurrentPage.button();
    }

    //删除选中行按钮
    var deleteBtn;
    if (deletable) {
        deleteBtn = $("<input type='button' value='剔除选中条目' class='funcButton deleteBtn'/>").button({disabled: true});
        deleteBtn.appendTo(pageController);
    }

    //生成基本控制界面结束

    //工具函数，将第x列设为超链接，url由用户自己定义的renderer函数提供
    var setLink = function (columnIndex, urlRenderer, target, onclick, type) {
        columnIndex = parseInt(columnIndex);
        var trArray, targetTdArray;

        if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < columns.length) {
            trArray = $(".dataTr", table).toArray();
            targetTdArray = [];
            trArray.forEach(function (tr) {
                if ($(tr).find(".dataCell")[columnIndex]) {
                    targetTdArray.push($(tr).find(".dataCell")[columnIndex]);
                }
            });
            targetTdArray.forEach(function (td, i) {

                var trIndex = parseInt($(trArray[i]).attr("srcindex")),
                    trData = that.orgSrc[trIndex],
                    aTitle = $(td).text(),
                    generatedA = $("<a href=''>" + aTitle + "</a>");

                if (type === 'button') {
                    generatedA = $("<input type='button' value='" + aTitle + "'>").button();
                }

                if (urlRenderer && type !== 'button') {
                    generatedA.attr('href', urlRenderer(trIndex, trData, generatedA));
                }
                else if (type !== 'button') {
                    generatedA.attr('href', 'javascript: void (0)');
                }

                if (!target || type !== 'button') {
                    generatedA.attr('target', '_blank');
                }
                else {
                    generatedA.attr('target', target);
                }
                //修复ff下一个bug
                //如果不设置target为_self,在ff中点击href为javascript:void 0的超链接，会打开一个新的空标签页
                if (!urlRenderer) {
                    generatedA.attr('target', '_self');
                }

                if (onclick) {
                    generatedA.click(function () {
                        var a = this;
                        onclick(trData, a);
                    });
                }
                $(td).attr('editInvalid', 'true');
                $(td).empty().append(generatedA);

            });
        }
    };

    var showActionHint = function (msg) {
        $(".dataTr", table).remove();
        $(".tempMessage", table).remove();
        $("<div class='tempMessage'>" + msg + "</div>").insertAfter(table.find(".xTable-view"));
        XUtil.helpers.addShield(table);
    };

    var removeActionHint = function () {
        $(table).find('.tempMessage').remove();
        XUtil.helpers.removeShield();
    };

    //初始化实例成员
    //原始json
    that.orgSrc = option.src;
    //widget的id
    that.id = id;
    //保存所有表头
    that.headers = headers;
    //这个属性保存了所有的列对应的原JSON对象中的属性
    that.attrs = dataMap;
    //与当前表格对应的JSON数组
    that.src = that.orgSrc.slice();
    //将部分重要dom设为实例属性
    that.option = option;
    that.firstButton = firstButton;
    that.prevButton = prevButton;
    that.gotoBox = gotoBox;
    that.nextButton = nextButton;
    that.lastButton = lastButton;
    that.pageSizeSelector = pageSizeSelector;
    that.pageController = pageController;
    that.controller = controller;
    that.view = view;

    //给每个数据对象增加两个属性
    that.src.forEach(function (sub, i) {
        //selected属性用来保存该对象是否被选中
        sub.selected = false;
        //orgIndex保存了该对象原始的index
        sub.orgIndex = i;
    });

    //实例方法
    //初始化函数，将JSON分页后加载第一页
    that.init = function () {
        var src = that.src;
        var maxPage = Math.ceil(src.length / pageSize);
        var i, j, subPage;

        pages = [];
        selectedIndexes = [];

        pageSizeController.empty().append("共" + src.length + "条结果，每页显示")
            .append(pageSizeSelector).append("条");
        maxPageSpan.html(' / ' + maxPage);
        $('.xTable-selectAll', table).prop('checked', false);

        //分页
        for (i = 0; i < src.length; i++) {
            src[i].selected = false;
            if ((i + 1) % pageSize === 0) {
                subPage = [];
                for (j = pageSize; j > 0; j--) {
                    src[i - j + 1].srcIndex = i - j + 1;
                    subPage.push(src[i - j + 1]);
                }
                pages.push(subPage);
            } else if (i === src.length - 1) {
                subPage = [];
                for (j = pageSize * (maxPage - 1); j < src.length; j++) {
                    src[j].srcIndex = j;
                    subPage.push(src[j]);
                }
                pages.push(subPage);
            }
        }

        //载入第一页
        that.loadPage(1);
    };

    that.destroy = function () {
        $(targetDiv).empty();
    };

    // 加载第X页
    that.loadPage = function (pageNum) {
        var page;
        var editTd;
        var dcArr, cnArr;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        if (pages.length === 0) {
            $(".dataTr", table).remove();
            return;
        }
        if (pageNum > 0 && pageNum <= pages.length) {
            $(".dataTr", table).remove();

            gotoBox.val(pageNum);
            pageNum = parseInt(pageNum);
            page = pages[pageNum - 1];
            page.forEach(function (rowObj, i) {
                var dataTr = $("<tr class='dataTr'></tr>");
                var selectRow = $("<input type='checkbox' class='selectRow'/>");
                var selectRowTd = $("<td class='rowCb'></td>");

                dataTr.attr("index", pageSize * (pageNum - 1) + i);
                if (selectable && rowObj.selected) {
                    selectRow.prop("checked", true);
                    dataTr.addClass('rowSelect');
                }
                dataTr.attr("srcIndex", rowObj.orgIndex).data("srcObj", rowObj);

                selectRowTd.append(selectRow);
                if (selectable) {
                    dataTr.append(selectRowTd);
                }
                dataTr.appendTo(view);
                dataMap.forEach(function (attrName, i) {
                    var dataTd = $("<td class='dataCell' srcName='" + attrName + "'></td>");

                    if (!(attrName in rowObj)) {
                        throw error("XTable.js: 源JSON数据与data属性关联失败，请检查参数对象：column的data属性输入是否正确。");
                    }

                    dataTd.append(rowObj[attrName]);
                    dataTd.appendTo(dataTr);

                    if (editable) {
                        if ("editable" in option.columns[i] && option.columns[i].editable === false) {
                            dataTd.attr('editInvalid', 'true');
                        }
                    }
                });
                if (editable) {
                    editTd = $("<td class='editTd'>" +
                    "<input type='button' class='editBtn' value='编辑'/>" +
                    "</td>");
                    editTd.find('input').button();
                    dataTr.append(editTd);
                    if (!showEditCol) {
                        editTd.hide();
                    }
                }
            });

            if (linkCols && linkCols.length > 0) {
                linkCols.forEach(function (col) {
                    setLink(col.colIndex, col.renderer, col.target, col.onclick, col.type);
                });
            }

            dcArr = $(".dataCell", table).toArray();
            cnArr = $(".colName", table).toArray();
            dcArr.forEach(function (dc) {
                var srcName = $(dc).attr("srcName");
                if (visibleCols.indexOf(srcName) === -1) {
                    $(dc).hide();
                }
            });
            cnArr.forEach(function (cn) {
                var srcName = $(cn).attr("srcName");
                if (visibleCols.indexOf(srcName) === -1) {
                    $(cn).hide();
                }
                else {
                    $(cn).show();
                }
            });
        }
    };

    //选择某行
    that.selectRow = function (row) {
        var index = parseInt($(row).attr("index"));

        beforeSelect(that.getSelectedData(), row);

        $(row).attr("select", "selected");
        $(row).find('input[type=checkbox]').prop('checked', true);
        if (selectedIndexes.indexOf(index) === -1) {
            selectedIndexes.push(index);
            that.src[index].selected = true;
            $(row).addClass('rowSelect');
        }

        selectCb(that.getSelectedData(), row);
        if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
            deleteBtn.button({disabled: false});
        }

        log("XTable-Filter.selectRow: The rows been selected are ");
        log(that.getSelectedData());
    };

    //反选某行
    that.unselectRow = function (row) {
        var index = $(row).attr("index");
        var i = selectedIndexes.indexOf(parseInt(index));

        beforeDeselect(that.getSelectedData(), row);

        $(row)
            .removeClass('rowSelect')
            .removeClass('rowHover')
            .removeClass('rowSelect')
            .removeAttr("select");
        $(row).find('input[type=checkbox]').prop('checked', false);
        $(".xTable-selectAll", table).prop("checked", false);

        if (i !== -1) {
            selectedIndexes.splice(i, 1);
            that.src[index].selected = false;
        }

        deselectCb(that.getSelectedData(), row);

        //当没有行被选中时，delete按钮将会被disabled
        if (that.getSelectedData().length === 0 && deletable) {
            deleteBtn.button({disabled: true});
        }

        log("XTable-Filter.unselectRow: The rows been selected are ");
        log(that.getSelectedData());
    };

    //全选
    that.selectAll = function () {
        var i;

        beforeSelect(that.getSelectedData());

        $('.xTable-selectAll', table).prop('checked', true);
        $(".selectRow", table).prop("checked", true);
        selectedIndexes = [];
        $(".dataTr", table)
            .attr("select", "selected")
            .addClass('rowSelect');

        for (i = 0; i < that.src.length; i++) {
            selectedIndexes.push(i);
            that.src[i].selected = true;
        }

        if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
            deleteBtn.button({disabled: false});
        }

        selectCb(that.getSelectedData());
    };

    //全反选
    that.unselectAll = function () {
        var i;

        beforeDeselect(that.getSelectedData());

        selectedIndexes = [];
        for (i = 0; i < that.src.length; i++) {
            that.src[i].selected = false;
        }

        $(".selectRow", table).prop("checked", false);
        $('.xTable-selectAll', table).prop('checked', false);

        $(".dataTr", table)
            .removeAttr("select")
            .removeClass('rowSelect')
            .removeClass('rowHover');

        //当没有行被选中时，delete按钮将会被disabled
        if (that.getSelectedData().length === 0 && deletable) {
            deleteBtn.button({disabled: true});
        }

        deselectCb(that.getSelectedData());
    };

    //设置每页显示条数
    that.setPageSize = function (pSize) {
        var options = pageSizeSelector[0].options;
        var targetIndex = -1;
        var i, option;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        pageSize = parseInt(pSize);
        $(".orderTag", table).empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            if (parseInt(option.value) === pageSize) {
                targetIndex = i;
                break;
            }
        }

        pageSizeSelector[0].selectedIndex = targetIndex;
        that.init();
    };

    //前往第一页
    that.toFirstPage = function () {
        that.loadPage(1);
    };

    //前往最后一页
    that.toLastPage = function () {
        that.loadPage(pages.length);
    };

    //上一页
    that.toPrevPage = function () {
        var currentPage = parseInt(gotoBox.val());
        if (currentPage > 1) {
            that.loadPage(currentPage - 1);
        }
    };

    //下一页
    that.toNextPage = function () {
        var currentPage = parseInt(gotoBox.val());
        if (currentPage < pages.length) {
            that.loadPage(currentPage + 1);
        }
    };

    //导出选中的数据
    that.getSelectedData = function () {
        var selectedDataArray = [];
        selectedIndexes.forEach(function (index) {
            selectedDataArray.push(that.src[index]);
        });
        return selectedDataArray;
    };

    //设置可见的列
    that.setVisibleCols = function (vCols) {
        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        visibleCols = vCols;
        that.init();
    };

    //在某一列开启编辑功能
    that.editRow = function (row) {
        var dCells = $(row).find('.dataCell').toArray();
        dCells.forEach(function (dCell) {
            var tempVal;
            if (!$(dCell).attr('editInvalid')) {
                tempVal = $(dCell).html();
                $(dCell)
                    .empty()
                    .append("<input class='editInput' type='text' value='" + tempVal + "'/>");
            }
        });
        $($(row).find(".editBtn")).val('保存');
        editingRowCount++;
        $('.xTable-pageSizeSelector', table).prop('disabled', true);
        $('input[type=button]:not(.editBtn)', table).button({disabled: true});
    };

    //保存经过编辑的列
    that.saveRow = function (row) {

        var dCells = $(row).find('.dataCell').toArray();
        var orgIndex = $(row).attr('srcindex'),
            index = $(row).attr('index');
        var editedObj = that.orgSrc[index],
            editedObjArr;

        beforeEdit(editedObj, row);

        dCells.forEach(function (dCell) {
            var tempVal = "";
            var srcName = $(dCell).attr('srcname');

            //判断这个单元格是否可以编辑
            if (!$(dCell).attr('editInvalid')) {
                tempVal = $($(dCell).find('.editInput')).val();
                //数字的情况要单独考虑
                if (typeof targetAttr === "number") {
                    if (isNaN(Number(tempVal))) {

                        that.src[index][srcName] = NaN;
                        that.orgSrc[orgIndex][srcName] = NaN;
                        $(dCell).html(NaN);
                    }
                    else {
                        that.src[index][srcName] = Number(tempVal);
                        that.orgSrc[orgIndex][srcName] = Number(tempVal);
                        $(dCell).html(tempVal);
                    }
                }
                //其他情况，包括字符串和null的情况
                else {
                    that.src[index][srcName] = tempVal;
                    that.orgSrc[orgIndex][srcName] = tempVal;
                    $(dCell).html(tempVal);
                }
            }
        });
        if (editedIndexArr.indexOf(orgIndex) === -1) {
            editedIndexArr.push(orgIndex);
        }

        editedObjArr = that.getEditedData();

        log("XTable-Filter.saveEdit: The rows been edited are ");
        log(editedObjArr);

        $($(row).find(".editBtn")).val('编辑');
        editingRowCount--;

        if (editingRowCount === 0) {
            $('.xTable-pageSizeSelector', table).prop('disabled', false);
            $('input[type=button]:not(.editBtn,.deleteBtn)', table).button({disabled: false});
            if (selectedIndexes.length !== 0) {
                deleteBtn.button({disabled: false});
            }
        }

        editCb(editedObj, row);

        //返回被编辑的对象
        return editedObj;

    };

    //将所有被编辑过的行整理为一个数组并导出
    that.getEditedData = function () {
        var editedObjArr = [];
        editedIndexArr.forEach(function (i) {
            that.orgSrc[i] && editedObjArr.push(that.orgSrc[i]);
        });

        return editedObjArr;
    };

    //排序，根据order进行正序和倒序排序
    //这个方法使用了WebWorker以提高用户体验
    //因此在IE10以下的浏览器将会出现异常
    that.sortBy = function (name, order) {
        var worker = new Worker(root + "/workers/XTableSort.js");

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }

        showActionHint('正在排序，请稍候...');

        worker.postMessage({
            src: that.src,
            name: name,
            order: order
        });

        worker.onmessage = function (e) {
            removeActionHint();
            that.src = e.data;
            that.init();
            worker.terminate();
        };
    };

    //删除条目，使用了WebWorker
    that.deleteSelectedData = function () {
        var selectedData = that.getSelectedData();
        var worker;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }

        if (beforeDelete(selectedData, that.orgSrc)) {

            showActionHint('正在删除，请稍候...');

            worker = new Worker(root + '/workers/XTableDelete.js');

            worker.postMessage({
                selectedData: selectedData,
                orgSrc: that.orgSrc
            });

            worker.onmessage = function (e) {

                that.orgSrc = e.data;
                that.src = that.orgSrc.slice();
                //给每个数据对象增加两个属性
                //由于源orgSrc数组发生了变化，这里必须重新初始化orgIndex和selected
                that.src.forEach(function (sub, i) {
                    //selected属性用来保存该对象是否被选中
                    sub.selected = false;
                    //orgIndex保存了该对象原始的index
                    sub.orgIndex = i;
                });

                removeActionHint();
                $(controller).find('.cFilterData').remove();
                $(controller).find('.resetData').remove();
                $(deleteBtn).button({disabled: true});
                that.init();
                worker.terminate();

                deleteCb(selectedData, that.orgSrc);
            };
        }
    };
    /*
     * 为表格附加其他功能,将在表格上方翻页功能旁边附加一个功能按键，并且返回按键dom
     * fName:功能名，将作为button的value值
     * handler:点击功能按钮后执行的事件函数，接受两个参数：目前选中的数据的json以及源json数据
     * className:为按钮添加class,以空格分隔
     * style:为按钮附加样式
     */
    that.extendFunction = function (option) {
        var funcBtn = $("<input type='button' value='" + option.fName + "' class='funcButton'/>");
        funcBtn
            .appendTo(that.pageController)
            .button({disabled: option.disabled})
            .click(function () {
                $.proxy(option.handler, this)(that.getSelectedData(), that.orgSrc);
            });
        option.className && funcBtn.addClass(option.className);
        option.style && (funcBtn[0].style = funcBtn[0].style + ';' + option.style);
        return funcBtn;
    };

    /*
     * 为表格添加一行，由于插入功能场景比较复杂，因此不提供默认的添加功能，用户需使用此函数自行定制
     * 可以在此接口上实现添加新表格数据的功能
     * 接收三个可选参数，分别是新行中每一列的默认值（如果没有则默认为一空行），插入前执行的操作，以及插入后的回调函数
     */
    that.addRow = function (dataObj, beforeAdd, callback) {
        if (dataObj === undefined) {
            dataObj = {};
        }

        beforeAdd && beforeAdd(dataObj, that.orgSrc);

        dataMap.forEach(function (attr) {
            if (dataObj[attr] === undefined) {
                dataObj[attr] = '';
            }
        });
        dataObj.selected = false;
        dataObj.orgIndex = that.orgSrc.length;

        that.src.push(dataObj);
        that.orgSrc.push($.extend({}, dataObj, true));

        that.init();
        that.toLastPage();
        that.view
            .find('.dataTr')
            .last()
            .find('.editTd')
            .find('input')
            .click();
        that.view
            .find('.dataTr')
            .last()
            .find('input[type=text]')
            .first()
            .focus();
        callback && callback(dataObj, that.orgSrc);
    };

    /*
     * 列过滤器，继承自基本过滤器类
     * 重写了基本过滤器类中的loadFilter方法
     * 提取列中所有内容，生成一个关键字清单，根据用户输入的关键字进行过滤表格
     */
    that.filter = (function () {
        //继承了基本过滤器
        var filterThat = XUtil.XFilter({
            //src置为空，之后会根据列名设置src并加载
            src: [],
            id: that.id + '-filter',
            filterType: filterType
        });

        var filterId = filterThat.id;
        //过滤器容器div
        var filterDiv = filterThat.filterDiv;

        var filterDialog = filterDiv.parent();

        //过滤器标题
        var filterTitle = "";
        //与当前过滤器对应的源数据的某个属性
        var filterSrcName = "";
        //选中的关键字
        var selectedNames = filterThat.selectedNames;

        //自动调整dialog的宽度
        filterDialog
            .css('width', 'auto')
            .css('font-size', '16px');

        filterDiv.dialog({
            open: function () {
                XUtil.helpers.addShield(document.body);
            }
        });
        filterDialog.appendTo(table);

        //向过滤器中加载关键字，重载
        filterThat.loadFilterOverride = function (title, srcName) {
            //初始化src数组
            filterThat.src = [];
            filterSrcName = srcName;
            that.src.forEach(function (sub) {
                filterThat.src.push(sub[srcName]);
            });
            //根据传入的列名加载过滤器
            filterThat.loadFilter(title);
        };

        //反向过滤，对选中的关键字求反后过滤
        filterThat.cFilterdata = function () {
            var worker;

            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (that.src.length !== that.orgSrc.length) {

                $('.orderTag', table).empty();
                showActionHint('正在过滤，请稍候...');

                worker = new Worker(root + "/workers/XTableCFilter.js");

                worker.postMessage({
                    src: that.src,
                    orgSrc: that.orgSrc
                });

                worker.onmessage = function (e) {
                    removeActionHint();
                    that.src = e.data;
                    that.init();
                };
            }
        };

        //根据选中的关键字过滤表单
        filterThat.filterData = function () {
            var worker;

            selectedNames = filterThat.selectedNames;

            showActionHint('正在过滤，请稍候...');

            filterDiv.dialog("close");

            worker = new Worker(root + "/workers/XTableFilterData.js");

            worker.postMessage({
                src: that.src,
                selectedNames: selectedNames,
                filterSrcName: filterSrcName
            });

            worker.onmessage = function (e) {
                var resetData, cFilterData;

                removeActionHint();

                $('#' + filterId + '-cFilterData', table).remove();
                //这里src的指向发生了变动，所以需要加一句that.src=src
                that.src = e.data;
                that.init();
                $('#' + filterId + "-resetData", table).remove();
                if (that.src.length !== that.orgSrc.length) {
                    resetData = $("<input type='button' class='resetData' id=\'" +
                    filterId + "-resetData\' style=''value='重置过滤器'/>");
                    cFilterData = $("<input type='button' class='cFilterData' id=\'" +
                    filterId + "-cFilterData\' value='反向过滤'/>");
                    resetData.insertAfter(pageSizeController);
                    resetData.button();
                    cFilterData.insertAfter(resetData);
                    cFilterData.button();
                }
                worker.terminate();
            };
        };

        //重置过滤器，显示表格中全部元素
        filterThat.resetData = function () {

            XUtil.helpers.addShield();

            that.src = that.orgSrc.slice();
            $('.orderTag', table).empty();
            $('#' + filterId + '-resetData', table).remove();
            $('#' + filterId + '-cFilterData', table).remove();
            $(".orderTag", table).empty();

            XUtil.helpers.removeShield();

            that.init();
        };

        //初始化各dom元素的响应事件
        $(".openFilterLi", table).click(function (e) {
            var isOpen = filterDiv.dialog('isOpen');
            var title, srcName;

            e.stopPropagation();

            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (!isOpen) {
                title = $(this).prev().html();
                srcName = $(this.parentNode).attr("srcname");
                filterThat.loadFilterOverride(title, srcName);
            }
        });

        $(table).undelegate("#" + filterId + "-resetData", "click");
        $(table).delegate("#" + filterId + "-resetData", "click", function () {
            filterThat.resetData();
        });

        $(filterDialog).undelegate("#" + filterId + "-startFilter", "click");
        $(filterDialog).delegate("#" + filterId + "-startFilter", "click", function () {
            filterThat.filterData();
        });

        $(table).undelegate("#" + filterId + "-cFilterData", "click");
        $(table).delegate("#" + filterId + "-cFilterData", "click", function () {
            filterThat.cFilterdata();
        });

        $("#" + filterId + "-resetFilter", filterDialog).unbind().click(function () {
            $("#" + filterId + "-filterStr").val("请输入过滤关键字").select();
            filterThat.loadFilterOverride(filterTitle, filterSrcName);
        });

        return filterThat;
    })();

    //初始化各dom的响应事件
    //全选当前页按钮
    selectCurrentPage.click(function () {
        var rows = $('.dataTr', table).toArray();
        $('.selectRow', table).prop('checked', true);
        rows.forEach(function (row) {
            if (!$(row).attr('select')) {
                that.selectRow(row);
            }
        });
    });

    //前往第一页按钮
    firstButton.click(function () {
        that.toFirstPage();
    });

    //前一页按钮
    prevButton.click(function () {
        that.toPrevPage();
    });

    //前往某页输入框
    gotoBox.keydown(function (e) {
        var pageNum;
        if (e.keyCode === 13) {
            pageNum = parseInt(this.value);
            that.loadPage(pageNum);
        }
    });

    //下一页按钮
    nextButton.click(function () {
        that.toNextPage();
    });

    //最后一页按钮
    lastButton.click(function () {
        that.toLastPage();
    });

    //设置按钮
    openSetV.click(function () {
        vcolsDialog.dialog("open");
    });

    //删除列按钮
    deletable && deleteBtn.click(function () {
        that.deleteSelectedData();
    });

    //设置可见列对话框
    $("#" + that.id + "-submitVCols", vcolsDialog.parent()).click(function () {
        var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).toArray();
        var tempVisibleCols = [];

        vColCb.forEach(function (cb) {
            var checked = $(cb).is(":checked");
            if (checked) {
                tempVisibleCols.push($(cb).attr("srcName"));
            }
        });
        that.setVisibleCols(tempVisibleCols);
        $(vcolsDialog).dialog("close");
    });

    $('.showAllCol', vcolsDialog.parent()).change(function () {
        var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent());
        if ($(this).is(':checked')) {
            vColCb.prop('checked', true);
        }
        else {
            vColCb.prop('checked', false);
        }
    });

    $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).change(function () {
        if ($('.showAllCol', vcolsDialog.parent()).is(':checked')) {
            if (!$(this).is(':checked')) {
                $('.showAllCol', vcolsDialog.parent()).prop('checked', false);
            }
        }
    });

    //每页显示条数选择器
    $(table).undelegate(".xTable-pageSizeSelector", "change");
    $(table).delegate(".xTable-pageSizeSelector", "change", function () {
        var index = this.options.selectedIndex;
        that.setPageSize(this.options[index].value);
    });

    //选择checkbox
    $(table).undelegate(".selectRow", "change");
    $(table).delegate(".selectRow", "change", function () {
        var row = this.parentNode.parentNode;
        if ($(this).is(":checked")) {
            that.selectRow(row);
        } else {
            that.unselectRow(row);
        }
    });

    //全选checkbox
    $(table).undelegate(".xTable-selectAll", "change");
    $(table).delegate(".xTable-selectAll", "change", function () {
        if ($(this).is(":checked")) {
            that.selectAll();
        } else {
            that.unselectAll();
        }
    });

    //行的hover事件
    $(table).undelegate(".dataTr", "mouseover");
    $(table).delegate(".dataTr", "mouseover", function () {
        var selected = $(this).attr("select");
        if (!selected) {
            $(this).addClass('rowHover');
        }
    });

    $(table).undelegate(".dataTr", "mouseout");
    $(table).delegate(".dataTr", "mouseout", function () {
        var selected = $(this).attr("select");
        if (!selected) {
            $(this).removeClass('rowHover');
        }
    });

    //列排序
    $(table).undelegate(".colName", "click");
    $(table).delegate(".colName", "click", function () {
        var name = $(this).attr("srcname");
        var sortable = $(this).attr("sortable");
        if (sortable === "true") {
            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (!$(this).attr("order") || $(this).attr("order") === "desc") {
                $(this).attr("order", "asc");
                $(table).find(".orderTag").empty();
                $(this).find(".orderTag").append("<img src='" + root + "/images/sort_asc.gif'/>");
                that.sortBy(name, "asc");
            } else {
                $(this).attr("order", "desc");
                $(table).find(".orderTag").empty();
                $(this).find(".orderTag").append("<img src='" + root + "/images/sort_desc.gif'>");
                that.sortBy(name, "desc");
            }
        }
    });

    //编辑按钮，开启该行编辑功能
    $(table).undelegate(".editBtn", 'click');
    $(table).delegate(".editBtn", 'click', function () {
        var row = this.parentNode.parentNode;
        var type = $(this).val();

        if (type === "编辑") {
            that.editRow(row);
        }
        else {
            that.saveRow(row);
        }
    });

    //单元格输入框focus事件，全选当前输入框内容
    $(table).undelegate(".editInput", 'focus');
    $(table).delegate(".editInput", 'focus', function () {
        var self = this;
        setTimeout(function () {
            self.select();
        }, 200);
    });

    //单元格双击，开启该行编辑功能
    $(table).undelegate(".dataCell", "dblclick");
    $(table).delegate(".dataCell", "dblclick", function () {
        var row, type;
        if (editable && !$(this).attr('editInvalid')) {
            row = this.parentNode;
            type = $($(row).find(".editBtn")).val();

            if (type === "编辑") {
                that.editRow(row);
            }
            $(this).find('input').focus();
        }
    });

    //单元格输入框回车事件，保存对当前行的修改
    $(table).undelegate(".editInput", "keydown");
    $(table).delegate(".editInput", "keydown", function (event) {
        var editBtn;
        if (event.keyCode === 13) {
            editBtn = $(this.parentNode.parentNode).find('.editBtn');
            if ($(editBtn).val() === '保存') {
                $(editBtn).click();
            }
        }
    });

    //初始化表格
    that.init();

    //返回表格实例that
    return that;
};

/*
 * 基本过滤器类
 * 接受以下参数
 * src:字符串数组，包含了应当加载的所有关键字，必须
 * id:过滤器dom的id，可选
 * startFilterText:确定按钮的文本，可选，
 * startFilterHandler:点击确定按钮时的响应
 * closeFilterText:取消按钮的文本
 * closeFilterHandler:点击取消按钮时的响应
 * filterType:设置过滤器关键字匹配模式，设置为1时为拆字匹配（例如输入北大即可匹配到北京大学），
 *            设置为2时为连字匹配（方法和String的search方法类似），可选，默认为2
 */
XUtil.XFilter = function (option) {
    //控制台函数的引用
    var log = XUtil.helpers.log;
    var error = XUtil.helpers.error;

    //用来返回的实例
    var that = {};

    //类的私有成员
    var id = option.id || 'XFilter-' + XUtil.helpers.guid(),
    //	确定和取消按钮的文本
        startFilterText = option.startFilterText || "确定",
        closeFilterText = option.closeFilterText || '取消',
    //	确定和取消按钮的响应函数
        startFilterHandler = option.startFilterHandler || function (selectedNames, filter) {
                filter.filterDiv.dialog('close');
            },
        closeFilterHandler = option.closeFilterHandler || function (selectedNames, filter) {
                filter.filterDiv.dialog('close');
            },
    //	过滤类型
        filterType = option.filterType || 2,
    //	过滤器的标题
        title = option.title || "",
    //	rootPath
        root = XUtil.config.rootPath;

    //开始生成对话框，使用jquery-ui.dialog
    var filterDiv = $("<div style='display:table' title='过滤器'></div>");
    $(filterDiv).attr("id", id);
    filterDiv.dialog({
        autoOpen: false,
        resizable: false,
        title: title,
        buttons: [
            {
                text: startFilterText,
                id: id + "-startFilter",
                click: function () {
                    startFilterHandler(that.selectedNames, that);
                }
            },
            {
                text: closeFilterText,
                id: id + "-closeFilter",
                click: function () {
                    closeFilterHandler(that.selectedNames, that);
                }
            }
        ],
        position: {
            my: "top+10%",
            at: "top+10%",
            of: window
        },
        //打开和关闭时清除关键字缓存
        close: function () {
            XUtil.helpers.removeShield();

            filterDiv.removeData('allNamesCatch');
            filterDiv.removeData('sNamesCatch');
        },
        open: function () {
            XUtil.helpers.addShield();

            filterDiv.removeData('allNamesCatch');
            filterDiv.removeData('sNamesCatch');
        }
    });

    var filterDialog = filterDiv.parent();

    //开始生成控制界面
    var filter = $("<div class='xFilter-searchDiv'>"
        + "<div><input type='text' value='请输入过滤关键字' class='xFilter-filterStr' id=\'" + id + "-filterStr\'/></div>"
        + "<div>" +
        "<input type='button' class='XFilter-searchBtn' value='搜索' id=\'" + id + "-filterSubmit\'/></div>"
        + "<div><input type='button' class='XFilter-resetBtn' value='重置' id=\'" + id + "-resetFilter\'/>" +
        "</div></div>"),
        completeMatch = $("<input type='radio' value='completeMatch' id='completeMatch' name='matchType'/>"),
        partialMatch = $("<input type='radio' value='partialMatch' id='partialMatch' checked='checked' name='matchType'/>"),
        matchType = "partial",
        matchRadios = $("<div class='matchRadios'></div>"),
        completeMatchSpan = $("<div></div>").append(completeMatch).append("<span class='xFilter-radioSpan'>完全匹配</span>"),
        partialMatchSpan = $("<div></div>").append(partialMatch).append("<span class='xFilter-radioSpan'>部分匹配</span>"),
        filterResult = $("<div class='xFilter-filterResult' id='xFilter-filterResult'></div>");

    matchRadios.append(partialMatchSpan).append(completeMatchSpan);
    filter.append(matchRadios);
    filterDiv.append(filter).append(filterResult);

    //检验参数合法性
    if (!root || root === "") {
        throw error("XFilter: 配置参数有误，请检查myUtil.config对象中的root属性");
    }
    if (!option.src) {
        throw error("XFilter: 配置参数有误，请检查option对象的src属性");
    }

    //开始初始化实例成员
    that.option = option;
    //源数据数组
    that.src = option.src;
    //所有关键字
    that.allNames = [];
    //选中的关键字
    that.selectedNames = [];
    //关键字过滤后剩余的所有关键字
    that.tempAllNames = [];
    //id
    that.id = option.id || 'XFilter-' + XUtil.helpers.guid();
    //过滤器类型
    that.filterType = filterType;
    //关键字匹配类型
    that.matchType = matchType;
    //将重要的dom加入实例
    that.filterDiv = filterDiv;
    that.filterResult = filterResult;
    that.startFilterBtn = $('#' + id + "-startFilter", filterDialog)[0];
    that.closeFilterBtn = $("#" + id + "-closeFilter", filterDialog)[0];
    that.completeMatch = completeMatch;
    that.partialMatch = partialMatch;

    //实例方法
    //生成关键字列表（关键字去重）并载入过滤器
    that.loadFilter = function (title) {
        //缓存
        var allNamesCatch = filterDiv.data('allNamesCatch');
        var sNamesCatch = filterDiv.data('sNamesCatch');
        var worker, option;
        var selectAll;

        if (title) {
            filterDiv.dialog({
                title: title
            });
        }

        filterDiv.dialog("open");
        filterDialog.css('width', 'auto');

        //由于jquery.button组件不能给未添加到文档中的dom添加className，因此只能在这里调用button()
        $('input[type=button]', filterDiv).button();

        $("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
        partialMatch.prop("checked", true);
        completeMatch.prop("checked", false);
        filterDiv.find(".XFilter-matchResult").remove();

        $(filterResult).empty().append("正在加载关键字，请稍候...");
        $("#" + id + "-startFilter").button({
            disabled: true
        });

        that.tempAllNames = [];
        //如果没有缓存，则调用WebWorker载入关键字列表
        if (!allNamesCatch || !sNamesCatch) {

            log("XFilter.loadFilter: 未找到缓存，将直接加载关键字.");

            worker = new Worker(root + "/workers/XFilterGetKeys.js");
            option = {
                src: that.src
            };
            worker.postMessage(option);
            worker.onmessage = function (e) {
                var res = e.data;
                var names = res.names;
                var sNames = res.sNames;

                selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
                "<input type='checkbox' class=\'" +
                id + "-fselectAll\' checked='checked' id=\'" +
                id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
                "</div>");

                $("#" + id + "-startFilter", filterDialog).button({
                    disabled: false
                });

                filterResult.empty().append(selectAll);
                that.allNames = names;
                that.selectedNames = sNames;
                names.forEach(function (name, i) {
                    var filterName;
                    if (i < 1000) {
                        filterName = $("<div class='nameCell'>" +
                        "<input type='checkbox' class=\'" +
                        id + "-nameCb\' key='" +
                        name + "' checked='checked'><span class='xFilter-nameTag'>" +
                        name + "</span>" +
                        "</div>");
                        filterResult.append(filterName);
                    }
                });
                filterDiv.data('allNamesCatch', that.allNames);
                filterDiv.data('sNamesCatch', that.selectedNames);

                worker.terminate();
            };
        }
        //如果有缓存，则直接载入缓存
        else {
            log('XFilter.loadFilter: 从缓存加载关键字.');

            selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
            "<input type='checkbox' class=\'" +
            id + "-fselectAll\' checked='checked' id=\'" +
            id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
            "</div>");
            filterResult.empty().append(selectAll);

            $("#" + id + "-startFilter", filterDialog).button({
                disabled: false
            });

            that.allNames = allNamesCatch;
            that.selectedNames = sNamesCatch;
            that.allNames.forEach(function (name, i) {
                var filterName;
                if (i < 1000) {
                    filterName = $("<div class='nameCell'>" +
                    "<input type='checkbox' class=\'" +
                    id + "-nameCb\' key='" +
                    name + "' checked='checked'/><span class='xFilter-nameTag'>" +
                    name + "</span>" +
                    "</div>");
                    filterResult.append(filterName);
                }
            });
        }
    };

    //选中某关键字
    that.selectName = function (name) {
        if (that.selectedNames.indexOf(name) === -1) {
            that.selectedNames.push(name);
        }
    };

    //反选某关键字
    that.unselectName = function (name) {
        var index = that.selectedNames.indexOf(name);
        if (index !== -1) {
            that.selectedNames.splice(index, 1);
        }
        $("#" + id + "fselectAll", filterDialog).prop("checked", false);
    };

    //根据用户输入过滤关键字
    that.searchByName = function (searchStr, type) {
        var selectedNames = [],
            allNames = that.allNames,
            tempAllNames = [];

        var filterResult = that.filterResult;

        var searchType = "";

        var strArray = searchStr.split(/\s+/);

        var i, j, k, substr, orgName, name, hasSubstr, startPos, endPos;

        var tempSelectAll = $("<div id='tSelectAll'>" +
            "<input type='checkbox' checked='checked' class=\'" +
            id + "-fselectAll\' id=\'" +
            id + "-fselectAll\'>" +
            "<span class='xFilter-nameTag'>全部</span>" +
            "</div>"),
            tempNameCell;

        if (!type) {
            searchType = "partial";
            if ($(completeMatch).is(":checked")) {
                searchType = "complete";
            }
        }
        else {
            searchType = type;
        }
        searchStr = searchStr
            .replace(/[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]|\s|\,|\.|\?/g, " ")
            .trim()
            .toLowerCase();

        for (i = 0; i < strArray.length; i++) {
            substr = strArray[i].trim();

            if (substr === '') {
                continue;
            }

            for (j = 0; j < allNames.length; j++) {
                orgName = allNames[j].toString();
                name = allNames[j].toString().toLowerCase();
                hasSubstr = true;
                //部分匹配
                if (searchType === "partial") {
                    //拆字匹配
                    if (parseInt(filterType) === 1) {
                        //如果过滤关键字不为数字
                        if (isNaN(Number(substr))) {
                            //判断关键字是否包含用户输入的字符
                            for (k = 0; k < substr.length; k++) {
                                if (name.search(substr.charAt(k)) === -1) {
                                    hasSubstr = false;
                                    break;
                                }
                            }
                            //判断字符的先后顺序是否符合
                            if (hasSubstr) {
                                var foundIndexes = [];
                                for (k = 0; k < substr.length; k++) {
                                    if (name.search(substr.charAt(k)) !== -1) {
                                        startPos = name.indexOf(substr.charAt(k));
                                        endPos = name.lastIndexOf(substr.charAt(k));
                                        if (foundIndexes.length === 0) {
                                            foundIndexes.push(startPos);
                                        }
                                        else {
                                            if (endPos < foundIndexes[foundIndexes.length - 1]) {
                                                hasSubstr = false;
                                                break;
                                            }
                                            else {
                                                if (startPos > foundIndexes[foundIndexes.length - 1]) {
                                                    foundIndexes.push(startPos);
                                                }
                                                else {
                                                    foundIndexes.push(endPos);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        //如果过滤关键字是数字且候选关键字也是数字
                        else if (!isNaN(substr) && !isNaN(parseInt(name))) {
                            hasSubstr = false;
                            if (name.toString().search('' + substr) === 0) {
                                hasSubstr = true;
                            }
                        }
                        //如果候选关键字是字符串
                        else if (!isNaN(substr) && isNaN(parseInt(name))) {
                            hasSubstr = true;
                            if (name.toString().search('' + substr) === -1) {
                                hasSubstr = false;
                            }
                        }
                    }
                    //连字匹配
                    else {
                        hasSubstr = false;
                        if (name.search(substr) !== -1) {
                            hasSubstr = true;
                        }
                    }
                }
                //完全匹配
                else {
                    hasSubstr = false;
                    if (name === substr) {
                        hasSubstr = true;
                    }
                }
                if (hasSubstr) {
                    selectedNames.indexOf(orgName) === -1 && selectedNames.push(orgName);
                    tempAllNames.indexOf(orgName) === -1 && tempAllNames.push(orgName);
                }
            }
        }

        filterResult.empty().append(tempSelectAll);

        for (i = 0; i < tempAllNames.length; i++) {
            if (i < 500) {
                name = tempAllNames[i];
                tempNameCell = $("<div class='nameCell'>" +
                "<input type='checkbox' checked='checked' class=\'" +
                id + "-nameCb\' key='" +
                name + "' index='" +
                i + "'>" +
                "<span class='xFilter-nameTag'>" +
                name +
                "</span>" +
                "</div>");
                filterResult.append(tempNameCell);
            }
            else {
                break;
            }
        }

        matchRadios.find(".XFilter-matchResult").remove();
        matchRadios.append("<span class='XFilter-matchResult'>共匹配到" +
        "<span class='red'>" + tempAllNames.length + "</span>" +
        "条关键字</span>");
        that.selectedNames = selectedNames;
        that.tempAllNames = tempAllNames;
        log(that.selectedNames);
    };

    //选中所有关键字
    that.fSelectAll = function () {
        that.selectedNames = [];
        if (that.tempAllNames.length === 0) {
            that.allNames.forEach(function (name) {
                that.selectedNames.push(name);
            });
        } else {
            that.tempAllNames.forEach(function (name) {
                that.selectedNames.push(name);
            });
        }
    };

    //反选所有关键字
    that.fUnselectAll = function () {
        that.selectedNames = [];
    };

    //组件响应事件初始化
    //输入框的focus事件
    //为了解决ff下的未知bug，select都在200毫秒后执行
    $("#" + id + "-filterStr", filterDialog).unbind().focus(function () {
        var self = this;
        setTimeout(function () {
            self.select();
        }, 200);
    });

    //输入框中点击回车，开始搜素关键字
    $("#" + id + "-filterStr", filterDialog).keydown(function (e) {
        if (e.keyCode === 13) {
            $("#" + id + "-filterSubmit", filterDialog).click();
        }
    });

    //搜索按钮单击事件
    $("#" + id + "-filterSubmit", filterDialog).unbind().click(function () {
        var searchStr = $("#" + id + "-filterStr", filterDialog).val();
        var type;
        if (searchStr !== "" && searchStr !== "请输入过滤关键字") {
            type = "partial";
            if ($(completeMatch).is(":checked")) {
                type = "complete";
            }
            that.searchByName(searchStr, type);

        }
        else
            $("#" + id + "-resetFilter", filterDialog).click();
    });

    //关键字前选择框改变事件
    $(filterDialog).undelegate("." + id + "-nameCb", "change");
    $(filterDialog).delegate("." + id + "-nameCb", "change", function () {
        var checked = $(this).is(":checked");
        var name = $(this).attr("key");
        if (!checked) {
            that.unselectName(name);
            $("." + id + "-fselectAll", filterDialog).prop("checked", false);
        } else {
            that.selectName(name);
        }
    });

    //选择全部关键字选择框改变事件
    $(filterDialog).undelegate("." + id + "-fselectAll", "change");
    $(filterDialog).delegate("." + id + "-fselectAll", "change", function () {
        var checked = $(this).is(":checked");
        if (!checked) {
            $("." + id + "-nameCb", filterDialog).prop("checked", false);
            that.fUnselectAll();
        } else {
            $("." + id + "-nameCb", filterDialog).prop("checked", true);
            that.fSelectAll();
        }
    });

    //重置按钮单击事件
    $("#" + id + "-resetFilter", filterDialog).unbind().click(function () {
        $("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
        that.loadFilter();
    });

    return that;
};

/**
 * 源文件：src/waterfall.js
 * 瀑布式布局，展示方式类似手机端的百度图片的搜索结果
 * 可以接受任意格式的json数组，然后调用用户自定义的renderer函数将每个数组中的每一个json元素转化为dom元素的字符串（即component中的内容）
 * 然后以瀑布式布局的模式展示这些dom
 */

XUtil.XWaterfall = function (option) {

    var log = XUtil.helpers.log;

    //读取配置项
    var url = option.url || '',
        src = $.isArray(option.src) ? option.src : [],
        colNum = $.isNumeric(Math.floor(option.colNum)) ? Math.floor(option.colNum) : 5,
        renderTo = option.renderTo || document.body,
        colWidth = $.isNumeric(option.colWidth) ? option.colWidth : 236,
        contentWidth = $.isNumeric(option.contentWidth) ? option.contentWidth : 234,
        initialSize = $.isNumeric(Math.floor(option.initialSize)) ? option.initialSize : colNum * 10,
        marginTop = $.isNumeric(option.marginTop) ? option.marginTop : 10,
        fetchSize = $.isNumeric(option.fetchSize) ? option.fetchSize : colNum * 5,
        renderer = $.isFunction(option.renderer) ? option.renderer : function (model) {
            return model;
        },
        onFetch = $.isFunction(option.onFetch) ? option.onFetch : function (renderTo) {
            log('XWaterfall: fetching...');
        },
        fetchCallback = $.isFunction(option.fetchCallback) ? option.fetchCallback : function (status, renderTo, fetchedLen) {
            log('XWaterfall: ' + status);
        },
        fetchSizeAttr = option.fetchSizeAttr || 'fetchSize',
        currentSizeAttr = option.currentSizeAttr || 'currentSize';

    //私有成员及方法
    //  保存当前显示元素之前被移除元素的缓冲
    var preCache = [],
    //  保存当前显示元素之后被移除元素的缓冲
        afterCache = [],
    //  保存全部已加载元素的数组
        all = [],
    //  保存所有列信息的数组
        columns = [],
    //  上方基线
        upperHeight = 0,
    //  下方基线
        bottomHeight = 0,
    //  容器高度，将随着加载/移除元素动态设置
        maxHeight = 0,
    //  是否可以继续fetch
        fetchEnable = true;

    //推入一个新的component（并非从afterCache中读取）
    var pushComponent = function (component) {
        var i, col;
        var targetCol = columns[0],
            minHeight = columns[0].currentHeight;

        for (i = 0; i < columns.length; i++) {
            col = columns[i];
            if (col.currentHeight < minHeight) {
                minHeight = col.currentHeight;
                targetCol = col;
            }
        }

        targetCol.append(component, 'new');
        all.push(component);

        return targetCol;
    };

    //计算并设置顶端基线
    var setUpperHeight = function () {
        var upperHeights = [];

        columns.forEach(function (col) {
            upperHeights.push(col.currentTop);
        });

        upperHeight = Math.max.apply(window, upperHeights);
    };

    //计算并设置底端基线
    var setBottomHeight = function () {
        var bottomHeights = [];

        columns.forEach(function (col) {
            bottomHeights.push(col.currentHeight);
        });

        bottomHeight = Math.min.apply(window, bottomHeights);
    };

    //计算并设置控件的最大高度
    var setMaxHeight = function () {
        var maxHeights = [];

        columns.forEach(function (col) {
            maxHeights.push(col.currentHeight);
        });

        maxHeight = Math.max.apply(window, maxHeights);
    };

    //实例对象及实例属性/方法
    var that = {};

    that.set = function (attrs) {
        $.isNumeric(attrs.initialSize) && (initialSize = attrs.initialSize);
        $.isNumeric(attrs.colWidth) && (colWidth = attrs.colWidth);
        $.isNumeric(attrs.marginTop) && (marginTop = attrs.marginTop);
        $.isNumeric(attrs.fetchSize) && (fetchSize = attrs.fetchSize);
        $.isNumeric(attrs.colNum) && (colNum = attrs.colNum);
        $.isNumeric(attrs.contentWidth) && (contentWidth = attrs.contentWidth);
        $.isFunction(attrs.onFetch) && (onFetch = attrs.onFetch);
        $.isFunction(attrs.fetchCallback) && (fetchCallback = attrs.fetchCallback);
        ("url" in attrs) && (url = attrs.url);

        return that;
    };

    //向瀑布流中追加新元素
    that.fetch = function () {
        var i, currentLen;
        var targetCol,
            attrData = {};

        currentLen = all.length;

        //从静态资源中获得新元素
        if (currentLen < src.length) {
            for (i = currentLen; i < currentLen + fetchSize; i++) {
                if (i < src.length) {
                    targetCol = pushComponent(src[i]);
                    preCache.push(targetCol.shift());
                }
                else {
                    that.fetch();
                    break;
                }
            }
        }
        else {
            //从服务器请求新元素
            if (url !== '') {
                onFetch(renderTo);
                //在本次fetch操作结束之前，禁止新的fetch操作
                fetchEnable = false;

                attrData[fetchSizeAttr] = fetchSize;
                attrData[currentSizeAttr] = currentSize;

                //会自动为get请求添加两个参数，当前已经获取的所有资源的数量和期望获取元素的数量(等于fetchSize)
                $.get(url, attrData)
                    .done(function (data) {
                        if (data.message === 'success') {

                            if (data.src.length === fetchSize) {

                                data.src.forEach(function (com) {
                                    var targetCol = pushComponent(com);
                                    preCache.push(targetCol.shift());
                                });

                                //fetch成功后，允许新的fetch操作
                                fetchEnable = true;

                                fetchCallback('success', renderTo, data.src.length);
                            }
                            else {
                                log('XWaterfall: fetch failed, data.src.length is not equal to fetchsize.');
                                fetchEnable = false;
                            }
                        }
                        else if (data.message === 'all loaded') {
                            log('XWaterfall: no more resource!');
                            fetchEnable = false;

                            fetchCallback('allLoaded', renderTo, data.src.length);
                        }
                        else {
                            log('XWaterfall: exception:' + data.message);
                            fetchEnable = false;
                            fetchCallback('exception', renderTo, data.src.length);
                        }
                    })
                    .fail(function () {
                        log('XWaterfall: fetch failed!');
                        fetchEnable = false;
                        fetchCallback('error', renderTo, data.src.length);
                    });
            }
            else {
                fetchEnable = false;
                return;
            }

        }

        setUpperHeight();
        setBottomHeight();
        setMaxHeight();

        $(renderTo).css('height', maxHeight);

        return that;
    };

    //从前/后缓冲中重新获取/添加元素
    that.reAttach = function (position) {

        var component, targetColIndex, targetCol;

        if (position === 'top') {
            component = preCache.pop();
            if (component) {
                targetColIndex = component.col;
                targetCol = columns[targetColIndex];
                targetCol.prepend(component);

                afterCache.push(targetCol.pop());
            }
        }
        else if (position === 'bottom') {
            component = afterCache.pop();

            if (component) {
                targetColIndex = component.col;
                targetCol = columns[targetColIndex];
                targetCol.append(component, 'old');
                preCache.push(targetCol.shift());
            }
        }

        setUpperHeight();
        setBottomHeight();
        setMaxHeight();

        return that;
    };

    //初始化瀑布式布局
    //可以单独调用，这样能实现还原布局的效果（滚动条跳到顶端，并且只加载初始的元素）
    that.init = function () {
        var i, col;

        all = [];
        preCache = [];
        afterCache = [];
        columns = [];
        upperHeight = 0;
        bottomHeight = 0;
        maxHeight = 0;
        fetchEnable = true;

        $(renderTo)
            .empty()
            .css('min-height', 0)
            .css('height', 0)
            .css('position', 'relative');

        for (i = 0; i < colNum; i++) {

            //这里采取这种形式是为了提高性能, Array的join操作比直接拼字符串稍快
            var genHtml = function (com) {
                var tmpl = [
                    "<div style='left:",
                    com.left,
                    "px;top:",
                    com.top,
                    "px;width:",
                    contentWidth,
                    "px;height:",
                    com.height,
                    "px;' id='",
                    com.id,
                    "' class='XWaterfall-component'>",
                    renderer(com.model),
                    "</div>"
                ];

                return tmpl.join('');
            };

            //列对象，存储了一些基本信息，包括：
            //列中的所有元素，列的位置(targetLeft)，列的index，列的当前高度（随着元素的添加和删除会动态
            //变化），以及列中第一个元素的top(currentTop)
            //提供四个方法：append(在列末尾添加新元素),prepend（在列的头部添加新元素），
            //pop（从列的末尾推出一个元素），shift（从列头推出一个元素）
            col = {
                index: i,
                targetLeft: colWidth * i,
                components: [],
                currentTop: $(renderTo).offset().top,
                currentHeight: 0,
                append: function (com, type) {

                    var self = this;

                    var component = {},
                        domHtml,
                        domNode;

                    var id;

                    var top;

                    if (type === 'new') {

                        id = XUtil.helpers.guid();

                        self.currentHeight === 0 ? top = 0 : top = self.currentHeight + marginTop;

                        //注意，这里对元素的原始数据（即从服务器获得的json）进行了dom创建的操作
                        //用户必须自定义renderer方法来根据原始数据定制自己元素的dom字符串（并非dom元素，否则会带来巨大的性能问题）
                        //默认返回原始数据本身
                        domHtml = renderer(com);
                        domNode = $("<div class='XWaterfall-component'>" + domHtml + "</div>");
                        domNode
                            .css('width', contentWidth)
                            .attr('id', id)
                            .appendTo(renderTo)
                            .css('left', self.targetLeft)
                            .css('top', top);

                        //这个属性保存了元素被放在哪一列中
                        component.col = self.index;
                        self.components.push(component);
                        //这个属性保存了元素在列中的位置
                        component.index = self.components.indexOf(component);
                        component.id = id;
                        component.top = top;
                        component.left = self.targetLeft;
                        component.height = domNode.outerHeight();
                        component.model = com;

                        if (self.components.length === 1) {
                            self.currentHeight = component.height;
                        }
                        else {
                            self.currentHeight += component.height + marginTop;
                        }
                    }
                    else {
                        domHtml = genHtml(com);

                        $(renderTo).append(domHtml);

                        self.components.push(com);

                        if (self.components.length === 1) {
                            self.currentHeight = com.height;
                        }
                        else {
                            self.currentHeight += com.height + marginTop;
                        }
                    }
                },
                prepend: function (component) {
                    var self = this,
                        domHtml = genHtml(component);

                    $(renderTo).append(domHtml);

                    self.components.unshift(component);

                    self.currentTop > 0 && (self.currentTop = parseInt(self.components[0].top));
                },
                shift: function () {
                    var self = this;
                    var first = self.components.shift();

                    $('#' + first.id).remove();

                    self.currentTop = parseInt(self.components[0].top);

                    return first;
                },
                pop: function () {
                    var self = this;
                    var last = self.components.pop();

                    $('#' + last.id).remove();

                    self.currentHeight = self.currentHeight - last.height - marginTop;

                    return last;
                }
            };

            columns.push(col);
        }

        for (i = 0; i < initialSize; i++) {
            if (i < src.length) {
                pushComponent(src[i]);
            }
        }

        setMaxHeight();
        $(renderTo).css('height', maxHeight);

        $(document).scrollTop(0);

        return that;
    };

    (function () {
        //记录上一个滚动条位置,用来判断滚动条运动的方向
        var preScrollTop = 0;

        //页面滚动条事件
        //滚动条事件只能对一个waterfall组件有效
        $(document).off('scroll.XWaterfall');
        $(document).on('scroll.XWaterfall', function () {

            var scrollTop = $(document).scrollTop(),
                scrollBottom = $(document).scrollTop() + $(window).height(),
                documentHeight = $(document).height();

            var fetchFactor = (documentHeight - scrollBottom),
                upFactor = scrollTop - upperHeight,
                downFactor = bottomHeight - scrollBottom;

            //根据当前滚动条坐标计算运动方向
            var isGoingDown = (scrollTop - preScrollTop > 0);

            if (isGoingDown) {
                if (afterCache.length === 0) {
                    if (fetchEnable && fetchFactor < 100) {
                        that.fetch();
                    }
                }
                else {
                    if (downFactor < 100) {
                        if (downFactor >= 0) {
                            that.reAttach('bottom');
                        }
                        else {
                            while (bottomHeight < $(document).scrollTop() + $(window).height() &&
                            afterCache.length > 0) {

                                that.reAttach('bottom');
                            }
                        }
                    }
                }
            }
            else {
                if (upFactor < 100 && preCache.length > 0) {
                    if (upFactor >= 0) {
                        that.reAttach('top');
                    }
                    else {
                        while (upperHeight > $(document).scrollTop() &&
                        preCache.length > 0) {

                            that.reAttach('top');
                        }
                    }
                }
            }

            preScrollTop = scrollTop;

        });
    })();

    that.init();

    return that;
};

/*
 * 源文件：src/preload.js
 */

//预加载图片
XUtil.helpers.preloadImages(
    XUtil.config.rootPath + "/images/sort_asc.gif",
    XUtil.config.rootPath + "/images/sort_desc.gif",
    XUtil.config.rootPath + '/images/closebtn.png',
    XUtil.config.rootPath + '/images/closebtn-hover.png'
);
/*
 * 源文件：src/end.js
 */

//暴露全局变量
exports.XUtil = XUtil;
exports.myUtil = XUtil;

return XUtil;

});