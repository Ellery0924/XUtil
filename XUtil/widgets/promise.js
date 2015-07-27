!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()},safeEvent:function(b,c,d,e){var f,g,h=!1;c=c||window,d=d||300;var i=function(a){f=a,b.apply(c,g)};return function(){var b,c=a.now();g=Array.prototype.slice.apply(arguments),h?c-f>d&&i(c):(h=!0,i(c),e&&(b=setInterval(function(){var c=a.now();c-f>=e&&(i(c),clearInterval(b),h=!1)},d/10)))}},loadImg:function(a,b){var c,d=-1!==navigator.userAgent.search("MSIE 6.0"),e=-1!==navigator.userAgent.search("MSIE 7.0"),f=a.getAttribute("real-src"),g="1"===a.getAttribute("loaded");a.getAttribute("img-index");(!g||d||e)&&(c=new Image,c.onload=function(){a.setAttribute("src",f),a.setAttribute("loaded","1"),b&&b(),c=null},c.src=f)}},b.helpers.shimConsole(),function(a){function c(){this.queue=[],this.status="pending",this.isPromise=!0,this.parentPromise=null}var d=c.prototype;d._setFinalStatus=function(a){for(var b=this;b.parentPromise;)b=b.parentPromise;return this.status=a,b.status=a,b},d.then=function(b,c){switch(this.status){case"pending":this.queue.push({done:b,fail:c});break;case"resolved":b&&b.apply(a);break;case"rejected":c&&c.apply(a)}return this},d.resolve=function(){var b,c,d,e;b=this.queue.shift(),b&&"pending"===this.status?(c=b.done,d=Array.prototype.slice.call(arguments).concat(this),e=c.apply(a,d),e&&e.isPromise?(e.queue=this.queue,e.parentPromise=this):this.resolve(e)):b?"pending"!==this.status&&console.log("this promise has been resolved/rejected!"):this._setFinalStatus("resolved")},d.reject=function(){var b,c,d,e;b=this.queue.shift(),b&&(c=b.fail,c&&(d=Array.prototype.slice.call(arguments).concat(this),c.apply(a,d))),this.queue=[],e=this._setFinalStatus("rejected"),e&&(e.queue=[])},b.Promise=c,b.when=function(){var a,b,d=new c,e=[].slice.call(arguments),f=[],g=e.length;for(a=0;a<e.length;a++)b=e[a],b.isPromise&&b.then(function(a){f.push(a),--g||d.resolve(f)},function(a){d.reject(a)});return d}}(window),c.XUtil=b,c.myUtil=b,b});