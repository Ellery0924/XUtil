var fs = require('fs');
var crypto = require('crypto');

function md5(str){
    var hash = crypto.createHash('md5');
    return hash.update(str+"").digest('hex');
}

function watchFile(filepath, callback, time){
	if(fs.existsSync(filepath)){
		var reg = /(^\s*)|(\s*$)/g;
		var str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
		var fMd5 = md5(str);
		time = parseInt(time,10) || 30;

		fs.watchFile(filepath, {interval: time}, function (curr, prev){
			if(curr.mtime > prev.mtime){
				var _str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
				var _fMd5 = md5(_str);
				if(fMd5 !== _fMd5){
					fMd5 = _fMd5;
					callback(null, {});
				}
			}
		});
	}else{
		var err = filepath + ' 文件不存在';
		callback(err);
	}
}

function watch() {
	var i = 0,
		filename,
		event=arguments[arguments.length-2]||'restart',
		listener=arguments[arguments.length-1];

	if(!listener) {return;}

	for (; i < arguments.length-2; i++) {

		filename = arguments[i].toString();
		//console.log(event);
		watchFile(filename, function (e) {
			if (e) {
				console.log(e);
			}
			else {
				console.log(filename+' has been modified, refreshing...');
				listener.emit(event);
			}
		});
	}
}

module.exports.watch=watchFile;

module.exports.watchWithEmitter=watch;
