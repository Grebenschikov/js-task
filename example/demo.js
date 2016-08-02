C(function() {
	var list = new CardList(),
		dropdown = C('#card_type');

	Card.setTypes(types);
	for (var t in types) {
		var type = types[t];
		var option = C.create('option').value(t).html(type.title === undefined ? t : type.title);
		dropdown.append(option);
	}
	
	function reinit() {
		var paramsWrapper = C('#card_params');
		paramsWrapper.html('');

		var type = C('#card_type option:checked').value();
		var params = types[type].params || {};
		
		for (var p in params) {
			var param = params[p], 
				id = 'card_param_' + p,
				group = C.create('div').addClass('group'),
				input = C.create('input');

			input.attr('name', p).attr('id', id).attr('type', param[0] || "text");			
			group.append(input);
			input.prepend(C.create('label').attr('for', id).html((param[1] || p) + ': '));
			
			paramsWrapper.append(group);
		}
	}

	function clear() {
		C('#card_from, #card_to').value('');
		for (var type in types) {
			C('#card_type').value(type);
			reinit();
			break;
		}
		
		return false;
	}

	function remove() {
		var id = new C['node'](this).parent().param('id');
		console.log(list.remove(id));
		renderTrips();
		localStorage.setItem('data', JSON.stringify(list.arr()));
	}

	function renderTrips() {
		var displayList = 'none', displayWays = 'none', listWrapper = C('#list_block ul'), waysWrapper = C('#ways_block ul');
		listWrapper.html('');
		waysWrapper.html('');
		console.log(list.arr());
		list.each(function(el, i) {
			displayList = 'block';
			var li = C.create('li').html(el.description()).param('id', i);
			var remover = C.create('span').html('delete').on('click', remove);
			li.append(remover);
			listWrapper.append(li);
		}).sort().each(function(el, i) {
			displayWays = 'block';
			var li = C.create('li').html(el.way());
			waysWrapper.append(li);
		});

		C('#list_block').css('display', displayList);
		C('#ways_block').css('display', displayWays);


	}

	reinit();
	dropdown.on('change', reinit);
	C('#clear_btn').on('click', clear);

	C('#add_btn').on('click', function() {
		var type = C('#card_type option:checked').value(),
			from = C('#card_from').value(),
			to = C('#card_to').value(),
			params = {};

		C('#card_params input').each(function(_, el) {
			var el = new C['node'](el);
			params[el.attr('name')] = el.attr('type') == 'checkbox' ? el.param('checked') : el.value();
		});

		list.add(new Card(type, from, to, params));
		C('#card_from, #card_to').value('');
		reinit();
		renderTrips();

		localStorage.setItem('data', JSON.stringify(list.arr()));
	});	

	var data = localStorage.getItem('data');
	if (data !== null && (data = JSON.parse(data))) {
		for (var i in data) {
			var card = new Card(data[i]);
			list.add(card);
		}
		renderTrips();
	}

});