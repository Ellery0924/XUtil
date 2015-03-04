/**
 *
 */

$(function(){
	var acc=XUtil.XAccordion({
		renderTo:'#accordionTest',
		animated:true,
		closable:true,
		titles:['title1','title2','']
	})
	.set({
		className:'myAccordion',
		id:'myAccordion',
		iconClass:'myIcon'
	})
	.init();
	
	var newNode=$("<div>wdsdglaksdjgals;kdfa</div>");
	
	acc.append(newNode,'wjskdlgjskdl');
});