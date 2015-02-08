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
    var minVal = this.getAttribute('minX');
    var stepping = this.getAttribute('steppingX');
    //works

    var pixelStart = this.getAttribute("startX");
    var distancePerStepInPixel = this.getAttribute("distanceX");
    var objX = object.getAttribute('cx');
    var v = (objX - pixelStart) / distancePerStepInPixel;


    var value = minVal + v * stepping;
    console.log(this.getAttribute('attributeX') + " " + value);

    return value;


}
theObject.positionToValueY = function(object) {
    var minVal = this.getAttribute('minY');
    var stepping = this.getAttribute('steppingY');
    var pixelStart = this.getAttribute("startY");
    var distancePerStepInPixel = this.getAttribute("distanceY");
    var objY = object.getAttribute('cy');

    var v = (pixelStart - objY) / distancePerStepInPixel;
    var value = minVal + v * stepping;

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

