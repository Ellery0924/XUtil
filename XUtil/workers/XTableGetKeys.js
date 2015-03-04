/**
 * Created by shenjiao on 14-6-18.
 */
(function(){
    var getKeys=function(src,srcName){
        var result={}
        var names=[];
        var sNames=[];
        for(var i=0;i<src.length;i++){
            var subObj=src[i];
            var key=subObj[srcName];
            if(key===undefined){
                key="";
            }
            if (names.indexOf(key.toString()) === -1) {
                names.push(key.toString());
                sNames.push(key.toString());
            }
        }
        result.names=names;
        result.sNames=sNames;
        return result;
    }
    onmessage=function(e){
        var option= e.data;
        var result=getKeys(option.src,option.srcName);
        postMessage(result);
    }
})();