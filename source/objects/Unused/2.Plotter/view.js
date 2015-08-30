Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
	GeneralObject.draw.call(this, external);
	
	this.redraw(rep);
}

/* Draws the content of the plotter. */
Plotter.redraw = function(rep) {
	d3.select(rep).select("rect")
		.attr("width", this.getAttribute("width"))
		.attr("height", this.getAttribute("height"));
	
	var chart = d3.select(rep).select("g");
	chart.selectAll("g").remove();
	chart.selectAll("text").remove();
	chart.selectAll("path").remove();
	
	if (!$(rep).hasClass("selected")) {
		chart
			.attr("stroke", this.getAttribute("linecolor"))
			.attr("stroke-width", this.getAttribute("linesize"));
	}
	
	// Get the content.
	var content = this.getContentAsObject();
	
	var width = this.getAttribute("width") - 70;
	var height = this.getAttribute("height") - 50;
	
	// Declare the x-axis.
	var x = d3.scale.linear()
		.range([0, width]);
		
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(content.xAxis.ticks.major);
	
	// Declare the y-axis.
	var y = d3.scale.linear()
		.range([height, 0]);
		
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(content.yAxis.ticks.major);
	
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
	
	var x0 = x(0);
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
	
	for (var i = 0; i < content.users.length; ++i) {
		var data = content.users[i].values.map(function(d) {
			return {
				x: d[0],
				y: d[1]
			};
		});
	
		// Draw the path which represents the chart.
		chart.append("path")
			.datum(data)
			.attr("class", "line")
			.attr("style", "stroke: " + content.users[i].color + ";")
			.attr("d", line);
	}
}

/* Creates the representation for the desktop version of the plotter. */
Plotter.createRepresentation = function(parent) {
	this.setAttribute("width", 500);
	this.setAttribute("height", 400);
	var margin = { top: 20, right: 20, bottom: 50, left: 50},
		width = 500 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
	
	var rep = d3.select("#room_left").append("g")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", this.getAttribute("id"));
	
	// rep.dataObject = this;
	
	var chart = rep.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	rep.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "transparent")
		.attr("class", "borderrect");
	
	this.initGUI(rep.node());
	return rep.node();
}

Plotter.editValueTable = function() {
	var content = this.getContentAsObject();
	var dom = $('<table></table>');
	var titleSettings = $("<tr></tr>");
	var xAxisSettings = $("<tr></tr>");
	var yAxisSettings = $("<tr></tr>");
	
	var title  = $('<td>Titel:</td><td><input type="text" name="title" value="' + content.title + '" /></td>');
	var xLabel = $('<td>Label X-Achse:</td><td><input type="text" name="xLabel" value="' + content.xAxis.label + '" /></td>');
	var xMin   = $('<td>Minimum X-Achse:</td><td><input type="text" name="xMin" value="' + content.xAxis.scale.min + '" /></td>');
	var xMax   = $('<td>Maximum X-Achse:</td><td><input type="text" name="xMax" value="' + content.xAxis.scale.max + '" /></td>');
	var yLabel = $('<td>Label Y-Achse:</td><td><input type="text" name="yLabel" value="' + content.yAxis.label + '" /></td>');
	var yMin   = $('<td>Minimum Y-Achse:</td><td><input type="text" name="yMin" value="' + content.yAxis.scale.min + '" /></td>');
	var yMax   = $('<td>Maximum Y-Achse:</td><td><input type="text" name="yMax" value="' + content.yAxis.scale.max + '" /></td>');
	
	$(titleSettings).append(title);
	$(xAxisSettings).append(xLabel);
	$(xAxisSettings).append(xMin);
	$(xAxisSettings).append(xMax);
	$(yAxisSettings).append(yLabel);
	$(yAxisSettings).append(yMin);
	$(yAxisSettings).append(yMax);
	$(dom).append(titleSettings);
	$(dom).append(xAxisSettings);
	$(dom).append(yAxisSettings);
	
	var buttons = {};
	
	var that = this;
	
	buttons[GUI.translate("save")] = function(domContent){
		var title = $(domContent).find('input[name=title]').val();
		var xLabel = $(domContent).find('input[name=xLabel]').val();
		var xMin = $(domContent).find('input[name=xMin]').val();
		var xMax = $(domContent).find('input[name=xMax]').val();
		var yLabel = $(domContent).find('input[name=yLabel]').val();
		var yMin = $(domContent).find('input[name=yMin]').val();
		var yMax = $(domContent).find('input[name=yMax]').val();
		
		content.title = title;
		content.xAxis.label = xLabel;
		content.xAxis.scale.min = xMin;
		content.xAxis.scale.max = xMax;
		content.yAxis.label = yLabel;
		content.yAxis.scale.min = yMin;
		content.yAxis.scale.max = yMax;
		
		that.setContentAsJSON(content);
		return true;
	};
	
	GUI.dialog("Plotter Configuration", dom, buttons)
}

Plotter.setViewWidth = function(value) {
	var rep = this.getRepresentation();
	var content = this.getContentAsObject();
	
	var x = this.getAttribute("x");
	var y = this.getAttribute("y");
	
	d3.select(rep).attr("width", value);
	d3.select(rep).attr("transform", "translate(" + x + "," + y + ")");
	
	GUI.adjustContent(this);
	
	this.redraw(rep);
}

Plotter.setViewHeight = function(value) {
	var rep = this.getRepresentation();
	var content = this.getContentAsObject();
	
	var x = this.getAttribute("x");
	var y = this.getAttribute("y");
	
	d3.select(rep).attr("height", value);
	d3.select(rep).attr("transform", "translate(" + x + "," + y + ")");
	
	GUI.adjustContent(this);
	
	this.redraw(rep);
}

Plotter.getViewBoundingBoxX = function() {
	return this.getViewX();

	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		return this.getViewX();
	} else {
		return this.getRepresentation().getBBox().x;
	}
}

Plotter.getViewBoundingBoxY = function() {
	return this.getViewY();
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		return this.getViewY();
	} else {
		return this.getRepresentation().getBBox().y;
	}
}

Plotter.getViewBoundingBoxWidth = function() {
	return this.getViewWidth();
}

Plotter.getViewBoundingBoxHeight = function() {
	return this.getViewHeight();
}

Plotter.checkTransparency = function(attribute, value) {
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if (linecolor === 'rgba(0, 0, 0, 0)') {
		return false;
	} else return true;
}