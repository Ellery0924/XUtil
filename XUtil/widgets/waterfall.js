!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h))for(var i=a(h),j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");m||n||o||r?(k.val(l),k.trigger("change")):(p||q)&&("true"===l?(k.prop("checked",!0),k.trigger("change")):"false"===l&&(k.prop("checked",!1),k.trigger("change")))}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.XWaterfall=function(c){var d=b.helpers.log,e=c.url||"",f=a.isArray(c.src)?c.src:[],g=a.isNumeric(Math.floor(c.colNum))?Math.floor(c.colNum):5,h=c.renderTo||document.body,i=a.isNumeric(c.colWidth)?c.colWidth:236,j=a.isNumeric(c.contentWidth)?c.contentWidth:234,k=a.isNumeric(Math.floor(c.initialSize))?c.initialSize:10*g,l=a.isNumeric(c.marginTop)?c.marginTop:10,m=a.isNumeric(c.fetchSize)?c.fetchSize:5*g,n=a.isFunction(c.renderer)?c.renderer:function(a){return a},o=a.isFunction(c.onFetch)?c.onFetch:function(){d("XWaterfall: fetching...")},p=a.isFunction(c.fetchCallback)?c.fetchCallback:function(a){d("XWaterfall: "+a)},q=[],r=[],s=[],t=[],u=0,v=0,w=0,x=!0,y=function(a){var b,c,d=t[0],e=t[0].currentHeight;for(b=0;b<t.length;b++)c=t[b],c.currentHeight<e&&(e=c.currentHeight,d=c);return d.append(a,"new"),s.push(a),d},z=function(){var a=[];t.forEach(function(b){a.push(b.currentTop)}),u=Math.max.apply(window,a)},A=function(){var a=[];t.forEach(function(b){a.push(b.currentHeight)}),v=Math.min.apply(window,a)},B=function(){var a=[];t.forEach(function(b){a.push(b.currentHeight)}),w=Math.max.apply(window,a)},C={};return C.set=function(b){return a.isNumeric(b.initialSize)&&(k=b.initialSize),a.isNumeric(b.colWidth)&&(i=b.colWidth),a.isNumeric(b.marginTop)&&(l=b.marginTop),a.isNumeric(b.fetchSize)&&(m=b.fetchSize),a.isNumeric(b.colNum)&&(g=b.colNum),a.isNumeric(b.contentWidth)&&(j=b.contentWidth),a.isFunction(b.onFetch)&&(o=b.onFetch),a.isFunction(b.fetchCallback)&&(p=b.fetchCallback),"url"in b&&(e=b.url),C},C.fetch=function(){var b,c,g;if(c=s.length,c<f.length)for(b=c;c+m>b;b++){if(!(b<f.length)){C.fetch();break}g=y(f[b]),q.push(g.shift())}else{if(""===e)return void(x=!1);o(h),x=!1,a.get(e,{fetchSize:m,currentSize:s.length}).done(function(a){"success"===a.message?a.src.length===m?(a.src.forEach(function(a){var b=y(a);q.push(b.shift())}),x=!0,p("success",h,a.src.length)):(d("XWaterfall: fetch failed, data.src.length is not equal to fetchsize."),x=!1):"all loaded"===a.message?(d("XWaterfall: no more resource!"),x=!1,p("allLoaded",h,a.src.length)):(d("XWaterfall: exception:"+a.message),x=!1,p("exception",h,a.src.length))}).fail(function(){d("XWaterfall: fetch failed!"),x=!1,p("error",h,data.src.length)})}return z(),A(),B(),a(h).css("height",w),C},C.reAttach=function(a){var b,c,d;return"top"===a?(b=q.pop(),b&&(c=b.col,d=t[c],d.prepend(b),r.push(d.pop()))):"bottom"===a&&(b=r.pop(),b&&(c=b.col,d=t[c],d.append(b,"old"),q.push(d.shift()))),z(),A(),B(),C},C.init=function(){var c,d;for(s=[],q=[],r=[],t=[],u=0,v=0,w=0,x=!0,a(h).empty().css("min-height",0).css("height",0).css("position","relative"),c=0;g>c;c++){var e=function(a){var b=["<div style='left:",a.left,"px;top:",a.top,"px;width:",j,"px;height:",a.height,"px;' id='",a.id,"' class='XWaterfall-component'>",n(a.model),"</div>"];return b.join("")};d={index:c,targetLeft:i*c,components:[],currentTop:a(h).offset().top,currentHeight:0,append:function(c,d){var f,g,i,k,m=this,o={};"new"===d?(i=b.helpers.guid(),k=0===m.currentHeight?0:m.currentHeight+l,f=n(c),g=a("<div class='XWaterfall-component'>"+f+"</div>"),g.css("width",j).attr("id",i).appendTo(h).css("left",m.targetLeft).css("top",k),o.col=m.index,m.components.push(o),o.index=m.components.indexOf(o),o.id=i,o.top=k,o.left=m.targetLeft,o.height=g.outerHeight(),o.model=c,1===m.components.length?m.currentHeight=o.height:m.currentHeight+=o.height+l):(f=e(c),a(h).append(f),m.components.push(c),1===m.components.length?m.currentHeight=c.height:m.currentHeight+=c.height+l)},prepend:function(b){var c=this,d=e(b);a(h).append(d),c.components.unshift(b),c.currentTop>0&&(c.currentTop=parseInt(c.components[0].top))},shift:function(){var b=this,c=b.components.shift();return a("#"+c.id).remove(),b.currentTop=parseInt(b.components[0].top),c},pop:function(){var b=this,c=b.components.pop();return a("#"+c.id).remove(),b.currentHeight=b.currentHeight-c.height-l,c}},t.push(d)}for(c=0;k>c;c++)c<f.length&&y(f[c]);return B(),a(h).css("height",w),a(document).scrollTop(0),C},function(){var b=0;a(document).off("scroll.XWaterfall"),a(document).on("scroll.XWaterfall",function(){var c=a(document).scrollTop(),d=a(document).scrollTop()+a(window).height(),e=a(document).height(),f=e-d,g=c-u,h=v-d,i=c-b>0;if(i){if(0===r.length)x&&100>f&&C.fetch();else if(100>h)if(h>=0)C.reAttach("bottom");else for(;v<a(document).scrollTop()+a(window).height()&&r.length>0;)C.reAttach("bottom")}else if(100>g&&q.length>0)if(g>=0)C.reAttach("top");else for(;u>a(document).scrollTop()&&q.length>0;)C.reAttach("top");b=c})}(),C.init(),C},c.XUtil=b,c.myUtil=b,b});