!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},addShield:function(b,c,d){var e,f,g,h,i,j=d||1;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),a.isNumeric(c)||(c=.5),i=a("<div class='xTable-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#ebe9e9").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(b).remove():a(".xTable-pageShield").remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<div class='XUtil-errorHint'>* "+c+"</div>");e.find(".errorHint")[0]?f.insertAfter(b):f.addClass(d)},clearErrorHint:function(b){b?a(b.parentNode).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=location.search.substring(1),g=f.split("&");for(a=0;a<g.length;a++)b=g[a].indexOf("="),-1!==b&&(c=g[a].substring(0,b),d=decodeURI(g[a].substring(b+1)),e[c]=d);return e},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.XDialog=function(c){var d,e,f,g,h,i,j,k,l,m=b.helpers.log,n=c.width||"auto",o=c.height||"auto",p=c.top||"50%",q=c.left||"50%",r=c.closable||!1,s=a.isFunction(c.onClose)?c.onClose:function(){m("XDialog: XDialog is closed.")},t=a.isFunction(c.onOpen)?c.onOpen:function(){m("XDialog: XDialog is opened.")},u=!1,v=c.id||"XDialog-"+b.helpers.guid(),w=c.className||"",x=c.title||"XDialog",y=c.zIndex||1e3,z=c.draggable||!1,A=c.animated||!1,B=c.content||"",C=!1,D=!1,E={};return"autoOpen"in c&&c.autoOpen===!0&&(u=!0),f=a("<div class='XDialog' id='"+v+"'><div class='XDialogTitle'><span class='titleText'></span><span class='closeBtn'></span></div><div class='XDialogContent'></div></div>")[0],g=a(f).find(".XDialogContent")[0],h=a(f).find(".closeBtn")[0],i=a(f).find(".titleText")[0],a(document.body).append(f),a(h).click(function(a){a.stopPropagation(),E.close()}),E.domNode=f,E.contentNode=g,E.closeBtn=h,E.init=function(){return a(f).css("position","fixed").css("top",p).css("left",q).css("z-index",y).hide().addClass(w),a(g).css("min-width","200px").css("min-height","200px").css("height",o).css("width",n).html(B),a(f).find(".closeBtn").hide(),d=a(f).outerWidth(),e=a(f).outerHeight(),a(f).css("margin-top",-e/2).css("margin-left",-d/2),a(f).find(".titleText").html(x),u&&E.open(),r&&a(f).find(".closeBtn").show(),z&&(a(i).css("cursor","move"),a(i).off("mousedown"),a(i).on("mousedown",function(a){1===a.which&&(D=!0,j=a.pageX,k=a.pageY)}),a(document).off("mousemove.XDialogDrag"),a(document).on("mousemove.XDialogDrag",function(b){var c,d,e,g;D&&(i.onselectstart=function(){return!1},c=b.pageX,d=b.pageY,e=c-j,g=d-k,p+=+g,q+=e,a(f).css("top",p).css("left",q),j=c,k=d)}),a(document).off("mouseup.XDialogDrag"),a(document).on("mouseup.XDialogDrag",function(){D=!1,i.onselectstart=function(){return!0}})),E},E.set=function(b){return"width"in b&&(n=b.width),"height"in b&&(o=b.height),"top"in b&&(p=b.top),"left"in b&&(q=b.left),"title"in b&&(x=b.title),"className"in b&&(w=b.className),"closable"in b&&(r=Boolean(b.closable)),"onClose"in b&&a.isFunction(b.onClose)&&(s=b.onClose),"onOpen"in b&&a.isFunction(b.onOpen)&&(t=b.onOpen),"autoOpen"in b&&(u=Boolean(b.autoOpen)),"zIndex"in b&&a.isNumeric(b.zIndex)&&(y=b.zIndex),"draggable"in b&&(z=b.draggable),"animated"in b&&(A=Boolean(b.animated)),"content"in b&&(B=b.content.toString()),E},E.open=function(){return C||(A?a(f).fadeIn("fast"):a(f).show(),C=!0,l=b.helpers.addShield(document.body,.5,y-1),t(),p=a(f).offset().top,q=a(f).offset().left,a(f).css("top",p).css("left",q).css("margin-top",0).css("margin-left",0)),E},E.close=function(){return C&&(A?a(f).fadeOut("fast"):a(f).hide(),C=!1,b.helpers.removeShield(),s()),E},E.init(),E},c.XUtil=b,c.myUtil=b,b});