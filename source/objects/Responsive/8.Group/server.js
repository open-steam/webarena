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


theObject.onLeave = function(object, oldData, newData) {


    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) === data.value) {
            object.setAttribute(data.attribute, false);
            console.log('Attribute ' + data.attribute + ' has been unset for ' + object);

            //destroy relationship with object
            this.removeAssociationToAnActiveObject(object.id);
            object.removeAssociationToAStructure(this.id);
        }
    }

};

theObject.onEnter = function(object, oldData, newData) {

    if (this.checkData()) {
        var data = this.getData();
        if (object.getAttribute(data.attribute) !== data.value) {
            object.setAttribute(data.attribute, data.value);
            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
            //establish connection with object
            this.createAssociationToAnActiveObject(object.id);
            object.createAssociationToAStructure(this.id);
        }
    }
};

theObject.onMoveWithin = function(object, oldData, newData) {
    return this.onEnter(object, oldData, newData);

};

theObject.onMoveOutside = function(object, oldData, newData) {
    return this.onLeave(object, oldData, newData);

};

theObject.getData = function() {
    var attribute = this.getAttribute('attribute');
    return {'attribute': attribute, 'value': true};
}

theObject.checkData = function() {
    var data = this.getData();

    if (!data.attribute || !data.value) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}
theObject.getValidPositions = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");


    //important: clockwise direction
    var p1 = {X: startX, Y: startY};
    var p2 = {X: startX + width - aoWidth, Y: startY};
    var p3 = {X: startX + width - aoWidth, Y: startY + height - aoHeight};
    var p4 = {X: startX, Y: startY + height - aoHeight};
    return [[p1, p2, p3, p4]];
}

theObject.getType = function() {
    return "area";
}

theObject.isStructuringObject = function(object) {
    var attributeName = this.getAttribute("attribute");
    var value = object.getAttribute(attributeName) || false;
    if (value) {
        return true;
    } else {
        return false;
    }
}


