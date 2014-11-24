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
    if (object.isContext && object.isContext()) {
        //TODO Merge context objects
    } else if (object.isStructuring()) {
        var structures = this.getAttribute('structures');
        structures[object.id] = false;
        this.setAttribute('structures', structures);

        var contexts = object.getAttribute('contexts');
        contexts[this.id] = false;
        object.setAttribute('contexts', contexts);
    } else {
        var activeObjects = this.getAttribute('activeObjects');
        activeObjects[object.id] = false;
        this.setAttribute('activeObjects', activeObjects);

        var contexts = object.getAttribute('contexts');
        contexts[this.id] = false;
        object.setAttribute('contexts', contexts);
    }
};

theObject.onEnter = function(object, oldData, newData) {
    if (object.isContext && object.isContext()) {
        //TODO Merge context objects
    } else if (object.isStructuring()) {
        var structures = this.getAttribute('structures');
        if(structures === 0){
            structures = {};
        }
        structures[object.id] = true;
        this.setAttribute('structures', structures);

        var contexts = object.getAttribute('contexts');
        if(contexts === 0){
            contexts = {};
        }
        contexts[this.id] = true;
        object.setAttribute('contexts', contexts);
    } else {
        var activeObjects = this.getAttribute('activeObjects');
         if(activeObjects === 0){
            activeObjects = {};
        }
        activeObjects[object.id] = true;
        this.setAttribute('activeObjects', activeObjects);

        var contexts = object.getAttribute('contexts');
        if(contexts === 0){
            contexts = {};
        }
        contexts[this.id] = true;
        object.setAttribute('contexts', contexts);
    }
};

theObject.onMoveWithin = function(object, oldData, newData) {
    //return this.onEnter(object, oldData, newData);
};

theObject.onMoveOutside = function(object, oldData, newData) {
    //return this.onLeave(object, oldData, newData);
};




