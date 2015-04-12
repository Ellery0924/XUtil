/**
 * 源文件：src/dialog.js
 * 对话框组件
 * 在页面上生成一个对话框，并且支持拖动
 * 可配置选项：
 * id: 组件的id, 默认为自动生成的guid
 * width, height:对话框内容区的宽度和高度，默认为auto，最小宽高均为200
 * top, left:对话框的位置，以对话框正中心为基准，默认为50%，即屏幕正中
 * closable, onClose: 是否在标题栏添加关闭按钮，默认为无按钮，onClose为关闭时的回调函数
 * onOpen: 打开对话框的回调
 * autoOpen: 对话框是否处于默认打开状态，默认为false
 * zIndex: 对话框的z-index, 默认为1000
 * draggable：对话框是否可以拖动，默认为false, 不可拖动
 * animated: 打开/关闭时是否有动画效果，默认为false, 无动画
 * content: 可以给这个属性传入html字符串或者dom元素来设置内容区的html
 */

XUtil.XDialog = function (option) {
	var helpers = XUtil.helpers;
	var log = helpers.log;

	var width = option.width || 'auto',
		height = option.height || 'auto',
		top = option.top || 0.5,
		left = option.left || 0.5,
		closable = option.closable || false,
		onClose = $.isFunction(option.onClose) ? option.onClose : function () {
			log('XDialog: XDialog is closed.');
		},
		onOpen = $.isFunction(option.onOpen) ? option.onOpen : function () {
			log('XDialog: XDialog is opened.');
		},
		autoOpen = false,
		id = option.id || 'XDialog-' + helpers.guid(),
		className = option.className || '',
		title = option.title || 'XDialog',
		zIndex = option.zIndex || 1000,
		draggable = option.draggable || false,
		animated = option.animated || false,
		content = option.content || '';

	var initialOpen = true;

	var offsetWidth,
		offsetHeight;

	var domNode,
		contentNode,
		closeBtn,
		titleBar;

	var opened = false;

	var dragStart = false,
		prevX,
		prevY,
		shield;

	var that = {};

	if ('autoOpen' in option && option.autoOpen === true) {
		autoOpen = true;
	}

	domNode = $("<div class='XDialog' id='" + id + "'>" +
	"<div class='XDialogTitle'>" +
	"<span class='titleText'></span>" +
	"<span class='closeBtn'></span>" +
	"</div>" +
	"<div class='XDialogContent'></div>" +
	"</div>")[0];

	contentNode = $(domNode).find('.XDialogContent')[0];

	closeBtn = $(domNode).find('.closeBtn')[0];

	titleBar = $(domNode).find('.titleText')[0];

	$(document.body)
		.append(domNode)
		.css('position', 'relative');

	$(closeBtn).click(function (event) {
		event.stopPropagation();
		that.close();
	});

	that.domNode = domNode;
	that.contentNode = contentNode;
	that.closeBtn = closeBtn;

	that.init = function () {


		$(domNode).css('position', 'fixed')
			.css('top', top)
			.css('left', left)
			.css('z-index', zIndex)
			.hide()
			.addClass(className);

		$(contentNode).css('min-width', '200px')
			.css('min-height', '200px')
			.css('height', height)
			.css('width', width)
			.html(content);

		$(domNode).find('.closeBtn').hide();

		offsetWidth = $(domNode).outerWidth();
		offsetHeight = $(domNode).outerHeight();

		$(domNode).css('margin-top', -offsetHeight / 2)
			.css('margin-left', -offsetWidth / 2);

		$(domNode).find('.titleText').html(title);

		if (autoOpen) {
			that.open();
		}

		if (closable) {
			$(domNode).find('.closeBtn').show();
		}

		//拖拽功能
		if (draggable) {

			$(titleBar).css('cursor', 'move');

			$(titleBar).on('mousedown.' + id, function (e) {
				if (e.which === 1) {
					dragStart = true;
					prevX = e.pageX;
					prevY = e.pageY;
				}
			});

			$(document).on('mousemove.' + id, function (e) {
				var currentX, currentY, deltaX, deltaY;
				if (dragStart) {
					titleBar.onselectstart = function () {
						return false;
					};

					currentX = e.pageX;
					currentY = e.pageY;
					deltaX = currentX - prevX;
					deltaY = currentY - prevY;

					top += +deltaY;
					left += deltaX;
					$(domNode).css('top', top)
						.css('left', left);

					prevX = currentX;
					prevY = currentY;
				}
			});

			$(document).on('mouseup.' + id, function () {
				dragStart = false;
				titleBar.onselectstart = function () {
					return true;
				};
			});
		}

		return that;
	};

	that.set = function (attrs) {

		('width' in attrs) && (width = attrs.width);
		('height' in attrs) && (height = attrs.height);
		('top' in attrs) && (top = attrs.top);
		('left' in attrs) && (left = attrs.left);
		('title' in attrs) && (title = attrs.title);
		('className' in attrs) && (className = attrs.className);
		('closable' in attrs) && (closable = Boolean(attrs.closable));
		('onClose' in attrs && $.isFunction(attrs.onClose)) && (onClose = attrs.onClose);
		('onOpen' in attrs && $.isFunction(attrs.onOpen)) && (onOpen = attrs.onOpen);
		('autoOpen' in attrs) && (autoOpen = Boolean(attrs.autoOpen));
		('zIndex' in attrs && $.isNumeric(attrs.zIndex)) && (zIndex = attrs.zIndex);
		('draggable' in attrs) && (draggable = attrs.draggable);
		('animated' in attrs) && (animated = Boolean(attrs.animated));
		('content' in attrs) && (content = attrs.content.toString());

		return that;
	};

	that.open = function () {

		if (!opened) {

			animated ? $(domNode).fadeIn('fast') : $(domNode).show();
			opened = true;
			shield = helpers.addShield(document.body, 0.5, zIndex - 1);
			onOpen();

			if (initialOpen) {

				top = $(window).height() * top - $(domNode).outerHeight() / 2;
				left = $(window).width() * left - $(domNode).outerWidth() / 2;

				$(domNode).css('top', top)
					.css('left', left)
					.css('margin-top', 0)
					.css('margin-left', 0);

				initialOpen = false;
			}
		}

		return that;
	};

	that.close = function () {
		if (opened) {

			animated ? $(domNode).fadeOut('fast') : $(domNode).hide();
			opened = false;
			helpers.removeShield();
			onClose();
		}

		return that;
	};

	that.init();

	return that;
};
