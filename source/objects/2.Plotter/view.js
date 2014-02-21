Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
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

Plotter.drawInternal = function(rep, svg, scaleX, scaleY) {
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
        var valueX = $('<td>x' + i + '</td><td><input type="text" name="x' + i + '" value="' + content.points[i][0] + '" /></td>');
		var valueY = $('<td>y' + i + '</td><td><input type="text" name="y' + i + '" value="' + content.points[i][1] + '" /></td>');
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
        var valueX = $('<td>x' + newIndex + '</td><td><input type="text" name="x' + newIndex + '" value="' + content.points[newIndex][0] + '" /></td>');
		var valueY = $('<td>y' + newIndex + '</td><td><input type="text" name="y' + newIndex + '" value="' + content.points[newIndex][1] + '" /></td>');
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
	
	var x = this.getAttribute('x');
	var y = this.getAttribute('y');
	
	$(rep).attr("width", value);
	$(rep).attr("height", value);
	$(rep).attr("transform", "translate(" + x + "," + y + ")");
	
	GUI.adjustContent(this);
	this.drawInternal(rep, GUI.svg);
}

Plotter.setViewHeight = function(value) {
	var rep = this.getRepresentation();
	var content = this.getContentAsObject();
	
	var x = this.getAttribute('x');
	var y = this.getAttribute('y');
	
	$(rep).attr("width", value);
	$(rep).attr("height", value);
	$(rep).attr("transform", "translate(" + x + "," + y + ")");
	
	GUI.adjustContent(this);
	this.drawInternal(rep, GUI.svg);
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