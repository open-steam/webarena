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
    var attributeX = object.getAttribute("attributeX-" + this.id);
    var attributeY = object.getAttribute("attributeY-" + this.id);
    if (attributeX && attributeY) {
        object.setAttribute("attributeX-" + this.id, false);
        object.setAttribute("attributeY-" + this.id, false);
    }
};

theObject.onEnter = function(object, data) {
    var structureWidth = this.getAttribute('width');
    var structureHeigth = this.getAttribute('height');
    var structureX = this.getAttribute('x');
    var structureY = this.getAttribute('y');
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');
    var cellWidth = structureWidth / (columns.length + 1);
    var cellHeight = structureHeigth / (rows.length + 1);

    var objCX = object.getAttribute("cx");
    var objCY = object.getAttribute("cy");

    var vx = Math.floor((objCX - structureX) / cellWidth);
    var vy = Math.floor((objCY - structureY) / cellHeight);

    if (vx < 1 || vy < 1) {
        console.log("position out of the valid area");
    } else {
        var attrX = columns[vx - 1];
        var attrY = rows[vy - 1];
        console.log("x " + attrX);
        console.log("y " + attrY);
        var currentXAttr = object.getAttribute("attributeX-" + this.id);
        var currentYAttr = object.getAttribute("attributeY-" + this.id);
        if (currentXAttr !== attrX) {
            object.setAttribute("attributeX-" + this.id, attrX);
        }
        if (currentYAttr !== attrY) {
            object.setAttribute("attributeY-" + this.id, attrY);
        }
        if (currentXAttr === attrX && currentYAttr === attrY) {
            console.log("position with the same meaning");
        }
    }

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
theObject.getType = function() {
    return "matrix";
}
theObject.isStructuringObject = function(object) {
    var valueX = object.getAttribute("attributeX-" + this.id);
    var valueY = object.getAttribute("attributeY-" + this.id);
    return valueX && valueY;

}
theObject.getValidPositions = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");

    var valueX = object.getAttribute("attributeX-" + this.id);
    var valueY = object.getAttribute("attributeY-" + this.id);
    
    var counterX = 0;
    var counterY = 0;

    var rowAttributes = this.getAttribute("Row");
    var columnAttributes = this.getAttribute("Column");
    
    for (var i in rowAttributes) {        
        if (rowAttributes[i] === valueY) {
            break;
        } else {
            counterY++;
        }
    }

    for (var i in columnAttributes) {
        if (columnAttributes[i] === valueX) {
            break;
        } else {
            counterX++;
        }
    }
    var vx = counterX + 1;
    var vy = counterY + 1;

    var wc = width / (columnAttributes.length + 1);
   
    var x1 = Math.floor(startX + (vx * wc));
    var x2 = Math.floor(startX + ((vx + 1) * wc) - aoWidth);

    var hc = height / (rowAttributes.length + 1);
    var y1 = Math.floor(startY + (vy * hc));
    var y2 = Math.floor(startY + ((vy + 1) * hc) - aoHeight);
   
    var p1 = {X: x1, Y: y1};
    var p2 = {X: x1, Y: y2};
    var p3 = {X: x2, Y: y2};
    var p4 = {X: x2, Y: y1};

    return [[p1, p2, p3, p4]];


}
theObject.getInvalidPositions = function(object) {
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