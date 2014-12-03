/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../../server.js');
module.exports = theObject;


theObject.exampleMethod = function() {
    console.log("method call");
};
theObject.exampleMethod.public = true;

theObject.removeAssociationToAStructure = function(objectId) {
    var structures = this.getAttribute('structures');
    if (structures[objectId]) {
        structures[objectId] = false;
        this.setAttribute('structures', structures);
    } else {
        console.log("Debug: You try to remove an association to a structure which isn't available!");
    }
    console.log(structures);
};
theObject.createAssociationToAStructure = function(objectId) {
    var structures = this.getAttribute('structures');
    if (structures[objectId]) {
        console.log("Debug: You try to create an association to a strucutre which already exists!");
    } else {
        structures[objectId] = true;
        this.setAttribute('structures', structures);
    }
    console.log(structures);
};


