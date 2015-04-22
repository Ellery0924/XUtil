/*
 * 脚本/css文件加载器，支持加载js和css文件并解析
 * 其中js有异步和同步两种模式
 * 接受一个数组作为参数，如果数组中的元素是对象，则会根据对象的path属性加载文件，并且将对象其他的属性设为script/link标签的html属性
 * 如果是一个字符串，则只加载文件
 * */
XUtil.loader = {
    option: {
        root: "",
        isSync: true
    },
    config: function (opt) {

        var option = this.option;

        for (var key in opt) {

            if (opt.hasOwnProperty(key)) {

                option[key] = opt[key];
            }
        }
    },
    load: function () {

        //需要加载的文件数组，为第一个参数
        var files,
            arg = arguments[0],
        //异步加载完成后执行的回调
            callback = arguments[1] || function () {
                    console && console.log('all loaded');
                },
        //文件根路径，将结尾可能存在的/替换为""，然后再加上/以确保格式正确，如果没有设置根路径则设为空字符串
            root = this.option.root ? this.option.root.replace(/\/$/, '') + "/" : "";

        //判断是否为js文件的正则表达式
        var rjs = /.js/;

        //计数器和锁，在异步加载模式下使用
        var count = 0, lock = false;

        files = arg;

        for (var i = 0; i < files.length; i++) {

            var file = files[i],
                isAbsoluteUrl;

            //修正file对象
            file = typeof file === 'object' ? file : {path: file};

            //判断是否为绝对路径或者以http://开头的url
            //如果是以上两种情况，忽略root而直接使用传入的绝对路径
            //如果不是，则在所有传入的路径前加上root
            isAbsoluteUrl = /^(?:http:\/\/|\/)/.test(file.path);

            var script, src, xhrSync, scriptText,
                link, href, rel;

            //不能够设置的属性
            var rinvalidAttr = /^(src|href|type|path|rel)$/;

            var head = document.head;

            if (rjs.test(file.path)) {
                //根据isAbsoluteUrl修正script标签的src属性
                src = isAbsoluteUrl ? file.path : root + file.path;
                script = document.createElement('script');

                //同步加载模式
                //通过同步ajax请求获得script标签的内容，然后用eval执行
                //之后插入script标签，并且通过一些很奇怪的方法阻止浏览器自动解析新插入的script标签
                if (this.option.isSync) {

                    xhrSync = new XMLHttpRequest();
                    xhrSync.open("GET", src, false);
                    xhrSync.send();

                    if (xhrSync.status !== 200) {

                        throw new Error(xhrSync.statusText);
                    }

                    scriptText = xhrSync.responseText;

                    //不光要确保同步下载，还要确保同步解析，因此使用了eval来手动解析js代码
                    //如果使用了jshint来校验，需要手动设置忽略eval规则，否则会报错
                    //copy了jQuery.globalEval的实现，确保在全局作用域下执行
                    (window.execScript || function (scriptText) {
                        window['eval'].call(window, scriptText);
                    })(scriptText);

                    head.appendChild(script);

                    //这里要制止浏览器自动执行script标签中的js代码，所以临时将type设为text
                    script.type = "text";
                    script.text = scriptText;

                    //将type重置为text/javascript，不会重复执行代码
                    //由于谷歌浏览器在修改script标签的src属性时依然会执行js代码，因此先设置src，后更改type
                    script.src = src;
                    script.type = "text/javascript";
                }
                //异步加载
                //在所有脚本解析完成后会触发loaded回调
                else {

                    script.src = src;
                    count++;

                    script.onload = script.onreadystatechange = function () {

                        if (!lock) {

                            if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {

                                //每一个js完成解析后会将计数器减1
                                //当计数器为0时触发loaded回调，并且将锁置为true
                                if (--count === 0) {
                                    lock = true;
                                    callback();
                                }
                            }
                        }
                    };

                    head.appendChild(script);
                }

                for (var attrJs in file) {

                    if (file.hasOwnProperty(attrJs) && !rinvalidAttr.test(attrJs)) {

                        script.setAttribute(attrJs, file[attrJs]);
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

        if (this.option.isSync) {

            callback();
        }
    }
};