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
        var currentXAttr = object.getAttribute("attrbuteX-" + this.id);
        var currentYAttr = object.getAttribute("attrbuteY-" + this.id);
        if (currentXAttr !== attrX) {
            object.setAttribute("attrbuteX-" + this.id, attrX);
        }
        if (currentYAttr !== attrY) {
            object.setAttribute("attrbuteY-" + this.id, attrY);
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

