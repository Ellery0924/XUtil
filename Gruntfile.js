module.exports = function (grunt) {
    var walker = require('./node_utils/dirWalker'),
        fs = require('fs');

    var XUtilRoot = process.cwd() + '/XUtil';

    console.log(XUtilRoot);

    //加载依赖模块
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');

    //配置任务参数
    grunt.initConfig({
        //使用requirejs插件打包
        //requirejs: {
        //	main: {
        //		options: {
        //			//这里的baseUrl和require.config中的略有不同
        //			//应该根据根目录的路径稍作修改
        //			baseUrl: 'WebContent/',
        //			//指定require.config文件路径
        //			mainConfigFile:'WebContent/js/example.js',
        //			//这里只加入了主文件，插件会自动计算依赖关系，并根据上面的config文件来打包代码
        //			include: ['js/example'],
        //			//打包后的文件
        //			out: 'WebContent/js/example.min.js'
        //		}
        //	}
        //},
        //jshint
        jshint: {
            options: {
                globals: {
                    jQuery: true,
                    console: true
                },
                //以下是忽略的几条规则
                scripturl: true,
                loopfunc: true,
                '-W065': true,//missed radix parameter, 例如parseInt(num,decimal)
                '-W030': true,//&& and || 例如 window.foo && foo()
                '-W014': true,//超过80字符的行
                '-W099': true//tab和空格问题
            },
            XUtilHint: {
                src: ['<%=XUtilPath%>/src/*.js']
            }
            //demoHint:{
            //	src:['WebContent/js/*.js','!WebContent/js/example.min.js']
            //}
        },
        clean: {
            all: {
                src: [
                    '<%=XUtilPath%>/widgets/*.js',
                    '<%=XUtilPath%>/XUtil.js',
                    '<%=XUtilPath%>/XUtil.min.js',
                    '<%=XUtilPath%>/XUtil.min.css'
                ]
            }
        },
        //不使用requirejs的项目打包
        //合并js文件
        concat: {
            XUtilConcat: {
                //源文件集合
                src: [
                    '<%=XUtilPath%>/src/head.txt',
                    '<%=XUtilPath%>/src/base.js',
                    '<%=XUtilPath%>/src/*.js',
                    '!<%=XUtilPath%>/src/preload.js',
                    '<%=XUtilPath%>/src/preload.js',
                    '<%=XUtilPath%>/src/end.txt'
                ],
                //合并后的文件
                dest: '<%=XUtilPath%>/XUtil.js'
            }
        },
        //压缩js文件
        uglify: {
            XUtilUglify: {
                files: {
                    '<%=XUtilPath%>/XUtil.min.js': ['<%=XUtilPath%>/XUtil.js']
                }
            },
            XUtilWidgets: {
                files: [{
                    expand: true,
                    cwd: '<%=XUtilPath%>/widgets/',
                    src: '*.js',
                    dest: '<%=XUtilPath%>/widgets/'
                }]
            }
        },
        //压缩css文件
        cssmin: {
            XUtilCssUglify: {
                files: {
                    '<%=XUtilPath%>/XUtil.min.css': ['XUtil/XUtil.css']
                }
            }
        },
        //可复用的属性
        XUtilPath: XUtilRoot
    });

    //注册grunt命令行任务
    //构建XUtil类库，将按顺序执行js concat, js uglify和css uglify
    //并生成XUtil.js, XUtil.min.js, XUtil.min.css三个文件
    grunt.registerTask('build',
        //任务列表
        [
            'concat:XUtilConcat',
            'uglify:XUtilUglify',
            'cssmin:XUtilCssUglify'
        ]
    );

    //jshint
    grunt.registerTask('hint', ['jshint:XUtilHint']);

    //自定义任务，生成可单独使用的widget
    //使用了node原生模块fs和从combine-dev抄过来的dirWalker
    grunt.registerTask('widgets', function () {

        var root = XUtilRoot + '/',
            srcPath = root + 'src/',
            jsFiles = walker(srcPath).js,
            baseFile = srcPath + 'base.js',
            base = fs.readFileSync(baseFile),
            count = 0,
            head = fs.readFileSync(srcPath + 'head.txt'),
            end = fs.readFileSync(srcPath + 'end.txt');

        var i;

        //分别生成每个widget，由head.txt,base.js,相应widget的代码和end.txt合并而成
        for (i = 0; i < jsFiles.length; i++) {
            var fPath,
                widget,
                fName,
                destPath;

            fPath = jsFiles[i];

            if (fPath.lastIndexOf('/') === -1) {

                fName = fPath.substr(fPath.lastIndexOf('\\') + 1);
            }
            else {

                fName = fPath.substr(fPath.lastIndexOf('/') + 1);
            }

            if (fName !== 'base.js' && fName !== 'preload.js') {

                widget = fs.readFileSync(fPath);
                destPath = root + 'widgets/' + fName;

                fs.writeFileSync(destPath, head, 'utf-8');
                fs.appendFileSync(destPath, base, 'utf-8');
                fs.appendFileSync(destPath, widget, 'utf-8');
                fs.appendFileSync(destPath, end, 'utf-8');

                grunt.log.writeln('XUtil: Widget ' + fName + ' created.');
                count++;
            }
            else if (fName === 'base.js') {

                destPath = root + 'widgets/base.js';
                fs.writeFileSync(destPath, head, 'utf-8');
                fs.appendFileSync(destPath, base, 'utf-8');
                fs.appendFileSync(destPath, end, 'utf-8');

                grunt.log.writeln('XUtil: Widget base.js created.');
                count++;
            }
        }

        grunt.task.run('uglify:XUtilWidgets');

        grunt.log.writeln('XUtil: ' + count + ' widgets created.');

    });

    grunt.registerTask('default', ['hint', 'clean', 'widgets', 'build']);

    //使用requirejs插件打包示例工程，生成example.min.js
    //grunt.registerTask('demopkg', ['jshint:demoHint', 'requirejs:main']);
};