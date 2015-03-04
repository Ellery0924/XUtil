/*
 * 源文件：src/popout.js
 * 一个辅助输入控件容器，通常绑定在一个textbox上，在单击或者focus这个textbox时展开并提供辅助输入选项
 * 这个类只生成一个空白的容器，所需的辅助输入dom需要自行添加
 * 以后可能在这个类的基础上做出新的辅助输入UI控件
 * 接收以下参数
 * renderTo:绑定的目标dom，必需
 * popoutId:控件的id，可选
 * width:控件的宽度，可选，默认为400
 * height:控件的高度，可选，默认为auto
 * animation:展开时的动画效果，可选，有三个可选配置项：default为默认情况，没有动画；fade为淡入/淡出效果，slide为向下展开/向上收起效果
 * position:控件的位置，可选，有四个可选配置项：lowerLeft(左下),lowerRight(右下),upperLeft(左上),upperRight(右上)，默认为左下
 * autoOpen:设置控件是否自动展开，可选，默认为false,
 * onOpen,onClose:控件打开/关闭事件，可选，默认为空函数，接收一个免费参数popout，为控件的dom对象
 */
XUtil.XPopout = function (option) {
	var error = XUtil.helpers.error;

	//用来返回的实例对象
	var that = {};

	//初始化私有成员
	//	目标dom的id
	var renderTo = option.renderTo,
	//	附给popout的id
		id = option.id || 'XPopout-' + XUtil.helpers.guid(),
	//	popout的宽度
		width = option.width || 'auto',
	//	popout的高度
		height = option.height || 'auto',
	//	打开popout时的动画，默认为无动画
		animation = option.animation || "default",
	//	popout出现的位置
		position = option.position || "lowerLeft",
	//	目标dom
		targetDiv = $(renderTo)[0],
	//	设置是否自动打开popout
		autoOpen = false,
		className = option.className || '',
		content = option.content || '',
		triggerBy = option.triggerBy || 'click',
		pOffset = option.offset || {top: 0, left: 0},
		onOpen = option.onOpen || function (xPopout) {
		},
		onClose = option.onClose || function (xPopout) {
		};

	//popout窗体
	var popout = $("<div class='xPopout' id='" + id + "'></div>");

	if (option.autoOpen !== undefined && option.autoOpen === true) {
		autoOpen = true;
	}
	//遇到非法配置参数时抛出异常
	if (targetDiv === undefined) {
		throw error("XPopout: 配置参数有误，请检查option.renderTo属性");
	}

	if (animation === 'slide' && (position === 'upperLeft' || position === 'upperRight')) {
		animation = 'default';
	}

	//生成弹出框
	popout.append(content).addClass(className);
	popout.appendTo(document.body);
	popout.css("position", "absolute")
		.css("height", height || "auto")
		.css("width", width || 'auto')
		.css('display', "none")
		.css('background-color', '#fff')
		.css('padding', '10px');

	//初始化实例成员
	//绑定dom的引用
	that.bindDom = targetDiv;
	//弹出框dom的引用
	that.popout = popout[0];

	//初始化实例方法
	//设置popout的position
	that.setPosition = function (position) {
		//目标dom的坐标，宽度，高度
		var offset = $(targetDiv).offset();
		var targetDivWidth = targetDiv.offsetWidth;
		var targetDivHeight = targetDiv.offsetHeight;

		//四种位置的坐标
		var llPosition = {
			top: offset.top + targetDivHeight + Number(pOffset.top),
			left: offset.left + pOffset.left
		};

		var lrPosition = {
			top: offset.top + targetDivHeight + Number(pOffset.top),
			left: offset.left + targetDivWidth - popout.outerWidth() + Number(pOffset.left)
		};

		var ulPosition = {
			top: offset.top - popout.outerHeight() + Number(pOffset.top),
			left: offset.left + Number(pOffset.left)
		};

		var urPosition = {
			top: offset.top - popout.outerHeight() + Number(pOffset.top),
			left: offset.left + targetDivWidth - popout.outerWidth() + Number(pOffset.left)
		};

		//私有方法，根据坐标对象设置popout的位置
		var setPos = function (posObj) {
			popout.css('top', posObj.top);
			popout.css('left', posObj.left);
		};

		if (position === "lowerLeft") {
			setPos(llPosition);
			that.position = position;
		}
		else if (position === "lowerRight") {
			setPos(lrPosition);
			that.position = position;
		}
		else if (position === "upperLeft") {
			setPos(ulPosition);
			that.position = position;
		}
		else if (position === "upperRight") {
			setPos(urPosition);
			that.position = position;
		}
		else {
			setPos(llPosition);
			that.position = "lowerLeft";
		}

		return that;
	};

	//公有方法，打开popout
	that.open = function () {
		if (that.status === "closed") {
			onOpen(popout[0]);

			that.setPosition(position);

			if (animation === "fade") {
				popout.fadeIn('fast');
			}
			else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
				popout.slideDown('fast');
			}
			else {
				popout.show();
			}

			that.status = "opened";
		}

		return that;
	};

	//公有方法，关闭popout
	that.close = function () {
		if (that.status === "opened") {
			onClose(popout[0]);
			if (animation === "fade") {
				popout.fadeOut('fast');
			}
			else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
				popout.slideUp('fast');
			}
			else {
				popout.hide();
			}

			that.status = "closed";
		}

		return that;
	};

	that.setPosition(position);

	//根据用户配置确定是否自动打开
	if (autoOpen === false) {
		that.status = "closed";
	}
	else {
		that.status = "opened";
		that.open();
	}

	//初始化响应事件
	//点击目标dom时展开控件
	(function () {
		//延迟开启/关闭使用的布尔值
		var openning = false;

		var closeHandler = function (e, immediate) {
			var target;

			e.stopPropagation();
			target = e.target;

			if (popout.children().length !== 0 &&
				target !== popout[0] &&
				target !== targetDiv &&
				popout.find(target)[0] === undefined ||

				popout.children().length === 0 &&
				target !== targetDiv &&
				target !== popout[0]) {

				openning = false;

				if (triggerBy === 'hover' && !immediate) {

					setTimeout(function () {
						if (!openning && that.status === 'opened') {
							that.close();
						}
					}, 400);
				}
				else {
					that.close();
				}
			}
			else {
				openning = true;
			}

		};

		if (triggerBy === 'hover') {

			$(targetDiv).on('mouseenter.XPopoutOpen', function () {
				openning = true;
				setTimeout(function () {
					if (openning) {
						that.open();
					}
				}, 350);
			});

			$(document).on('mouseover.XPopoutClose', function (e) {
				closeHandler.call(this, e);
			});

			$(document).on('click.XPopoutClose', function (e) {
				closeHandler.call(this, e, true);
			});
		}
		else {
			$(targetDiv).on('click.XPopoutOpen', function () {
				that.open();
			});

			$(document).on('click.XPopoutClose', function (e) {
				closeHandler.call(this, e);
			});
		}

	})();

	return that;
};
