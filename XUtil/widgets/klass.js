!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},addShield:function(b,c,d){var e,f,g,h,i,j=d||1;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),a.isNumeric(c)||(c=.5),i=a("<div class='xTable-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#ebe9e9").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(b).remove():a(".xTable-pageShield").remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<div class='XUtil-errorHint'>* "+c+"</div>");0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d)},clearErrorHint:function(b){!b&&a(".errorHint").remove(),b&&a(b.parentNode).find(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=location.search.substring(1),g=f.split("&");for(a=0;a<g.length;a++)b=g[a].indexOf("="),-1!==b&&(c=g[a].substring(0,b),d=decodeURI(g[a].substring(b+1)),e[c]=d);return e},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.Class=function(a){function c(){this.init.apply(this,arguments),c.instances[b.helpers.guid()]=this}var d;return c.instances={},c.find=function(a){return a&&c.instances[a]?c.instances[a]:void 0},a&&(d=function(){},d.prototype=a.prototype,c.prototype=new d,c.parent=a,c.parentProto=a.prototype,c.parentInit=a.prototype.init),c.prototype.init=function(){},c.prototype.constructor=Object,c.include=function(a){var b;for(b in a)a.hasOwnProperty(b)&&(c.prototype[b]=a[b])},c.extend=function(a){var b;for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b])},c},c.XUtil=b,c.myUtil=b,b});