Plotter.draw = function(external) {
	if (!this.isVisible()) {
		return;
	}
	var rep = this.getRepresentation();
	
	// GeneralObject.draw.call(this, external);
	
	// We need the group representing the svg plot.
	var group = d3.select(rep).select('g');
	group.attr('transform', 'translate(0, 0)');
	// d3.select(rep).attr("transform", "translate(0, 0)");
	
	this.drawPlotter(group.select('g'));
	this.drawContentPane($(rep).find('.objectcontent'));
}

/* Draws the plotter. */
Plotter.drawPlotter = function(chart) {
	chart.selectAll("g").remove();
	chart.selectAll("text").remove();
	chart.selectAll("path").remove();
	
	/*
	if (!$(group).hasClass("selected")) {
		chart
			.attr("stroke", this.getAttribute("linecolor"))
			.attr("stroke-width", this.getAttribute("linesize"));
	}
	*/
	
	// Get the content.
	var content = this.getContentAsObject();
	
	var width = $(window).width() - 70;
	var height = $(window).width() - 70;
	
	// Declare the x-axis.
	var x = d3.scale.linear()
		.range([0, width]);
		
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
	
	// Declare the y-axis.
	var y = d3.scale.linear()
		.range([height, 0]);
		
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
	
	var line = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });
	
	x.domain([content.xAxis.scale.min, content.xAxis.scale.max]);
	y.domain([content.yAxis.scale.min, content.yAxis.scale.max]);
	
	// Draw the x-axis.
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + y(0) + ")")
		.call(xAxis);
	
	chart.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis.tickSize(-height, 0).tickFormat(""));
	
	// Draw the label for the x-axis.
	chart.append("text")
        .attr("x", width / 2)
        .attr("y", y(0) + 30)
        .style("text-anchor", "middle")
        .text(content.xAxis.label);
	
	// Draw the y-axis.
	chart.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + x(0) + ", 0)")
		.call(yAxis);
	
	chart.append("g")
		.attr("class", "grid")
		.call(yAxis.tickSize(-width, 0).tickFormat(""));
	
	// Draw the label for the y-axis.
	chart.append("text")
		.attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", x(0) - 30)
        .style("text-anchor", "middle")
        .text(content.yAxis.label);
	
	// Draw the title of the plotter object.
	chart.append("text")
		.attr("x", width / 2)
		.attr("y", -5)
		.style("text-anchor", "middle")
		.text(content.title);
	
	var userData = this.findUserData(content.users);
	if (userData == null) {
		var user = ObjectManager.getUser();
		var userData = {name: user.username, color: user.color, values: []};
		content.users.push(userData);
		this.setContentAsJSON(content);
		content = this.getContentAsObject();
	}
	
	var data = userData.values.map(function(d) {
		return {
			x: d[0],
			y: d[1]
		};
	});
	
	// Draw the path which represents the chart.
	chart.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("style", "stroke: " + userData.color + ";")
		.attr("d", line);
}

Plotter.drawContentPane = function(pane) {
	var content = this.getContentAsObject();
    
	var form = pane.find('#plotterForm');
	if (form.length > 0) {
		// Update the content pane.
	} else {
		// Create the content pane.
		var form = $('<table id="plotterForm" style="width: 100%; font-size: 12px; text-align: center"></table>');
		var xValues = $('<tr></tr>');
		var yValues = $('<tr></tr>');
		
		var that = this;
		
		var userData = this.findUserData(content.users);
		if (userData == null) {
			var user = ObjectManager.getUser();
			var userData = {name: user.username, color: user.color, values: []};
			content.users.push(userData);
			this.setContentAsJSON(content);
			content = this.getContentAsObject();
		}
		
		for (var i = 0; i < userData.values.length; ++i) {
			var valuePair = $('<tr></tr>');
			var valueX = $('<td style="text-align: right"><span style="display: table-cell; vertical-align: middle; text-align: right">x<sub>' + i + '</sub></span></td><td style="text-align: left"><input class="input" style="width: 100%; text-align: right" type="text" size="8" name="x' + i + '" value="' + userData.values[i][0] + '" /></td>');
			var valueY = $('<td style="text-align: right"><span style="display: table-cell; vertical-align: middle; text-align: right">y<sub>' + i + '</sub></span></td><td style="text-align: left"><input class="input" style="width: 100%; text-align: right" type="text" size="8" name="y' + i + '" value="' + userData.values[i][1] + '" /></td>');
			$(valuePair).append(valueX);
			$(valuePair).append('<td style="width: 10%"></td>');
			$(valuePair).append(valueY);
			
			$(valueX).bind('keyup', {pos: i, val: valueX}, function(event) {
				var content = that.getContentAsObject();
				var userData = that.findUserData(content.users);
				userData.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
				if (event.keyCode == 13) {
					that.setContentAsJSON(content);
				}
			});
			$(valueY).bind('keyup', {pos: i, val: valueY}, function(event) {
				var content = that.getContentAsObject();
				var userData = that.findUserData(content.users);
				userData.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
				if (event.keyCode == 13) {
					that.setContentAsJSON(content);
				}
			});
			
			$(form).append(valuePair);
		}
		
		var addEntry = $('<input class="inputButton" style="margin-top: 10px; margin-bottom: 10px" type="button" value="Eintrag hinzufuegen" />');
		var row = $('<tr></tr>');
		var col = $('<td colspan="5"></td>');
		$(col).append(addEntry);
		$(row).append(col);
		$(form).append(row);
		$(addEntry).bind('click', function() {
			var content = that.getContentAsObject();
			
			var userData = that.findUserData(content.users);
			var newIndex = userData.values.length;
			var lastEntry;
			if (newIndex == 0) {
				lastEntry = [0, 0];
			} else {
				lastEntry = userData.values[newIndex - 1];
			}
			userData.values.push(lastEntry);
			that.setContentAsJSON(content);
			
			var valuePair = $('<tr></tr>');
			var valueX = $('<td align="center">x' + newIndex + '</td><td><input class="input" type="text" size="8" style="width: 100%; text-align: right" name="x' + newIndex + '" value="' + userData.values[newIndex][0] + '" /></td>');
			var valueY = $('<td align="center">y' + newIndex + '</td><td><input class="input" type="text" size="8" style="width: 100%; text-align: right" name="y' + newIndex + '" value="' + userData.values[newIndex][1] + '" /></td>');
			$(valuePair).append(valueX);
			$(valuePair).append('<td style="width: 10%"></td>');
			$(valuePair).append(valueY);
			
			$(valueX).bind('keyup', {pos: newIndex, val: valueX}, function(event) {
				var content = that.getContentAsObject();
				var userData = that.findUserData(content.users);
				userData.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
				if (event.keyCode == 13) {
					that.setContentAsJSON(content);
				}
			});
			$(valueY).bind('keyup', {pos: newIndex, val: valueY}, function(event) {
				var content = that.getContentAsObject();
				var userData = that.findUserData(content.users);
				userData.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
				if (event.keyCode == 13) {
					that.setContentAsJSON(content);
				}
			});
			
			$(row).before(valuePair);
		});
		
		pane.append(form);
	}
    
}

/* Creates the representation for the desktop version of the plotter. */
Plotter.createRepresentation = function(parent) {
	if (!this.isVisible()) {
		return;
	}
	var margin = { top: 20, right: 20, bottom: 50, left: 50},
		width = $(window).width() - margin.left - margin.right,
		height = $(window).width() - margin.top - margin.bottom;
	
	var rep = document.createElement('div');
	rep.setAttribute('id', this.getAttribute('id'));
	//var rep = $('<div id="' + this.getAttribute('id') + '"></div>');
	$(parent).append(rep);
	
	var group = d3.select(rep).append('svg')
		.attr('width', $(window).width())
		.attr('height', $(window).width())
		.attr('style', 'background-color: white')
		.append('g')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);
	
	var chart = group.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	
	group.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', 'transparent')
		.attr('class', 'borderrect');
	
	$(rep).append('<div class="objectcontent"></div>');
	
	this.initGUI(rep);
	return rep;
	/*
	var rep = d3.select("svg").append("g")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", this.getAttribute("id"));
	
	// rep.dataObject = this;
	
	var chart = rep.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	rep.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", "transparent")
		.attr("class", "borderrect");
	
	this.initGUI(rep.node());
	return rep.node();
	*/
}

Plotter.checkTransparency = function(attribute, value) {
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if (linecolor === 'transparent') {
		return false;
	} else return true;
}

/* Very ugly, but works for the prototype. DRY!!! */
Plotter.buildFormForEditableContent = function() {
	var content = this.getContentAsObject();
    
    var dom = $('<table style="width: 100%; font-size: 12px; text-align: center"></table>');
    var xValues = $('<tr></tr>');
    var yValues = $('<tr></tr>');
	
	var that = this;
	
	var userData = this.findUserData(content.users);
	if (userData == null) {
		var user = ObjectManager.getUser();
		var userData = {name: user.username, color: user.color, values: []};
		content.users.push(userData);
		this.setContentAsJSON(content);
		content = this.getContentAsObject();
	}
    
    for (var i = 0; i < userData.values.length; ++i) {
        var valuePair = $('<tr></tr>');
        var valueX = $('<td style="text-align: right"><span style="display: table-cell; vertical-align: middle; text-align: right">x<sub>' + i + '</sub></span></td><td style="text-align: left"><input class="input" style="width: 100%; text-align: right" type="text" size="8" name="x' + i + '" value="' + userData.values[i][0] + '" /></td>');
		var valueY = $('<td style="text-align: right"><span style="display: table-cell; vertical-align: middle; text-align: right">y<sub>' + i + '</sub></span></td><td style="text-align: left"><input class="input" style="width: 100%; text-align: right" type="text" size="8" name="y' + i + '" value="' + userData.values[i][1] + '" /></td>');
        $(valuePair).append(valueX);
		$(valuePair).append('<td style="width: 10%"></td>');
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: i, val: valueX}, function(event) {
            var content = that.getContentAsObject();
			var userData = that.findUserData(content.users);
            userData.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
        });
        $(valueY).bind('keyup', {pos: i, val: valueY}, function(event) {
            var content = that.getContentAsObject();
			var userData = that.findUserData(content.users);
            userData.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
        });
        
        $(dom).append(valuePair);
    }
    
    var addEntry = $('<input class="inputButton" style="margin-top: 10px; margin-bottom: 10px" type="button" value="Eintrag hinzufuegen" />');
    var row = $('<tr></tr>');
    var col = $('<td colspan="5"></td>');
    $(col).append(addEntry);
    $(row).append(col);
    $(dom).append(row);
    $(addEntry).bind('click', function() {
        var content = that.getContentAsObject();
		
		var userData = that.findUserData(content.users);
		var newIndex = userData.values.length;
		var lastEntry;
		if (newIndex == 0) {
			lastEntry = [0, 0];
		} else {
			lastEntry = userData.values[newIndex - 1];
		}
        userData.values.push(lastEntry);
        that.setContentAsJSON(content);
		
		var valuePair = $('<tr></tr>');
        var valueX = $('<td align="center">x' + newIndex + '</td><td><input class="input" type="text" size="8" style="width: 100%; text-align: right" name="x' + newIndex + '" value="' + userData.values[newIndex][0] + '" /></td>');
		var valueY = $('<td align="center">y' + newIndex + '</td><td><input class="input" type="text" size="8" style="width: 100%; text-align: right" name="y' + newIndex + '" value="' + userData.values[newIndex][1] + '" /></td>');
        $(valuePair).append(valueX);
		$(valuePair).append('<td style="width: 10%"></td>');
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: newIndex, val: valueX}, function(event) {
            var content = that.getContentAsObject();
			var userData = that.findUserData(content.users);
            userData.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
			if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
        });
        $(valueY).bind('keyup', {pos: newIndex, val: valueY}, function(event) {
            var content = that.getContentAsObject();
			var userData = that.findUserData(content.users);
            userData.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
        });
        
        $(row).before(valuePair);
    });
    
    return dom;
}