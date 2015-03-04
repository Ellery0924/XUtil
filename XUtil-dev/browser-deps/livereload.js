(function(){
	var socket = io('http://127.0.0.1:45032/');
	
	socket.on('connection',function(){
		socket.send('hi,server');
	});
	
	socket.on('error',function(err){
		console.log('error: '+err);
	})
	
	socket.on('change',function(files){
		window.reload();
	})
})();