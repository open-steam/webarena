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
    if (attributeName !== '') {
        object.setAttribute(attributeName, '');
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

