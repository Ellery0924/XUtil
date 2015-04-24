/*
 * 源文件：src/menu.js
 * 树结构菜单
 * 可以通过给Menu实例附加(调用append方法)不同类型的MenuItem(简单Item和拥有子菜单的Item)来逐步构造菜单的树结构,
 * 或者直接将一个描述树结构的JSON赋给menuSrc属性，之后调用init方法来初始化Menu
 * 可以动态修改菜单的树结构，详见MenuItem
 * 菜单拥有两种展示形式：垂直vertical（类似windows资源管理器的树形展开菜单）和水平horizontal（类似点击鼠标右键后出现的悬浮菜单）
 * 拥有以下实例方法：
 * append:为菜单添加一个菜单项，可以是simpleItem或者popupItem,
 * open:将菜单展开至某个位置，接收一个位置字符串作为参数，例如0-2就是 展开第一个子菜单后，展开第一个子菜单的第二个子菜单
 * init:初始化/刷新菜单
 * closeAll:关闭所有打开的子菜单
 */
XUtil.XMenu = function (option) {
    //控制台函数的引用
    var log = XUtil.helpers.log;

    //类的私有成员
    var id = option.id || 'XMenu-' + XUtil.helpers.guid(),
        renderTo = option.renderTo,
        mMenuClass = option.menuClass || '',
        mTextClass = option.textClass || '',
        mIconClass = option.iconClass || '',
        mLabelClass = option.labelClass || '',
        mIconRightClass = option.iconRightClass || '',
        subMenuMargin = option.subMenuMargin || 20;

    var simpleItems = [],
        popups = [],
        allItems = [];

    //构建SimpleItem,内部使用
    var initSimpleItem = function (simpleItem, targetDiv) {
        var simpleItemId = simpleItem.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid();

        var simpleItemDiv = $("<li class='XMenuItem XMenuSimpleItem' id='" + simpleItemId + "'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            labelSpan = $("<div class='XMenuItemLabel simpleItemLabel'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var label = simpleItem.label;

        var onClick = simpleItem.onClick || function (simpleItemData, simpleItem, simpleItemDiv) {
                log(simpleItemData);
            };

        var iconClass = simpleItem.iconClass || mIconClass,
            iconRightClass = simpleItem.iconRightClass || mIconRightClass,
            textClass = simpleItem.textClass || mTextClass,
            labelClass = simpleItem.labelClass || mLabelClass;

        simpleItems.push(simpleItem);

        //给simpleItem添加一个到它的dom的引用
        simpleItem.domNode = simpleItemDiv;

        simpleItemDiv.data('itemData', simpleItem.itemData);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(simpleItemDiv);

        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        simpleItemDiv.click(function () {
            onClick(simpleItem.data, simpleItem, simpleItemDiv);
        });

        if (that.type === 'horizontal') {
            simpleItemDiv.bind('mouseenter', function () {
                var siblings;
                if (simpleItem.parent.subMenu) {
                    siblings = simpleItem.parent.subMenu;
                }
                else {
                    siblings = simpleItem.parent.menuSrc;
                }

                siblings.forEach(function (sib) {
                    sib.close && sib.close();
                });
            });
        }

        $(targetDiv).append(simpleItemDiv);
    };

    //构建PopupItem,内部使用
    var initPopupItem = function (popupItem, targetDiv) {

        var label = popupItem.label;

        var popupId = popupItem.id || 'XMenu-PopupItem-' + XUtil.helpers.guid(),
            popupItemDiv = $("<div class='XMenuItem XMenuPopupItem' id='" + popupId + "'></div>");

        var subMenu,
            subMenuDiv = $("<ul class='XMenuSubMenu'></ul>"),
            labelSpan = $("<li class='XMenuItemLabel popupItemLabel' style='cursor:pointer;'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var textClass = popupItem.textClass || mTextClass,
            iconClass = popupItem.iconClass || mIconClass,
            labelClass = popupItem.labelClass || mLabelClass,
            subMenuClass = popupItem.subMenuClass || mMenuClass,
            iconRightClass = popupItem.iconRightClass || mIconRightClass;

        var onClick = popupItem.onClick || function (popupItemData, popupItem, popupItemDiv) {
                log(popupItemData);
            };

        popups.push(popupItem);

        //给popupItem添加一个到它的dom的引用
        popupItem.domNode = popupItemDiv;
        //给popupItem的dom元素绑定一个data属性
        popupItemDiv.data('itemData', popupItem.data);

        $(targetDiv).append(popupItemDiv);
        subMenuDiv.hide();
        if (that.type === 'horizontal') {
            subMenuDiv.css('position', 'absolute');
        }

        subMenuDiv.addClass(subMenuClass);
        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(popupItemDiv);

        labelTextSpan.click(function () {
            onClick(popupItem.data, popupItem, popupItemDiv);
        });

        subMenu = popupItem.subMenu;
        //递归调用，构建子树
        subMenu.forEach(function (subItem) {
            var itemClass = subItem.itemClass;
            subItem.parent = popupItem;
            if (itemClass === 'simple') {
                initSimpleItem(subItem, subMenuDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(subItem, subMenuDiv);
            }
        });
        subMenuDiv.appendTo(popupItemDiv);

        //打开popupItem
        var openPopup = function () {

            var baseWidth, borderLeftWidth, borderTopWidth;
            var left, top;
            var openDirection = that.openDirection;

            baseWidth = parseInt(popupItemDiv.css('width'));
            //在ff下使用border-width取不到值，在ie下可以，这里必须使用border-left-width
            borderLeftWidth = isNaN(parseInt(subMenuDiv.css('border-left-width'))) ? 0 : parseInt(subMenuDiv.css('border-left-width'));
            borderTopWidth = isNaN(parseInt(subMenuDiv.css('border-top-width'))) ? 0 : parseInt(subMenuDiv.css('border-top-width'));

            if (that.type === 'vertical') {
                if (that.animated === true) {
                    subMenuDiv.slideDown('fast');
                }
                else {
                    subMenuDiv.show();
                }
                subMenuDiv
                    .css('margin-left', subMenuMargin)
                    .css('width', baseWidth - subMenuMargin - 2 * borderLeftWidth);
            }
            else {
                //悬浮菜单模式下针对四种不同打开方向的配置
                if (openDirection === 'bottomRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'bottomLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }
                else if (openDirection === 'topRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();

                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'topLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();
                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }

                if (that.animated === true && that.type === 'horizontal') {
                    subMenuDiv.fadeIn('fast');
                }
                else {
                    subMenuDiv.show();
                }

            }

            labelSpan.find('.XMenuItemIconRight').addClass('rotate');
            labelSpan.addClass('opened');
            labelSpan.attr('opened', 'opened');
            iconRightSpan.addClass('subExpanded');
            popupItem.isOpened = true;
        };

        //关闭popupItem,将会递归地关闭它的所有子孙popupItem
        var closePopup = function () {

            var subMenuDiv = this.domNode.find('.XMenuSubMenu'),
                labelSpan = this.domNode.find('.XMenuItemLabel'),
                iconRightSpan = this.domNode.find('.XMenuItemIconRight');

            subMenuDiv.find('.XMenuPopupItem').removeAttr('opened');

            iconRightSpan.removeClass('rotate');

            if (that.animated === true && that.type === 'vertical') {
                subMenuDiv.slideUp('fast');
            }
            else if (that.animated === true && that.type === 'horizontal') {
                subMenuDiv.fadeOut('fast');
            }
            else {
                subMenuDiv.hide();
            }

            //递归关闭所有子孙popupItem
            this.subMenu.forEach(function (sub) {
                if (sub.itemClass === 'popupItem') {
                    $.proxy(closePopup, sub)();
                }
            });

            labelSpan.removeClass('opened');
            labelSpan.attr('opened') && labelSpan.removeAttr('opened');
            iconRightSpan.removeClass('subExpanded');
            this.isOpened = false;
        };

        popupItem.open = openPopup;
        popupItem.close = closePopup;
        popupItem.isOpened = false;

        if (that.type === 'vertical') {
            iconRightSpan.click(function () {
                var opened = $(this.parentNode).attr('opened');
                if (opened === 'opened') {
                    popupItem.close();
                }
                else {
                    popupItem.open();
                }
            });
        }
        else {
            popupItemDiv.bind('mouseenter', function () {
                //在鼠标放在item 0.4秒后展开子菜单
                var self = this,
                    opened,
                    siblings;

                if (popupItem.parent.subMenu) {
                    siblings = popupItem.parent.subMenu;
                }
                else {
                    siblings = popupItem.parent.menuSrc;
                }

                $(self).find('.XMenuItemLabel').attr('opened', 'opened');

                siblings.forEach(function (sib) {
                    if (sib !== popupItem)
                        sib.close && sib.close();
                });

                //为了提高用户体验而设置的延迟
                setTimeout(function () {
                    opened = $(self).find('.XMenuItemLabel').attr('opened');

                    if (opened) {
                        popupItem.open();
                    }
                }, 400);
            });
        }

    };

    //私有，获取一个menuItem的location
    var getLocation = function (item) {
        var locationArr = [];
        var self = item;
        var subStr;
        while (self.parent !== undefined && self.parent.subMenu !== undefined) {
            subStr = self.parent.subMenu.indexOf(self);
            locationArr.push(subStr);
            self = self.parent;
        }
        locationArr.push(self.parent.menuSrc.indexOf(self));

        return locationArr.reverse().join('-');
    };

    //在悬浮菜单模式下，鼠标左键点击菜单外将会关闭整个菜单中的所有popupItem
    $(document).click(function (event) {
        var target = event.target;
        if (that.type === 'horizontal') {
            if (!$(that.domNode).find(target)[0]) {
                that.closeAll();
            }
        }
    });

    //在悬浮菜单模式下，当鼠标处在菜单范围外，将会关闭鼠标X坐标右边（或左边，根据展开方向确定）的所有菜单
    //这种行为与OS X中的系统悬浮菜单一致
    $(document).bind('mousemove', function (event) {
        var mouseX;
        var popupItemDiv, popupX;
        var target = event.target;
        mouseX = event.pageX;
        if (!$(that.domNode).find(target)[0] && that.type === 'horizontal') {
            that.allItems.forEach(function (item) {
                if (item.itemClass === 'popup' && item.isOpened === true) {
                    popupItemDiv = item.domNode;
                    popupX = $(popupItemDiv).offset().left;
                    if (that.openDirection.toLowerCase().search('right') !== -1) {
                        if (popupX > mouseX) {
                            item.close();
                        }
                    }
                    else if (that.openDirection.toLowerCase().search('left') !== -1) {
                        if (popupX + $(popupItemDiv).outerWidth() < mouseX) {
                            item.close();
                        }
                    }
                }
            });
        }
    });

    //类的实例成员
    var that = {};
    //菜单类型
    that.type = option.type || 'vertical';
    //是否开启动画
    that.animated = false;
    if ('animated' in option && option.animated === true) {
        that.animated = true;
    }
    //描述树结构的数组
    that.menuSrc = [];
    //保存所有节点的数组
    that.allItems = [];
    //打开菜单的方向，可以设为左上，左下，右上，右下
    that.openDirection = option.openDirection || 'bottomRight';
    //这个属性记录了树结构的级数
    that.maxLevel = 0;

    //给菜单添加菜单项
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.menuSrc.push(item);
            item.parent = that;
        }
        return that;
    };

    //将菜单展开至某个特定位置
    that.open = function (location) {
        var locationArr = location.split('-'),
            self = that.menuSrc[locationArr[0]];
        var i, target;

        if (self.open) {
            self.open();
        }
        else {
            return self;
        }

        for (i = 1; i < locationArr.length; i++) {
            target = locationArr[i];
            self.subMenu[target] && self.subMenu[target].open && self.subMenu[target].open();
            self = self.subMenu[target];
        }

        return self;
    };

    //关闭所有打开的popupItem
    that.closeAll = function () {
        that.menuSrc.forEach(function (sub) {
            if (sub.itemClass === 'popup') {
                sub.close();
            }
        });

        return that;
    };

    //初始化/刷新菜单UI
    that.init = function () {
        var rootDiv = $("<div class='XMenu' id='" + id + "'></div>")[0];
        var renderToDiv = $(renderTo)[0];

        if ($(renderTo).length > 1) {
            throw error('XMenu: option.renderTo属性设置有误！');
        }

        $(rootDiv).addClass(mMenuClass).css('position', 'relative');
        $(renderToDiv)
            .empty()
            .append(rootDiv);

        //构建树型结构菜单
        that.menuSrc.forEach(function (menuItem) {
            var itemClass = menuItem.itemClass;
            menuItem.parent = that;
            if (itemClass === 'simple') {
                initSimpleItem(menuItem, rootDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(menuItem, rootDiv);
            }
        });

        allItems = simpleItems.concat(popups);
        allItems.forEach(function (item) {
            var level;
            item.location = getLocation(item);
            item.rootMenu = that;
            //计算树结构的级数
            level = item.location.split('-').length;
            if (level > that.maxLevel) {
                that.maxLevel = level;
            }
        });

        that.domNode = rootDiv;
        that.allItems = allItems;

        $(rootDiv).children().addClass('firstLevelItem');
        that.type === 'vertical' ? $(rootDiv).addClass('vertical') : $(rootDiv).addClass('horizontal');

        return that;
    };
    return that;
};

/*
 * 简单MenuItem，同时作为popupItem的基类
 * 可以定制菜单项的文本，以及各个部分的className
 * 可以添加onclick回调
 * 拥有三个实例方法：
 * 		remove:将item从树结构中移除
 *      appendTo:将item和他的子孙节点添加至某个节点（形成一棵以目标节点为根节点的新的子树）
 *      		 ，如果目标节点是simpleItem，则将其转化为一个popupItem后添加
 *      		 （注意：父节点不能被添加到它的子节点中，叶子节点可以任意移动）
 *      insertAt:将item插入它同级节点中的某个位置
 * */
XUtil.MenuItem = function (option) {
    return {
        itemClass: 'simple',
        label: option.label || '空',
        onClick: option.onClick || function (itemData, item, itemDom) {
            var log = XUtil.helpers.log;
            log(itemData);
        },
        option: option,
        iconClass: option.iconClass || '',
        labelClass: option.labelClass || '',
        id: option.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid(),
        textClass: option.textClass || '',
        iconRightClass: option.iconRightClass || '',
        data: option.data || {},
        //父节点的引用，在构建树结构时初始化
        parent: undefined,
        //从目录树中移除本节点
        remove: function () {
            var targetIndex;
            //从父节点的子节点数组中移除本节点
            if (this.parent.subMenu) {
                targetIndex = this.parent.subMenu.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.subMenu.splice(targetIndex, 1);
                }
            }
            else if (this.parent.menuSrc) {
                targetIndex = this.parent.menuSrc.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.menuSrc.splice(this.parent.menuSrc.indexOf(this), 1);
                }
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            //将指向父元素的引用置为undefined
            //这一步已经被取消
            //因为在menu的init方法中将会初始化每个子节点的父元素，因此没有必要在此处重置parent属性
            //this.parent=undefined;

            return this;
        },
        appendTo: function (item) {
            if (item === undefined || item.parent === undefined) {
                return this;
            }

            if (this.parent === item) {
                return this;
            }

            //从原树结构中移除本节点
            this.remove();

            //如果目标是一个popupItem/menu
            //则向其添加本节点
            if (item.append) {
                item.append(this);
            }
            //如果目标是一个simpleItem
            //则将其转化为popupItem
            //然后构建以它为根节点的新子树
            else {
                //将item转化为一个空的popupItem
                item.itemClass = 'popup';
                item.subMenu = [];
                item.subMenuClass = '';
                item.append = function (i) {
                    if (i && i.itemClass && (i.itemClass === 'popup' || i.itemClass === 'simple')) {
                        this.subMenu.push(i);
                        i.parent = this;
                    }

                    //刷新菜单
                    this.rootMenu && this.rootMenu.init && this.rootMenu.init();
                    //支持级联调用
                    return this;
                };

                //插入节点
                item.append(this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            return this;
        },
        insertAt: function (itemIndex) {
            this.remove();

            if (this.parent.subMenu) {
                this.parent.subMenu.splice(itemIndex, 0, this);
            }
            else {
                this.parent.menuSrc.splice(itemIndex, 0, this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.init && this.rootMenu.init();

            return this;
        }
    };
};

/*
 * 拥有子菜单项的MenuItem，继承自SimpleMenuItem，扩展了一个append方法
 * 用来为其附加一个或多个SimpleMenuItem或者PopupItem
 * */
XUtil.PopupMenuItem = function (option) {
    //继承SimpleMenuItem
    var that = XUtil.MenuItem(option);
    //为PopupItem定制属性
    that.id = option.id || 'XMenu-PopupItem-' + XUtil.helpers.guid();
    that.itemClass = 'popup';
    //保存子菜单项的数组
    //子菜单项可以是SimpleItem,也可以是PopupItem
    that.subMenu = [];
    that.subMenuClass = option.subMenuClass || '';
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.subMenu.push(item);
            item.parent = that;
        }

        //刷新菜单
        that.rootMenu && that.rootMenu.init && that.rootMenu.init();

        //支持级联调用
        return that;
    };
    //打开/关闭子菜单，这两个方法将在menu初始化的时候定义
    that.open = function () {
    };
    that.close = function () {
    };
    return that;
};

//基于Menu组件的悬浮菜单组件
//可以将它绑定在一个/多个dom元素上，在鼠标右键点击的位置打开
//offset: x,y偏移，用来调整打开菜单的位置
//animation: 动画效果
XUtil.XSuspendedMenu = function (option) {
    var error = XUtil.helpers.error;

    var id = 'XSuspendedMenuContainer-' + XUtil.helpers.guid();

    var bindTo = option.bindTo || 'mouse',
        offset = option.offset || {top: 0, left: 0},
        animated = option.animated || false,
        menuAnimated;

    if (animated) {
        menuAnimated = true;
    }
    else {
        menuAnimated = false;
    }

    var container = $("<div class='XSuspendedMenuContainer'></div>");

    var that = {};

    container.css('position', 'absolute')
        .attr('id', id)
        .attr('opened', 'false')
        .appendTo(document.body)
        .hide();

    option.renderTo = '#' + id;
    option.animated = menuAnimated;
    option.type = 'horizontal';
    //内部包装的菜单组件
    that.menu = XUtil.XMenu(option);
    that.menu.init();
    //包装菜单的dom
    that.container = container;
    //绑定的目标dom，一个jQuery对象
    that.bindToDom = undefined;
    //保存菜单是否打开的属性
    that.isOpened = false;
    //指向当前展开的菜单所绑定的目标dom的引用
    that.target = undefined;

    if ($(bindTo)[0]) {
        that.bindToDom = $(bindTo);
    }
    else {
        throw error('XSuspendedMenu: 目标dom不存在，请检查option.bindTo属性.');
    }

    that.show = function (posX, posY) {
        var rightLimit, bottomLimit;
        var xDirection, yDirection, direction;

        rightLimit = $(document).outerWidth() - that.menu.maxLevel * container.outerWidth();
        bottomLimit = $(document).outerHeight() - that.menu.maxLevel * container.outerHeight();

        if (posX < rightLimit) {
            container.css('left', posX + 3 + offset.left);
            xDirection = 'Right';
        }
        else {
            container.css('left', posX - container.outerWidth() - 3 + offset.left);
            xDirection = 'Left';
        }

        if (posY < bottomLimit) {
            container.css('top', posY + 3 + offset.top);
            yDirection = 'bottom';
        }
        else {
            container.css('top', posY - container.outerHeight() - 3 + offset.top);
            yDirection = 'top';
        }

        direction = yDirection + xDirection;
        that.menu.openDirection = direction;
        that.menu.init();

        if (!animated) {
            container.show();
        }
        else {
            container.fadeIn(150);
        }
        container.attr('opened', 'true');
        that.isOpened = true;

        return that;
    };

    that.init = that.menu.init;

    that.hide = function () {
        if (!animated) {
            container.hide();
        }
        else {
            container.fadeOut(150);
        }
        container.attr('opened', 'false');
        that.target = undefined;
        that.isOpened = false;

        return that;
    };

    //在绑定dom中单击鼠标右键时打开菜单
    $(that.bindToDom).bind("contextmenu", function (event) {
        var posX = event.pageX;
        var posY = event.pageY;

        event.preventDefault();
        event.stopPropagation();

        if (that.isOpened) {
            that.hide();
            //target为触发事件的dom
            that.target = event.currentTarget;

            setTimeout(function () {
                that.show(posX, posY);
            }, 150);

        }
        else {
            that.show(posX, posY);
        }
    });

    //关闭菜单
    $(document.body).bind('click', function (event) {
        var target = event.target;
        //如果没有在container中点击左键，关闭菜单
        if (event.button === 0 && !container.find(target)[0] && container.attr('opened') === 'true') {
            that.hide();
        }
    });

    return that;
};
