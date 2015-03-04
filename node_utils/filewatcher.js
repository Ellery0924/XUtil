var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

module.exports=function(){

	function md5(str){
	    var hash = crypto.createHash('md5');
	    return hash.update(str+"").digest('hex');
	}
	
	//监听文件是否变动, callback(error, json), json为变动后的文件内容json对象
	function watchFile(filepath, callback, time){
		if(fs.existsSync(filepath)){
			var reg = /(^\s*)|(\s*$)/g;
			var str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
			var fMd5 = md5(str);
			time = parseInt(time,10) || 30;
	
			fs.watchFile(filepath, {interval: time*1000}, function (curr, prev){
				if(curr.mtime > prev.mtime){
					var _str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
					var _fMd5 = md5(_str);
					if(fMd5 !== _fMd5){
						fMd5 = _fMd5;
						callback(null, JSON.parse(_str));
					}
				}
			});
		}else{
			var err = filepath + ' 文件不存在';
			callback(err);
		}
	}
	
	return watchFile;

}