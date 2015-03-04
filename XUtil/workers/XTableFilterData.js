/**
 * Created by shenjiao on 14-6-18.
 */
(function(){
    var getKeys=function(src,selectedNames,filterSrcName){
        var tempSrc = [];
        src.forEach(function(subObj) {
            if (selectedNames.indexOf(subObj[filterSrcName].toString()) !== -1) {
                tempSrc.push(subObj);
            }
        })
        return tempSrc;
    }
    onmessage=function(e){
        var src= e.data.src;
        var selectedNames= e.data.selectedNames;
        var filterSrcName= e.data.filterSrcName;
        var result=getKeys(src,selectedNames,filterSrcName);
        postMessage(result);
    }
})();