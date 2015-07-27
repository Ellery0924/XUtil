!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()},safeEvent:function(a,b,c,d){var e,f,g=!1;b=b||window,c&&50>c&&(window.console&&console.warn("safeEvent: 设置的间隔值过小!自动调整为50ms"),c=50),d&&c>d&&(window.console&&console.warn("safeEvent: 设置的endGap过小!自动调整为一倍gap"),d=c);var h=function(c,d){e=c,d&&a.apply(b,f)};return function(){var a,b=(new Date).valueOf();f=Array.prototype.slice.apply(arguments),g?b-e>c&&h(b,c):(g=!0,h(b,c),d&&(a=setInterval(function(){var b=(new Date).valueOf();b-e>=d&&(h(b,d),clearInterval(a),g=!1)},50)))}},loadImg:function(a,b){var c,d=-1!==navigator.userAgent.search("MSIE 6.0"),e=-1!==navigator.userAgent.search("MSIE 7.0"),f=a.getAttribute("real-src"),g="1"===a.getAttribute("loaded");a.getAttribute("img-index");(!g||d||e)&&(c=new Image,c.onload=function(){a.setAttribute("src",f),a.setAttribute("loaded","1"),b&&b(),c=null},c.src=f)},numToHan:function(a){var b=["","十","百","千","万"],c=["零","一","二","三","四","五","六","七","八","九"],d="零";a+="";for(var e=a.length,f="",g=e-1;g>=0;g--){var h=e-g-1,i=a.charAt(h),j=b[g];0===i&&(j=d),f+=0===i?d:c[i]+j}return f.replace(/零+$|^零+/,"").replace(/零+/g,d)}},b.helpers.shimConsole(),b.Class=function(a){function c(){this.init.apply(this,arguments),c.instances[b.helpers.guid()]=this}var d;return c.instances={},c.find=function(a){return a&&c.instances[a]?c.instances[a]:void 0},a&&(d=function(){},d.prototype=a.prototype,c.prototype=new d,c.parent=a,c.parentProto=a.prototype,c.parentInit=a.prototype.init),c.prototype.init=function(){},c.prototype.constructor=Object,c.include=function(a){var b;for(b in a)a.hasOwnProperty(b)&&(c.prototype[b]=a[b])},c.extend=function(a){var b;for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b])},c},c.XUtil=b,c.myUtil=b,b});