!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},shimConsole:function(){var a=function(){};window.console||(window.console={log:a,error:a,warn:a})},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h))for(var i=a(h),j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");m||n||o||r?(k.val(l),k.trigger("change")):(p||q)&&("true"===l.toString()?(k.prop("checked",!0),k.trigger("change")):"false"===l.toString()&&(k.prop("checked",!1),k.trigger("change")))}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(".XUtil-pageShield").remove():a(b).remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.helpers.shimConsole(),b.XDialog=function(c){var d,e,f,g,h,i,j,k,l,m=b.helpers,n=m.log,o=c.width||"auto",p=c.height||"auto",q=c.top||.5,r=c.left||.5,s=c.closable||!1,t=a.isFunction(c.onClose)?c.onClose:function(){n("XDialog: XDialog is closed.")},u=a.isFunction(c.onOpen)?c.onOpen:function(){n("XDialog: XDialog is opened.")},v=!1,w=c.id||"XDialog-"+m.guid(),x=c.className||"",y=c.title||"XDialog",z=c.zIndex||1e3,A=c.draggable||!1,B=c.animated||!1,C=c.content||"",D=!0,E=!1,F=!1,G={};return"autoOpen"in c&&c.autoOpen===!0&&(v=!0),f=a("<div class='XDialog' id='"+w+"'><div class='XDialogTitle'><span class='titleText'></span><span class='closeBtn'></span></div><div class='XDialogContent'></div></div>")[0],g=a(f).find(".XDialogContent")[0],h=a(f).find(".closeBtn")[0],i=a(f).find(".titleText")[0],a(document.body).append(f).css("position","relative"),a(h).click(function(a){a.stopPropagation(),G.close()}),G.domNode=f,G.contentNode=g,G.closeBtn=h,G.init=function(){return a(f).css("position","fixed").css("top",q).css("left",r).css("z-index",z).hide().addClass(x),a(g).css("min-width","200px").css("min-height","200px").css("height",p).css("width",o).html(C),a(f).find(".closeBtn").hide(),d=a(f).outerWidth(),e=a(f).outerHeight(),a(f).css("margin-top",-e/2).css("margin-left",-d/2),a(f).find(".titleText").html(y),v&&G.open(),s&&a(f).find(".closeBtn").show(),A&&(a(i).css("cursor","move"),a(i).on("mousedown."+w,function(a){1===a.which&&(F=!0,j=a.pageX,k=a.pageY)}),a(document).on("mousemove."+w,function(b){var c,d,e,g;F&&(i.onselectstart=function(){return!1},c=b.pageX,d=b.pageY,e=c-j,g=d-k,q+=+g,r+=e,a(f).css("top",q).css("left",r),j=c,k=d)}),a(document).on("mouseup."+w,function(){F=!1,i.onselectstart=function(){return!0}})),G},G.set=function(b){return"width"in b&&(o=b.width),"height"in b&&(p=b.height),"top"in b&&(q=b.top),"left"in b&&(r=b.left),"title"in b&&(y=b.title),"className"in b&&(x=b.className),"closable"in b&&(s=Boolean(b.closable)),"onClose"in b&&a.isFunction(b.onClose)&&(t=b.onClose),"onOpen"in b&&a.isFunction(b.onOpen)&&(u=b.onOpen),"autoOpen"in b&&(v=Boolean(b.autoOpen)),"zIndex"in b&&a.isNumeric(b.zIndex)&&(z=b.zIndex),"draggable"in b&&(A=b.draggable),"animated"in b&&(B=Boolean(b.animated)),"content"in b&&(C=b.content.toString()),G},G.open=function(){return E||(B?a(f).fadeIn("fast"):a(f).show(),E=!0,l=m.addShield(document.body,.5,z-1),u(),D&&(q=a(window).height()*q-a(f).outerHeight()/2,r=a(window).width()*r-a(f).outerWidth()/2,a(f).css("top",q).css("left",r).css("margin-top",0).css("margin-left",0),D=!1)),G},G.close=function(){return E&&(B?a(f).fadeOut("fast"):a(f).hide(),E=!1,m.removeShield(),t()),G},G.init(),G},c.XUtil=b,c.myUtil=b,b});