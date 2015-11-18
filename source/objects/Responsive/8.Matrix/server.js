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
    var columnName = this.getAttribute("ColumnName");
    var rowName = this.getAttribute("RowName");
    var attributeX = object.getAttribute(columnName);
    var attributeY = object.getAttribute(rowName);
    if (attributeX && attributeY) {
        object.setAttribute(columnName, false);
        object.setAttribute(rowName, false);
    }
};

theObject.onEnter = function(object, data) {
    var structureWidth = this.getAttribute('width');
    var structureHeigth = this.getAttribute('height');
    var structureX = this.getAttribute('x');
    var structureY = this.getAttribute('y');
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');
    var columnName = this.getAttribute('ColumnName');
    var rowName = this.getAttribute("RowName");

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
        var currentXAttr = object.getAttribute(columnName);
        var currentYAttr = object.getAttribute(rowName);
        if (currentXAttr !== attrX) {
            object.setAttribute(columnName, attrX);
        }
        if (currentYAttr !== attrY) {
            object.setAttribute(rowName, attrY);
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
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');
    var columnName = this.getAttribute('ColumnName');
    var rowName = this.getAttribute("RowName");

    var valueX = object.getAttribute(columnName);
    var valueY = object.getAttribute(rowName);

    var containsY = false;
    var containsX = false;

    for (var i in rows) {
        if (rows[i] === valueY) {
            containsY = true;
            break;
        }
    }
    for (var i in columns) {
        if (columns[i] === valueX) {
            containsX = true;
            break;
        }
    }
    return containsX && containsY;
}

theObject.getValidPositions = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");

    var columnName = this.getAttribute('ColumnName');
    var rowName = this.getAttribute("RowName");

    var valueX = object.getAttribute(columnName);
    var valueY = object.getAttribute(rowName);

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