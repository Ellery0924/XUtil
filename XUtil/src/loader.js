/*
 * 脚本/css文件加载器，支持加载js和css文件并解析
 * 其中js有异步和同步两种模式
 * 在异步模式下，可以设置脚本下载完成后不自动解析（特殊异步模式）
 * 接受一个数组作为参数，如果数组中的元素是对象，则会根据对象的path属性加载文件，并且将对象其他的属性设为script/link标签的html属性
 * 如果是一个字符串，则只加载文件
 * 接受的第二个参数为结束回调，接受一个数组为参数，在同步和普通异步模式下，该数组保存的是添加到页面中的所有script标签
 * 在特殊异步模式下，该数组保存了所有下载的脚本的text
 * */
XUtil.loader = (function () {

    //私有的option对象
    var option = {
        root: "",
        mod: 'async'
    };

    //config方法，设置option对象，实例方法
    var config = function (opt) {

        for (var key in opt) {

            if (opt.hasOwnProperty(key)) {

                option[key] = opt[key];
            }
        }
    };

    //全局eval，实例方法
    //如果使用了jshint来校验，需要手动设置忽略eval规则，否则会报错
    //copy了jQuery.globalEval的实现，确保在全局作用域下执行
    var globalEval = function (text) {

        (window.execScript || function (text) {

            window['eval'].call(window, text);
        })(text);
    };

    //加载css/js文件，实例方法
    var load = function () {

        //工具函数，向document.head中插入一个script标签，但阻止浏览器自动解析其中的js代码
        var insertScriptNotEval = function (script, src, scriptText) {

            document.head.appendChild(script);

            //制止浏览器自动执行script标签中的js代码，所以临时将type设为text
            script.type = "text";
            script.text = scriptText;

            //由于谷歌浏览器在修改script标签的src属性时依然会执行js代码，因此先设置src，后更改type
            script.src = src;
            //将type重置为text/javascript，不会执行代码
            script.type = "text/javascript";
        };

        //获取加载模式
        var mod = option.mod,
        //同步模式
            isSync = mod.search('async') === -1,
        //普通异步模式
            isAsync = mod.search('async') !== -1 && mod.search('noteval') === -1,
        //特殊异步模式，下载脚本但不解析
            isAsyncNotEval = mod.search('async') !== -1 && mod.search('noteval') !== -1;

        //需要加载的文件数组，循环中对数组中每一个元素的引用，是否为绝对url
        var files = arguments[0], file, isAbsoluteUrl,
        //js脚本加载完成后执行的回调
            callback = arguments[1] || function () {
                    console && console.log('all loaded');
                },
        //文件根路径，将结尾可能存在的/替换为""，然后再加上/以确保格式正确，如果没有设置根路径则设为空字符串
            root = option.root ? option.root.replace(/\/$/, '') + "/" : "";

        //判断是否为js文件的正则表达式
        var rjs = /.js/,
        //不能够设置的属性
            rinvalidAttr = /^(src|href|type|path|rel)$/,
            rabsoluteUrl = /^(?:\s*http:\/\/|\/)/;

        //计数器和锁，在异步加载模式下使用
        var count = 0, scripts = [];

        var head = document.head;

        var script, src, xhr, xhrSync, scriptText,
            link, href, rel;

        for (var i = 0; i < files.length; i++) {

            file = files[i];

            //修正file对象
            file = typeof file === 'object' ? file : {path: file};

            //判断是否为绝对路径或者以http://开头的url
            //如果是以上两种情况，忽略root而直接使用传入的绝对路径
            //如果不是，则在所有传入的路径前加上root
            isAbsoluteUrl = rabsoluteUrl.test(file.path);

            if (rjs.test(file.path)) {
                //根据isAbsoluteUrl修正script标签的src属性
                src = isAbsoluteUrl ? file.path : root + file.path;
                script = document.createElement('script');

                //同步加载模式
                //通过同步ajax请求获得script标签的内容，然后用eval执行
                //之后插入script标签，并且通过一些很奇怪的方法阻止浏览器自动解析新插入的script标签
                if (isSync) {

                    xhrSync = new XMLHttpRequest();
                    xhrSync.open("GET", src, false);
                    xhrSync.send();

                    if (xhrSync.status !== 200) {

                        throw new Error(xhrSync.statusText);
                    }

                    scriptText = xhrSync.responseText;

                    //手动解析js代码
                    globalEval(text);

                    insertScriptNotEval(script, src, scriptText);

                    scripts.push(script);
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
                                //当计数器为0时触发loaded回调，并且将锁置为true
                                if (--count === 0) {

                                    callback(scripts);
                                }
                            }
                        };

                        head.appendChild(script);

                        scripts.push(script);

                        for (var attrJs in file) {

                            if (file.hasOwnProperty(attrJs) && !rinvalidAttr.test(attrJs)) {

                                script.setAttribute(attrJs, attrJs === 'data-main' ? root + file[attrJs] : file[attrJs]);
                            }
                        }
                    }
                    //特殊模式，异步下载脚本但不解析
                    else if (isAsyncNotEval) {

                        count++;

                        xhr = new XMLHttpRequest();
                        xhr.src = src;
                        xhr.open("GET", src);
                        xhr.send();

                        xhr.onreadystatechange = function () {

                            if (this.status === 200 && this.readyState === 4) {

                                //将获取的脚本文本加入scripts数组
                                scripts.push(this.responseText);

                                //向head插入一个script标签但制止浏览器自动解析脚本
                                script = document.createElement('script');
                                head.appendChild(script);
                                insertScriptNotEval(script, this.src, this.responseText);

                                //所有脚本下载完成后触发回调
                                if (--count === 0) {

                                    callback(scripts);
                                }
                            }
                        };
                    }
                }
            }
            //加载css文件，只支持异步加载
            else {

                link = document.createElement('link');
                href = isAbsoluteUrl ? file.path : root + file.path;
                rel = file.rel || "stylesheet";

                link.href = href;
                link.rel = rel;

                for (var attrCss in file) {

                    if (file.hasOwnProperty(attrCss) && !rinvalidAttr.test(attrCss)) {

                        link.setAttribute(attrCss, file[attrCss]);
                    }
                }

                head.appendChild(link);
            }
        }

        console && console.log('all done!');

        if (option.mod === 'sync') {

            callback(scripts);
        }
    };

    return {
        config: config,
        load: load,
        globalEval: globalEval
    };
})();