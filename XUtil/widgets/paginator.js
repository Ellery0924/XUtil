!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h))for(var i=a(h),j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");m||n||o||r?(k.val(l),k.trigger("change")):(p||q)&&("true"===l.toString()?(k.prop("checked",!0),k.trigger("change")):"false"===l.toString()&&(k.prop("checked",!1),k.trigger("change")))}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()},safeEvent:function(b,c,d,e){var f,g,h=!1;c=c||window,d=d||300;var i=function(a){f=a,b.apply(c,g)};return function(){var b,c=a.now();g=Array.prototype.slice.apply(arguments),h?c-f>d&&i(c):(h=!0,i(c),e&&(b=setInterval(function(){var c=a.now();c-f>=e&&(i(c),clearInterval(b),h=!1)},d/10)))}},loadImg:function(b,c){var d,e=-1!==navigator.userAgent.search("MSIE 6.0"),f=-1!==navigator.userAgent.search("MSIE 7.0"),g=b.getAttribute("real-src"),h=1===parseInt(b.getAttribute("loaded"),10);b.getAttribute("img-index");(!h||e||f)&&(d=a(new Image),d.on("load",function(){a(b).attr({src:g,loaded:1}),c&&c(),d.remove()}).attr("src",g))}},b.helpers.shimConsole(),b.paginator=function(b){var c=b.renderTo,d=b.pageCount||12,e=b.range||5,f=b.callback||function(a){window.console&&console.log("rendering "+a)},g=b.defaultPage||1,h="<div class='paginator_ctrl'></div>",i="<table class='commonBtnWrap'><tr></tr></table>",j="<td class='pageBtnTd'><a href='javascript:void 0;' class='pageBtn common_btn' pageIndex='{{pageNum}}'>{{pageNum}}</a></td>",k="<a pageIndex='1' href='javascript:void 0;' class='pageBtn to_first'>1</a>",l="<a pageIndex='"+d+"' href='javascript:void 0;' class='pageBtn to_last'>"+d+"</a>",m="<span class='emmiter'>...</span>",n="<a href='javascript:void 0;' class='pageBtn to_next'>下一页</a>",o="<a href='javascript:void 0;' class='pageBtn to_prev'>上一页</a>",p="<div style='clear:both'></div>",q=a(h),r=function(){return g},s=function(b){var c=function(){var c,f=function(a){h.find("tr").append(j.replace(/\{\{pageNum}}/g,a))},g=-1,h=a(i);if(e>b&&b>0?g=0:b>=e&&d-e+1>=b?g=1:b>d-e+1&&d>=b&&(g=2),0===g){for(q.empty(),q.append(o).append(h),c=1;e>=c;c++)f(c);q.append(m).append(l).append(n),1===b&&q.find(".to_prev").hide()}else if(1===g){for(q.empty(),q.append(o).append(k).append(m).append(h),c=b-2;b+2>=c;c++)f(c);q.append(m).append(l).append(n)}else if(2===g){for(q.empty(),q.append(o).append(k).append(m).append(h),c=d-4;d>=c;c++)f(c);q.append(n),b===d&&q.find(".to_next").hide()}q.append(p),q.find("[pageIndex="+b+"]").addClass("current")};g=b,c(),f(b)},t=function(){s(--g)},u=function(){s(++g)},v=function(){a(c).append(q).append(p),function(){var b=".pageBtn.common_btn,.pageBtn.to_first,.pageBtn.to_last",c=".pageBtn.to_prev",d=".pageBtn.to_next";a(q).off("click",b).on("click",b,function(){var a=parseInt(this.getAttribute("pageIndex"),10);s(a)}),a(q).off("click",c).on("click",c,function(){t()}),a(q).off("click",d).on("click",d,function(){u()})}(),s(1)};return v(),{ctrl:q,init:v,toPage:s,toPrev:t,toNext:u,getCurrentPage:r}},c.XUtil=b,c.myUtil=b,b});