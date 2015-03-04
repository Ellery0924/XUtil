/**
 * 
 */

var deleteObj=function(selectedData,orgSrc){
    var resultArr=orgSrc;
    selectedData.forEach(function(sub){
                var orgIndex=sub.orgIndex;
                for(var i=0;i<resultArr.length;i++){
                    var orgObj=orgSrc[i];
                    if(orgObj.orgIndex===orgIndex){
                        resultArr.splice(i,1);
                        
                        console.log('XTable.deleteSelectedData: Deleting:');
                        console.log(orgObj);
                        
                        break;
                    }
                }
            });
    return resultArr;
}

onmessage=function(e){
        var orgSrc= e.data.orgSrc;
        var selectedData=e.data.selectedData
        var result=deleteObj(selectedData,orgSrc)
        postMessage(result);
    }