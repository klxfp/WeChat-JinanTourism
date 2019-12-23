Array.prototype.filter = Array.prototype.filter || function(fun) {
	if (this === void 0 || this === null) {
		throw new TypeError();
	}

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== 'function') {
		throw new TypeError();
	}

	var res = [];
	var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	for (var i = 0; i < len; i++) {
		if (i in t) {
			var val = t[i];
			if (fun.call(thisArg, val, i, t)) {
				res.push(val);
			}
		}
	}
	return res;
}
Array.prototype.find = Array.prototype.find || function(fn, thisArg) {
	var arr = this;
	for (var i = 0, length = arr.length; i < length; i++) {
		if (fn.call(thisArg, arr[i], i, arr)) {
			return arr[i];
		}
	}
}

Array.prototype.map = Array.prototype.map || function(fn, context) {
	var arr = [];
	if (typeof fn === "function") {
		for (var k = 0, length = this.length; k < length; k++) {
			arr.push(fn.call(context, this[k], k, this));
		}
	}
	return arr;
}

Array.prototype.findIndex = Array.prototype.findIndex || function(fn, thisArg) {
	var arr = this;
	for (var i = 0, length = arr.length; i < length; i++) {
		if (fn.call(thisArg, arr[i], i, arr)) {
			return i;
		}
	}
	return -1;
}