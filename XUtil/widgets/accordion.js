!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},bindInput:function(c,d){var e=d||"data-bind",f={},g=b.helpers.bindInput;if(c){if("string"==typeof c)void 0===d?(f={},f[c]="",g.call(window,f)):(f={},f[c]=d,g.call(window,f));else for(var h in c)if(c.hasOwnProperty(h)){var i=a(h).eq(0),j=(c[h]||i.attr(e)).toString(),k=i.is("input[type=text]"),l=i.is("textarea"),m=i.is("input[type=hidden]"),n=i.is("input[type=checkbox]"),o=i.is("input[type=radio]"),p=i.is("select");if(k||l||m)i.val(j),i.trigger("change");else if(n||o)"true"===j?(i.prop("checked",!0),i.trigger("change")):"false"===j&&(i.prop("checked",!1),i.trigger("change"));else if(p)for(var q=i[0].options,r=0;r<q.length;r++){var s=q[r];if(s.value===j){i[0].selectedIndex=r,i.trigger("change");break}}}}else f["["+e+"]"]="",this.bindInput.call(window,f)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(b).remove():a(".XUtil-pageShield").remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.XAccordion=function(c){var d,e=b.helpers.error,f=b.helpers.log,g=[],h={},i=c.titles||[],j=c.id||"XAccordion-"+b.helpers.guid(),k=c.animated||!1,l=a.isFunction(c.onShow)?c.onOpen:function(a){f("XAccordion: Container "+a.index+" is open")},m=a.isFunction(c.onRemove)?c.onRemove:function(a){return f("XAccordion: Container "+a.index+" is removed."),!0},n=c.closable||!1,o=c.className||"",p=c.iconClass||"";if(!("renderTo"in c&&a(c.renderTo)[0]))throw e("XAccordion: 目标div不合法，请检查option.renderTo属性！");d=c.renderTo;var q,r,s,t=a(d),u=function(b,c){var d,f,h,i,j="<div class='XAccordion-title'><span class='icon'></span><span class='titleText'></span><span class='closebtn'></span></div>",k="<div xa-title='"+c+" 'class='XAccordion-content'></div>",l="<div class='XAccordion-container'></div>";if(b=a(b)[0],!b)throw e("XAccordion.append: 要添加的dom元素不合法，请检查！");d={title:c,titleNode:void 0,contentNode:void 0,domNode:void 0,opened:!1},h=a(k).append(b),f=a(j),f.find(".titleText").html(c),i=a(l).append(f).append(h),d.titleNode=f,d.contentNode=h,d.domNode=i,g.push(d)},v=t.children();for(q=0;q<v.length;q++)r=v[q],s=""===i[q]?a(r).attr("xa-title"):i[q],a(r).removeAttr("xa-title"),u(r,s);return t.on("click",".titleText",function(){var b=a(this.parentNode.parentNode).attr("xa-index");h.show(b)}),t.on("click",".closebtn",function(){var b=a(this.parentNode.parentNode).attr("xa-index");h.remove(b)}),h.containers=g,h.titles=i,h.set=function(b){return"animated"in b&&(k=Boolean(b.animated)),a.isFunction(b.onShow)&&(l=b.onShow),a.isFunction(b.onRemove)&&(m=b.onRemove),"closable"in b&&(n=Boolean(b.closable)),"className"in b&&(o=b.className),"iconClass"in b&&(p=b.iconClass),"id"in b&&(j=b.id),h},h.show=function(a){var b;for(b=0;b<g.length;b++)b!==parseInt(a)&&h.hide(b);return g[a].opened||(k?g[a].contentNode.slideDown("fast"):g[a].contentNode.show(),g[a].opened=!0,g[a].domNode.addClass("opened"),l(g[a])),h},h.hide=function(a){return g[a].opened=!1,k?g[a].contentNode.slideUp("fast"):g[a].contentNode.hide(),g[a].domNode.removeClass("opened"),h},h.remove=function(a){return m(g[a])&&(g.splice(a,1),h.init()),h},h.append=function(a,b){return u(a,b),h.init(),h},h.init=function(){if(t.empty(),t.addClass("XAccordion").addClass(o).attr("xa-id",j),g.length>0){for(q=0;q<g.length;q++)t.append(g[q].domNode),g[q].domNode.attr("xa-index",q),g[q].index=q,0!==q&&(g[q].contentNode.hide(),g[q].opened=!1);n||t.find(".closebtn").hide(),t.find(".icon").addClass(p),g[0].contentNode.show(),g[0].opened=!0,g[0].domNode.addClass("opened")}return h},h.init(),h},c.XUtil=b,c.myUtil=b,b});