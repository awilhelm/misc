var counter = 0

function find_node(node, expression)
{
	return document.evaluate(expression, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
}

function open_()
{
	open_1_([document.getElementById('large').value, document.getElementById('small').value, document.getElementById('ranges').value])
}

function open_1_(format)
{
	// évalue les intervales de nombres
	var ranges = format[2].split(/\s+/)
	var new_ranges = []
	var groups = [0]
	for(var i in ranges)
	{
		if(ranges[i] == '*')
		{
			groups.push(0)
			continue
		}
		++groups[groups.length - 1]
		var range = ranges[i].split(',')
		ranges[i] = []
		for(var j in range)
		{
			var n = range[j].match(/^(\d+)\W+(\d+)$/)
			if(n)
			{
				for(var k = n[1]; k <= n[2]; ++k)
				{
					var number = k.toString()
					while(number.length < n[1].length)
					{
						number = '0' + number
					}
					ranges[i].push(number)
				}
			}
			else
			{
				ranges[i].push(range[j])
			}
		}
		new_ranges.push(ranges[i])
	}

	// affiche les miniatures de plus haut niveau
	open_3_(format, new_ranges, groups)
}

function open_3_(format, ranges, groups)
{
	const prototype = find_node(document, '//fieldset')
	const frame = prototype.parentNode.appendChild(prototype.cloneNode(true))
	const hidden_large = find_node(frame, './/input[1]')
	hidden_large.setAttribute('name', 'large_' + counter)
	hidden_large.setAttribute('value', format[0])
	const hidden_small = find_node(frame, './/input[2]')
	hidden_small.setAttribute('name', 'small_' + counter)
	hidden_small.setAttribute('value', format[1])
	const hidden_ranges = find_node(frame, './/input[3]')
	hidden_ranges.setAttribute('name', 'ranges_' + counter)
	hidden_ranges.setAttribute('value', format[2])
	find_node(frame, './/td[1]/*').value = format[0]
	find_node(frame, './/td[2]/*').value = format[2]
	++counter

	// construit la liste des images à afficher
	var list = [format]
	var queue
	while(groups.length && groups[0]--)
	{
		queue = list
		list = []
		var set = {}
		while(queue.length)
		{
			var tuple = queue.shift()
			for(var i in ranges[0])
			{
				var new_tuple = new Array(tuple.length)
				for(var k in tuple)
				{
					new_tuple[k] = tuple[k].replace(/\{0\}/g, ranges[0][i]).replace(/\{(\d+)\}/g, function(s, n) {return '{' + (n - 1) + '}'})
				}
				new_tuple[2] = tuple[2].split(' ').slice(1).join(' ').replace(/^\*\s*/, '')
				if(!(new_tuple in set))
				{
					set[new_tuple] = true
					list.push(new_tuple)
				}
			}
		}
		ranges = ranges.slice(1)
	}

	// affiche les images
	for(var i in list)
	{
		var link = frame.appendChild(document.createElement('a'))
		link.title = list[i][0]
		var image = link.appendChild(document.createElement('img'))
		image.alt = ''
		if(groups.length > 1)
		{
			if(!list[i][1].length)
			{
				list[i][1] = list[i][0]
			}
			link.setAttribute('class', 'small')
			link.href = list[i][0]
			link.onclick = open_3_.bind(this, list[i], ranges, groups.slice(1))
			image.src = list[i][1].replace(/\{(\d+)\}/g, function(s, n) {return ranges[parseInt(n)][0]})
		}
		else
		{
			link.setAttribute('class', 'large')
			image.src = list[i][0]
		}
	}

	return false
}

function load_()
{
	var queue = window.location.search.slice(1).split('&')
	var indexes = []
	var list = []
	while(queue.length)
	{
		var data = queue.shift().split('=')
		switch(data[0])
		{
			case 'style':
			{
				var styles = document.getElementsByTagName('link')
				for(var i = 0; i < styles.length; ++i)
				{
					if(styles[i].getAttribute('rel').indexOf('style') != -1 && styles[i].getAttribute('title'))
					{
						styles[i].disabled = (styles[i].getAttribute('title') != data[1])
					}
				}
				break
			}
			default:
			{
				data[0] = data[0].split('_')
				var k = ['large', 'small', 'ranges'].indexOf(data[0][0])
				if(k >= 0)
				{
					var i = indexes.indexOf(data[0][1])
					if(i < 0)
					{
						i = list.length
						list.push(new Array(3))
						indexes.push(data[0][1])
					}
					list[i][k] = decodeURIComponent(data[1].replace(/\+/g, '%20'))
				}
			}
		}
	}
	for(var i in list)
	{
		try
		{
			open_1_(list[i])
		}
		catch(error)
		{
		}
	}
}

function save_(form)
{
	var styles = document.getElementsByTagName('link')
	for(var i = 0; i < styles.length; ++i)
	{
		if(styles[i].getAttribute('rel').indexOf('style') != -1 && styles[i].getAttribute('title') && !styles[i].disabled)
		{
			form.elements['style'].value = styles[i].getAttribute('title')
		}
	}
}

function edit_(button)
{
	const frame = find_node(button, 'ancestor::fieldset')
	document.getElementById('large').value = find_node(frame, './/input[1]').value
	document.getElementById('small').value = find_node(frame, './/input[2]').value
	document.getElementById('ranges').value = find_node(frame, './/input[3]').value
}

function close_(button)
{
	const frame = find_node(button, 'ancestor::fieldset')
	frame.parentNode.removeChild(frame)
}

function collapse_(button)
{
	const frame = find_node(button, 'ancestor::fieldset')
	button.value = frame.className ? '−' : '+'
	frame.className = frame.className ? '' : 'collapsed'
}
