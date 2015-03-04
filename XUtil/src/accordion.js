/**
 * 源文件：src/accordion.js
 * Accordion组件
 * 效果与大多数js库的accordion组件类似
 * 可以在组织好结构的dom上初始化，详见test/accordionTest.html
 * 或者调用append方法手动添加标签
 * 可配置属性：
 * id：组件id，默认为自动生成的guid
 * renderTo: 目标dom的id
 * titles: 每个标签的title，接收一个字符串数组
 * 每个标签的title也可以用dom的xa-title属性来设置，详见test/accordionTest.html
 * animated: 打开/关闭是否有slide动画效果，默认为false,无动画
 * onShow: 展开标签时的回调函数，接收一个参数，为展开标签的模型对象
 * onRemove: 删除一个标签时的回调，同样接收标签的模型对象为参数
 * closable: 标签是否可以移除，默认为false
 * className, iconClass: 可以自定义组件的className，可以定制标签头部的icon的className
 */

XUtil.XAccordion = function (option) {

	var error = XUtil.helpers.error;
	var log = XUtil.helpers.log;

	var containers = [];

	var that = {};

	var titles = option.titles || [],
		id = option.id || 'XAccordion-' + XUtil.helpers.guid(),
		animated = option.animated || false,
		onShow = $.isFunction(option.onShow) ? option.onOpen : function (container) {
			log('XAccordion: Container ' + container.index + ' is open');
		},
		onRemove = $.isFunction(option.onRemove) ? option.onRemove : function (container) {
			log('XAccordion: Container ' + container.index + ' is removed.');
			return true;
		},
		renderTo,
		closable = option.closable || false,
		className = option.className || '',
		iconClass = option.iconClass || '';

	if (!('renderTo' in option) || !$(option.renderTo)[0]) {
		throw error('XAccordion: 目标div不合法，请检查option.renderTo属性！');
	}
	else {
		renderTo = option.renderTo;
	}

	var target = $(renderTo);

	var append = function (dom, title) {

		var container,
			titleNode,
			contentNode,
			domNode;

		var titleTmpl = "<div class='XAccordion-title'>" +
				"<span class='icon'></span>" +
				"<span class='titleText'></span>" +
				"<span class='closebtn'></span>" +
				"</div>",
			contentTmpl = "<div xa-title='" + title + " 'class='XAccordion-content'></div>",
			domTmpl = "<div class='XAccordion-container'></div>";

		dom = $(dom)[0];

		if (dom) {

			container = {
				title: title,
				titleNode: undefined,
				contentNode: undefined,
				domNode: undefined,
				opened: false
			};

			contentNode = $(contentTmpl).append(dom);
			titleNode = $(titleTmpl);
			titleNode.find('.titleText').html(title);
			domNode = $(domTmpl).append(titleNode).append(contentNode);

			container.titleNode = titleNode;
			container.contentNode = contentNode;
			container.domNode = domNode;

			containers.push(container);
		}
		else {
			throw error('XAccordion.append: 要添加的dom元素不合法，请检查！');
		}
	};

	var children = target.children();
	var i;
	var child,
		titleText;

	for (i = 0; i < children.length; i++) {
		child = children[i];
		titleText = titles[i] === '' ? $(child).attr('xa-title') : titles[i];
		$(child).removeAttr('xa-title');
		append(child, titleText);
	}

	target.on('click', '.titleText', function () {
		var index = $(this.parentNode.parentNode).attr('xa-index');
		that.show(index);
	});

	target.on('click', '.closebtn', function () {
		var index = $(this.parentNode.parentNode).attr('xa-index');
		that.remove(index);
	});

	that.containers = containers;
	that.titles = titles;

	that.set = function (attrs) {
		('animated' in attrs) && (animated = Boolean(attrs.animated));
		($.isFunction(attrs.onShow)) && (onShow = attrs.onShow);
		($.isFunction(attrs.onRemove)) && (onRemove = attrs.onRemove);
		('closable' in attrs) && (closable = Boolean(attrs.closable));
		('className' in attrs) && (className = attrs.className);
		('iconClass' in attrs) && (iconClass = attrs.iconClass);
		('id' in attrs) && (id = attrs.id);

		return that;
	};

	that.show = function (index) {

		var i;
		for (i = 0; i < containers.length; i++) {
			if (i !== parseInt(index)) {
				that.hide(i);
			}
		}

		if (!containers[index].opened) {

			animated ? containers[index].contentNode.slideDown('fast') : containers[index].contentNode.show();
			containers[index].opened = true;
			containers[index].domNode.addClass('opened');
			onShow(containers[index]);
		}

		return that;
	};

	that.hide = function (index) {

		containers[index].opened = false;
		animated ? containers[index].contentNode.slideUp('fast') : containers[index].contentNode.hide();
		containers[index].domNode.removeClass('opened');

		return that;
	};

	that.remove = function (index) {

		if (onRemove(containers[index])) {

			containers.splice(index, 1);
			that.init();
		}

		return that;
	};

	that.append = function (dom, title) {

		append(dom, title);
		that.init();

		return that;
	};

	that.init = function () {

		target.empty();
		target.addClass('XAccordion')
			.addClass(className)
			.attr('xa-id', id);

		if (containers.length > 0) {

			for (i = 0; i < containers.length; i++) {
				target.append(containers[i].domNode);
				containers[i].domNode.attr('xa-index', i);
				containers[i].index = i;

				if (i !== 0) {
					containers[i].contentNode.hide();
					containers[i].opened = false;
				}
			}

			if (!closable) {
				target.find('.closebtn').hide();
			}

			target.find('.icon').addClass(iconClass);

			containers[0].contentNode.show();
			containers[0].opened = true;
			containers[0].domNode.addClass('opened');
		}

		return that;
	};

	that.init();

	return that;
};
