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

    if (this.checkData(object)) {
        var data = this.getData(object);

        if (object.getAttribute(data.attribute) === data.value) {
            object.setAttribute(data.attribute, '');
            console.log('Attribute ' + data.attribute + ' has been unset for ' + object);
        }
    }

};


theObject.onEnter = function(object, data) {
    console.log(object);

    if (this.checkData(object)) {
        var data = this.getData(object);

        if (object.getAttribute(data.attribute) !== data.value) {
            object.setAttribute(data.attribute, data.value);
            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
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
    var value = this.positionToValue(object);
    return {'attribute': attribute, 'value': value};
}

theObject.positionToValue = function(object) {
    this.padding = 20;
    var minVal = this.getAttribute('min');
    var maxVal = this.getAttribute('max');
    var stepping = this.getAttribute('stepping');
    var numberOfSteps = Math.floor(((maxVal - minVal) / stepping) + 1);
    //works

    var pixelStart = this.padding;
    var pixelEnd = this.getAttribute('width') - this.padding - this.padding;
    var distancePerStepInPixel = (pixelEnd - pixelStart) / (numberOfSteps - 1);

    //works

    //determine current position of the structure
    var x = this.getAttribute('x');
    console.log("struct x: " + x);

    var objX = object.getAttribute('x');
    console.log("objX: " + objX);
    //pdf objWidth isn't true
    //var objWidth = object.getAttribute('width');
    //hack:
    var objWidth = 64;

    //absolute obj middle
    var objMiddle = Math.round(objX + (objWidth / 2));
    console.log("objMiddle " + objMiddle);


    //Distance between scale start and objPosition
    var relativePositonX = objMiddle - (x + pixelStart);
    console.log("rel Pos: " + relativePositonX);


    var value = minVal + (Math.round(relativePositonX / distancePerStepInPixel));
    console.log("Value: " + value);

    return value;


}
/*function positionToValue(object) {
 //determine an area for validation
 var minVal = object.getAttribute('min');
 var maxVal = object.getAttribute('max');
 var stepping = object.getAttribute('stepping');
 var numberOfSteps = Math.floor(((maxVal - minVal) / stepping) + 1);
 
 var pixelStart = object.padding;
 var pixelEnd = object.getAttribute('width') - object.padding - object.padding;
 var distancePerStepInPixel = (pixelEnd - pixelStart) / (numberOfSteps - 1);
 
 
 //determine current position of the structure
 var x = object.getAttribute('x');
 var y = object.getAttribute('y');
 
 var overlappingObjects = object.getOverlappingObjects();
 
 for (var overlappingObj in overlappingObjects) {
 //determine current position
 var objX = overlappingObj.getAttribute('x');
 var objWidth = overlappingObj.getAttribute('width');
 var objMiddle = Math.round((objX + objWidth) / 2);
 
 //Distance between scale start and objPosition
 var relativePositonX = objMiddle - x + pixelStart;
 
 var value = minVal + (Math.round(relativePositonX/distancePerStepInPixel));
 console.log(value);
 
 }
 
 
 return 5;
 } */


theObject.checkData = function(object) {
    var data = this.getData(object);
    if (!data.attribute || !data.value) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}

