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
    //为某个元素添加一层半透明遮罩，用来屏蔽该元素以及内部元素的响应事件
    //接收三个参数targetDiv(目标div), opacity(透明度)和zIndex(z-index的值)
    //返回遮罩元素
    addShield: function (targetDiv, opacity, zIndex) {
        var top, left, width, height;
        var targetZIndex = zIndex || 1;
        var shield;

        !targetDiv && (targetDiv = document.body);
        targetDiv = $(targetDiv);

        top = targetDiv.offset().top;
        left = targetDiv.offset().left;
        width = targetDiv.outerWidth();
        height = targetDiv.outerHeight();

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
        if (!shield) {
            $('.XUtil-pageShield').remove();
        }
        else {
            $(shield).remove();
        }
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
    }
};
