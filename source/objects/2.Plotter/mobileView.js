Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
	// GeneralObject.draw.call(this, external);
	
	d3.select(rep)
		.attr("transform", "translate(0, 0)");
	
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
	//d3.select(rep).select("rect")
	//	.attr("width", this.getAttribute("width"))
	//	.attr("height", this.getAttribute("height"));
	
	var chart = d3.select(rep).select("g");
	chart.selectAll("g").remove();
	chart.selectAll("text").remove();
	chart.selectAll("path").remove();
	
	if (!this.isSelectedOnMobile) {
		return;
	}
	
	if (!$(rep).hasClass("selected")) {
		chart
			.attr("stroke", this.getAttribute("linecolor"))
			.attr("stroke-width", this.getAttribute("linesize"));
	}
	
	// Get the content.
	var content = this.getContentAsObject();
	
	var width = $(window).width() - 70;
	var height = $(window).width() - 50;
	
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
	
	chart.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis.tickSize(-height, 0).tickFormat(""));
	
	// Draw the label for the x-axis.
	chart.append("text")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .style("text-anchor", "middle")
        .text(content.xAxis.label);
	
	// Draw the y-axis.
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	
	chart.append("g")
		.attr("class", "grid")
		.call(yAxis.tickSize(-width, 0).tickFormat(""));
	
	// Draw the label for the y-axis.
	chart.append("text")
		.attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .text(content.yAxis.label);
	
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

/* Creates the representation for the desktop version of the plotter. */
Plotter.createRepresentation = function(parent) {
	var margin = { top: 20, right: 20, bottom: 30, left: 50},
		width = $(window).width() - margin.left - margin.right,
		height = $(window).width() - margin.top - margin.bottom;
	
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
	
	this.initGUI(rep);
	return rep;
}

GeneralObject.setViewX = function(value) {
	return;

	var self = this;
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		var x = 0;
		/*
		if (isNaN(self.getViewY())) {
			var y = 0;
		} else {
			var y = self.getViewY();
		}
		*/
		
		$(rep).attr("transform", "translate("+value+","+x+")");	
	}
	
	$(rep).attr("x", value);
	
	GUI.adjustContent(this);
	
}

Plotter.setViewHeight = function(value) {
	return;
	var rep = this.getRepresentation();
	var content = this.getContentAsObject();
	
	// var x = this.getAttribute("x");
	// var y = this.getAttribute("y");
	var x = 0;
	var y = 0;
	
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

Plotter.buildFormForEditableContent = function() {
	var content = this.getContentAsObject();
    
    var dom = $('<table style="width: 100%; text-align: center"></table>');
    var xValues = $('<tr></tr>');
    var yValues = $('<tr></tr>');
	
	var that = this;
    
    for (var i = 0; i < content.values.length; ++i) {
        var valuePair = $('<tr></tr>');
        var valueX = $('<td>x' + i + '</td><td><input type="text" size="8" name="x' + i + '" value="' + content.values[i][0] + '" /></td>');
		var valueY = $('<td>y' + i + '</td><td><input type="text" size="8" name="y' + i + '" value="' + content.values[i][1] + '" /></td>');
        $(valuePair).append(valueX);
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: i, val: valueX}, function(event) {
            var content = that.getContentAsObject();
            content.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
            
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
        });
        $(valueY).bind('keyup', {pos: i, val: valueY}, function(event) {
            var content = that.getContentAsObject();
            content.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
            
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
		
		var newIndex = content.values.length;
		var lastEntry = content.values[newIndex - 1];
        content.values.push(lastEntry);
        that.setContentAsJSON(content);
        
        var rep = that.buildMobileRep(GUI.mobileSVG/*$(canvas).svg('get')*/);
        $(rep).attr("width", $(window).width());
        $(rep).attr("width", $(window).width());
		
		var valuePair = $('<tr></tr>');
        var valueX = $('<td>x' + newIndex + '</td><td><input type="text" size="8" name="x' + newIndex + '" value="' + content.values[newIndex][0] + '" /></td>');
		var valueY = $('<td>y' + newIndex + '</td><td><input type="text" size="8" name="y' + newIndex + '" value="' + content.values[newIndex][1] + '" /></td>');
        $(valuePair).append(valueX);
        $(valuePair).append(valueY);
        
        $(valueX).bind('keyup', {pos: newIndex, val: valueX}, function(event) {
            var content = that.getContentAsObject();
            content.values[event.data.pos][0] = parseFloat($(event.data.val).find('input[name=x' + event.data.pos + ']').val());
			if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
            /*
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
            */
        });
        $(valueY).bind('keyup', {pos: newIndex, val: valueY}, function(event) {
            var content = that.getContentAsObject();
            content.values[event.data.pos][1] = parseFloat($(event.data.val).find('input[name=y' + event.data.pos + ']').val());
            if (event.keyCode == 13) {
				that.setContentAsJSON(content);
			}
            /*
            var rep = that.buildMobileRep(GUI.mobileSVG);
            $(rep).attr("width", $(window).width());
            $(rep).attr("width", $(window).width());
            */
        });
        
        $(row).before(valuePair);
    });
    
    return dom;
}