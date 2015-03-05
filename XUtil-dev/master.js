/**
 * Created by shenjiao on 15/3/2.
 * 主进程监视server.js文件，同时启动一个运行着server.js的子进程，文件发生改动时自动重启server.js
 */

var initService = require('./server'),
	watch = require('./node_utils/fileWatcher').watchWithEmitter,
	cluster = require('cluster');

if (cluster.isMaster) {
	var appWorker = cluster.fork();

	cluster.on('restart', function () {
		appWorker.kill();
		appWorker = cluster.fork();
	});

	watch('./server.js', './config.json', './initConfig.js','restart',cluster);

	process.on('SIGINT', function () {
		console.log('Shutting down server...');
		appWorker.kill();
		process.exit(130);
	});

}
else {
	initService();
}

