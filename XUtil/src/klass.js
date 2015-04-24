/**
 * Created by shenjiao on 15/2/28.
 * 一种JS类实现，借鉴了Spine.js中类的实现并做了一些小改动（加入了父类原型属性和父类init方法的引用以及guid）
 */
XUtil.Class = function (parent) {

	var sub;

	function Class() {

		this.init.apply(this, arguments);
		Class.instances[XUtil.helpers.guid()] = this;
	}

	Class.instances = {};

	Class.find = function (id) {

		if (id && Class.instances[id]) {

			return Class.instances[id];
		}
	};

	if (parent) {

		sub = function () {
		};
		sub.prototype = parent.prototype;
		Class.prototype = new sub();
		Class.parent = parent;
		Class.parentProto = parent.prototype;
		Class.parentInit = parent.prototype.init;
	}

	Class.prototype.init = function () {
	};

	Class.prototype.constructor = Object;

	Class.include = function (mixin) {

		var key;

		for (key in mixin) {

			if (mixin.hasOwnProperty(key)) {

				Class.prototype[key] = mixin[key];
			}
		}
	};

	Class.extend = function (mixin) {

		var key;

		for (key in mixin) {

			if (mixin.hasOwnProperty(key)) {

				Class[key] = mixin[key];
			}

		}
	};

	return Class;
};