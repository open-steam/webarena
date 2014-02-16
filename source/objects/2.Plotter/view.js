Plotter.draw = function(external) {
	var rep = this.getRepresentation();
	
	GeneralObject.draw.call(this, external);
	
	if (!$(rep).hasClass("selected")) {
		$(rep).children("polyline").attr("stroke", this.getAttribute('linecolor'));
	}
	
	$(rep).children("polyline").css("fill", this.getAttribute('fill'));
	$(rep).children("polyline").css("stroke-width", this.getAttribute('linesize'));
	
	this.plotPoints();
}

Plotter.plotPoints = function() {
	var rep = this.getRepresentation();
	var content = JSON.parse(this.content);
	var points = content.points;
	var pointsString = "";
	
	var scaleX = parseFloat(this.getAttribute('width')) / points[points.length - 1][0];
	var scaleY = parseFloat(this.getAttribute('height')) / this.getMinMaxY(points).max;
	
	for (var i = 0; i < points.length; ++i) {
		var x = Math.floor(1.0*points[i][0] * scaleX);
		var y = Math.floor(1.0*points[i][1] * scaleY);
		pointsString += x + "," + y + " ";
	}
	
	$(rep).children("polyline").attr("points", pointsString);
}

Plotter.createRepresentation = function(parent) {
	var rep = GUI.svg.group(parent, this.getAttribute('id'));
	var polyline = GUI.svg.polyline(rep, [], {});
	
	rep.dataObject = this;
	
	$(rep).attr("id", this.getAttribute('id'));
	$(polyline).addClass("borderRect");
	
	this.initGUI(rep);
	
	return rep;
}

Plotter.editValueTable = function() {
	GUI.editValueTable(this);
}
/*
Plotter.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
	this.plotPoints();
}

Plotter.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
	this.plotPoints();
}

Plotter.getViewHeight = function() {
	var yExtends = this.getMinMaxY();
	return yExtends.max - yExtends.min;
}
*/
/*
Plotter.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
	this.drawPolygon();
}

Plotter.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
	this.drawPolygon();
}
*/

Plotter.getViewBoundingBoxY = function() {
	return this.getViewY();
	// return this.getMinMaxY(this.getContent().points).min;
}

Plotter.getViewBoundingBoxHeight = function() {
	return this.getViewY() + this.getViewHeight();
	//return this.getMinMaxY(this.getContent().points).max;
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