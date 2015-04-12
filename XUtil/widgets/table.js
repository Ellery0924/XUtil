!function(a){"function"==typeof define&&define.amd?define(["jquery","jquery-ui"],a):a(jQuery)}(function(a){"use strict";var b={},c=window;return b.config={rootPath:"XUtil"},b.helpers={log:function(){var a=Array.prototype.slice.apply(arguments,[]);a.unshift("(XUtil) "),console.log.apply(console,a)},error:function(){if(arguments[0]){var a="(XUtil) "+arguments[0].toString();return new Error(a)}},bindInput:function(c,d){var e=d||"data-bind",f=b.helpers.bindInput,g={};if(c){if("string"==typeof c)void 0===d?(g={},g[c]="",f.call(window,g)):(g={},g[c]=d,f.call(window,g));else for(var h in c)if(c.hasOwnProperty(h)){var i=a(h);console.log(i,e);for(var j=0;j<i.length;j++){var k=a(h).eq(j),l=(c[h]||(k.attr(e)?k.attr(e):"")).toString(),m=k.is("input[type=text]"),n=k.is("textarea"),o=k.is("input[type=hidden]"),p=k.is("input[type=checkbox]"),q=k.is("input[type=radio]"),r=k.is("select");if(m||n||o)k.val(l),k.trigger("change");else if(p||q)"true"===l?(k.prop("checked",!0),k.trigger("change")):"false"===l&&(k.prop("checked",!1),k.trigger("change"));else if(r)for(var s=k[0].options,t=0;t<s.length;t++){var u=s[t];if(u.value===l){k[0].selectedIndex=t,k.trigger("change");break}}}}}else g["["+e+"]"]="",f.call(window,g)},addShield:function(b,c,d){var e,f,g,h,i,j=d||1e4;return!b&&(b=document.body),b=a(b),e=b.offset().top,f=b.offset().left,g=b.outerWidth(),h=b.outerHeight(),b[0]===document.body&&(g="100%",h="100%"),a.isNumeric(c)||(c=.3),i=a("<div class='XUtil-pageShield'></div>"),i.css("position","absolute").css("z-index",j).css("background","#000").css("opacity",c).css("top",e).css("left",f).css("width",g).css("height",h).appendTo(document.body),i},removeShield:function(b){b?a(b).remove():a(".XUtil-pageShield").remove()},showErrorHint:function(b,c,d){var e=a(b.parentNode),f=a("<span class='errorHint'>* "+c+"</span>");return 0===e.find(".errorHint").length&&f.insertAfter(b),d&&f.addClass(d),f},clearErrorHint:function(b){b?a(a(b).parent()).find(".errorHint").remove():a(".errorHint").remove()},getUrlArgs:function(){var a,b,c,d,e={},f=window.location||f,g=f.search.substring(1),h=g.split("&");for(a=0;a<h.length;a++)b=h[a].indexOf("="),-1!==b&&(c=h[a].substring(0,b),d=decodeURI(h[a].substring(b+1)),e[c]=d);return e},toQuery:function(a){var b="?";for(var c in a)a.hasOwnProperty(c)&&(b+=c+"="+a[c]+"&");return b},getUrl:function(a,b){var c=helpers;return encodeURI(a+c.toQuery(b))},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:0&b&3|8;return c.toString(16)}).toUpperCase()},preloadImages:function(){var a;for(a=0;a<arguments.length;a++)(new Image).src=arguments[a].toString()}},b.XTable=function(c){var d=b.helpers.log,e=b.helpers.error,f={},g=c.id||"XTable-"+b.helpers.guid();if(!c.src)throw e("XTable: 配置参数有误，请检查src属性是否为合法的JSON数据");var h=b.config.rootPath;if(!h||""===h)throw e("XTable: 配置参数有误，请检查myUtil.config对象");var i=!0;"colEditable"in c&&c.colEditable===!1&&(i=!1);var j=!0;"hasFilter"in c&&c.hasFilter===!1&&(j=!1);var k=c.filterType||1,l=a(c.renderTo)[0];if(!l||a(c.renderTo).length>1)throw e("XTable: 配置参数有误，请检查option.renderTo属性");var m=c.fontSize||"14px";a(l).empty().css("font-size",m);var n=[],o=[],p=[],q=[],r=[],s=[];c.columns.forEach(function(a){if(n.push(a.name),j===!0?"hasFilter"in a&&a.hasFilter!==!0?"hasFilter"in a&&a.hasFilter===!1&&r.push(!1):r.push(!0):r.push(!1),"sortable"in a&&a.sortable!==!0?"sortable"in a&&a.sortable===!1&&s.push(!1):s.push(!0),!("data"in a))throw e("XTable.js: 配置参数有误，请检查option.column的data属性。");o.push(a.data),p.push(a.width),"visible"in a&&a.visible!==!0||q.push(a.data)});var t=!0,u=[],v=c.beforeSelect||function(){},w=c.selectCb||function(){},x=c.beforeDeselect||function(){},y=c.deselectCb||function(){};"selectable"in c&&c.selectable===!1&&(t=!1);var z,A=c.beforeDelete||function(){return!0},B=c.deleteCb||function(){};z="deletable"in c&&c.deletable===!0?!0:!1;var C=c.editable||!1,D=c.showEditCol||!1,E=[],F=0,G=C&&c.editCb||function(){},H=C&&c.beforeEdit||function(){},I="top";"controllerPosition"in c&&"bottom"===c.controllerPosition&&(I="bottom");var J=c.pageSizes||[10,20,50,100,200],K=parseInt(J[0]),L=c.linkCols,M=[],N=a("<div class='xTable-table'></div>"),O=a("<div class='xTable-controller'></div>"),P=a("<div class='xTable-pageController'></div>"),Q=a("<div class='xTable-pageSizeController'></div>"),R=a("<li class='functionButton prevButton ui-state-default ui-corner-all'><span class='ui-icon ui-icon-seek-prev'></span></li>"),S=a("<li class='functionButton nextButton ui-state-default ui-corner-all'><span class='ui-icon ui-icon-seek-next'></span></li>"),T=a("<li class='functionButton firstButton ui-state-default ui-corner-all'><span class='ui-icon ui-icon-seek-first'></span></li>"),U=a("<li class='functionButton lastButton ui-state-default ui-corner-all'><span class='ui-icon ui-icon-seek-end'></span></li>"),V=a("<input type='text' class='xTable-gotoBox' value='1'/>"),W=a("<span class='xTable-maxPage'></span>"),X=a("<table class='xTable-view' border='1' width='100%'></table>"),Y=a("<select class='xTable-pageSizeSelector'></select>");J.forEach(function(a){Y.append("<option value='"+a+"'>"+a+"</option>")}),P.append(T).append(R).append(V).append(W).append(S).append(U),O.append(P).append(Q),"top"===I?N.append(O).append(X):N.append(X).append(O),a(l).append(N);var Z=a("<input class='xTable-selectAll' type='checkbox'/>"),$=a("<td class='xTable-selectAllTd' class='xTable-selectAllTd'></td>");$.append(Z),X.empty();var _=[],aa=a("<tr class='xTable-Header'></tr>");if(t&&aa.append($),n.forEach(function(b,c){var d=a("<td class='colName' colName='"+b+"'><div class='colNameText'>"+b+"</div></td>");if(aa.append(d),_.push(d),r[c]&&a("<li class='openFilterLi ui-state-default ui-corner-all' title='.ui-icon-search'><span class='ui-icon ui-icon-search'></span></li>").appendTo(d),s[c]){var e=a("<div class='orderTag'></div>");d.attr("sortable","true").append(e)}else d.attr("sortable","false")}),C){var ba=a("<td class='editHeader' colName='edit'>编辑</td>");aa.append(ba),D||ba.hide()}p.forEach(function(a,b){_[b]&&_[b].css("width",a)}),o.forEach(function(a,b){_[b]&&_[b].attr("srcName",a)}),X.append(aa),a(l).find("li").hover(function(){a(this).addClass("ui-state-hover"),a(this).css("cursor","pointer")},function(){a(this).removeClass("ui-state-hover"),a(this).css("cursor","default")}),a("#"+g+"-setVCols",N).remove();var ca=a("<div id='"+g+"-setVCols'></div>");ca.dialog({autoOpen:!1,width:400,resizable:!1,title:"设置显示的列",buttons:[{text:"确定",id:g+"-submitVCols",click:function(){}},{text:"取消",id:g+"-closeSetVCols",click:function(){a(this).dialog("close")}}],position:{my:"top+10%",at:"top+10%",of:window},open:function(){b.helpers.addShield(document.body)},close:function(){b.helpers.removeShield()}}),a(N).append(ca.parent());var da=a("<input type='button' value='设置' class='openSetV'/>");i&&(da.insertAfter(U),da.button());var ea=a("<input type='checkbox' class='showAllCol' checked='true'/>"),fa=a("<div class='subVCol showAllColSpan'></div>");fa.append(ea).append("全部").appendTo(ca),c.columns.forEach(function(b){var c=a("<div class='subVCol'></div>"),d=a("<input type='checkbox' class='vColCb' srcName='"+b.data+"' colName='"+b.name+"'/>");c.append(d).append(b.name),"visible"in b&&b.visible!==!0?(d.prop("checked",!1),ea.prop("checked",!1)):d.prop("checked",!0),ca.append(c)});var ga=a("<input type='button' value='全选当前页' class='funcButton'/>");t&&(ga.appendTo(P),ga.button());var ha;z&&(ha=a("<input type='button' value='剔除选中条目' class='funcButton deleteBtn'/>").button({disabled:!0}),ha.appendTo(P));var ia=function(b,c,d,e,g){b=parseInt(b);var h,i;!isNaN(b)&&b>=0&&b<n.length&&(h=a(".dataTr",N).toArray(),i=[],h.forEach(function(c){a(c).find(".dataCell")[b]&&i.push(a(c).find(".dataCell")[b])}),i.forEach(function(b,i){var j=parseInt(a(h[i]).attr("srcindex")),k=f.orgSrc[j],l=a(b).text(),m=a("<a href=''>"+l+"</a>");"button"===g&&(m=a("<input type='button' value='"+l+"'>").button()),c&&"button"!==g?m.attr("href",c(j,k,m)):"button"!==g&&m.attr("href","javascript: void (0)"),d&&"button"===g?m.attr("target",d):m.attr("target","_blank"),c||m.attr("target","_self"),e&&m.click(function(){var a=this;e(k,a)}),a(b).attr("editInvalid","true"),a(b).empty().append(m)}))},ja=function(c){a(".dataTr",N).remove(),a(".tempMessage",N).remove(),a("<div class='tempMessage'>"+c+"</div>").insertAfter(N.find(".xTable-view")),b.helpers.addShield(N)},ka=function(){a(N).find(".tempMessage").remove(),b.helpers.removeShield()};return f.orgSrc=c.src,f.id=g,f.headers=_,f.attrs=o,f.src=f.orgSrc.slice(),f.option=c,f.firstButton=T,f.prevButton=R,f.gotoBox=V,f.nextButton=S,f.lastButton=U,f.pageSizeSelector=Y,f.pageController=P,f.controller=O,f.view=X,f.src.forEach(function(a,b){a.selected=!1,a.orgIndex=b}),f.init=function(){var b,c,d,e=f.src,g=Math.ceil(e.length/K);for(M=[],u=[],Q.empty().append("共"+e.length+"条结果，每页显示").append(Y).append("条"),W.html(" / "+g),a(".xTable-selectAll",N).prop("checked",!1),b=0;b<e.length;b++)if(e[b].selected=!1,(b+1)%K===0){for(d=[],c=K;c>0;c--)e[b-c+1].srcIndex=b-c+1,d.push(e[b-c+1]);M.push(d)}else if(b===e.length-1){for(d=[],c=K*(g-1);c<e.length;c++)e[c].srcIndex=c,d.push(e[c]);M.push(d)}f.loadPage(1)},f.destroy=function(){a(l).empty()},f.loadPage=function(b){var d,f,g,h;return 0!==F?void alert("请先保存当前正在编辑的行！"):0===M.length?void a(".dataTr",N).remove():void(b>0&&b<=M.length&&(a(".dataTr",N).remove(),V.val(b),b=parseInt(b),d=M[b-1],d.forEach(function(d,g){var h=a("<tr class='dataTr'></tr>"),i=a("<input type='checkbox' class='selectRow'/>"),j=a("<td class='rowCb'></td>");h.attr("index",K*(b-1)+g),t&&d.selected&&(i.prop("checked",!0),h.addClass("rowSelect")),h.attr("srcIndex",d.orgIndex).data("srcObj",d),j.append(i),t&&h.append(j),h.appendTo(X),o.forEach(function(b,f){var g=a("<td class='dataCell' srcName='"+b+"'></td>");if(!(b in d))throw e("XTable.js: 源JSON数据与data属性关联失败，请检查参数对象：column的data属性输入是否正确。");g.append(d[b]),g.appendTo(h),C&&"editable"in c.columns[f]&&c.columns[f].editable===!1&&g.attr("editInvalid","true")}),C&&(f=a("<td class='editTd'><input type='button' class='editBtn' value='编辑'/></td>"),f.find("input").button(),h.append(f),D||f.hide())}),L&&L.length>0&&L.forEach(function(a){ia(a.colIndex,a.renderer,a.target,a.onclick,a.type)}),g=a(".dataCell",N).toArray(),h=a(".colName",N).toArray(),g.forEach(function(b){var c=a(b).attr("srcName");-1===q.indexOf(c)&&a(b).hide()}),h.forEach(function(b){var c=a(b).attr("srcName");-1===q.indexOf(c)?a(b).hide():a(b).show()})))},f.selectRow=function(b){var c=parseInt(a(b).attr("index"));v(f.getSelectedData(),b),a(b).attr("select","selected"),a(b).find("input[type=checkbox]").prop("checked",!0),-1===u.indexOf(c)&&(u.push(c),f.src[c].selected=!0,a(b).addClass("rowSelect")),w(f.getSelectedData(),b),u.length>0&&z&&0===F&&ha.button({disabled:!1}),d("XTable-Filter.selectRow: The rows been selected are "),d(f.getSelectedData())},f.unselectRow=function(b){var c=a(b).attr("index"),e=u.indexOf(parseInt(c));x(f.getSelectedData(),b),a(b).removeClass("rowSelect").removeClass("rowHover").removeClass("rowSelect").removeAttr("select"),a(b).find("input[type=checkbox]").prop("checked",!1),a(".xTable-selectAll",N).prop("checked",!1),-1!==e&&(u.splice(e,1),f.src[c].selected=!1),y(f.getSelectedData(),b),0===f.getSelectedData().length&&z&&ha.button({disabled:!0}),d("XTable-Filter.unselectRow: The rows been selected are "),d(f.getSelectedData())},f.selectAll=function(){var b;for(v(f.getSelectedData()),a(".xTable-selectAll",N).prop("checked",!0),a(".selectRow",N).prop("checked",!0),u=[],a(".dataTr",N).attr("select","selected").addClass("rowSelect"),b=0;b<f.src.length;b++)u.push(b),f.src[b].selected=!0;u.length>0&&z&&0===F&&ha.button({disabled:!1}),w(f.getSelectedData())},f.unselectAll=function(){var b;for(x(f.getSelectedData()),u=[],b=0;b<f.src.length;b++)f.src[b].selected=!1;a(".selectRow",N).prop("checked",!1),a(".xTable-selectAll",N).prop("checked",!1),a(".dataTr",N).removeAttr("select").removeClass("rowSelect").removeClass("rowHover"),0===f.getSelectedData().length&&z&&ha.button({disabled:!0}),y(f.getSelectedData())},f.setPageSize=function(b){var c,d,e=Y[0].options,g=-1;if(0!==F)return void alert("请先保存当前正在编辑的行！");for(K=parseInt(b),a(".orderTag",N).empty(),c=0;c<e.length;c++)if(d=e[c],parseInt(d.value)===K){g=c;break}Y[0].selectedIndex=g,f.init()},f.toFirstPage=function(){f.loadPage(1)},f.toLastPage=function(){f.loadPage(M.length)},f.toPrevPage=function(){var a=parseInt(V.val());a>1&&f.loadPage(a-1)},f.toNextPage=function(){var a=parseInt(V.val());a<M.length&&f.loadPage(a+1)},f.getSelectedData=function(){var a=[];return u.forEach(function(b){a.push(f.src[b])}),a},f.setVisibleCols=function(a){return 0!==F?void alert("请先保存当前正在编辑的行！"):(q=a,void f.init())},f.editRow=function(b){var c=a(b).find(".dataCell").toArray();c.forEach(function(b){var c;a(b).attr("editInvalid")||(c=a(b).html(),a(b).empty().append("<input class='editInput' type='text' value='"+c+"'/>"))}),a(a(b).find(".editBtn")).val("保存"),F++,a(".xTable-pageSizeSelector",N).prop("disabled",!0),a("input[type=button]:not(.editBtn)",N).button({disabled:!0})},f.saveRow=function(b){var c,e=a(b).find(".dataCell").toArray(),g=a(b).attr("srcindex"),h=a(b).attr("index"),i=f.orgSrc[h];return H(i,b),e.forEach(function(b){var c="",d=a(b).attr("srcname");a(b).attr("editInvalid")||(c=a(a(b).find(".editInput")).val(),"number"==typeof targetAttr?isNaN(Number(c))?(f.src[h][d]=0/0,f.orgSrc[g][d]=0/0,a(b).html(0/0)):(f.src[h][d]=Number(c),f.orgSrc[g][d]=Number(c),a(b).html(c)):(f.src[h][d]=c,f.orgSrc[g][d]=c,a(b).html(c)))}),-1===E.indexOf(g)&&E.push(g),c=f.getEditedData(),d("XTable-Filter.saveEdit: The rows been edited are "),d(c),a(a(b).find(".editBtn")).val("编辑"),F--,0===F&&(a(".xTable-pageSizeSelector",N).prop("disabled",!1),a("input[type=button]:not(.editBtn,.deleteBtn)",N).button({disabled:!1}),0!==u.length&&ha.button({disabled:!1})),G(i,b),i},f.getEditedData=function(){var a=[];return E.forEach(function(b){f.orgSrc[b]&&a.push(f.orgSrc[b])}),a},f.sortBy=function(a,b){var c=new Worker(h+"/workers/XTableSort.js");return 0!==F?void alert("请先保存当前正在编辑的行！"):(ja("正在排序，请稍候..."),c.postMessage({src:f.src,name:a,order:b}),void(c.onmessage=function(a){ka(),f.src=a.data,f.init(),c.terminate()}))},f.deleteSelectedData=function(){var b,c=f.getSelectedData();return 0!==F?void alert("请先保存当前正在编辑的行！"):void(A(c,f.orgSrc)&&(ja("正在删除，请稍候..."),b=new Worker(h+"/workers/XTableDelete.js"),b.postMessage({selectedData:c,orgSrc:f.orgSrc}),b.onmessage=function(d){f.orgSrc=d.data,f.src=f.orgSrc.slice(),f.src.forEach(function(a,b){a.selected=!1,a.orgIndex=b}),ka(),a(O).find(".cFilterData").remove(),a(O).find(".resetData").remove(),a(ha).button({disabled:!0}),f.init(),b.terminate(),B(c,f.orgSrc)}))},f.extendFunction=function(b){var c=a("<input type='button' value='"+b.fName+"' class='funcButton'/>");return c.appendTo(f.pageController).button({disabled:b.disabled}).click(function(){a.proxy(b.handler,this)(f.getSelectedData(),f.orgSrc)}),b.className&&c.addClass(b.className),b.style&&(c[0].style=c[0].style+";"+b.style),c},f.addRow=function(b,c,d){void 0===b&&(b={}),c&&c(b,f.orgSrc),o.forEach(function(a){void 0===b[a]&&(b[a]="")}),b.selected=!1,b.orgIndex=f.orgSrc.length,f.src.push(b),f.orgSrc.push(a.extend({},b,!0)),f.init(),f.toLastPage(),f.view.find(".dataTr").last().find(".editTd").find("input").click(),f.view.find(".dataTr").last().find("input[type=text]").first().focus(),d&&d(b,f.orgSrc)},f.filter=function(){var c=b.XFilter({src:[],id:f.id+"-filter",filterType:k}),d=c.id,e=c.filterDiv,g=e.parent(),i="",j="",l=c.selectedNames;return g.css("width","auto").css("font-size","16px"),e.dialog({open:function(){b.helpers.addShield(document.body)}}),g.appendTo(N),c.loadFilterOverride=function(a,b){c.src=[],j=b,f.src.forEach(function(a){c.src.push(a[b])}),c.loadFilter(a)},c.cFilterdata=function(){var b;return 0!==F?void alert("请先保存当前正在编辑的行！"):void(f.src.length!==f.orgSrc.length&&(a(".orderTag",N).empty(),ja("正在过滤，请稍候..."),b=new Worker(h+"/workers/XTableCFilter.js"),b.postMessage({src:f.src,orgSrc:f.orgSrc}),b.onmessage=function(a){ka(),f.src=a.data,f.init()}))},c.filterData=function(){var b;l=c.selectedNames,ja("正在过滤，请稍候..."),e.dialog("close"),b=new Worker(h+"/workers/XTableFilterData.js"),b.postMessage({src:f.src,selectedNames:l,filterSrcName:j}),b.onmessage=function(c){var e,g;ka(),a("#"+d+"-cFilterData",N).remove(),f.src=c.data,f.init(),a("#"+d+"-resetData",N).remove(),f.src.length!==f.orgSrc.length&&(e=a("<input type='button' class='resetData' id='"+d+"-resetData' style=''value='重置过滤器'/>"),g=a("<input type='button' class='cFilterData' id='"+d+"-cFilterData' value='反向过滤'/>"),e.insertAfter(Q),e.button(),g.insertAfter(e),g.button()),b.terminate()}},c.resetData=function(){b.helpers.addShield(),f.src=f.orgSrc.slice(),a(".orderTag",N).empty(),a("#"+d+"-resetData",N).remove(),a("#"+d+"-cFilterData",N).remove(),a(".orderTag",N).empty(),b.helpers.removeShield(),f.init()},a(".openFilterLi",N).click(function(b){var d,f,g=e.dialog("isOpen");return b.stopPropagation(),0!==F?void alert("请先保存当前正在编辑的行！"):void(g||(d=a(this).prev().html(),f=a(this.parentNode).attr("srcname"),c.loadFilterOverride(d,f)))}),a(N).undelegate("#"+d+"-resetData","click"),a(N).delegate("#"+d+"-resetData","click",function(){c.resetData()}),a(g).undelegate("#"+d+"-startFilter","click"),a(g).delegate("#"+d+"-startFilter","click",function(){c.filterData()}),a(N).undelegate("#"+d+"-cFilterData","click"),a(N).delegate("#"+d+"-cFilterData","click",function(){c.cFilterdata()}),a("#"+d+"-resetFilter",g).unbind().click(function(){a("#"+d+"-filterStr").val("请输入过滤关键字").select(),c.loadFilterOverride(i,j)}),c}(),ga.click(function(){var b=a(".dataTr",N).toArray();a(".selectRow",N).prop("checked",!0),b.forEach(function(b){a(b).attr("select")||f.selectRow(b)})}),T.click(function(){f.toFirstPage()}),R.click(function(){f.toPrevPage()}),V.keydown(function(a){var b;13===a.keyCode&&(b=parseInt(this.value),f.loadPage(b))}),S.click(function(){f.toNextPage()}),U.click(function(){f.toLastPage()}),da.click(function(){ca.dialog("open")}),z&&ha.click(function(){f.deleteSelectedData()}),a("#"+f.id+"-submitVCols",ca.parent()).click(function(){var b=a("#"+f.id+"-setVCols .vColCb",ca.parent()).toArray(),c=[];b.forEach(function(b){var d=a(b).is(":checked");d&&c.push(a(b).attr("srcName"))}),f.setVisibleCols(c),a(ca).dialog("close")}),a(".showAllCol",ca.parent()).change(function(){var b=a("#"+f.id+"-setVCols .vColCb",ca.parent());a(this).is(":checked")?b.prop("checked",!0):b.prop("checked",!1)}),a("#"+f.id+"-setVCols .vColCb",ca.parent()).change(function(){a(".showAllCol",ca.parent()).is(":checked")&&(a(this).is(":checked")||a(".showAllCol",ca.parent()).prop("checked",!1))}),a(N).undelegate(".xTable-pageSizeSelector","change"),a(N).delegate(".xTable-pageSizeSelector","change",function(){var a=this.options.selectedIndex;f.setPageSize(this.options[a].value)}),a(N).undelegate(".selectRow","change"),a(N).delegate(".selectRow","change",function(){var b=this.parentNode.parentNode;a(this).is(":checked")?f.selectRow(b):f.unselectRow(b)}),a(N).undelegate(".xTable-selectAll","change"),a(N).delegate(".xTable-selectAll","change",function(){a(this).is(":checked")?f.selectAll():f.unselectAll()}),a(N).undelegate(".dataTr","mouseover"),a(N).delegate(".dataTr","mouseover",function(){var b=a(this).attr("select");b||a(this).addClass("rowHover")}),a(N).undelegate(".dataTr","mouseout"),a(N).delegate(".dataTr","mouseout",function(){var b=a(this).attr("select");b||a(this).removeClass("rowHover")}),a(N).undelegate(".colName","click"),a(N).delegate(".colName","click",function(){var b=a(this).attr("srcname"),c=a(this).attr("sortable");if("true"===c){if(0!==F)return void alert("请先保存当前正在编辑的行！");a(this).attr("order")&&"desc"!==a(this).attr("order")?(a(this).attr("order","desc"),a(N).find(".orderTag").empty(),a(this).find(".orderTag").append("<img src='"+h+"/images/sort_desc.gif'>"),f.sortBy(b,"desc")):(a(this).attr("order","asc"),a(N).find(".orderTag").empty(),a(this).find(".orderTag").append("<img src='"+h+"/images/sort_asc.gif'/>"),f.sortBy(b,"asc"))}}),a(N).undelegate(".editBtn","click"),a(N).delegate(".editBtn","click",function(){var b=this.parentNode.parentNode,c=a(this).val();"编辑"===c?f.editRow(b):f.saveRow(b)}),a(N).undelegate(".editInput","focus"),a(N).delegate(".editInput","focus",function(){var a=this;setTimeout(function(){a.select()},200)}),a(N).undelegate(".dataCell","dblclick"),a(N).delegate(".dataCell","dblclick",function(){var b,c;C&&!a(this).attr("editInvalid")&&(b=this.parentNode,c=a(a(b).find(".editBtn")).val(),"编辑"===c&&f.editRow(b),a(this).find("input").focus())}),a(N).undelegate(".editInput","keydown"),a(N).delegate(".editInput","keydown",function(b){var c;13===b.keyCode&&(c=a(this.parentNode.parentNode).find(".editBtn"),"保存"===a(c).val()&&a(c).click())}),f.init(),f},b.XFilter=function(c){var d=b.helpers.log,e=b.helpers.error,f={},g=c.id||"XFilter-"+b.helpers.guid(),h=c.startFilterText||"确定",i=c.closeFilterText||"取消",j=c.startFilterHandler||function(a,b){b.filterDiv.dialog("close")},k=c.closeFilterHandler||function(a,b){b.filterDiv.dialog("close")},l=c.filterType||2,m=c.title||"",n=b.config.rootPath,o=a("<div style='display:table' title='过滤器'></div>");a(o).attr("id",g),o.dialog({autoOpen:!1,resizable:!1,title:m,buttons:[{text:h,id:g+"-startFilter",click:function(){j(f.selectedNames,f)}},{text:i,id:g+"-closeFilter",click:function(){k(f.selectedNames,f)}}],position:{my:"top+10%",at:"top+10%",of:window},close:function(){b.helpers.removeShield(),o.removeData("allNamesCatch"),o.removeData("sNamesCatch")},open:function(){b.helpers.addShield(),o.removeData("allNamesCatch"),o.removeData("sNamesCatch")}});var p=o.parent(),q=a("<div class='xFilter-searchDiv'><div><input type='text' value='请输入过滤关键字' class='xFilter-filterStr' id='"+g+"-filterStr'/></div><div><input type='button' class='XFilter-searchBtn' value='搜索' id='"+g+"-filterSubmit'/></div><div><input type='button' class='XFilter-resetBtn' value='重置' id='"+g+"-resetFilter'/></div></div>"),r=a("<input type='radio' value='completeMatch' id='completeMatch' name='matchType'/>"),s=a("<input type='radio' value='partialMatch' id='partialMatch' checked='checked' name='matchType'/>"),t="partial",u=a("<div class='matchRadios'></div>"),v=a("<div></div>").append(r).append("<span class='xFilter-radioSpan'>完全匹配</span>"),w=a("<div></div>").append(s).append("<span class='xFilter-radioSpan'>部分匹配</span>"),x=a("<div class='xFilter-filterResult' id='xFilter-filterResult'></div>");if(u.append(w).append(v),q.append(u),o.append(q).append(x),!n||""===n)throw e("XFilter: 配置参数有误，请检查myUtil.config对象中的root属性");if(!c.src)throw e("XFilter: 配置参数有误，请检查option对象的src属性");return f.option=c,f.src=c.src,f.allNames=[],f.selectedNames=[],f.tempAllNames=[],f.id=c.id||"XFilter-"+b.helpers.guid(),f.filterType=l,f.matchType=t,f.filterDiv=o,f.filterResult=x,f.startFilterBtn=a("#"+g+"-startFilter",p)[0],f.closeFilterBtn=a("#"+g+"-closeFilter",p)[0],f.completeMatch=r,f.partialMatch=s,f.loadFilter=function(b){var c,e,h,i=o.data("allNamesCatch"),j=o.data("sNamesCatch");b&&o.dialog({title:b}),o.dialog("open"),p.css("width","auto"),a("input[type=button]",o).button(),a("#"+g+"-filterStr",p).val("请输入过滤关键字").select(),s.prop("checked",!0),r.prop("checked",!1),o.find(".XFilter-matchResult").remove(),a(x).empty().append("正在加载关键字，请稍候..."),a("#"+g+"-startFilter").button({disabled:!0}),f.tempAllNames=[],i&&j?(d("XFilter.loadFilter: 从缓存加载关键字."),h=a("<div id='xFilter-fSelectAllSpan'><input type='checkbox' class='"+g+"-fselectAll' checked='checked' id='"+g+"-fselectAll'><span class='xFilter-nameTag'>全部</span></div>"),x.empty().append(h),a("#"+g+"-startFilter",p).button({disabled:!1}),f.allNames=i,f.selectedNames=j,f.allNames.forEach(function(b,c){var d;1e3>c&&(d=a("<div class='nameCell'><input type='checkbox' class='"+g+"-nameCb' key='"+b+"' checked='checked'/><span class='xFilter-nameTag'>"+b+"</span></div>"),x.append(d))})):(d("XFilter.loadFilter: 未找到缓存，将直接加载关键字."),c=new Worker(n+"/workers/XFilterGetKeys.js"),e={src:f.src},c.postMessage(e),c.onmessage=function(b){var d=b.data,e=d.names,i=d.sNames;h=a("<div id='xFilter-fSelectAllSpan'><input type='checkbox' class='"+g+"-fselectAll' checked='checked' id='"+g+"-fselectAll'><span class='xFilter-nameTag'>全部</span></div>"),a("#"+g+"-startFilter",p).button({disabled:!1}),x.empty().append(h),f.allNames=e,f.selectedNames=i,e.forEach(function(b,c){var d;1e3>c&&(d=a("<div class='nameCell'><input type='checkbox' class='"+g+"-nameCb' key='"+b+"' checked='checked'><span class='xFilter-nameTag'>"+b+"</span></div>"),x.append(d))}),o.data("allNamesCatch",f.allNames),o.data("sNamesCatch",f.selectedNames),c.terminate()})},f.selectName=function(a){-1===f.selectedNames.indexOf(a)&&f.selectedNames.push(a)},f.unselectName=function(b){var c=f.selectedNames.indexOf(b);-1!==c&&f.selectedNames.splice(c,1),a("#"+g+"fselectAll",p).prop("checked",!1)},f.searchByName=function(b,c){var e,h,i,j,k,m,n,o,p,q,s=[],t=f.allNames,v=[],w=f.filterResult,x="",y=b.split(/\s+/),z=a("<div id='tSelectAll'><input type='checkbox' checked='checked' class='"+g+"-fselectAll' id='"+g+"-fselectAll'><span class='xFilter-nameTag'>全部</span></div>");for(c?x=c:(x="partial",a(r).is(":checked")&&(x="complete")),b=b.replace(/[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]|\s|\,|\.|\?/g," ").trim().toLowerCase(),e=0;e<y.length;e++)if(j=y[e].trim(),""!==j)for(h=0;h<t.length;h++){if(k=t[h].toString(),m=t[h].toString().toLowerCase(),n=!0,"partial"===x)if(1===parseInt(l))if(isNaN(Number(j))){for(i=0;i<j.length;i++)if(-1===m.search(j.charAt(i))){n=!1;break}if(n){var A=[];for(i=0;i<j.length;i++)if(-1!==m.search(j.charAt(i)))if(o=m.indexOf(j.charAt(i)),p=m.lastIndexOf(j.charAt(i)),0===A.length)A.push(o);else{if(p<A[A.length-1]){n=!1;break}A.push(o>A[A.length-1]?o:p)}}}else isNaN(j)||isNaN(parseInt(m))?!isNaN(j)&&isNaN(parseInt(m))&&(n=!0,-1===m.toString().search(""+j)&&(n=!1)):(n=!1,0===m.toString().search(""+j)&&(n=!0));else n=!1,-1!==m.search(j)&&(n=!0);else n=!1,m===j&&(n=!0);n&&(-1===s.indexOf(k)&&s.push(k),-1===v.indexOf(k)&&v.push(k))}for(w.empty().append(z),e=0;e<v.length&&500>e;e++)m=v[e],q=a("<div class='nameCell'><input type='checkbox' checked='checked' class='"+g+"-nameCb' key='"+m+"' index='"+e+"'><span class='xFilter-nameTag'>"+m+"</span></div>"),w.append(q);u.find(".XFilter-matchResult").remove(),u.append("<span class='XFilter-matchResult'>共匹配到<span class='red'>"+v.length+"</span>条关键字</span>"),f.selectedNames=s,f.tempAllNames=v,d(f.selectedNames)},f.fSelectAll=function(){f.selectedNames=[],0===f.tempAllNames.length?f.allNames.forEach(function(a){f.selectedNames.push(a)}):f.tempAllNames.forEach(function(a){f.selectedNames.push(a)})},f.fUnselectAll=function(){f.selectedNames=[]},a("#"+g+"-filterStr",p).unbind().focus(function(){var a=this;setTimeout(function(){a.select()},200)}),a("#"+g+"-filterStr",p).keydown(function(b){13===b.keyCode&&a("#"+g+"-filterSubmit",p).click()}),a("#"+g+"-filterSubmit",p).unbind().click(function(){var b,c=a("#"+g+"-filterStr",p).val();""!==c&&"请输入过滤关键字"!==c?(b="partial",a(r).is(":checked")&&(b="complete"),f.searchByName(c,b)):a("#"+g+"-resetFilter",p).click()}),a(p).undelegate("."+g+"-nameCb","change"),a(p).delegate("."+g+"-nameCb","change",function(){var b=a(this).is(":checked"),c=a(this).attr("key");b?f.selectName(c):(f.unselectName(c),a("."+g+"-fselectAll",p).prop("checked",!1))}),a(p).undelegate("."+g+"-fselectAll","change"),a(p).delegate("."+g+"-fselectAll","change",function(){var b=a(this).is(":checked");b?(a("."+g+"-nameCb",p).prop("checked",!0),f.fSelectAll()):(a("."+g+"-nameCb",p).prop("checked",!1),f.fUnselectAll())}),a("#"+g+"-resetFilter",p).unbind().click(function(){a("#"+g+"-filterStr",p).val("请输入过滤关键字").select(),f.loadFilter()}),f},c.XUtil=b,c.myUtil=b,b});