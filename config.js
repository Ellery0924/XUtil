(function (module) {
    var root = '/Users/shenjiao/Documents/WSProjects/XUtil/',
        XUtilRoot = root + 'XUtil/';

    var config = {
        root: root,
        lag: 100,
        XUtilRoot: XUtilRoot,
        git: {
            username: '383188743@qq.com',
            password: '19880924sj'
        },
        targetPaths: [
            XUtilRoot + 'src',
            XUtilRoot + 'tests'
        ]
    };

    module.exports = config;
})(module);