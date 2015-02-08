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
    if(this.getAttribute("direction") === "horizontal"){
        var value = this.positionToValueX(object);
    }else{
        var value = this.positionToValueY(object);
    }
    
    return {'attribute': attribute, 'value': value};
}

theObject.positionToValueX = function(object) {
    var minVal = this.getAttribute('min');
    var stepping = this.getAttribute('stepping');
    //works

    var pixelStart = this.getAttribute("startX");
    var distancePerStepInPixel = this.getAttribute("distanceX");
    var objX = object.getAttribute('cx');
    var v = (objX - pixelStart) / distancePerStepInPixel;


    var value = minVal + v * stepping;
    console.log(this.getAttribute('attribute') + " " + value);

    return value;
}

theObject.positionToValueY = function(object) {
    var minVal = this.getAttribute('min');
    var stepping = this.getAttribute('stepping');
    var pixelStart = this.getAttribute("startY");
    var distancePerStepInPixel = this.getAttribute("distanceY");
    var objY = object.getAttribute('cy');

    var v = (pixelStart - objY) / distancePerStepInPixel;
    var value = minVal + v * stepping;

    console.log(this.getAttribute('attribute') + " " + value);

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

