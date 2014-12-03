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
            
            //destroy relationship with object
            this.removeAssociationToAnActiveObject(object.id);
            object.removeAssociationToAStructure(this.id);
        }
    }

};

theObject.onEnter = function(object, oldData, newData) {
    
    if (this.checkData()) {
        var data = this.getData();

        if (object.getAttribute(data.attribute) !== data.value) {
            object.setAttribute(data.attribute, data.value);
            console.log('Attribute ' + data.attribute + ' has been set to ' + data.value + ' for ' + object);
            
            //establish connection with object
            this.createAssociationToAnActiveObject(object.id);
            object.createAssociationToAStructure(this.id);
            
        }
    }
};

theObject.onMoveWithin = function(object, oldData, newData) {
    
    
};

theObject.onMoveOutside = function(object, oldData, newData) {
   
    
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



