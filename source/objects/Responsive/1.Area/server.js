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
    console.log("evaluating Position");
    if (this.checkData()) {
        var data = this.getData();
       
        if (inside){
        	if (object.getAttribute(data.attribute) !== data.value) {
	            object.setAttribute(data.attribute, data.value);
	            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
	        }
        } else {  //removed from the structure
	        if (object.getAttribute(data.attribute) === data.value) {
	            object.setAttribute(data.attribute, false);
	            console.log('Attribute ' + data.attribute + ' has been unset for ' + object);
	        }
        }
    }

};

theObject.getData = function() {
    var attribute = this.getAttribute('attribute');
    var value = this.getAttribute('value');
    return {'attribute': attribute, 'value': value};
}

theObject.checkData = function() {
    var data = this.getData();
    if (!data.attribute || !data.value) {
        this.shout(this + ' has insufficient data for evaluation.');
        return false;
    }

    return true;
}

theObject.getPlacementArea = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");

    var p1 = {X: startX, Y: startY};
    var p2 = {X: startX + width - aoWidth, Y: startY};
    var p3 = {X: startX + width - aoWidth, Y: startY + height - aoHeight};
    var p4 = {X: startX, Y: startY + height - aoHeight};
    return [[p1, p2, p3, p4]];
}

theObject.howToHandle = function(object) {
    var attributeName = this.getAttribute("attribute");
    var value = object.getAttribute(attributeName) || false;
    if (value && (this.getAttribute("value") === value)) {
        return 'attract';
    } else {
        return 'distract';
    }
}
