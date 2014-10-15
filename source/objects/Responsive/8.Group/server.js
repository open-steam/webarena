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


theObject.onLeave = function(object, oldData, newData) {

   
    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) === data.value) {
            object.setAttribute(data.attribute, '');
            console.log('Attribute ' + data.attribute + ' has been unset for ' + object);
        }
    }

};

theObject.onEnter = function(object, oldData, newData) {
    
    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) !== data.value) {
            object.setAttribute(data.attribute, data.value);
            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
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



