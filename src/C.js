/*
 * Simple dom framework
 *
 * For extending C, use
 * 	C.node.prototype.someFunc = function() { return 'Value: ' + this.value(); }
 */

(function (w, d) {
	function event(node, action, cb) {
		if (node.addEventListener) {
			node.addEventListener(action, cb);
		} else {
			node.attachEvent('on' + action, cb);
		}
	}

	var C = function (selector) {
		if (typeof selector === 'function') {
			return event(w, 'load', selector);
		}
		return new C['node'](d.querySelectorAll(selector));
	};

	C.create = function (tag) {
		return new C['node'](document.createElement(tag));
	};

	C.node = function (nodes) {
		if (nodes.length === undefined) {
			nodes = [nodes];
		}

		this.each = function (cb) {
			for (var i = 0; i < nodes.length; i++) {
				var res = cb(i, nodes[i]);
				if (res !== undefined) {
					return res;
				}
			}
		};

		this.first = function () {
			return nodes.length ? nodes[0] : null;
		};

		this.count = function () {
			return nodes.length;
		};

		this.on = function (action, cb) {
			this.each(function (_, el) {
				event(el, action, cb);
			});
			return this;
		};

		this.attr = function (name, val) {
			if (val === undefined) {
				return nodes.length ? this.first().getAttribute(name) : null;
			} else {
				this.each(function (_, el) {
					el.setAttribute(name, val);
				});
				return this;
			}
		};

		this.param = function (name, val) {
			if (val === undefined) {
				var el = this.first();
				return el !== undefined && el[name] !== undefined ? el[name] : null;
			} else {
				this.each(function (_, el) {
					el[name] = val;
				});
				return this;
			}
		};

		this.value = function (val) {
			return this.param('value', val);
		};

		this.html = function (data) {
			return this.param('innerHTML', data);
		};

		this.parent = function () {
			return nodes.length ? new C['node'](this.first().parentNode) : null;
		};

		this.append = function (node) {
			this.each(function (_, el) {
				el.appendChild(node.first());
			});
			return this;
		};

		this.prepend = function (node) {
			this.parent().first().insertBefore(node.first(), this.first());
			return this;
		};

		this.addClass = function (cl) {
			var now = this.param('className');
			this.param('className', (now.replace(new RegExp('^|\\s(' + cl + ')\\s|$', 'g'), ' ') + ' ' + cl).trim());
			return this;
		};

		this.hasClass = function (cl) {
			var now = this.param('className');
			return new RegExp('^|\\s(' + cl + ')\\s|$', 'g').test(now);
		};

		this.removeClass = function (cl) {
			var now = this.param('className');
			this.param('className', now.replace(new RegExp('^|\\s(' + cl + ')\\s|$', 'g'), ' ').trim());
			return this;
		};

		this.toggleClass = function (cl) {
			if (this.hasClass(cl)) {
				this.removeClass(cl);
			} else {
				this.addClass(cl);
			}
			return this;
		};

		this.css = function (key, value) {
			if (typeof key === 'object') {
				for (var k in key) {
					this.css(k, key[k]);
				}
			} else {
				if (value === undefined) {
					return this.first().style[key] || null;
				} else {
					this.each(function (_, el) {
						el.style[key] = value;
					})
				}
			}
			return this;
		};

		return this;
	};

	w['C'] = C;
})(window, document);