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

theObject.onLeave = function(object, data) {
    if (object.getAttribute('Row-' + this.id) !== undefined 
            && object.getAttribute('Row-' + this.id) !== ""
            && object.getAttribute('Column-' + this.id) !== undefined
            && object.getAttribute('Column-' + this.id) !== "") {
        object.setAttribute('Row-' + this.id, "");
        object.setAttribute('Column-' + this.id, "");
        console.log("removed attributes");
    }
};

theObject.onEnter = function(object, data) {
    //data is undefined
    //obj is the current object which was move on "this" structure
    var structureWidth = this.getAttribute('width');
    var structureHeigth = this.getAttribute('height');
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');
    var cellWidth = structureWidth / (columns.length + 1);
    var cellHeight = structureHeigth / (rows.length + 1);

    var objCX = object.getAttribute("cx");
    var objCY = object.getAttribute("cy");

    var relativeX = objCX - this.getAttribute('x');
    var relativeY = objCY - this.getAttribute('y');

    if ((relativeX >= cellWidth) && (relativeY >= cellHeight)) {
        var xIndex = Math.floor(relativeX / cellWidth);
        var yIndex = Math.floor(relativeY / cellHeight);

        var attrX = columns[xIndex - 1];
        var attrY = rows[yIndex - 1];

        var currentValueX = object.getAttribute('Row-' + this.id);
        var currentValueY = object.getAttribute('Column-' + this.id);

        if (currentValueX !== attrX && currentValueY !== attrY) {
            object.setAttribute('Row-' + this.id, attrX);
            object.setAttribute('Column-' + this.id, attrY);
        } else {
            console.log("attributes already set!");
        }


    } else {
        console.log("Inside the structure, but outside the value area");
        object.setAttribute('Row-' + this.id, "");
        object.setAttribute('Column-' + this.id, "");
    }

    //TODO:reduce to a function start

    /* var direction = this.getAttribute('direction');
     var overlappingObjects = this.getOverlappingObjects();
     
     var sortedPositions = [];
     
     for (var index in overlappingObjects) {
     if (overlappingObjects[index].isActive && overlappingObjects[index].isActive) {
     sortedPositions.push(overlappingObjects[index].getAttribute(direction));
     }
     
     }
     sortedPositions = sortedPositions.sort();
     
     var counter = 1;
     for (var i in sortedPositions) {
     for (var index in overlappingObjects) {
     if (overlappingObjects[index].getAttribute(direction) === sortedPositions[i]) {
     console.log(overlappingObjects[index].getAttribute('id') + "    " + counter);
     overlappingObjects[index].setAttribute(this.getAttribute('attribute'), counter);
     counter++;
     break;
     }
     }
     }
     //TODO:reduce to a function end */

};



theObject.onMoveWithin = function(object, oldData, newData) {

    return this.onEnter(object, oldData, newData);

};



theObject.onMoveOutside = function(object, oldData, newData) {

    return this.onLeave(object, oldData, newData);

};


theObject.getData = function(object) {
    var attribute = this.getAttribute('attribute');
    var value = this.getAttribute(attribute);
    return {'attribute': attribute, 'value': value};
}

theObject.checkData = function(object) {
    var data = this.getData(object);
    if (!data.attribute || !data.value) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}

