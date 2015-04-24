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

    //    为input和select绑定默认值
    //    接受一个参数对象，格式如下：
    //    {
    //      'selector':value
    //    }
    // 其中selector是要绑定的dom元素的选择器
    // value为要绑定的值
    // 对于checkbox和radio，应设置为true/false(字符串)
    //
    // 如果不传参数则会检索页面中所有带data-bind属性的元素，并将data-bind的值设为默认值
    //
    // 在绑定之后会触发input和select的change事件
    //
    // 更新：
    // 现在可以接受两个字符串作为参数，例如bind('input[type=text]','something')
    // 将会查找页面内所有被selector选中的元素，然后将它们的默认值置为他们本身的data-bind属性
    // 这样可以按顺序为一系列dom执行绑定，例如
    // bind(ele1,str1);
    // bind(ele2,str2);
    // 在ele2的值依赖于ele1的取值时会有用，比如select2中的option依赖于select1的值来动态生成的情况
    // 如果不传入第二个参数，则使用元素的data-bind属性作为默认值（如果存在）
    //
    // 如果第一个参数是对象
    // 可以接受第二个参数attr，将data-bind属性改为其它属性名
    bindInput: function (option, attr) {

        var bindAttr = attr || 'data-bind',
            bind = XUtil.helpers.bindInput;

        var arg = {};

        if (!option) {

            arg['[' + bindAttr + ']'] = '';
            bind.call(window, arg);
        }
        else if (typeof option === 'string') {

            if (attr === undefined) {

                arg = {};
                arg[option] = '';

                bind.call(window, arg);
            }
            else {

                arg = {};
                arg[option] = attr;

                bind.call(window, arg);
            }
        }
        else {

            for (var selector in option) {

                if (option.hasOwnProperty(selector)) {

                    var eleArr = $(selector);

                    for (var i = 0; i < eleArr.length; i++) {

                        var ele = $(selector).eq(i),
                            value = (option[selector] || (ele.attr(bindAttr) ? ele.attr(bindAttr) : '')).toString();

                        var isTextInput = ele.is('input[type=text]'),
                            isTextArea = ele.is('textarea'),
                            isHiddenInput = ele.is('input[type=hidden]'),
                            isCheckbox = ele.is('input[type=checkbox]'),
                            isRadio = ele.is('input[type=radio]'),
                            isSelect = ele.is('select');

                        if (isTextInput || isTextArea || isHiddenInput || isSelect) {

                            ele.val(value);
                            ele.trigger('change');
                        }
                        else if (isCheckbox || isRadio) {

                            if (value === 'true') {

                                ele.prop('checked', true);
                                ele.trigger('change');
                            }
                            else if (value === 'false') {

                                ele.prop('checked', false);
                                ele.trigger('change');
                            }
                        }
                    }
                }
            }
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
    }
};
