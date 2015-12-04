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
	
	if (!this.checkData(object)){
		//shout;
		return false;
	}
	
	if (!inside){
	
	    var attributeName = this.getAttribute("attribute");
	    if (attributeName && object.getAttribute(attributeName)) {
	        object.setAttribute(attributeName, false);
	        console.log('Attribute ' + attributeName + ' has been unset for ' + object);
	        console.log('TODO: this should only happen if attribute value in range!!');
	    }
	} else {
		
		if (this.checkData(object)) {
	        var data = this.getData(object);
	        var min = this.getAttribute("min");
	        var max = this.getAttribute("max");
	        if (data.value < min || data.value > max) {
	            console.log("object " + object.id + " width " + data.value + " is out of range!!!!!");
	            object.setAttribute(data.attribute, false);
	        } else if (object.getAttribute(data.attribute) !== data.value) {
	            object.setAttribute(data.attribute, data.value);
	            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
	        }
	    }	
		
	}

};


theObject.getData = function(object) {
    var attribute = this.getAttribute('attribute');
    if (this.getAttribute("direction") === "horizontal") {
        var value = this.positionToValueX(object);
    } else {
        var value = this.positionToValueY(object);
    }

    return {'attribute': attribute, 'value': value};
}

theObject.positionToValueX = function(object) {
    var minVal = this.getAttribute('min');
    var stepping = this.getAttribute('stepping');

    var pixelStart = this.getAttribute("startX");
    var distancePerStepInPixel = this.getAttribute("distanceX");
    var objX = object.getAttribute('cx');
    var v = (objX - pixelStart) / distancePerStepInPixel;

    var value = minVal + v * stepping;
    
    return value;
}

theObject.positionToValueY = function(object) {
    var minVal = this.getAttribute('min');
    var stepping = this.getAttribute('stepping');
    var pixelStart = this.getAttribute("startY");
    var distancePerStepInPixel = this.getAttribute("distanceY");
    var objY = object.getAttribute('cy');

    var v = (pixelStart - objY) / distancePerStepInPixel;

    return value;
}

theObject.checkData = function(object) {
    var data = this.getData(object);
    if (!data.attribute || !data.value) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}

theObject.getType = function() {
    return "scale1d";
}

theObject.howToHandle = function(object) {
    var attributeName = this.getAttribute("attribute");
    var value = object.getAttribute(attributeName) || false;
    if (value && this.valueInRange(object)) {
        return 'attract';
    } else {
        return 'distract';
    }
    
}

theObject.valueInRange = function (object){
	
	if (!this.checkData(object)) return;
	
    var min = this.getAttribute('min');
    var max = this.getAttribute('max');
    var attribute = this.getAttribute('attribute');
    var value = object.getAttribute(this.getAttribute("attribute"));
	
    return value>=min && value<=max;
}

theObject.getPlacementArea = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");

    var direction = this.getAttribute("direction");
    var minimum = this.getAttribute("min");
    var stepping = this.getAttribute("stepping");
    var value = object.getAttribute(this.getAttribute("attribute"));
    var v = (value - minimum) / stepping;

    if (direction === "horizontal") {
        var d = this.getAttribute("distanceX");
        var cx = startX + 20 + (v * d);
        var x = cx - (aoWidth / 2)
        var y1 = startY;
        var y2 = startY + height - aoHeight - 80;
        var p1 = {X: x, Y: y1};
        var p2 = {X: x + 1, Y: y1};
        var p3 = {X: x + 1, Y: y2};
        var p4 = {X: x, Y: y2};


        return [[p1, p2, p3, p4]];

    } else {
        var d = this.getAttribute("distanceY");
        var cy = (startY + height - 80) - (v * d);
        var y = Math.floor(cy - (aoHeight / 2));
        var x1 = Math.floor(startX + 60);
        var x2 = Math.floor(startX + width - aoWidth);

        var p1 = {X: x1, Y: y};
        var p2 = {X: x2, Y: y};
        var p3 = {X: x2, Y: y + 1};
        var p4 = {X: x1, Y: y + 1};

        return [[p1, p2, p3, p4]];

    }


}
