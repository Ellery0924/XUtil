/**
 * Created by shenjiao on 15/3/2.
 * 主进程监视server.js文件，同时启动一个运行着server.js的子进程，文件发生改动时自动重启server.js
 */

var startService = require('./server'),
	watchFile = require('../node_utils/utils').watchFile,
	cluster = require('cluster');

function watch() {
	var i = 0, filename;

	for (; i < arguments.length; i++) {

		filename = arguments[i].toString();

		watchFile(filename, function (e) {
			if (e) {
				console.log(e);
			}
			else {
				console.log('server.js has been modified, refreshing...');
				cluster.emit('restart');
			}
		});
	}
}

if (cluster.isMaster) {
	var appWorker = cluster.fork();

	cluster.on('restart', function () {
		appWorker.kill();
		appWorker = cluster.fork();
	});

	watch('./server.js', '../config.json', './initConfig.js');

	process.on('SIGINT', function () {
		console.log('Shutting down server...');
		appWorker.kill();
		process.exit(130);
	});

}
else {
	startService();
}

