!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h)){var i=a(h);console.log(i,e);for(var j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");if(m||n||o)k.val(l),k.trigger("change");else if(p||q)"true"===l?(k.prop("checked",!0),k.trigger("change")):"false"===l&&(k.prop("checked",!1),k.trigger("change"));else if(r)for(var s=k[0].options,t=0;t<s.length;t++){var u=s[t];if(u.value===l){k[0].selectedIndex=t,k.trigger("change");break}}}}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(b).remove():a(".XUtil-pageShield").remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.XMenu=function(c){var d=b.helpers.log,e=c.id||"XMenu-"+b.helpers.guid(),f=c.renderTo,g=c.menuClass||"",h=c.textClass||"",i=c.iconClass||"",j=c.labelClass||"",k=c.iconRightClass||"",l=c.subMenuMargin||20,m=[],n=[],o=[],p=function(c,e){var f=c.id||"XMenu-SimpleItem-"+b.helpers.guid(),g=a("<li class='XMenuItem XMenuSimpleItem' id='"+f+"'></li>"),l=a("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),n=a("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),o=a("<div class='XMenuItemLabel simpleItemLabel'></div>"),p=a("<div class='XMenuItemIconRight' style='display:inline-block;'></div>"),q=c.label,r=c.onClick||function(a){d(a)},t=c.iconClass||i,u=c.iconRightClass||k,v=c.textClass||h,w=c.labelClass||j;m.push(c),c.domNode=g,g.data("itemData",c.itemData),o.append(l).append(n).append(p).appendTo(g),n.html(q).addClass(v),l.addClass(t),p.addClass(u),o.addClass(w),g.click(function(){r(c.data,c,g)}),"horizontal"===s.type&&g.bind("mouseenter",function(){var a;a=c.parent.subMenu?c.parent.subMenu:c.parent.menuSrc,a.forEach(function(a){a.close&&a.close()})}),a(e).append(g)},q=function(c,e){var f,m=c.label,o=c.id||"XMenu-PopupItem-"+b.helpers.guid(),r=a("<div class='XMenuItem XMenuPopupItem' id='"+o+"'></div>"),t=a("<ul class='XMenuSubMenu'></ul>"),u=a("<li class='XMenuItemLabel popupItemLabel' style='cursor:pointer;'></li>"),v=a("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),w=a("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),x=a("<div class='XMenuItemIconRight' style='display:inline-block;'></div>"),y=c.textClass||h,z=c.iconClass||i,A=c.labelClass||j,B=c.subMenuClass||g,C=c.iconRightClass||k,D=c.onClick||function(a){d(a)};n.push(c),c.domNode=r,r.data("itemData",c.data),a(e).append(r),t.hide(),"horizontal"===s.type&&t.css("position","absolute"),t.addClass(B),w.html(m).addClass(y),v.addClass(z),x.addClass(C),u.addClass(A),u.append(v).append(w).append(x).appendTo(r),w.click(function(){D(c.data,c,r)}),f=c.subMenu,f.forEach(function(a){var b=a.itemClass;a.parent=c,"simple"===b?p(a,t):"popup"===b&&q(a,t)}),t.appendTo(r);var E=function(){var a,b,d,e,f,g=s.openDirection;a=parseInt(r.css("width")),b=isNaN(parseInt(t.css("border-left-width")))?0:parseInt(t.css("border-left-width")),d=isNaN(parseInt(t.css("border-top-width")))?0:parseInt(t.css("border-top-width")),"vertical"===s.type?(s.animated===!0?t.slideDown("fast"):t.show(),t.css("margin-left",l).css("width",a-l-2*b)):("bottomRight"===g?(e=u.parent().parent().outerWidth()+u.parent().position().left,f=u.position().top,t.css("top",f-d+"px").css("left",parseInt(e-2*b)+"px")):"bottomLeft"===g?(e=u.parent().position().left-u.parent().parent().outerWidth(),f=u.position().top,t.css("top",f-d+"px").css("left",parseInt(e)+"px")):"topRight"===g?(e=u.parent().parent().outerWidth()+u.parent().position().left,f=u.position().top-t.outerHeight()+u.outerHeight(),t.css("top",f+d+"px").css("left",parseInt(e-2*b)+"px")):"topLeft"===g&&(e=u.parent().position().left-u.parent().parent().outerWidth(),f=u.position().top-t.outerHeight()+u.outerHeight(),t.css("top",f+d+"px").css("left",parseInt(e)+"px")),s.animated===!0&&"horizontal"===s.type?t.fadeIn("fast"):t.show()),u.find(".XMenuItemIconRight").addClass("rotate"),u.addClass("opened"),u.attr("opened","opened"),x.addClass("subExpanded"),c.isOpened=!0},F=function(){var b=this.domNode.find(".XMenuSubMenu"),c=this.domNode.find(".XMenuItemLabel"),d=this.domNode.find(".XMenuItemIconRight");b.find(".XMenuPopupItem").removeAttr("opened"),d.removeClass("rotate"),s.animated===!0&&"vertical"===s.type?b.slideUp("fast"):s.animated===!0&&"horizontal"===s.type?b.fadeOut("fast"):b.hide(),this.subMenu.forEach(function(b){"popupItem"===b.itemClass&&a.proxy(F,b)()}),c.removeClass("opened"),c.attr("opened")&&c.removeAttr("opened"),d.removeClass("subExpanded"),this.isOpened=!1};c.open=E,c.close=F,c.isOpened=!1,"vertical"===s.type?x.click(function(){var b=a(this.parentNode).attr("opened");"opened"===b?c.close():c.open()}):r.bind("mouseenter",function(){var b,d,e=this;d=c.parent.subMenu?c.parent.subMenu:c.parent.menuSrc,a(e).find(".XMenuItemLabel").attr("opened","opened"),d.forEach(function(a){a!==c&&a.close&&a.close()}),setTimeout(function(){b=a(e).find(".XMenuItemLabel").attr("opened"),b&&c.open()},400)})},r=function(a){for(var b,c=[],d=a;void 0!==d.parent&&void 0!==d.parent.subMenu;)b=d.parent.subMenu.indexOf(d),c.push(b),d=d.parent;return c.push(d.parent.menuSrc.indexOf(d)),c.reverse().join("-")};a(document).click(function(b){var c=b.target;"horizontal"===s.type&&(a(s.domNode).find(c)[0]||s.closeAll())}),a(document).bind("mousemove",function(b){var c,d,e,f=b.target;c=b.pageX,a(s.domNode).find(f)[0]||"horizontal"!==s.type||s.allItems.forEach(function(b){"popup"===b.itemClass&&b.isOpened===!0&&(d=b.domNode,e=a(d).offset().left,-1!==s.openDirection.toLowerCase().search("right")?e>c&&b.close():-1!==s.openDirection.toLowerCase().search("left")&&e+a(d).outerWidth()<c&&b.close())})});var s={};return s.type=c.type||"vertical",s.animated=!1,"animated"in c&&c.animated===!0&&(s.animated=!0),s.menuSrc=[],s.allItems=[],s.openDirection=c.openDirection||"bottomRight",s.maxLevel=0,s.append=function(a){return a&&a.itemClass&&("popup"===a.itemClass||"simple"===a.itemClass)&&(s.menuSrc.push(a),a.parent=s),s},s.open=function(a){var b,c,d=a.split("-"),e=s.menuSrc[d[0]];if(!e.open)return e;for(e.open(),b=1;b<d.length;b++)c=d[b],e.subMenu[c]&&e.subMenu[c].open&&e.subMenu[c].open(),e=e.subMenu[c];return e},s.closeAll=function(){return s.menuSrc.forEach(function(a){"popup"===a.itemClass&&a.close()}),s},s.init=function(){var b=a("<div class='XMenu' id='"+e+"'></div>")[0],c=a(f)[0];if(a(f).length>1)throw error("XMenu: option.renderTo属性设置有误！");return a(b).addClass(g).css("position","relative"),a(c).empty().append(b),s.menuSrc.forEach(function(a){var c=a.itemClass;a.parent=s,"simple"===c?p(a,b):"popup"===c&&q(a,b)}),o=m.concat(n),o.forEach(function(a){var b;a.location=r(a),a.rootMenu=s,b=a.location.split("-").length,b>s.maxLevel&&(s.maxLevel=b)}),s.domNode=b,s.allItems=o,a(b).children().addClass("firstLevelItem"),a(b).addClass("vertical"===s.type?"vertical":"horizontal"),s},s},b.MenuItem=function(a){return{itemClass:"simple",label:a.label||"空",onClick:a.onClick||function(a){var c=b.helpers.log;c(a)},option:a,iconClass:a.iconClass||"",labelClass:a.labelClass||"",id:a.id||"XMenu-SimpleItem-"+b.helpers.guid(),textClass:a.textClass||"",iconRightClass:a.iconRightClass||"",data:a.data||{},parent:void 0,remove:function(){var a;return this.parent.subMenu?(a=this.parent.subMenu.indexOf(this),-1!==a&&this.parent.subMenu.splice(a,1)):this.parent.menuSrc&&(a=this.parent.menuSrc.indexOf(this),-1!==a&&this.parent.menuSrc.splice(this.parent.menuSrc.indexOf(this),1)),this.rootMenu&&this.rootMenu.init&&this.rootMenu.init(),this},appendTo:function(a){return void 0===a||void 0===a.parent?this:this.parent===a?this:(this.remove(),a.append?a.append(this):(a.itemClass="popup",a.subMenu=[],a.subMenuClass="",a.append=function(a){return a&&a.itemClass&&("popup"===a.itemClass||"simple"===a.itemClass)&&(this.subMenu.push(a),a.parent=this),this.rootMenu&&this.rootMenu.init&&this.rootMenu.init(),this},a.append(this)),this.rootMenu&&this.rootMenu.init&&this.rootMenu.init(),this)},insertAt:function(a){return this.remove(),this.parent.subMenu?this.parent.subMenu.splice(a,0,this):this.parent.menuSrc.splice(a,0,this),this.rootMenu&&this.rootMenu.init&&this.rootMenu.init(),this}}},b.PopupMenuItem=function(a){var c=b.MenuItem(a);return c.id=a.id||"XMenu-PopupItem-"+b.helpers.guid(),c.itemClass="popup",c.subMenu=[],c.subMenuClass=a.subMenuClass||"",c.append=function(a){return a&&a.itemClass&&("popup"===a.itemClass||"simple"===a.itemClass)&&(c.subMenu.push(a),a.parent=c),c.rootMenu&&c.rootMenu.init&&c.rootMenu.init(),c},c.open=function(){},c.close=function(){},c},b.XSuspendedMenu=function(c){var d,e=b.helpers.error,f="XSuspendedMenuContainer-"+b.helpers.guid(),g=c.bindTo||"mouse",h=c.offset||{top:0,left:0},i=c.animated||!1;d=i?!0:!1;var j=a("<div class='XSuspendedMenuContainer'></div>"),k={};if(j.css("position","absolute").attr("id",f).attr("opened","false").appendTo(document.body).hide(),c.renderTo="#"+f,c.animated=d,c.type="horizontal",k.menu=b.XMenu(c),k.menu.init(),k.container=j,k.bindToDom=void 0,k.isOpened=!1,k.target=void 0,!a(g)[0])throw e("XSuspendedMenu: 目标dom不存在，请检查option.bindTo属性.");return k.bindToDom=a(g),k.show=function(b,c){var d,e,f,g,l;return d=a(document).outerWidth()-k.menu.maxLevel*j.outerWidth(),e=a(document).outerHeight()-k.menu.maxLevel*j.outerHeight(),d>b?(j.css("left",b+3+h.left),f="Right"):(j.css("left",b-j.outerWidth()-3+h.left),f="Left"),e>c?(j.css("top",c+3+h.top),g="bottom"):(j.css("top",c-j.outerHeight()-3+h.top),g="top"),l=g+f,k.menu.openDirection=l,k.menu.init(),i?j.fadeIn(150):j.show(),j.attr("opened","true"),k.isOpened=!0,k},k.init=k.menu.init,k.hide=function(){return i?j.fadeOut(150):j.hide(),j.attr("opened","false"),k.target=void 0,k.isOpened=!1,k},a(k.bindToDom).bind("contextmenu",function(a){var b=a.pageX,c=a.pageY;a.preventDefault(),a.stopPropagation(),k.isOpened?(k.hide(),k.target=a.currentTarget,setTimeout(function(){k.show(b,c)},150)):k.show(b,c)}),a(document.body).bind("click",function(a){var b=a.target;0!==a.button||j.find(b)[0]||"true"!==j.attr("opened")||k.hide()}),k},c.XUtil=b,c.myUtil=b,b});