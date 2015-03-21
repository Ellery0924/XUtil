/**
 * 
 */

$(function(){
	var dialog=XUtil.XDialog({})
		.set({
			width:400,
			className:'hi!',
			autoOpen:false,
			closable:true,
			title:'测试对话框',
			top:0.5,
			draggable:true,
			animated:true,
			content:"<div style='padding:0.5em;'>hello there!</div>"
		})
		.init();
	
	$('#dialogOpen').click(function(){
		dialog.open();
	});
});