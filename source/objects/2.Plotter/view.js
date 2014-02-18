Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
	// The content is a JSON string, so we must parse it.
	var content;
	if (typeof this.content != "string") {
		var that = this;
		this.getContentAsString(function(data) {
			if (!data) {
				that.content = undefined;
			} else {
				that.content = data;
			}
		});
		content = JSON.parse(this.content);
	} else {
		content = JSON.parse(this.content);
	}
	
	// We need the svg here, because we have some dynamic tags.
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	GeneralObject.draw.call(this, external);
	
	var borderRect = $(rep).find(".borderRect");
	$(borderRect).attr("width", this.getAttribute('width'));
	$(borderRect).attr("height", this.getAttribute('height'));
	
	var scaleX = this.getAttribute('width') / (content.xAxis.scale.max - content.xAxis.scale.min);
	var scaleY = this.getAttribute('height') / (content.yAxis.scale.max - content.yAxis.scale.min);
	
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

Plotter.drawInternal = function() {
	var rep = this.getRepresentation();
	
	// The content is a JSON string, so we must parse it.
	var content;
	if (typeof this.content != "string") {
		var that = this;
		this.getContentAsString(function(data) {
			if (!data) {
				that.content = undefined;
			} else {
				that.content = data;
			}
		});
		content = JSON.parse(this.content);
	} else {
		content = JSON.parse(this.content);
	}
	
	// We need the svg here, because we have some dynamic tags.
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	var borderRect = $(rep).find(".borderRect");
	$(borderRect).attr("width", this.getAttribute('width'));
	$(borderRect).attr("height", this.getAttribute('height'));
	
	var scaleX = this.getAttribute('width') / (content.xAxis.scale.max - content.xAxis.scale.min);
	var scaleY = this.getAttribute('height') / (content.yAxis.scale.max - content.yAxis.scale.min);
	
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

Plotter.createRepresentation = function(parent) {
	// We supply the representation for the desktop and mobilephone version.
	var svg;
	if (GUI.guiType == 'mobilephone') {
		svg = GUI.mobileSVG;
	} else {
		svg = GUI.svg;
	}
	
	// Create the representation.
	var rep = svg.group(parent, this.getAttribute('id'));
	// The border rect.
	var borderRect = svg.rect(rep, 0, 0, 10, 10);
	// The plot itself.
	var plot = svg.group(rep);
	var polyline = svg.polyline(plot, [], {});
	
	rep.dataObject = this;
	
	$(rep).attr("id", this.getAttribute('id'));
	$(borderRect).attr("fill", "transparent");
	$(borderRect).addClass("borderRect");
	// Add a class for finding the plot representation.
	$(plot).addClass("plot");
	
	this.initGUI(rep);
	
	return rep;
}

Plotter.editValueTable = function() {
	GUI.editValueTable(this);
}

Plotter.setViewWidth = function(value) {
	var rep = this.getRepresentation();
	var content;
	if (typeof this.content != "string") {
		var that = this;
		this.getContentAsString(function(data) {
			if (!data) {
				that.content = undefined;
			} else {
				that.content = data;
			}
		});
		content = JSON.parse(this.content);
	} else {
		content = JSON.parse(this.content);
	}
	
	var x = this.getAttribute('x');
	var y = this.getAttribute('y');
	
	$(rep).attr("width", value);
	$(rep).attr("height", value);
	$(rep).attr("transform", "translate(" + x + "," + y + ")");
	//$(rep).find(".plot").attr("transform", "translate(" + x + "," + y + ") scale(" + scaleX + "," + scaleX + ")");
	
	GUI.adjustContent(this);
	this.drawInternal();
}

Plotter.setViewHeight = function(value) {
	var rep = this.getRepresentation();
	var content;
	if (typeof this.content != "string") {
		var that = this;
		this.getContentAsString(function(data) {
			if (!data) {
				that.content = undefined;
			} else {
				that.content = data;
			}
		});
		content = JSON.parse(this.content);
	} else {
		content = JSON.parse(this.content);
	}
	
	var x = this.getAttribute('x');
	var y = this.getAttribute('y');
	
	$(rep).attr("width", value);
	$(rep).attr("height", value);
	$(rep).attr("transform", "translate(" + x + "," + y + ")");
	//$(rep).find(".plot").attr("transform", "translate(" + x + "," + y + ") scale(" + scaleY + "," + scaleY + ")");
	
	GUI.adjustContent(this);
	this.drawInternal();
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

Plotter.getMinMaxY = function (points) {
	if (points[0] == null) {
		return null;
	}
	
	var yExtends = {min:points[0][1], max:points[0][1]};
	for (var i = 1; i < points.length; ++i) {
		if (points[i][1] < yExtends.min) {
			yExtends.min = points[i][1];
		} else if (points[i][1] > yExtends.max) {
			yExtends.max = points[i][1];
		}
	}
	
	return yExtends;
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