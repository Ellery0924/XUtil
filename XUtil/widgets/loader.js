!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h))for(var i=a(h),j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");m||n||o||r?(k.val(l),k.trigger("change")):(p||q)&&("true"===l.toString()?(k.prop("checked",!0),k.trigger("change")):"false"===l.toString()&&(k.prop("checked",!1),k.trigger("change")))}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.helpers.shimConsole(),b.loader=function(){var a={root:"",mod:"async"},b=function(b){for(var c in b)b.hasOwnProperty(c)&&a.hasOwnProperty(c)&&(a[c]=b[c])},c=function(a){(window.execScript||function(a){window.eval.call(window,a)})(a)},d=function(){for(var b,d,e,f,g,h,i,j,k=a.mod,l=-1===k.search("async"),m=-1!==k.search("async")&&-1===k.search("noteval"),n=-1!==k.search("async")&&-1!==k.search("noteval"),o=/.js/,p=/^\s*(src|href|type|path|rel)\s*$/,q=/^(http:\/\/|\/)/,r=/\/$/,s=arguments[0],t=arguments[1]||function(){console.log("all loaded")},u=a.root?a.root.replace(r,"")+"/":"",v=0,w=[],x=document.head||document.getElementsByTagName("head")[0],y=function(a,b,c){x.appendChild(a),a.type="text",a.text=c,a.src=b,a.type="text/javascript"},z=function(a){var b=q.test(a);return b?a:u+a},A=function(a,b,c){for(var d in a)a.hasOwnProperty(d)&&!p.test(d)&&b.setAttribute(d,c&&"data-main"===d?z(a[d]):a[d])},B=0;B<s.length;B++)if(b=s[B],b="object"==typeof b?b:{path:b},o.test(b.path))if(e=z(b.path),d=document.createElement("script"),l){if(f=new XMLHttpRequest,f.open("GET",e,!1),f.send(),200!==f.status)throw new Error(f.statusText);g=f.responseText,c(g),y(d,e,g),w.push(d),A(b,d,!0)}else m?(d.src=e,v++,d.onload=d.onreadystatechange=function(){this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||0===--v&&t(w)},x.appendChild(d),w.push(d),A(b,d,!0)):n&&(v++,function(){var a=new XMLHttpRequest;a.src=e,a.file=b,a.open("GET",e),a.onreadystatechange=function(){if(4==this.readyState&&200===this.status){w.push(this.responseText);var a=document.createElement("script");y(a,this.src,this.responseText),0===--v&&t(w),A(this.file,a,!0)}},a.send(null)}());else h=document.createElement("link"),i=z(b.path),j=b.rel||"stylesheet",h.href=i,h.rel=j,A(b,h,!1),x.appendChild(h);console.log("all done!"),"sync"===a.mod&&t(w)};return{config:b,load:d,globalEval:c}}(),c.XUtil=b,c.myUtil=b,b});