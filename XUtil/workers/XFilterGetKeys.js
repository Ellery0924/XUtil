/**
 * Created by shenjiao on 14-6-20.
 */
(function(){
    var getKeys=function(src){
        var result={}
        var names=[];
        var sNames=[];
        for(var i=0;i<src.length;i++){
            var subKey=src[i];
            if (names.indexOf(subKey.toString()) === -1) {
                names.push(subKey.toString());
                sNames.push(subKey.toString());
            }
        }
        result.names=names;
        result.sNames=sNames;
        return result;
    }
    onmessage=function(e){
        var option= e.data;
        var result=getKeys(option.src);
        postMessage(result);
    }
})();