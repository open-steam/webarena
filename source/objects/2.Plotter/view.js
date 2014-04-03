Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
	GeneralObject.draw.call(this, external);
	
	this.redraw(rep);
	return;
	
	// We need the svg here, because we have some dynamic tags.
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	GeneralObject.draw.call(this, external);
	
	var content = this.getContentAsObject();
	var scaleX = this.getAttribute('width') / (content.xAxis.scale.max - content.xAxis.scale.min);
	var scaleY = this.getAttribute('height') / (content.yAxis.scale.max - content.yAxis.scale.min);
	
	this.drawInternal(rep, svg, scaleX, scaleY);
}

/* Draws the content of the plotter. */
Plotter.redraw = function(rep) {
	// TODO: Draw content here.
	d3.select(rep).select("rect")
		.attr("width", this.getAttribute("width"))
		.attr("height", this.getAttribute("height"));
	
	var chart = d3.select(rep).select("g");
	chart.selectAll("g").remove();
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
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
	
	// Draw the y-axis.
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	
	var data = content.values.map(function(d) {
		return {
			x: d[0],
			y: d[1]
		};
	});
	
	// Draw the path which represents the chart.
	chart.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);
}

Plotter.drawInternal = function(rep, svg, scaleX, scaleY) {
	return;
	// The content is a JSON string, so we must parse it.
	var content = this.getContentAsObject();
	
	var borderRect = $(rep).find(".borderRect");
	$(borderRect).attr("width", this.getAttribute('width'));
	$(borderRect).attr("height", this.getAttribute('height'));
	
	// Get the plot group.
	var plot = $(rep).find(".plot");
	// Delete the old plot.
	$(plot).empty();
	
	/*
	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	*/
	
	// Check if we have a visible x-axis.
	if (content.yAxis.scale.min <= 0 && content.yAxis.scale.max >= 0) {
		this.plotXAxis(svg, plot,
			content.xAxis.scale.min, content.xAxis.scale.max,
			content.xAxis.ticks.major, content.xAxis.ticks.minor,
			content.yAxis.scale.max, scaleX, scaleY);
	}
	
	// Check if we have a visible y-axis.
	if (content.xAxis.scale.min <= 0 && content.xAxis.scale.max >= 0) {
		this.plotYAxis(svg, plot,
		content.yAxis.scale.min, content.yAxis.scale.max,
		content.yAxis.ticks.major, content.yAxis.ticks.minor,
		content.xAxis.scale.min, scaleX, scaleY);
	}
	
	// Plot the points.
	this.plotPoints(svg, plot,
		content.points,
		content.xAxis.scale.min, content.yAxis.scale.max,
		scaleX, scaleY);
}

Plotter.plotXAxis = function (svg, parent, scaleMin, scaleMax, major, minor, yOffset, scaleX, scaleY) {
	// Create a group which represents the x-axis.
	var xAxis = svg.group(parent);
	
	// Create the x-axis.
	$(xAxis).attr("stroke", "black");
	$(xAxis).attr("stroke-width", "1");
	svg.line(xAxis, scaleMin*scaleX, yOffset*scaleY, scaleMax*scaleX, yOffset*scaleY);
	
	// Draw minor and major indicators on the x-axis.
	var step = minor;
	if (minor < Number.MIN_VALUE) {
		step = major;
		if (major < Number.MIN_VALUE) {
			return;
		}
	}
	
	if (major < Number.MIN_VALUE) {
		for (var x = scaleMin; x <= scaleMax; x += step) {
			svg.line(xAxis, x*scaleX, (-2.5 + yOffset)*scaleY, x*scaleX, (2.5 + yOffset)*scaleY);
		}
		return;
	}
	
	for (var x = scaleMin; x <= scaleMax; x += step) {
		if ((x - scaleMin) / major < Number.MIN_VALUE) {
			svg.line(xAxis, x*scaleX, (-5 + yOffset)*scaleY, x*scaleX, (5 + yOffset)*scaleY);
		} else {
			svg.line(xAxis, x*scaleX, (-2.5 + yOffset)*scaleY, x*scaleX, (2.5 + yOffset)*scaleY);
		}
	}
}

Plotter.plotYAxis = function (svg, parent, scaleMin, scaleMax, major, minor, xOffset, scaleX, scaleY) {
	// Create a group which represents the y-axis.
	var yAxis = svg.group(parent);
	
	// Create the y-axis.
	$(yAxis).attr("stroke", "black");
	$(yAxis).attr("stroke-width", "1");
	svg.line(yAxis, xOffset*scaleX, scaleMin*scaleY, xOffset*scaleX, scaleMax*scaleY);
	
	// Draw minor and major indicators on the y-axis.
	var step = minor;
	if (minor < Number.MIN_VALUE) {
		step = major;
		if (major < Number.MIN_VALUE) {
			return;
		}
	}
	
	if (major < Number.MIN_VALUE) {
		for (var y = scaleMax; y >= scaleMin; y -= step) {
			svg.line(yAxis, (-2.5 + xOffset)*scaleX, y*scaleY, (2.5 + xOffset)*scaleX, y*scaleY);
		}
		return;
	}
	
	for (var y = scaleMax; y >= scaleMin; y -= step) {
		if ((scaleMax - y) / major < Number.MIN_VALUE) {
			svg.line(yAxis, (-5 + xOffset)*scaleX, y*scaleY, (5 + xOffset)*scaleX, y*scaleY);
		} else {
			svg.line(yAxis, (-2.5 + xOffset)*scaleX, y*scaleY, (2.5 + xOffset)*scaleX, y*scaleY);
		}
	}
}

Plotter.plotPoints = function(svg, rep, points, xOffset, yOffset, scaleX, scaleY) {
	// Compute the points with the right offset.
	var pointsWithOffset = [];
	
	for (var i = 0; i < points.length; ++i) {
		var x = (points[i][0] - xOffset)*scaleX;
		var y = (yOffset - points[i][1])*scaleY;
		
		pointsWithOffset.push([x, y]);
	}
	
	// Create the polyline with the computed points.
	var polyline = svg.polyline(rep, pointsWithOffset);
	
	// Set attributes for the polyline.
	$(polyline).attr("stroke", this.getAttribute('linecolor'));
	$(polyline).css("fill", this.getAttribute('fill'));
	$(polyline).attr("stroke-width", this.getAttribute('linesize'));
}

/* Creates the representation for the desktop version of the plotter. */
Plotter.createRepresentation = function(parent) {	
	var margin = { top: 20, right: 20, bottom: 30, left: 50},
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
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", "transparent")
		.attr("class", "borderrect");
	
	this.initGUI(rep);
	return rep;
}

Plotter.buildMobileRep = function(svg) {
	var width = $(window).width();
	var height = $(window).width();
	
	svg.clear(false);
	
	var rep = svg.group();
	var plot = svg.group(rep);
	var polyline = svg.polyline(plot, [], {});
	
	$(plot).addClass("plot");
	
	var content = this.getContentAsObject();
	var scaleX = $(window).width() / (content.xAxis.scale.max - content.xAxis.scale.min);
	var scaleY = $(window).height()/2 / (content.yAxis.scale.max - content.yAxis.scale.min);
	
	$(rep).attr("id", this.getAttribute('id'));
	
	this.drawInternal(rep, svg, scaleX, scaleY);
	
	return rep;
}

Plotter.buildFormForEditableContent = function() {
	var content = this.getContentAsObject();
    
    var dom = $('<table style="width: 100%; text-align: center"></table>');
    var xValues = $('<tr></tr>');
    var yValues = $('<tr></tr>');
	
	var that = this;
    
    for (var i = 0; i < content.points.length; ++i) {
        var valuePair = $('<tr></tr>');
        var valueX = $('<td>x' + i + '</td><td><input type="text" size="8" name="x' + i + '" value="' + content.points[i][0] + '" /></td>');
		var valueY = $('<td>y' + i + '</td><td><input type="text" size="8" name="y' + i + '" value="' + content.points[i][1] + '" /></td>');
        $(valuePair).append(valueX);
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: i, val: valueX}, function(event) {
            var content = that.getContentAsObject();
            content.points[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
            that.setContentAsJSON(content);
            
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
        });
        $(valueY).bind('keyup', {pos: i, val: valueY}, function(event) {
            var content = that.getContentAsObject();
            content.points[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            that.setContentAsJSON(content);
            
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
        });
        
        $(dom).append(valuePair);
    }
    
    var addEntry = $('<input type="button" value="Eintrag hinzufuegen" />');
    var row = $('<tr></tr>');
    var col = $('<td colspan="4"></td>');
    $(col).append(addEntry);
    $(row).append(col);
    $(dom).append(row);
    $(addEntry).bind('click', function() {
        var content = that.getContentAsObject();
		
		var newIndex = content.points.length;
		var lastEntry = content.points[newIndex - 1];
        content.points.push(lastEntry);
        that.setContentAsJSON(content);
        
        var rep = that.buildMobileRep(GUI.mobileSVG/*$(canvas).svg('get')*/);
        $(rep).attr("width", $(window).width());
        $(rep).attr("width", $(window).width());
		
		var valuePair = $('<tr></tr>');
        var valueX = $('<td>x' + newIndex + '</td><td><input type="text" size="8" name="x' + newIndex + '" value="' + content.points[newIndex][0] + '" /></td>');
		var valueY = $('<td>y' + newIndex + '</td><td><input type="text" size="8" name="y' + newIndex + '" value="' + content.points[newIndex][1] + '" /></td>');
        $(valuePair).append(valueX);
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: newIndex, val: valueX}, function(event) {
            var content = that.getContentAsObject();
            content.points[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
            that.setContentAsJSON(content);
            
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
        });
        $(valueY).bind('keyup', {pos: newIndex, val: valueY}, function(event) {
            var content = that.getContentAsObject();
            content.points[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            that.setContentAsJSON(content);
            
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
        });
        
        $(row).before(valuePair);
    });
    
    return dom;
}

Plotter.editValueTable = function() {
	GUI.editValueTable(this);
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
	/*
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	this.drawInternal(rep, svg);
	*/
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
	/*
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	this.drawInternal(rep, svg);
	*/
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
	if (linecolor === 'transparent') {
		return false;
	} else return true;
}