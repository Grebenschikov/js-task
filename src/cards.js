/*
 * Trip Sorter Api.
 * 
 * Usage: 
 * 	Configure types of cards:
 * 		Card.setTypes({
 * 			'bus' : {
 * 				'format': 'Take the airport bus from {from} to {to}. [if hasseat]Seat: {seat}[endif][if not hasseat]No seat assignment[endif]',
 * 				'params': [
 * 					'hasseat': ['checkbox'],
 * 					'seat': ['text', 'Seat']
 * 				]
 * 			}
 * 		});
 * 	  OR
 * 		Card.addType('bus', {
 * 			'format': 'Take the airport bus from {from} to {to}. [if hasseat]Seat: {seat}[endif][if not hasseat]No seat assignment[endif]',
 * 			'params': [
 * 				'hasseat': ['checkbox'],
 * 				'seat': ['text', 'Seat']
 * 			]
 * 		});

 * 	Init list:
 * 		var list = new CardList();
 * 		list.add(new Card(type, from, to {options}));
 * 		list.add(new Card({type: type, from: from, to: to, options: options}))
 * 	  OR
 * 		var list = new CardList([new Card(card1), new Card(card2), ...]);
 * 	Sorting:
 * 		list.each(function(card) {
 * 			console.log('Unsorted', card);
 * 		}).sort().each(function(card) {
 * 			console.log('Sorted', card);
 * 		});
 * 
 */

var Card = function (type, from, to, params) {
	if (typeof type === 'object') {
		from = type.from;
		to = type.to;
		params = type.params;
		type = type.type;
	}

	this.type = type;
	this.from = from;
	this.to = to;
	this.params = params || {};

	this.next = -1;
	this.prev = -1;

	this.description = function () {
		return (Card.types[this.type].title || this.type) + ' from ' + this.from + ' to ' + this.to;
	}

	this.way = function () {
		var params = { from: this.from, to: this.to };
		for (var k in this.params) params[k] = this.params[k];
		var format = Card.types[this.type].format || "";
		format = format.replace(/\[if(\s+not)?\s+([a-zA-Z0-9\-_\.]+)]([^\[]*)\[endif\s*]/g, function (_, not, param, data) {
			var flag = !not ? params[param] : !params[param];
			return flag ? data : '';
		}).replace(/\{([a-zA-Z0-9\-_\.]+)}/g, function (_, param) {
			return params[param] || '{' + param + '}';
		});

		return format;
	}

	return this;
}

Card.setTypes = function (types) {
	Card.types = types;
}

Card.addType = function (name, type) {
	Card.types = Card.types || {};
	Card.types[name] = type;
}

var CardList = function (list) {
	if (list === undefined) {
		list = [];
	}

	this.add = function (card) {
		list.push(card);
		return list.length - 1;
	}

	this.remove = function (i) {
		return list.splice(i, 1)[0];
	}

	this.arr = function () {
		return list;
	}

	this.sort = function () {
		
		var keys = [], sorted = [];

		for (var i = 0; i < list.length; i++) {
			keys.push([i, list[i].to], [i, list[i].from]);
		}

		keys.sort(function (a, b) {
			if (a[1] < b[1])
				return -1;
			if (a[1] > b[1])
				return 1;
			return 0;
		});

		for (i = 0; i < keys.length; i++) {
			if (keys[i + 1] === undefined) break;
			var a = keys[i][0], b = keys[i + 1][0];
			if (list[a].to === list[b].from) {
				list[a].next = b;
				list[b].prev = a;
				i++;
			} else if (list[a].from === list[b].to) {
				list[b].next = a;
				list[a].prev = b;
				i++;
			}
		}

		for (i = 0; i < list.length; i++) {
			if (list[i].prev == -1) {
				sorted.push(list[i]);
				var next = list[list[i].next];
				var max = list.length;
				while (next && max--) {
					sorted.push(next);
					var nextId = next.next;
					next = list[nextId];
				}
				break;
			}
		}

		for (i = 0; i < list.length; i++) {
			list[i].prev = -1;
			list[i].next = -1;
		}

		return new CardList(sorted);
	}

	this.each = function (cb) {
		list.forEach(cb);
		return this;
	}

	return this;
}