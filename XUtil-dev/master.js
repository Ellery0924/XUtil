/**
 * Created by shenjiao on 15/3/2.
 */

var createServer=require('./server'),
	watchFile = require('../node_utils/utils').watchFile,
	cluster=require('cluster');

if(cluster.isMaster){
	var appWorker=cluster.fork();

	cluster.on('restart',function(){
		appWorker.kill();
		appWorker=cluster.fork();
	});

	watchFile('./server.js',function(e){
		if(e){
			console.log(e);
		}
		else{
			console.log('server.js has been modified, refreshing...');
			cluster.emit('restart');
		}
	});

	process.on('SIGINT',function(){
		console.log('Shutting down server...');
		appWorker.kill();
		process.exit(130);
	});

}
else{
	createServer();
}

