/**
 * 
 */
$(function(){
	var popout1=XUtil.XPopout({
		renderTo:'#test1',
		position:'upperLeft',
		width:400,
		height:150
	});
	
	var popout2=XUtil.XPopout({
		renderTo:'#test2',
		position:'upperRight',
		animation:'fade',
		width:400,
		height:150
	});
	
	var popout3=XUtil.XPopout({
		renderTo:'#test3',
		width:400,
		height:200,
		animation:'slide',
		offset:{top:2,left:-10},
		className:'myPopout'
	});
	
	var popout4=XUtil.XPopout({
		renderTo:'#test4',
		position:'lowerRight',
		animation:'fade',
		height:200,
		width:400,
		triggerBy:'hover'
	});

	console.log(popout1, popout2, popout3, popout4);
});