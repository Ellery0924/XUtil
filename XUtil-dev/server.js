
module.exports=function(){
//NodeJS编写的文件监控服务器
	var SocketIo = require('socket.io'),
		http = require('http'),
		walker = require('../node_utils/dirWalker'),
		watchFile = require('../node_utils/utils').watchFile,
		REFRESH_LAG = parseInt(require('../config').lag, 10) || 2000,
		PORT=require('../config').port;

	var pid = process.pid;

	var handler = function (req) {
		console.log(req.url);
	};

//创建服务器
	var server = http.createServer(handler);

//socket
	var io = SocketIo(server);
//监控文件列表
	var files = [];

	var targetPaths = require('../config').targetPaths,
		path,
		i,
		tempFiles;

	for (i = 0; i < targetPaths.length; i++) {
		path = targetPaths[i];
		tempFiles = walker(path).js.concat(walker(path).css).concat(walker(path).other);
		files = files.concat(tempFiles);
	}

	io.on('connection', function (socket) {
		console.log('connection from host ' + socket.handshake.headers.host + ' established!');
		socket.on('message', function (msg) {
			console.log('XUtil-dev: message \"' + msg + '\" from host ' + socket.handshake.headers.host);
		});
	});

	process.nextTick(function () {
		//监控目标文件夹下的文件
		files.forEach(function (file) {
			watchFile(file, function (err) {
				if (err)
					console.log(err);
				else {
					setTimeout(function () {
						io.sockets.emit('changed', file);
						console.log('File changed, refreshing browser...');
					}, REFRESH_LAG);
				}
			}, 10);
		});
	});

	server.listen(PORT);

	console.log(
		'XUtil-dev: Start watching:\n' +
		targetPaths.join('\n') +
		'\non process ' +
		pid
	);
};