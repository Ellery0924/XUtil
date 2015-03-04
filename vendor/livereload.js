(function(){
	var socket = io('http://127.0.0.1:45032/');
	
	socket.on('message',function(msg){
		console.log(msg);
	});
	
	socket.on('error',function(err){
		console.log('error: '+err);
	});

    socket.on('changed', function (file) {
        console.log(file);
		window.location.reload();
	});
})();