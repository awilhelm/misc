var counter = 0

function find_node(node, expression)
{
	return document.evaluate(expression, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
}

function open_()
{
	open_1_([document.getElementById('large').value, document.getElementById('small').value, document.getElementById('ranges').value])
}

function open_1_(format) // the ranges are still in text form and need parsing
{
	var ranges = format[2].split(/\s+/)
	var new_ranges = [] // will hold the ranges
	var groups = [0] // will hold the number of ranges in each group
	for(var i in ranges)
	{
		if(ranges[i] == '*') // an asterisk delimits two levels of hierarchy
		{
			groups.push(0)
			continue
		}
		++groups[groups.length - 1]
		var range = ranges[i].split(',') // a comma delimits the parts of a range
		ranges[i] = [] // will hold the expanded range
		for(var j in range)
		{
			var n = range[j].match(/^(\d+)\W+(\d+)$/) // any other punctuation delimits the upper- and lower-bound of a range
			if(n)
			{
				for(var k = n[1]; k <= n[2]; ++k)
				{
					var number = k.toString()
					while(number.length < n[1].length)
					{
						number = '0' + number // add leading zeros
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

	open_3_(format, new_ranges, groups) // show images for the highest level in the hierarchy
}

function open_3_(format, ranges, groups) // the ranges were already parsed
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

	// -- compile a list of images to be shown

	var list = [format]
	var queue
	while(groups.length && groups[0]--)
	{
		queue = list
		list = []
		var set = {}
		while(queue.length) // do a non-recursive breadth-first traversal
		{
			var tuple = queue.shift()
			for(var i in ranges[0])
			{
				var new_tuple = new Array(tuple.length)
				for(var k in tuple)
				{
					new_tuple[k] = tuple[k].replace(/\{0\}/g, ranges[0][i]).replace(/\{(\d+)\}/g, function(s, n) {return '{' + (n - 1) + '}'})
				}
				new_tuple[2] = tuple[2].split(' ').slice(1).join(' ').replace(/^\*\s*/, '') // remove the (already visited) first range and the (now useless) first delimiter
				if(!(new_tuple in set))
				{
					set[new_tuple] = true // ensure that there is no duplicate
					list.push(new_tuple) // push the new state
				}
			}
		}
		ranges = ranges.slice(1)
	}

	// -- show each image

	for(var i in list)
	{
		var link = frame.appendChild(document.createElement('a'))
		link.title = list[i][0]
		var image = link.appendChild(document.createElement('img'))
		image.alt = ''
		if(groups.length > 1) // we want thumbnails
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
		else // we want full-size images
		{
			link.setAttribute('class', 'large')
			image.src = list[i][0]
		}
	}

	return false // do not propagate the event
}

function load_()
{
	var queue = window.location.search.slice(1).split('&') // the first character is a question mark; ampersands delimit the parameters
	var list = {} // will hold galleries to be loaded
	while(queue.length)
	{
		var data = queue.shift().split('=') // an equals sign delimit a parameter name and its value
		switch(data[0])
		{
			case 'style': // set the style sheet
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
			default: // add a gallery
			{
				data[0] = data[0].split('_') // a low line delimit a parameter name and its associated gallery
				var k = ['large', 'small', 'ranges'].indexOf(data[0][0])
				if(k >= 0)
				{
					if(!(data[0][1] in list))
					{
						list[data[0][1]] = new Array(3)
					}
					list[data[0][1]][k] = decodeURIComponent(data[1].replace(/\+/g, '%20'))
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
		catch(error) // probably due to invalid parameters
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
