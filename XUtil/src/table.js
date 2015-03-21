/*
 * 源文件：src/table.js
 * 表格widget，将一个JSON数组以表的形式展示，支持对表格数据进行增删改操作，以及分页，排序，选择，编辑，关键字过滤等多种功能
 *
 * 接收一个参数对象option，包含以下内容：
 *
 * renderTo: 目标div的id，必需
 *
 * id:widget的id，如果不设置，则会调用guid函数生成一个随机id
 *
 * src:源JSON数组，必需
 *
 * fontSize:字体大小，默认12px，非必需
 *
 * colEditable:是否设置列的可见性，默认true
 *
 * hasFilter:表是否可过滤，默认true，可以对每一列分别定制过滤功能，详见column的设置
 *
 * editable:表是否可编辑，默认不可编辑
 * showEditCol:是否显示包含编辑按钮的列，默认为隐藏
 * beforeEdit:编辑操作保存之前调用
 * editCallback:编辑操作后的回调函数，在表被设置为可编辑的情况下配置，默认为一空函数，
 * 拥有免费参数editedObj，为被编辑的行的原始数据obj，以及row，为当前被编辑的列
 *
 * selectable:表的行是否可选，默认可选
 * beforeSelect,beforeDeselect:select和deselect前调用
 * selectCb,deselectCb:select和deselect过后的callback
 *
 * deletable: 行是否可删除，默认不可删除
 * beforeDelete:delete操作前调用
 * deleteCb: 删除操作后的回调函数，接收两个参数: data为删除的行对应的源数据对象，orgSrc为整个表对应的数据对象
 *
 * columns:定制列属性的数组，可对表格中的每一列进行定制，每个数组成员对象包含以下属性：
 *      name: 列名，必需
 *      width: 列宽度（单位为px或者百分数，非必需），
 *      data: 列展示的数据（即该列对应源JSON的属性，必需），
 *      hasFilter: 本列是否包含过滤器（可省略，默认包含），
 *      sortable: 本列是否可排序（可省略，默认可排序。注意：对于中文字符串的排序使用了String.prototype.localeCompare函数,
 *      对于不同的浏览器，其实现方式并不一致.例如chrome会进行按拼音的排序,而FF则会根据笔画数进行排序），
 *      visible: 本列是否可见（可省略，默认可见）
 *      editable:本列是否可编辑（可省略，在option.editable=true的情况下，默认为可编辑）
 *
 * filterType: 过滤器类别，值可为1或者2（可省略，默认为1，拆字匹配，如输入"北大"即可匹配到"北京大学";
 * 若置为2则进行连续字符串的匹配，例如"北京"能匹配到"北京大学"，而"北大"则不能）
 *
 * pageSizes:一个包含每页显示条目数的数组，例如[5,10,50,100]（代表四个可选项，每页显示5，10，50，100条数据），非必需
 *
 * linkCols:可以将某列的数据变成超链接/button，可以通过renderer定制超链接的href，或者通过onclick属性定制点击事件，非必需
 */
XUtil.XTable = function (option) {
	//控制台和异常函数的引用
	var log = XUtil.helpers.log;
	var error = XUtil.helpers.error;

	//用来返回的对象，类的公有成员集合
	var that = {};

	//开始初始化类的私有成员
	//id
	var id = option.id || 'XTable-' + XUtil.helpers.guid();

	if (!option.src) {
		throw error('XTable: 配置参数有误，请检查src属性是否为合法的JSON数据');
	}
	//开始初始化配置属性
	var root = XUtil.config.rootPath;
	if (!root || root === "") {
		throw error("XTable: 配置参数有误，请检查myUtil.config对象");
	}

	//配置是否可以显示/隐藏列
	var colEditable = true;
	if ('colEditable' in option && option.colEditable === false) {
		colEditable = false;
	}

	//配置表是否可过滤
	var hasFilter = true;
	if ('hasFilter' in option && option.hasFilter === false) {
		hasFilter = false;
	}

	//过滤器类型
	var filterType = option.filterType || 1;

	var targetDiv = $(option.renderTo)[0];
	if (!targetDiv || $(option.renderTo).length > 1) {
		throw error('XTable: 配置参数有误，请检查option.renderTo属性');
	}

	//根据配置，设置表字体大小
	var fontSize = option.fontSize || "14px";
	$(targetDiv).empty().css('font-size', fontSize);

	//初始化每个列的配置
	//	列名
	var columns = [],
	//	源数据到列的映射关系
		dataMap = [],
	//	保存列宽度配置的数组
		columnWidth = [],
	//	保存列可见性配置的数组
		visibleCols = [],
	//	保存列是否可过滤配置的数组
		hasFilters = [],
	//	保存列是否可排序配置的数组
		sortable = [];

	//根据option的配置初始化以上几个数组
	option.columns.forEach(function (col) {
		columns.push(col.name);
		if (hasFilter === true) {
			if (!("hasFilter" in col) || col.hasFilter === true) {
				hasFilters.push(true);
			}
			else if ("hasFilter" in col && col.hasFilter === false) {
				hasFilters.push(false);
			}
		}
		else {
			hasFilters.push(false);
		}
		if (!("sortable" in col) || col.sortable === true) {
			sortable.push(true);
		}
		else if ("sortable" in col && col.sortable === false) {
			sortable.push(false);
		}
		if (!("data" in col)) {
			throw error("XTable.js: 配置参数有误，请检查option.column的data属性。");
		}
		dataMap.push(col.data);
		columnWidth.push(col.width);
		if (!("visible" in col) || col.visible === true) {
			visibleCols.push(col.data);
		}
	});

	//配置选择功能
	//	selectable参数，默认为true
	var selectable = true,
	//	用来保存选中的列的index的数组
		selectedIndexes = [],
		beforeSelect = option.beforeSelect || function (selectedData, row) {
			},
		selectCb = option.selectCb || function (selectedData, row) {
			},
		beforeDeselect = option.beforeDeselect || function (selectedData, row) {
			},
		deselectCb = option.deselectCb || function (selectedData, row) {
			};

	if ("selectable" in option && option.selectable === false) {
		selectable = false;
	}

	//配置删除功能
	var deletable,
		beforeDelete = option.beforeDelete || function (selectedData, orgSrc) {
				return true;
			},
		deleteCb = option.deleteCb || function (selectedData, orgSrc) {
			};

	if ("deletable" in option && option.deletable === true) {
		deletable = true;
	}
	else {
		deletable = false;
	}

	//配置编辑功能
	//	editable参数，默认为false
	var editable = option.editable || false;
	//	是否显示编辑/保存按钮
	var showEditCol = option.showEditCol || false;
	//	保存编辑过的行的数组
	var editedIndexArr = [],
	//	当前打开编辑功能的列数量
		editingRowCount = 0,
	//	editCallback函数,在edit操作过后执行
		editCb = editable && option.editCb || function (eObj, row) {
			},
		beforeEdit = editable && option.beforeEdit || function (eObj, row) {
			};

	var controllerPosition = 'top';
	if ('controllerPosition' in option && option.controllerPosition === 'bottom') {
		controllerPosition = 'bottom';
	}

	//	可选的pagesize
	var pageSizes = option.pageSizes || [10, 20, 50, 100, 200],
	//	默认的初始pageSize
		pageSize = parseInt(pageSizes[0]);

	//超链接列
	var linkCols = option.linkCols;
	//保存分页后的源数据的数组
	var pages = [];

	//开始生成基本控制界面
	var table = $("<div class='xTable-table'></div>"),
		controller = $("<div class='xTable-controller'></div>"),
		pageController = $("<div class='xTable-pageController'></div>"),
		pageSizeController = $("<div class='xTable-pageSizeController'></div>"),
		prevButton = $("<li class='functionButton prevButton ui-state-default ui-corner-all'>" +
		"<span class='ui-icon ui-icon-seek-prev'></span>" +
		"</li>"),
		nextButton = $("<li class='functionButton nextButton ui-state-default ui-corner-all'>" +
		"<span class='ui-icon ui-icon-seek-next'></span>" +
		"</li>"),
		firstButton = $("<li class='functionButton firstButton ui-state-default ui-corner-all'>" +
		"<span class='ui-icon ui-icon-seek-first'></span>" +
		"</li>"),
		lastButton = $("<li class='functionButton lastButton ui-state-default ui-corner-all'>" +
		"<span class='ui-icon ui-icon-seek-end'></span>" +
		"</li>"),
		gotoBox = $("<input type='text' class='xTable-gotoBox' value='1'/>"),
		maxPageSpan = $("<span class='xTable-maxPage'></span>"),
		view = $("<table class='xTable-view' border='1' width='100%'></table>"),
		pageSizeSelector = $("<select class='xTable-pageSizeSelector'></select>");

	pageSizes.forEach(function (size) {
		pageSizeSelector.append("<option value='" + size + "'>" + size + "</option>");
	});

	pageController
		.append(firstButton)
		.append(prevButton)
		.append(gotoBox)
		.append(maxPageSpan)
		.append(nextButton)
		.append(lastButton);

	controller
		.append(pageController)
		.append(pageSizeController);

	if (controllerPosition === 'top') {
		table
			.append(controller)
			.append(view);
	}
	else {
		table
			.append(view)
			.append(controller);
	}

	$(targetDiv)
		.append(table);

	//全选checkbox
	var selectAll = $("<input class='xTable-selectAll' type='checkbox'/>"),
		selectAllTd = $("<td class='xTable-selectAllTd' class='xTable-selectAllTd'></td>");

	selectAllTd.append(selectAll);
	view.empty();

	//初始化表头
	//存储表头的数组
	var headers = [];
	var tableHeader = $("<tr class='xTable-Header'></tr>");

	//如果option.selectable为true，则插入全选checkbox
	if (selectable) {
		tableHeader.append(selectAllTd);
	}

	columns.forEach(function (colName, i) {
		var nameTd = $("<td class='colName' colName='" + colName + "'>" +
		"<div class='colNameText'>" + colName + "</div>" +
		"</td>");
		tableHeader.append(nameTd);
		headers.push(nameTd);
		//配置列的可过滤属性
		if (hasFilters[i]) {
			$("<li class='openFilterLi ui-state-default ui-corner-all' title='.ui-icon-search'>" +
			"<span class='ui-icon ui-icon-search'></span>" +
			"</li>").appendTo(nameTd);
		}
		//配置列的可排序属性
		if (sortable[i]) {
			var orderTag = $("<div class='orderTag'></div>");
			nameTd.attr("sortable", "true").append(orderTag);
		}
		else {
			nameTd.attr("sortable", "false");
		}
	});
	//如果表格可编辑，增加一包含编辑按钮的列
	if (editable) {
		var editHeader = $("<td class='editHeader' colName='edit'>编辑</td>");
		tableHeader.append(editHeader);
		if (!showEditCol) {
			editHeader.hide();
		}
	}

	//设置列的宽度
	columnWidth.forEach(function (width, i) {
		if (headers[i]) {
			headers[i].css("width", width);
		}
	});

	//给表头中的每个cell绑定一个srcName属性，这个属性指向与该列关联的源数据对象的属性名
	dataMap.forEach(function (name, i) {
		if (headers[i]) {
			headers[i].attr("srcName", name);
		}
	});
	view.append(tableHeader);

	//为打开过滤器按钮载入jquery-ui风格
	$(targetDiv).find('li').hover(function () {
		$(this).addClass("ui-state-hover");
		$(this).css("cursor", "pointer");
	}, function () {
		$(this).removeClass("ui-state-hover");
		$(this).css("cursor", "default");
	});

	//设置显示的列面板
	$('#' + id + '-setVCols', table).remove();
	var vcolsDialog = $("<div id='" + id + "-setVCols'></div>");

	vcolsDialog.dialog({
		autoOpen: false,
		width: 400,
		resizable: false,
		title: "设置显示的列",
		buttons: [
			{
				text: "确定",
				id: id + "-submitVCols",
				click: function () {

				}
			},
			{
				text: "取消",
				id: id + "-closeSetVCols",
				click: function () {
					$(this).dialog("close");
				}
			}
		],
		position: {
			my: "top+10%",
			at: "top+10%",
			of: window
		},
		open: function () {
			XUtil.helpers.addShield(document.body);
		},
		close: function () {
			XUtil.helpers.removeShield();
		}
	});

	$(table).append(vcolsDialog.parent());

	//设置可见列按钮
	var openSetV = $("<input type='button' value='设置' class='openSetV'/>");
	if (colEditable) {
		openSetV.insertAfter(lastButton);
		openSetV.button();
	}

	var showAllCol = $("<input type='checkbox' class='showAllCol' checked='true'/>");
	var showAllColSpan = $("<div class='subVCol showAllColSpan'></div>");
	showAllColSpan
		.append(showAllCol)
		.append('全部')
		.appendTo(vcolsDialog);

	option.columns.forEach(function (col) {
		var subVCol = $("<div class='subVCol'></div>"),
			colCb = $("<input type='checkbox' class='vColCb' srcName='" + col.data + "' colName='" + col.name + "'/>");

		subVCol.append(colCb).append(col.name);
		if (!("visible" in col) || col.visible === true) {
			colCb.prop("checked", true);
		}
		else {
			colCb.prop("checked", false);
			showAllCol.prop('checked', false);
		}

		vcolsDialog.append(subVCol);
	});

	//全选当前页按钮
	var selectCurrentPage = $("<input type='button' value='全选当前页' class='funcButton'/>");
	if (selectable) {
		selectCurrentPage.appendTo(pageController);
		selectCurrentPage.button();
	}

	//删除选中行按钮
	var deleteBtn;
	if (deletable) {
		deleteBtn = $("<input type='button' value='剔除选中条目' class='funcButton deleteBtn'/>").button({disabled: true});
		deleteBtn.appendTo(pageController);
	}

	//生成基本控制界面结束

	//工具函数，将第x列设为超链接，url由用户自己定义的renderer函数提供
	var setLink = function (columnIndex, urlRenderer, target, onclick, type) {
		columnIndex = parseInt(columnIndex);
		var trArray, targetTdArray;

		if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < columns.length) {
			trArray = $(".dataTr", table).toArray();
			targetTdArray = [];
			trArray.forEach(function (tr) {
				if ($(tr).find(".dataCell")[columnIndex]) {
					targetTdArray.push($(tr).find(".dataCell")[columnIndex]);
				}
			});
			targetTdArray.forEach(function (td, i) {

				var trIndex = parseInt($(trArray[i]).attr("srcindex")),
					trData = that.orgSrc[trIndex],
					aTitle = $(td).text(),
					generatedA = $("<a href=''>" + aTitle + "</a>");

				if (type === 'button') {
					generatedA = $("<input type='button' value='" + aTitle + "'>").button();
				}

				if (urlRenderer && type !== 'button') {
					generatedA.attr('href', urlRenderer(trIndex, trData, generatedA));
				}
				else if (type !== 'button') {
					generatedA.attr('href', 'javascript: void (0)');
				}

				if (!target || type !== 'button') {
					generatedA.attr('target', '_blank');
				}
				else {
					generatedA.attr('target', target);
				}
				//修复ff下一个bug
				//如果不设置target为_self,在ff中点击href为javascript:void 0的超链接，会打开一个新的空标签页
				if (!urlRenderer) {
					generatedA.attr('target', '_self');
				}

				if (onclick) {
					generatedA.click(function () {
						var a = this;
						onclick(trData, a);
					});
				}
				$(td).attr('editInvalid', 'true');
				$(td).empty().append(generatedA);

			});
		}
	};

	var showActionHint = function (msg) {
		$(".dataTr", table).remove();
		$(".tempMessage", table).remove();
		$("<div class='tempMessage'>" + msg + "</div>").insertAfter(table.find(".xTable-view"));
		XUtil.helpers.addShield(table);
	};

	var removeActionHint = function () {
		$(table).find('.tempMessage').remove();
		XUtil.helpers.removeShield();
	};

	//初始化实例成员
	//原始json
	that.orgSrc = option.src;
	//widget的id
	that.id = id;
	//保存所有表头
	that.headers = headers;
	//这个属性保存了所有的列对应的原JSON对象中的属性
	that.attrs = dataMap;
	//与当前表格对应的JSON数组
	that.src = that.orgSrc.slice();
	//将部分重要dom设为实例属性
	that.option = option;
	that.firstButton = firstButton;
	that.prevButton = prevButton;
	that.gotoBox = gotoBox;
	that.nextButton = nextButton;
	that.lastButton = lastButton;
	that.pageSizeSelector = pageSizeSelector;
	that.pageController = pageController;
	that.controller = controller;
	that.view = view;

	//给每个数据对象增加两个属性
	that.src.forEach(function (sub, i) {
		//selected属性用来保存该对象是否被选中
		sub.selected = false;
		//orgIndex保存了该对象原始的index
		sub.orgIndex = i;
	});

	//实例方法
	//初始化函数，将JSON分页后加载第一页
	that.init = function () {
		var src = that.src;
		var maxPage = Math.ceil(src.length / pageSize);
		var i, j, subPage;

		pages = [];
		selectedIndexes = [];

		pageSizeController.empty().append("共" + src.length + "条结果，每页显示")
			.append(pageSizeSelector).append("条");
		maxPageSpan.html(' / ' + maxPage);
		$('.xTable-selectAll', table).prop('checked', false);

		//分页
		for (i = 0; i < src.length; i++) {
			src[i].selected = false;
			if ((i + 1) % pageSize === 0) {
				subPage = [];
				for (j = pageSize; j > 0; j--) {
					src[i - j + 1].srcIndex = i - j + 1;
					subPage.push(src[i - j + 1]);
				}
				pages.push(subPage);
			} else if (i === src.length - 1) {
				subPage = [];
				for (j = pageSize * (maxPage - 1); j < src.length; j++) {
					src[j].srcIndex = j;
					subPage.push(src[j]);
				}
				pages.push(subPage);
			}
		}

		//载入第一页
		that.loadPage(1);
	};

	that.destroy = function () {
		$(targetDiv).empty();
	};

	// 加载第X页
	that.loadPage = function (pageNum) {
		var page;
		var editTd;
		var dcArr, cnArr;

		if (editingRowCount !== 0) {
			alert('请先保存当前正在编辑的行！');
			return;
		}
		if (pages.length === 0) {
			$(".dataTr", table).remove();
			return;
		}
		if (pageNum > 0 && pageNum <= pages.length) {
			$(".dataTr", table).remove();

			gotoBox.val(pageNum);
			pageNum = parseInt(pageNum);
			page = pages[pageNum - 1];
			page.forEach(function (rowObj, i) {
				var dataTr = $("<tr class='dataTr'></tr>");
				var selectRow = $("<input type='checkbox' class='selectRow'/>");
				var selectRowTd = $("<td class='rowCb'></td>");

				dataTr.attr("index", pageSize * (pageNum - 1) + i);
				if (selectable && rowObj.selected) {
					selectRow.prop("checked", true);
					dataTr.addClass('rowSelect');
				}
				dataTr.attr("srcIndex", rowObj.orgIndex).data("srcObj", rowObj);

				selectRowTd.append(selectRow);
				if (selectable) {
					dataTr.append(selectRowTd);
				}
				dataTr.appendTo(view);
				dataMap.forEach(function (attrName, i) {
					var dataTd = $("<td class='dataCell' srcName='" + attrName + "'></td>");

					if (!(attrName in rowObj)) {
						throw error("XTable.js: 源JSON数据与data属性关联失败，请检查参数对象：column的data属性输入是否正确。");
					}

					dataTd.append(rowObj[attrName]);
					dataTd.appendTo(dataTr);

					if (editable) {
						if ("editable" in option.columns[i] && option.columns[i].editable === false) {
							dataTd.attr('editInvalid', 'true');
						}
					}
				});
				if (editable) {
					editTd = $("<td class='editTd'>" +
					"<input type='button' class='editBtn' value='编辑'/>" +
					"</td>");
					editTd.find('input').button();
					dataTr.append(editTd);
					if (!showEditCol) {
						editTd.hide();
					}
				}
			});

			if (linkCols && linkCols.length > 0) {
				linkCols.forEach(function (col) {
					setLink(col.colIndex, col.renderer, col.target, col.onclick, col.type);
				});
			}

			dcArr = $(".dataCell", table).toArray();
			cnArr = $(".colName", table).toArray();
			dcArr.forEach(function (dc) {
				var srcName = $(dc).attr("srcName");
				if (visibleCols.indexOf(srcName) === -1) {
					$(dc).hide();
				}
			});
			cnArr.forEach(function (cn) {
				var srcName = $(cn).attr("srcName");
				if (visibleCols.indexOf(srcName) === -1) {
					$(cn).hide();
				}
				else {
					$(cn).show();
				}
			});
		}
	};

	//选择某行
	that.selectRow = function (row) {
		var index = parseInt($(row).attr("index"));

		beforeSelect(that.getSelectedData(), row);

		$(row).attr("select", "selected");
		$(row).find('input[type=checkbox]').prop('checked', true);
		if (selectedIndexes.indexOf(index) === -1) {
			selectedIndexes.push(index);
			that.src[index].selected = true;
			$(row).addClass('rowSelect');
		}

		selectCb(that.getSelectedData(), row);
		if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
			deleteBtn.button({disabled: false});
		}

		log("XTable-Filter.selectRow: The rows been selected are ");
		log(that.getSelectedData());
	};

	//反选某行
	that.unselectRow = function (row) {
		var index = $(row).attr("index");
		var i = selectedIndexes.indexOf(parseInt(index));

		beforeDeselect(that.getSelectedData(), row);

		$(row)
			.removeClass('rowSelect')
			.removeClass('rowHover')
			.removeClass('rowSelect')
			.removeAttr("select");
		$(row).find('input[type=checkbox]').prop('checked', false);
		$(".xTable-selectAll", table).prop("checked", false);

		if (i !== -1) {
			selectedIndexes.splice(i, 1);
			that.src[index].selected = false;
		}

		deselectCb(that.getSelectedData(), row);

		//当没有行被选中时，delete按钮将会被disabled
		if (that.getSelectedData().length === 0 && deletable) {
			deleteBtn.button({disabled: true});
		}

		log("XTable-Filter.unselectRow: The rows been selected are ");
		log(that.getSelectedData());
	};

	//全选
	that.selectAll = function () {
		var i;

		beforeSelect(that.getSelectedData());

		$('.xTable-selectAll', table).prop('checked', true);
		$(".selectRow", table).prop("checked", true);
		selectedIndexes = [];
		$(".dataTr", table)
			.attr("select", "selected")
			.addClass('rowSelect');

		for (i = 0; i < that.src.length; i++) {
			selectedIndexes.push(i);
			that.src[i].selected = true;
		}

		if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
			deleteBtn.button({disabled: false});
		}

		selectCb(that.getSelectedData());
	};

	//全反选
	that.unselectAll = function () {
		var i;

		beforeDeselect(that.getSelectedData());

		selectedIndexes = [];
		for (i = 0; i < that.src.length; i++) {
			that.src[i].selected = false;
		}

		$(".selectRow", table).prop("checked", false);
		$('.xTable-selectAll', table).prop('checked', false);

		$(".dataTr", table)
			.removeAttr("select")
			.removeClass('rowSelect')
			.removeClass('rowHover');

		//当没有行被选中时，delete按钮将会被disabled
		if (that.getSelectedData().length === 0 && deletable) {
			deleteBtn.button({disabled: true});
		}

		deselectCb(that.getSelectedData());
	};

	//设置每页显示条数
	that.setPageSize = function (pSize) {
		var options = pageSizeSelector[0].options;
		var targetIndex = -1;
		var i, option;

		if (editingRowCount !== 0) {
			alert('请先保存当前正在编辑的行！');
			return;
		}
		pageSize = parseInt(pSize);
		$(".orderTag", table).empty();

		for (i = 0; i < options.length; i++) {
			option = options[i];
			if (parseInt(option.value) === pageSize) {
				targetIndex = i;
				break;
			}
		}

		pageSizeSelector[0].selectedIndex = targetIndex;
		that.init();
	};

	//前往第一页
	that.toFirstPage = function () {
		that.loadPage(1);
	};

	//前往最后一页
	that.toLastPage = function () {
		that.loadPage(pages.length);
	};

	//上一页
	that.toPrevPage = function () {
		var currentPage = parseInt(gotoBox.val());
		if (currentPage > 1) {
			that.loadPage(currentPage - 1);
		}
	};

	//下一页
	that.toNextPage = function () {
		var currentPage = parseInt(gotoBox.val());
		if (currentPage < pages.length) {
			that.loadPage(currentPage + 1);
		}
	};

	//导出选中的数据
	that.getSelectedData = function () {
		var selectedDataArray = [];
		selectedIndexes.forEach(function (index) {
			selectedDataArray.push(that.src[index]);
		});
		return selectedDataArray;
	};

	//设置可见的列
	that.setVisibleCols = function (vCols) {
		if (editingRowCount !== 0) {
			alert('请先保存当前正在编辑的行！');
			return;
		}
		visibleCols = vCols;
		that.init();
	};

	//在某一列开启编辑功能
	that.editRow = function (row) {
		var dCells = $(row).find('.dataCell').toArray();
		dCells.forEach(function (dCell) {
			var tempVal;
			if (!$(dCell).attr('editInvalid')) {
				tempVal = $(dCell).html();
				$(dCell)
					.empty()
					.append("<input class='editInput' type='text' value='" + tempVal + "'/>");
			}
		});
		$($(row).find(".editBtn")).val('保存');
		editingRowCount++;
		$('.xTable-pageSizeSelector', table).prop('disabled', true);
		$('input[type=button]:not(.editBtn)', table).button({disabled: true});
	};

	//保存经过编辑的列
	that.saveRow = function (row) {

		var dCells = $(row).find('.dataCell').toArray();
		var orgIndex = $(row).attr('srcindex'),
			index = $(row).attr('index');
		var editedObj = that.orgSrc[index],
			editedObjArr;

		beforeEdit(editedObj, row);

		dCells.forEach(function (dCell) {
			var tempVal = "";
			var srcName = $(dCell).attr('srcname');

			//判断这个单元格是否可以编辑
			if (!$(dCell).attr('editInvalid')) {
				tempVal = $($(dCell).find('.editInput')).val();
				//数字的情况要单独考虑
				if (typeof targetAttr === "number") {
					if (isNaN(Number(tempVal))) {

						that.src[index][srcName] = NaN;
						that.orgSrc[orgIndex][srcName] = NaN;
						$(dCell).html(NaN);
					}
					else {
						that.src[index][srcName] = Number(tempVal);
						that.orgSrc[orgIndex][srcName] = Number(tempVal);
						$(dCell).html(tempVal);
					}
				}
				//其他情况，包括字符串和null的情况
				else {
					that.src[index][srcName] = tempVal;
					that.orgSrc[orgIndex][srcName] = tempVal;
					$(dCell).html(tempVal);
				}
			}
		});
		if (editedIndexArr.indexOf(orgIndex) === -1) {
			editedIndexArr.push(orgIndex);
		}

		editedObjArr = that.getEditedData();

		log("XTable-Filter.saveEdit: The rows been edited are ");
		log(editedObjArr);

		$($(row).find(".editBtn")).val('编辑');
		editingRowCount--;

		if (editingRowCount === 0) {
			$('.xTable-pageSizeSelector', table).prop('disabled', false);
			$('input[type=button]:not(.editBtn,.deleteBtn)', table).button({disabled: false});
			if (selectedIndexes.length !== 0) {
				deleteBtn.button({disabled: false});
			}
		}

		editCb(editedObj, row);

		//返回被编辑的对象
		return editedObj;

	};

	//将所有被编辑过的行整理为一个数组并导出
	that.getEditedData = function () {
		var editedObjArr = [];
		editedIndexArr.forEach(function (i) {
			that.orgSrc[i] && editedObjArr.push(that.orgSrc[i]);
		});

		return editedObjArr;
	};

	//排序，根据order进行正序和倒序排序
	//这个方法使用了WebWorker以提高用户体验
	//因此在IE10以下的浏览器将会出现异常
	that.sortBy = function (name, order) {
		var worker = new Worker(root + "/workers/XTableSort.js");

		if (editingRowCount !== 0) {
			alert('请先保存当前正在编辑的行！');
			return;
		}

		showActionHint('正在排序，请稍候...');

		worker.postMessage({
			src: that.src,
			name: name,
			order: order
		});

		worker.onmessage = function (e) {
			removeActionHint();
			that.src = e.data;
			that.init();
			worker.terminate();
		};
	};

	//删除条目，使用了WebWorker
	that.deleteSelectedData = function () {
		var selectedData = that.getSelectedData();
		var worker;

		if (editingRowCount !== 0) {
			alert('请先保存当前正在编辑的行！');
			return;
		}

		if (beforeDelete(selectedData, that.orgSrc)) {

			showActionHint('正在删除，请稍候...');

			worker = new Worker(root + '/workers/XTableDelete.js');

			worker.postMessage({
				selectedData: selectedData,
				orgSrc: that.orgSrc
			});

			worker.onmessage = function (e) {

				that.orgSrc = e.data;
				that.src = that.orgSrc.slice();
				//给每个数据对象增加两个属性
				//由于源orgSrc数组发生了变化，这里必须重新初始化orgIndex和selected
				that.src.forEach(function (sub, i) {
					//selected属性用来保存该对象是否被选中
					sub.selected = false;
					//orgIndex保存了该对象原始的index
					sub.orgIndex = i;
				});

				removeActionHint();
				$(controller).find('.cFilterData').remove();
				$(controller).find('.resetData').remove();
				$(deleteBtn).button({disabled: true});
				that.init();
				worker.terminate();

				deleteCb(selectedData, that.orgSrc);
			};
		}
	};
	/*
	 * 为表格附加其他功能,将在表格上方翻页功能旁边附加一个功能按键，并且返回按键dom
	 * fName:功能名，将作为button的value值
	 * handler:点击功能按钮后执行的事件函数，接受两个参数：目前选中的数据的json以及源json数据
	 * className:为按钮添加class,以空格分隔
	 * style:为按钮附加样式
	 */
	that.extendFunction = function (option) {
		var funcBtn = $("<input type='button' value='" + option.fName + "' class='funcButton'/>");
		funcBtn
			.appendTo(that.pageController)
			.button({disabled: option.disabled})
			.click(function () {
				$.proxy(option.handler, this)(that.getSelectedData(), that.orgSrc);
			});
		option.className && funcBtn.addClass(option.className);
		option.style && (funcBtn[0].style = funcBtn[0].style + ';' + option.style);
		return funcBtn;
	};

	/*
	 * 为表格添加一行，由于插入功能场景比较复杂，因此不提供默认的添加功能，用户需使用此函数自行定制
	 * 可以在此接口上实现添加新表格数据的功能
	 * 接收三个可选参数，分别是新行中每一列的默认值（如果没有则默认为一空行），插入前执行的操作，以及插入后的回调函数
	 */
	that.addRow = function (dataObj, beforeAdd, callback) {
		if (dataObj === undefined) {
			dataObj = {};
		}

		beforeAdd && beforeAdd(dataObj, that.orgSrc);

		dataMap.forEach(function (attr) {
			if (dataObj[attr] === undefined) {
				dataObj[attr] = '';
			}
		});
		dataObj.selected = false;
		dataObj.orgIndex = that.orgSrc.length;

		that.src.push(dataObj);
		that.orgSrc.push($.extend({}, dataObj, true));

		that.init();
		that.toLastPage();
		that.view
			.find('.dataTr')
			.last()
			.find('.editTd')
			.find('input')
			.click();
		that.view
			.find('.dataTr')
			.last()
			.find('input[type=text]')
			.first()
			.focus();
		callback && callback(dataObj, that.orgSrc);
	};

	/*
	 * 列过滤器，继承自基本过滤器类
	 * 重写了基本过滤器类中的loadFilter方法
	 * 提取列中所有内容，生成一个关键字清单，根据用户输入的关键字进行过滤表格
	 */
	that.filter = (function () {
		//继承了基本过滤器
		var filterThat = XUtil.XFilter({
			//src置为空，之后会根据列名设置src并加载
			src: [],
			id: that.id + '-filter',
			filterType: filterType
		});

		var filterId = filterThat.id;
		//过滤器容器div
		var filterDiv = filterThat.filterDiv;

		var filterDialog = filterDiv.parent();

		//过滤器标题
		var filterTitle = "";
		//与当前过滤器对应的源数据的某个属性
		var filterSrcName = "";
		//选中的关键字
		var selectedNames = filterThat.selectedNames;

		//自动调整dialog的宽度
		filterDialog
			.css('width', 'auto')
			.css('font-size', '16px');

		filterDiv.dialog({
			open: function () {
				XUtil.helpers.addShield(document.body);
			}
		});
		filterDialog.appendTo(table);

		//向过滤器中加载关键字，重载
		filterThat.loadFilterOverride = function (title, srcName) {
			//初始化src数组
			filterThat.src = [];
			filterSrcName = srcName;
			that.src.forEach(function (sub) {
				filterThat.src.push(sub[srcName]);
			});
			//根据传入的列名加载过滤器
			filterThat.loadFilter(title);
		};

		//反向过滤，对选中的关键字求反后过滤
		filterThat.cFilterdata = function () {
			var worker;

			if (editingRowCount !== 0) {
				alert('请先保存当前正在编辑的行！');
				return;
			}

			if (that.src.length !== that.orgSrc.length) {

				$('.orderTag', table).empty();
				showActionHint('正在过滤，请稍候...');

				worker = new Worker(root + "/workers/XTableCFilter.js");

				worker.postMessage({
					src: that.src,
					orgSrc: that.orgSrc
				});

				worker.onmessage = function (e) {
					removeActionHint();
					that.src = e.data;
					that.init();
				};
			}
		};

		//根据选中的关键字过滤表单
		filterThat.filterData = function () {
			var worker;

			selectedNames = filterThat.selectedNames;

			showActionHint('正在过滤，请稍候...');

			filterDiv.dialog("close");

			worker = new Worker(root + "/workers/XTableFilterData.js");

			worker.postMessage({
				src: that.src,
				selectedNames: selectedNames,
				filterSrcName: filterSrcName
			});

			worker.onmessage = function (e) {
				var resetData, cFilterData;

				removeActionHint();

				$('#' + filterId + '-cFilterData', table).remove();
				//这里src的指向发生了变动，所以需要加一句that.src=src
				that.src = e.data;
				that.init();
				$('#' + filterId + "-resetData", table).remove();
				if (that.src.length !== that.orgSrc.length) {
					resetData = $("<input type='button' class='resetData' id=\'" +
					filterId + "-resetData\' style=''value='重置过滤器'/>");
					cFilterData = $("<input type='button' class='cFilterData' id=\'" +
					filterId + "-cFilterData\' value='反向过滤'/>");
					resetData.insertAfter(pageSizeController);
					resetData.button();
					cFilterData.insertAfter(resetData);
					cFilterData.button();
				}
				worker.terminate();
			};
		};

		//重置过滤器，显示表格中全部元素
		filterThat.resetData = function () {

			XUtil.helpers.addShield();

			that.src = that.orgSrc.slice();
			$('.orderTag', table).empty();
			$('#' + filterId + '-resetData', table).remove();
			$('#' + filterId + '-cFilterData', table).remove();
			$(".orderTag", table).empty();

			XUtil.helpers.removeShield();

			that.init();
		};

		//初始化各dom元素的响应事件
		$(".openFilterLi", table).click(function (e) {
			var isOpen = filterDiv.dialog('isOpen');
			var title, srcName;

			e.stopPropagation();

			if (editingRowCount !== 0) {
				alert('请先保存当前正在编辑的行！');
				return;
			}

			if (!isOpen) {
				title = $(this).prev().html();
				srcName = $(this.parentNode).attr("srcname");
				filterThat.loadFilterOverride(title, srcName);
			}
		});

		$(table).undelegate("#" + filterId + "-resetData", "click");
		$(table).delegate("#" + filterId + "-resetData", "click", function () {
			filterThat.resetData();
		});

		$(filterDialog).undelegate("#" + filterId + "-startFilter", "click");
		$(filterDialog).delegate("#" + filterId + "-startFilter", "click", function () {
			filterThat.filterData();
		});

		$(table).undelegate("#" + filterId + "-cFilterData", "click");
		$(table).delegate("#" + filterId + "-cFilterData", "click", function () {
			filterThat.cFilterdata();
		});

		$("#" + filterId + "-resetFilter", filterDialog).unbind().click(function () {
			$("#" + filterId + "-filterStr").val("请输入过滤关键字").select();
			filterThat.loadFilterOverride(filterTitle, filterSrcName);
		});

		return filterThat;
	})();

	//初始化各dom的响应事件
	//全选当前页按钮
	selectCurrentPage.click(function () {
		var rows = $('.dataTr', table).toArray();
		$('.selectRow', table).prop('checked', true);
		rows.forEach(function (row) {
			if (!$(row).attr('select')) {
				that.selectRow(row);
			}
		});
	});

	//前往第一页按钮
	firstButton.click(function () {
		that.toFirstPage();
	});

	//前一页按钮
	prevButton.click(function () {
		that.toPrevPage();
	});

	//前往某页输入框
	gotoBox.keydown(function (e) {
		var pageNum;
		if (e.keyCode === 13) {
			pageNum = parseInt(this.value);
			that.loadPage(pageNum);
		}
	});

	//下一页按钮
	nextButton.click(function () {
		that.toNextPage();
	});

	//最后一页按钮
	lastButton.click(function () {
		that.toLastPage();
	});

	//设置按钮
	openSetV.click(function () {
		vcolsDialog.dialog("open");
	});

	//删除列按钮
	deletable && deleteBtn.click(function () {
		that.deleteSelectedData();
	});

	//设置可见列对话框
	$("#" + that.id + "-submitVCols", vcolsDialog.parent()).click(function () {
		var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).toArray();
		var tempVisibleCols = [];

		vColCb.forEach(function (cb) {
			var checked = $(cb).is(":checked");
			if (checked) {
				tempVisibleCols.push($(cb).attr("srcName"));
			}
		});
		that.setVisibleCols(tempVisibleCols);
		$(vcolsDialog).dialog("close");
	});

	$('.showAllCol', vcolsDialog.parent()).change(function () {
		var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent());
		if ($(this).is(':checked')) {
			vColCb.prop('checked', true);
		}
		else {
			vColCb.prop('checked', false);
		}
	});

	$('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).change(function () {
		if ($('.showAllCol', vcolsDialog.parent()).is(':checked')) {
			if (!$(this).is(':checked')) {
				$('.showAllCol', vcolsDialog.parent()).prop('checked', false);
			}
		}
	});

	//每页显示条数选择器
	$(table).undelegate(".xTable-pageSizeSelector", "change");
	$(table).delegate(".xTable-pageSizeSelector", "change", function () {
		var index = this.options.selectedIndex;
		that.setPageSize(this.options[index].value);
	});

	//选择checkbox
	$(table).undelegate(".selectRow", "change");
	$(table).delegate(".selectRow", "change", function () {
		var row = this.parentNode.parentNode;
		if ($(this).is(":checked")) {
			that.selectRow(row);
		} else {
			that.unselectRow(row);
		}
	});

	//全选checkbox
	$(table).undelegate(".xTable-selectAll", "change");
	$(table).delegate(".xTable-selectAll", "change", function () {
		if ($(this).is(":checked")) {
			that.selectAll();
		} else {
			that.unselectAll();
		}
	});

	//行的hover事件
	$(table).undelegate(".dataTr", "mouseover");
	$(table).delegate(".dataTr", "mouseover", function () {
		var selected = $(this).attr("select");
		if (!selected) {
			$(this).addClass('rowHover');
		}
	});

	$(table).undelegate(".dataTr", "mouseout");
	$(table).delegate(".dataTr", "mouseout", function () {
		var selected = $(this).attr("select");
		if (!selected) {
			$(this).removeClass('rowHover');
		}
	});

	//列排序
	$(table).undelegate(".colName", "click");
	$(table).delegate(".colName", "click", function () {
		var name = $(this).attr("srcname");
		var sortable = $(this).attr("sortable");
		if (sortable === "true") {
			if (editingRowCount !== 0) {
				alert('请先保存当前正在编辑的行！');
				return;
			}

			if (!$(this).attr("order") || $(this).attr("order") === "desc") {
				$(this).attr("order", "asc");
				$(table).find(".orderTag").empty();
				$(this).find(".orderTag").append("<img src='" + root + "/images/sort_asc.gif'/>");
				that.sortBy(name, "asc");
			} else {
				$(this).attr("order", "desc");
				$(table).find(".orderTag").empty();
				$(this).find(".orderTag").append("<img src='" + root + "/images/sort_desc.gif'>");
				that.sortBy(name, "desc");
			}
		}
	});

	//编辑按钮，开启该行编辑功能
	$(table).undelegate(".editBtn", 'click');
	$(table).delegate(".editBtn", 'click', function () {
		var row = this.parentNode.parentNode;
		var type = $(this).val();

		if (type === "编辑") {
			that.editRow(row);
		}
		else {
			that.saveRow(row);
		}
	});

	//单元格输入框focus事件，全选当前输入框内容
	$(table).undelegate(".editInput", 'focus');
	$(table).delegate(".editInput", 'focus', function () {
		var self = this;
		setTimeout(function () {
			self.select();
		}, 200);
	});

	//单元格双击，开启该行编辑功能
	$(table).undelegate(".dataCell", "dblclick");
	$(table).delegate(".dataCell", "dblclick", function () {
		var row, type;
		if (editable && !$(this).attr('editInvalid')) {
			row = this.parentNode;
			type = $($(row).find(".editBtn")).val();

			if (type === "编辑") {
				that.editRow(row);
			}
			$(this).find('input').focus();
		}
	});

	//单元格输入框回车事件，保存对当前行的修改
	$(table).undelegate(".editInput", "keydown");
	$(table).delegate(".editInput", "keydown", function (event) {
		var editBtn;
		if (event.keyCode === 13) {
			editBtn = $(this.parentNode.parentNode).find('.editBtn');
			if ($(editBtn).val() === '保存') {
				$(editBtn).click();
			}
		}
	});

	//初始化表格
	that.init();

	//返回表格实例that
	return that;
};

/*
 * 基本过滤器类
 * 接受以下参数
 * src:字符串数组，包含了应当加载的所有关键字，必须
 * id:过滤器dom的id，可选
 * startFilterText:确定按钮的文本，可选，
 * startFilterHandler:点击确定按钮时的响应
 * closeFilterText:取消按钮的文本
 * closeFilterHandler:点击取消按钮时的响应
 * filterType:设置过滤器关键字匹配模式，设置为1时为拆字匹配（例如输入北大即可匹配到北京大学），
 *            设置为2时为连字匹配（方法和String的search方法类似），可选，默认为2
 */
XUtil.XFilter = function (option) {
	//控制台函数的引用
	var log = XUtil.helpers.log;
	var error = XUtil.helpers.error;

	//用来返回的实例
	var that = {};

	//类的私有成员
	var id = option.id || 'XFilter-' + XUtil.helpers.guid(),
	//	确定和取消按钮的文本
		startFilterText = option.startFilterText || "确定",
		closeFilterText = option.closeFilterText || '取消',
	//	确定和取消按钮的响应函数
		startFilterHandler = option.startFilterHandler || function (selectedNames, filter) {
				filter.filterDiv.dialog('close');
			},
		closeFilterHandler = option.closeFilterHandler || function (selectedNames, filter) {
				filter.filterDiv.dialog('close');
			},
	//	过滤类型
		filterType = option.filterType || 2,
	//	过滤器的标题
		title = option.title || "",
	//	rootPath
		root = XUtil.config.rootPath;

	//开始生成对话框，使用jquery-ui.dialog
	var filterDiv = $("<div style='display:table' title='过滤器'></div>");
	$(filterDiv).attr("id", id);
	filterDiv.dialog({
		autoOpen: false,
		resizable: false,
		title: title,
		buttons: [
			{
				text: startFilterText,
				id: id + "-startFilter",
				click: function () {
					startFilterHandler(that.selectedNames, that);
				}
			},
			{
				text: closeFilterText,
				id: id + "-closeFilter",
				click: function () {
					closeFilterHandler(that.selectedNames, that);
				}
			}
		],
		position: {
			my: "top+10%",
			at: "top+10%",
			of: window
		},
		//打开和关闭时清除关键字缓存
		close: function () {
			XUtil.helpers.removeShield();

			filterDiv.removeData('allNamesCatch');
			filterDiv.removeData('sNamesCatch');
		},
		open: function () {
			XUtil.helpers.addShield();

			filterDiv.removeData('allNamesCatch');
			filterDiv.removeData('sNamesCatch');
		}
	});

	var filterDialog = filterDiv.parent();

	//开始生成控制界面
	var filter = $("<div class='xFilter-searchDiv'>"
		+ "<div><input type='text' value='请输入过滤关键字' class='xFilter-filterStr' id=\'" + id + "-filterStr\'/></div>"
		+ "<div>" +
		"<input type='button' class='XFilter-searchBtn' value='搜索' id=\'" + id + "-filterSubmit\'/></div>"
		+ "<div><input type='button' class='XFilter-resetBtn' value='重置' id=\'" + id + "-resetFilter\'/>" +
		"</div></div>"),
		completeMatch = $("<input type='radio' value='completeMatch' id='completeMatch' name='matchType'/>"),
		partialMatch = $("<input type='radio' value='partialMatch' id='partialMatch' checked='checked' name='matchType'/>"),
		matchType = "partial",
		matchRadios = $("<div class='matchRadios'></div>"),
		completeMatchSpan = $("<div></div>").append(completeMatch).append("<span class='xFilter-radioSpan'>完全匹配</span>"),
		partialMatchSpan = $("<div></div>").append(partialMatch).append("<span class='xFilter-radioSpan'>部分匹配</span>"),
		filterResult = $("<div class='xFilter-filterResult' id='xFilter-filterResult'></div>");

	matchRadios.append(partialMatchSpan).append(completeMatchSpan);
	filter.append(matchRadios);
	filterDiv.append(filter).append(filterResult);

	//检验参数合法性
	if (!root || root === "") {
		throw error("XFilter: 配置参数有误，请检查myUtil.config对象中的root属性");
	}
	if (!option.src) {
		throw error("XFilter: 配置参数有误，请检查option对象的src属性");
	}

	//开始初始化实例成员
	that.option = option;
	//源数据数组
	that.src = option.src;
	//所有关键字
	that.allNames = [];
	//选中的关键字
	that.selectedNames = [];
	//关键字过滤后剩余的所有关键字
	that.tempAllNames = [];
	//id
	that.id = option.id || 'XFilter-' + XUtil.helpers.guid();
	//过滤器类型
	that.filterType = filterType;
	//关键字匹配类型
	that.matchType = matchType;
	//将重要的dom加入实例
	that.filterDiv = filterDiv;
	that.filterResult = filterResult;
	that.startFilterBtn = $('#' + id + "-startFilter", filterDialog)[0];
	that.closeFilterBtn = $("#" + id + "-closeFilter", filterDialog)[0];
	that.completeMatch = completeMatch;
	that.partialMatch = partialMatch;

	//实例方法
	//生成关键字列表（关键字去重）并载入过滤器
	that.loadFilter = function (title) {
		//缓存
		var allNamesCatch = filterDiv.data('allNamesCatch');
		var sNamesCatch = filterDiv.data('sNamesCatch');
		var worker, option;
		var selectAll;

		if (title) {
			filterDiv.dialog({
				title: title
			});
		}

		filterDiv.dialog("open");
		filterDialog.css('width', 'auto');

		//由于jquery.button组件不能给未添加到文档中的dom添加className，因此只能在这里调用button()
		$('input[type=button]', filterDiv).button();

		$("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
		partialMatch.prop("checked", true);
		completeMatch.prop("checked", false);
		filterDiv.find(".XFilter-matchResult").remove();

		$(filterResult).empty().append("正在加载关键字，请稍候...");
		$("#" + id + "-startFilter").button({
			disabled: true
		});

		that.tempAllNames = [];
		//如果没有缓存，则调用WebWorker载入关键字列表
		if (!allNamesCatch || !sNamesCatch) {

			log("XFilter.loadFilter: 未找到缓存，将直接加载关键字.");

			worker = new Worker(root + "/workers/XFilterGetKeys.js");
			option = {
				src: that.src
			};
			worker.postMessage(option);
			worker.onmessage = function (e) {
				var res = e.data;
				var names = res.names;
				var sNames = res.sNames;

				selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
				"<input type='checkbox' class=\'" +
				id + "-fselectAll\' checked='checked' id=\'" +
				id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
				"</div>");

				$("#" + id + "-startFilter", filterDialog).button({
					disabled: false
				});

				filterResult.empty().append(selectAll);
				that.allNames = names;
				that.selectedNames = sNames;
				names.forEach(function (name, i) {
					var filterName;
					if (i < 1000) {
						filterName = $("<div class='nameCell'>" +
						"<input type='checkbox' class=\'" +
						id + "-nameCb\' key='" +
						name + "' checked='checked'><span class='xFilter-nameTag'>" +
						name + "</span>" +
						"</div>");
						filterResult.append(filterName);
					}
				});
				filterDiv.data('allNamesCatch', that.allNames);
				filterDiv.data('sNamesCatch', that.selectedNames);

				worker.terminate();
			};
		}
		//如果有缓存，则直接载入缓存
		else {
			log('XFilter.loadFilter: 从缓存加载关键字.');

			selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
			"<input type='checkbox' class=\'" +
			id + "-fselectAll\' checked='checked' id=\'" +
			id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
			"</div>");
			filterResult.empty().append(selectAll);

			$("#" + id + "-startFilter", filterDialog).button({
				disabled: false
			});

			that.allNames = allNamesCatch;
			that.selectedNames = sNamesCatch;
			that.allNames.forEach(function (name, i) {
				var filterName;
				if (i < 1000) {
					filterName = $("<div class='nameCell'>" +
					"<input type='checkbox' class=\'" +
					id + "-nameCb\' key='" +
					name + "' checked='checked'/><span class='xFilter-nameTag'>" +
					name + "</span>" +
					"</div>");
					filterResult.append(filterName);
				}
			});
		}
	};

	//选中某关键字
	that.selectName = function (name) {
		if (that.selectedNames.indexOf(name) === -1) {
			that.selectedNames.push(name);
		}
	};

	//反选某关键字
	that.unselectName = function (name) {
		var index = that.selectedNames.indexOf(name);
		if (index !== -1) {
			that.selectedNames.splice(index, 1);
		}
		$("#" + id + "fselectAll", filterDialog).prop("checked", false);
	};

	//根据用户输入过滤关键字
	that.searchByName = function (searchStr, type) {
		var selectedNames = [],
			allNames = that.allNames,
			tempAllNames = [];

		var filterResult = that.filterResult;

		var searchType = "";

		var strArray = searchStr.split(/\s+/);

		var i, j, k, substr, orgName, name, hasSubstr, startPos, endPos;

		var tempSelectAll = $("<div id='tSelectAll'>" +
			"<input type='checkbox' checked='checked' class=\'" +
			id + "-fselectAll\' id=\'" +
			id + "-fselectAll\'>" +
			"<span class='xFilter-nameTag'>全部</span>" +
			"</div>"),
			tempNameCell;

		if (!type) {
			searchType = "partial";
			if ($(completeMatch).is(":checked")) {
				searchType = "complete";
			}
		}
		else {
			searchType = type;
		}
		searchStr = searchStr
			.replace(/[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]|\s|\,|\.|\?/g, " ")
			.trim()
			.toLowerCase();

		for (i = 0; i < strArray.length; i++) {
			substr = strArray[i].trim();

			if (substr === '') {
				continue;
			}

			for (j = 0; j < allNames.length; j++) {
				orgName = allNames[j].toString();
				name = allNames[j].toString().toLowerCase();
				hasSubstr = true;
				//部分匹配
				if (searchType === "partial") {
					//拆字匹配
					if (parseInt(filterType) === 1) {
						//如果过滤关键字不为数字
						if (isNaN(Number(substr))) {
							//判断关键字是否包含用户输入的字符
							for (k = 0; k < substr.length; k++) {
								if (name.search(substr.charAt(k)) === -1) {
									hasSubstr = false;
									break;
								}
							}
							//判断字符的先后顺序是否符合
							if (hasSubstr) {
								var foundIndexes = [];
								for (k = 0; k < substr.length; k++) {
									if (name.search(substr.charAt(k)) !== -1) {
										startPos = name.indexOf(substr.charAt(k));
										endPos = name.lastIndexOf(substr.charAt(k));
										if (foundIndexes.length === 0) {
											foundIndexes.push(startPos);
										}
										else {
											if (endPos < foundIndexes[foundIndexes.length - 1]) {
												hasSubstr = false;
												break;
											}
											else {
												if (startPos > foundIndexes[foundIndexes.length - 1]) {
													foundIndexes.push(startPos);
												}
												else {
													foundIndexes.push(endPos);
												}
											}
										}
									}
								}
							}
						}
						//如果过滤关键字是数字且候选关键字也是数字
						else if (!isNaN(substr) && !isNaN(parseInt(name))) {
							hasSubstr = false;
							if (name.toString().search('' + substr) === 0) {
								hasSubstr = true;
							}
						}
						//如果候选关键字是字符串
						else if (!isNaN(substr) && isNaN(parseInt(name))) {
							hasSubstr = true;
							if (name.toString().search('' + substr) === -1) {
								hasSubstr = false;
							}
						}
					}
					//连字匹配
					else {
						hasSubstr = false;
						if (name.search(substr) !== -1) {
							hasSubstr = true;
						}
					}
				}
				//完全匹配
				else {
					hasSubstr = false;
					if (name === substr) {
						hasSubstr = true;
					}
				}
				if (hasSubstr) {
					selectedNames.indexOf(orgName) === -1 && selectedNames.push(orgName);
					tempAllNames.indexOf(orgName) === -1 && tempAllNames.push(orgName);
				}
			}
		}

		filterResult.empty().append(tempSelectAll);

		for (i = 0; i < tempAllNames.length; i++) {
			if (i < 500) {
				name = tempAllNames[i];
				tempNameCell = $("<div class='nameCell'>" +
				"<input type='checkbox' checked='checked' class=\'" +
				id + "-nameCb\' key='" +
				name + "' index='" +
				i + "'>" +
				"<span class='xFilter-nameTag'>" +
				name +
				"</span>" +
				"</div>");
				filterResult.append(tempNameCell);
			}
			else {
				break;
			}
		}

		matchRadios.find(".XFilter-matchResult").remove();
		matchRadios.append("<span class='XFilter-matchResult'>共匹配到" +
		"<span class='red'>" + tempAllNames.length + "</span>" +
		"条关键字</span>");
		that.selectedNames = selectedNames;
		that.tempAllNames = tempAllNames;
		log(that.selectedNames);
	};

	//选中所有关键字
	that.fSelectAll = function () {
		that.selectedNames = [];
		if (that.tempAllNames.length === 0) {
			that.allNames.forEach(function (name) {
				that.selectedNames.push(name);
			});
		} else {
			that.tempAllNames.forEach(function (name) {
				that.selectedNames.push(name);
			});
		}
	};

	//反选所有关键字
	that.fUnselectAll = function () {
		that.selectedNames = [];
	};

	//组件响应事件初始化
	//输入框的focus事件
	//为了解决ff下的未知bug，select都在200毫秒后执行
	$("#" + id + "-filterStr", filterDialog).unbind().focus(function () {
		var self = this;
		setTimeout(function () {
			self.select();
		}, 200);
	});

	//输入框中点击回车，开始搜素关键字
	$("#" + id + "-filterStr", filterDialog).keydown(function (e) {
		if (e.keyCode === 13) {
			$("#" + id + "-filterSubmit", filterDialog).click();
		}
	});

	//搜索按钮单击事件
	$("#" + id + "-filterSubmit", filterDialog).unbind().click(function () {
		var searchStr = $("#" + id + "-filterStr", filterDialog).val();
		var type;
		if (searchStr !== "" && searchStr !== "请输入过滤关键字") {
			type = "partial";
			if ($(completeMatch).is(":checked")) {
				type = "complete";
			}
			that.searchByName(searchStr, type);

		}
		else
			$("#" + id + "-resetFilter", filterDialog).click();
	});

	//关键字前选择框改变事件
	$(filterDialog).undelegate("." + id + "-nameCb", "change");
	$(filterDialog).delegate("." + id + "-nameCb", "change", function () {
		var checked = $(this).is(":checked");
		var name = $(this).attr("key");
		if (!checked) {
			that.unselectName(name);
			$("." + id + "-fselectAll", filterDialog).prop("checked", false);
		} else {
			that.selectName(name);
		}
	});

	//选择全部关键字选择框改变事件
	$(filterDialog).undelegate("." + id + "-fselectAll", "change");
	$(filterDialog).delegate("." + id + "-fselectAll", "change", function () {
		var checked = $(this).is(":checked");
		if (!checked) {
			$("." + id + "-nameCb", filterDialog).prop("checked", false);
			that.fUnselectAll();
		} else {
			$("." + id + "-nameCb", filterDialog).prop("checked", true);
			that.fSelectAll();
		}
	});

	//重置按钮单击事件
	$("#" + id + "-resetFilter", filterDialog).unbind().click(function () {
		$("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
		that.loadFilter();
	});

	return that;
};
