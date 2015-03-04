/**
 * 
 */
(function(){
	onmessage=function(e){
        var src= e.data.src;
        var orgSrc=e.data.orgSrc;
        var result=cFilterData(src,orgSrc)
        postMessage(result);
    }
	
	var cFilterData=function(src,orgSrc){
		var tempSrc=[];
        orgSrc.forEach(function(subObj){
            var isInSrc=false;
            for(var i=0;i<src.length;i++){
                var srcSub=src[i];
                if(srcSub.orgIndex===subObj.orgIndex){
                    isInSrc=true;
                    break;
                }
            }
            if(isInSrc===false){
                tempSrc.push(subObj);
            }
        })
        return tempSrc;
	}
})()