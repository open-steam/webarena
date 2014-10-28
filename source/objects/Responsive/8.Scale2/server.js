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

    if (this.checkData(object)) {
        var data = this.getData(object);

        if (object.getAttribute(data.attributeX) !== data.valueX && object.getAttribute(data.attributeY) !== data.valueY) {
            object.setAttribute(data.attributeX, data.valueX);
            object.setAttribute(data.attributeY, data.valueY);
            console.log('Attribute ' + data.attributeX + ' has been set to ' + data.valueX + ' for ' + object);
            console.log('Furthermore, attribute ' + data.attributeY + ' has been set to ' + data.valueY + ' for ' + object);
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
    var attributeX = this.getAttribute('attributeX');
    var attributeY = this.getAttribute('attributeY');
    var valueX = this.positionToValueX(object);
    var valueY = this.positionToValueY(object);
    return {"attributeX": attributeX, "attributeY": attributeY, "valueX": valueX, "valueY": valueY};
}

theObject.positionToValueX = function(object) {
    this.padding = 20;
    var minVal = this.getAttribute('minX');
    var maxVal = this.getAttribute('maxX');
    var stepping = this.getAttribute('steppingX');
    var numberOfSteps = Math.floor(((maxVal - minVal) / stepping) + 1);
    //works

    var pixelStart = this.padding;
    var pixelEnd = this.getAttribute('width') - this.padding - this.padding;
    var distancePerStepInPixel = (pixelEnd - pixelStart) / (numberOfSteps - 1);

    //works

    //determine current position of the structure
    var x = this.getAttribute('x');
    //  console.log("struct x: " + x);

    var objX = object.getAttribute('x');
    //console.log("objX: " + objX);
    //pdf objWidth isn't true
    //var objWidth = object.getAttribute('width');
    //hack:
    var objWidth = 64;

    //absolute obj middle
    var objMiddle = Math.round(objX + (objWidth / 2));
    //console.log("objMiddle " + objMiddle);


    //Distance between scale start and objPosition
    var relativePositonX = objMiddle - (x + pixelStart);
    //console.log("rel Pos: " + relativePositonX);


    var value = minVal + (Math.round(relativePositonX / distancePerStepInPixel));
    console.log(this.getAttribute('attributeX') + " " + value);

    return value;


}
theObject.positionToValueY = function(object) {
    this.padding = 20;
    var minVal = this.getAttribute('minY');
    var maxVal = this.getAttribute('maxY');
    var stepping = this.getAttribute('steppingY');
    var numberOfSteps = Math.floor(((maxVal - minVal) / stepping) + 1);
    //works

    var pixelStart = this.getAttribute('height') - this.padding;
    var pixelEnd = this.padding + this.padding;

    var distancePerStepInPixel = (pixelEnd - pixelStart) / (numberOfSteps - 1);

    //works

    //determine current position of the structure
    var y = this.getAttribute('y');
    //console.log("struct y: " + y);

    var objY = object.getAttribute('y');
    //console.log("objY: " + objY);
    //pdf objWidth isn't true
    //var objWidth = object.getAttribute('width');
    //hack:
    var objHeight = 64;

    //absolute obj middle
    var objMiddle = Math.round(objY + (objHeight / 2));
    //console.log("objMiddle " + objMiddle);


    //Distance between scale start and objPosition
    var relativePositonY = objMiddle - (y + pixelStart);
    //console.log("rel Pos: " + relativePositonY);


    var value = minVal + (Math.round(relativePositonY / distancePerStepInPixel));
    console.log(this.getAttribute('attributeY') + " " + value);

    return value;
}



theObject.checkData = function(object) {
    var data = this.getData(object);
    if (!data.attributeX || !data.valueX || !data.attributeY || !data.valueY) {
        console.log(this + ' has insufficient data.'); //TODO shout back to people in the room
        return false;
    }

    return true;
}

