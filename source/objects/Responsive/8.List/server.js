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

    var attributeName = this.getAttribute('attribute');
    if (attributeName !== '') {
        object.setAttribute(attributeName, '');
        
        //TODO:reduce to a function start
        var direction = this.getAttribute('direction');
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
//TODO:reduce to a function end
    } else {
        console.log("List: No attribute set for " + object.getAttribute('id'));
    }


};


theObject.onEnter = function(object, data) {
    //TODO:reduce to a function start
    
    var direction = this.getAttribute('direction');
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
    //TODO:reduce to a function end

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

