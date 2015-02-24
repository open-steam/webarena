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
theObject.evaluatePositions = function() {
    var direction = this.getAttribute('direction');
    var axis;
    var otherAxis;
    if (direction === "vertical") {
        axis = "y";
        otherAxis = "x";
    } else {
        axis = "x";
        otherAxis = "y";
    }

    //Hole alle überlappenden Objekte
    var overlappingObjects = this.getOverlappingObjects();
    var activeObjectsinStructure = [];
    //Filtere nur die Anwendungsobjekte heraus
    for (var index in overlappingObjects) {
        if (overlappingObjects[index].isActive && overlappingObjects[index].isActive()) {
            activeObjectsinStructure.push(overlappingObjects[index]);
        }
    }

    activeObjectsinStructure = activeObjectsinStructure.sort(function(a, b) {
        var value = a.getAttribute(axis) - b.getAttribute(axis);
        if (value === 0) {
            return a.getAttribute(otherAxis) - b.getAttribute(otherAxis);
        } else {
            return value;
        }
    });
    var attributeName = this.getAttribute("attribute");
    var counter = 1;
    for (var i in activeObjectsinStructure) {
        activeObjectsinStructure[i].setAttribute(attributeName, counter);
        console.log("objid: " + activeObjectsinStructure[i].id + " rang: " + counter);
        counter++;
    }
};
theObject.onLeave = function(object, data) {
    var attributeName = this.getAttribute('attribute');
    if (attributeName !== '' && object.getAttribute(attributeName)) {
        object.setAttribute(attributeName, false);
        console.log("removed " + object.id + "from list " + this.id);
        //Bewerte die Objekte innerhalb der Liste neu
        this.evaluatePositions();
    }
    else {
        console.log("List: No attribute set for " + object.getAttribute('id'));
    }
};


theObject.onEnter = function(object, data) {
    //Bewerte die Objekte innerhalb der Liste neu
    this.evaluatePositions();

    //TODO: Anschliessende Repositionierung der AWO

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
    return "list";
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
theObject.getValidPositions = function(object) {
    var startX = this.getAttribute('x');
    var startY = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');

    var aoWidth = object.getAttribute("width");
    var aoHeight = object.getAttribute("height");
    var attributeName = this.getAttribute("attribute");

    /* var objects = this.getOverlappingObjects();
     var activeObjects = [];
     for (var i in objects) {
     if (objects[i].isActive && objects[i].isActive()) {
     activeObjects.push(objects[i]);
     }
     } /*
     /*activeObjects.sort(function(a, b) {
     var valA = a.getAttribute(attributeName);
     var valB = b.getAttribute(attributeName);
     return valA - valB;
     }); */
    //Zuvor muss ich bestimmen, wie ich mit der Distanz umgehe.
    //Bei vertikaler Liste die Distanz zwischen links und rechts gleich halten.
    //Bei horizontaler Liste die Distanz nach oben und unten gleich halten.
    //Diese Distanzen können unter der Berücksichtigung der Abmessungen der Struktur bestimmt werden.
    //Distanz zwischen den Anwendungsobjekten aus Anzahl der Anwendungsobjekte und Abmessungen der Struktur bestimmbar.
    //Problem:
    var value = object.getAttribute(attributeName);
    var distance = this.getAttribute("distance");
    var direction = this.getAttribute("direction");

    var x = startX;
    var y = startY;
    if (direction === "vertical") {
        x += distance;
        y += distance * value;
    } else {
        y += distance;
        x += distance * value;
    }

    var p1 = {X: x, Y: y};
    var p2 = {X: x + 1, Y: y};
    var p3 = {X: x + 1, Y: y + 1};
    var p4 = {X: x, Y: y + 1};

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