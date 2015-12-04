/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../../server.js');
module.exports = theObject;

theObject.evaluatePosition = function(object, inside) {

	if (!inside){

	    var attributeNameX = this.getAttribute("attributeX");
	    var attributeNameY = this.getAttribute("attributeY");
	    if (attributeNameX && object.getAttribute(attributeNameX)) {
	        object.setAttribute(attributeNameX, false);
	        console.log('Attribute ' + attributeNameX + ' has been unset for ' + object);
	    }
	    if (attributeNameY && object.getAttribute(attributeNameY)) {
	        object.setAttribute(attributeNameY, false);
	        console.log('Attribute ' + attributeNameY + ' has been unset for ' + object);
	    }
	} else {
		
		if (this.checkData(object)) {
	        var data = this.getData(object);
	        var minX = this.getAttribute("minX");
	        var maxX = this.getAttribute("maxX");
	        var minY = this.getAttribute("minY");
	        var maxY = this.getAttribute("maxY");
	
	        if (minX > data.valueX || maxX < data.valueX || minY > data.valueY || maxY < data.valueY) {
	            console.log("obj is out of range!!!!!");
	            object.setAttribute(data.attributeX, false);
	            object.setAttribute(data.attributeY, false);
	        } else if (object.getAttribute(data.attributeX) !== data.valueX && object.getAttribute(data.attributeY) !== data.valueY) {
	            object.setAttribute(data.attributeX, data.valueX);
	            object.setAttribute(data.attributeY, data.valueY);
	            console.log('Attribute ' + data.attributeX + ' has been set to ' + data.valueX + ' for ' + object);
	            console.log('Furthermore, attribute ' + data.attributeY + ' has been set to ' + data.valueY + ' for ' + object);
	        }
	    }
		
	}

};


theObject.getData = function(object) {
    var attributeX = this.getAttribute('attributeX');
    var attributeY = this.getAttribute('attributeY');
    var valueX = this.positionToValueX(object);
    var valueY = this.positionToValueY(object);
    return {"attributeX": attributeX, "attributeY": attributeY, "valueX": valueX, "valueY": valueY};
}

theObject.positionToValueX = function(object) {
    var minVal = this.getAttribute('minX');
    var stepping = this.getAttribute('steppingX');
    //works

    var pixelStart = this.getAttribute("startX");
    var distancePerStepInPixel = this.getAttribute("distanceX");
    var objX = object.getAttribute('cx');
    var v = (objX - pixelStart) / distancePerStepInPixel;


    var value = minVal + v * stepping;
    console.log(this.getAttribute('attributeX') + " " + value);

    return value;


}
theObject.positionToValueY = function(object) {
    var minVal = this.getAttribute('minY');
    var stepping = this.getAttribute('steppingY');
    var pixelStart = this.getAttribute("startY");
    var distancePerStepInPixel = this.getAttribute("distanceY");
    var objY = object.getAttribute('cy');

    var v = (pixelStart - objY) / distancePerStepInPixel;
    var value = minVal + v * stepping;

    console.log(this.getAttribute('attributeY') + " " + value);

    return value;
}



theObject.checkData = function(object) {
    var data = this.getData(object);
    if (!data.attributeX || !data.valueX || !data.attributeY || !data.valueY) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}
theObject.getType = function() {
    return "scale2d";
}
theObject.howToHandle = function(object) {
    var attributeNameX = this.getAttribute("attributeX");
    var attributeNameY = this.getAttribute("attributeY");
    var valueX = object.getAttribute(attributeNameX) || false;
    var valueY = object.getAttribute(attributeNameY) || false;
    if (valueX && valueY) {
        return 'attract';
    } else {
        return 'distract';
    }
}
theObject.getValidPositions = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");

    var minX = this.getAttribute("minX");
    var steppingX = this.getAttribute("steppingX");
    var valueX = object.getAttribute(this.getAttribute("attributeX"));
    var vx = (valueX - minX) / steppingX;
    var dx = this.getAttribute("distanceX");
    var cx = startX + 60 + (vx * dx);
    var x = Math.floor(cx - (aoWidth / 2));
    var minY = this.getAttribute("minY");
    var steppingY = this.getAttribute("steppingY");
    var valueY = object.getAttribute(this.getAttribute("attributeY"));
    var vy = (valueY - minY) / steppingY;
    var dy = this.getAttribute("distanceY");
    var cy = (startY + height - 80) - (vy * dy);
    var y = Math.floor(cy - (aoHeight / 2));

    var p1 = {X: x, Y: y};
    var p2 = {X: x + 1, Y: y};
    var p3 = {X: x + 1, Y: y + 1};
    var p4 = {X: x, Y: y + 1};

    return [[p1, p2, p3, p4]];
}

