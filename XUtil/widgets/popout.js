!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h))for(var i=a(h),j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");m||n||o||r?(k.val(l),k.trigger("change")):(p||q)&&("true"===l.toString()?(k.prop("checked",!0),k.trigger("change")):"false"===l.toString()&&(k.prop("checked",!1),k.trigger("change")))}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()},safeEvent:function(b,c,d,e){var f,g,h=!1;c=c||window,d=d||300;var i=function(a){f=a,b.apply(c,g)};return function(){var b,c=a.now();g=Array.prototype.slice.apply(arguments),h?c-f>d&&i(c):(h=!0,i(c),e&&(b=setInterval(function(){var c=a.now();c-f>=e&&(i(c),clearInterval(b),h=!1)},d/10)))}},loadImg:function(b,c){var d,e=-1!==navigator.userAgent.search("MSIE 6.0"),f=-1!==navigator.userAgent.search("MSIE 7.0"),g=b.getAttribute("real-src"),h=1===parseInt(b.getAttribute("loaded"),10);b.getAttribute("img-index");(!h||e||f)&&(d=a(new Image),d.on("load",function(){a(b).attr({src:g,loaded:1}),c&&c(),d.remove()}).attr("src",g))}},b.helpers.shimConsole(),b.XPopout=function(c){var d=b.helpers.error,e={},f=c.renderTo,g=c.id||"XPopout-"+b.helpers.guid(),h=c.width||"auto",i=c.height||"auto",j=c.animation||"default",k=c.position||"lowerLeft",l=a(f)[0],m=!1,n=c.className||"",o=c.content||"",p=c.triggerBy||"click",q=c.offset||{top:0,left:0},r=c.onOpen||function(a){},s=c.onClose||function(a){},t=a("<div class='xPopout' id='"+g+"'></div>");if(void 0!==c.autoOpen&&c.autoOpen===!0&&(m=!0),void 0===l)throw d("XPopout: 配置参数有误，请检查option.renderTo属性");return"slide"!==j||"upperLeft"!==k&&"upperRight"!==k||(j="default"),t.append(o).addClass(n),t.appendTo(document.body),t.css("position","absolute").css("height",i||"auto").css("width",h||"auto").css("display","none").css("background-color","#fff").css("padding","10px"),e.bindDom=l,e.popout=t[0],e.setPosition=function(b){var c=a(l).offset(),d=l.offsetWidth,f=l.offsetHeight,g={top:c.top+f+Number(q.top),left:c.left+q.left},h={top:c.top+f+Number(q.top),left:c.left+d-t.outerWidth()+Number(q.left)},i={top:c.top-t.outerHeight()+Number(q.top),left:c.left+Number(q.left)},j={top:c.top-t.outerHeight()+Number(q.top),left:c.left+d-t.outerWidth()+Number(q.left)},k=function(a){t.css("top",a.top),t.css("left",a.left)};return"lowerLeft"===b?(k(g),e.position=b):"lowerRight"===b?(k(h),e.position=b):"upperLeft"===b?(k(i),e.position=b):"upperRight"===b?(k(j),e.position=b):(k(g),e.position="lowerLeft"),e},e.open=function(){return"closed"===e.status&&(r(t[0]),e.setPosition(k),"fade"===j?t.fadeIn("fast"):"slide"!==j||"lowerLeft"!==k&&"lowerRight"!==k?t.show():t.slideDown("fast"),e.status="opened"),e},e.close=function(){return"opened"===e.status&&(s(t[0]),"fade"===j?t.fadeOut("fast"):"slide"!==j||"lowerLeft"!==k&&"lowerRight"!==k?t.hide():t.slideUp("fast"),e.status="closed"),e},e.setPosition(k),m===!1?e.status="closed":(e.status="opened",e.open()),function(){var b=!1,c=function(a,c){var d;a.stopPropagation(),d=a.target,0!==t.children().length&&d!==t[0]&&d!==l&&void 0===t.find(d)[0]||0===t.children().length&&d!==l&&d!==t[0]?(b=!1,"hover"!==p||c?e.close():setTimeout(function(){b||"opened"!==e.status||e.close()},400)):b=!0};"hover"===p?(a(l).on("mouseenter.XPopoutOpen",function(){b=!0,setTimeout(function(){b&&e.open()},350)}),a(document).on("mouseover.XPopoutClose",function(a){c.call(this,a)}),a(document).on("click.XPopoutClose",function(a){c.call(this,a,!0)})):(a(l).on("click.XPopoutOpen",function(){e.open()}),a(document).on("click.XPopoutClose",function(a){c.call(this,a)}))}(),e},c.XUtil=b,c.myUtil=b,b});