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


theObject.deletedPlacedProperties = function(object, changeData) {
  
    var oldData = {};
    var newData = {};
    var fields = ['x', 'y', 'cx', 'cy', 'width', 'height'];

    for (var i in fields) {
        var field = fields[i];
        oldData[field] = changeData['old'][field] || object.getAttribute(field);
        newData[field] = changeData['new'][field] || object.getAttribute(field);
    }

    //determine intersections

    var oldIntersects = this.intersects(oldData.x, oldData.y, oldData.width, oldData.height);
    var newIntersects = this.intersects(newData.x, newData.y, newData.width, newData.height);


    //leave
    if (oldIntersects && !newIntersects) {
        var data = this.getData();
        var deleted;
        if (object.getAttribute("deleted")) {
            deleted = object.getAttribute("deleted");
        } else {
            deleted = [];
        }
        deleted.push(data);
        object.setAttribute("deleted", deleted);
    }
}

theObject.getLocationInformation = function(object, changeData) {
    var oldData = {};
    var newData = {};
    var fields = ['x', 'y', 'cx', 'cy', 'width', 'height'];

    for (var i in fields) {
        var field = fields[i];
        oldData[field] = changeData['old'][field] || object.getAttribute(field);
        newData[field] = changeData['new'][field] || object.getAttribute(field);
    }

    //determine intersections

    var oldIntersects = this.intersects(oldData.x, oldData.y, oldData.width, oldData.height);
    var newIntersects = this.intersects(newData.x, newData.y, newData.width, newData.height);

    //inside
    if (oldIntersects && newIntersects)
        return "I";
    //outside
    if (!oldIntersects && !newIntersects)
        return "O";
    //leave
    if (oldIntersects && !newIntersects)
        return "L";
    //enter
    if (!oldIntersects && newIntersects)
        return "E";
}

theObject.onLeave = function(object, oldData, newData) {

   
    var structureStates = object.getAttribute("structureStates");
    structureStates.push("ol");
    object.setAttribute("structureStates", structureStates);

    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) === data.value) {
            object.setAttribute(data.attribute, '');
            console.log('Attribute ' + data.attribute + ' has been unset for ' + object);
            var deleted;
            if (object.getAttribute("deleted")) {
                deleted = object.getAttribute("deleted");
            } else {
                deleted = [];
            }
            deleted.push(data);
            object.setAttribute("deleted", deleted);
        }
    }

};

theObject.onEnter = function(object, oldData, newData) {
    
    var structureStates = object.getAttribute("structureStates");
    structureStates.push("oe");
    object.setAttribute("structureStates", structureStates);

    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) !== data.value) {
            object.setAttribute(data.attribute, data.value);
            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);

            var added;
            if (object.getAttribute("added")) {
                added = object.getAttribute("added");
            } else {
                added = [];
            }
            added.push(data);
            object.setAttribute("added", added);
        }

    }
};

theObject.onMoveWithin = function(object, oldData, newData) {
    
    var structureStates = object.getAttribute("structureStates");
    structureStates.push("omw");
    object.setAttribute("structureStates", structureStates);
    //return this.onEnter(object,oldData,newData);

};

theObject.onMoveOutside = function(object, oldData, newData) {
   
    var structureStates = object.getAttribute("structureStates");
    structureStates.push("omo");
    object.setAttribute("structureStates", structureStates);
    //return this.onLeave(object,oldData,newData);

};

theObject.getData = function() {
    var attribute = this.getAttribute('attribute');
    var value = this.getAttribute('value');
    return {'attribute': attribute, 'value': value};
}

theObject.checkData = function() {
    var data = this.getData();

    if (!data.attribute || !data.value) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}



