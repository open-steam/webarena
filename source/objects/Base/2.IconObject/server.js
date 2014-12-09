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
    structures[objectId] = false;
    console.log("beziehung weg");
    console.log(this.setAttribute("structures", structures));
};
theObject.createAssociationToAStructure = function(objectId) {
    var structures = this.getAttribute('structures');
    structures[objectId] = true;
    this.setAttribute("structures", structures);
};
theObject.reposition = function() {
    //get context
    //get all structures of this context
    //getValidPositionsForAllStructures
    //if o is associated with this structure --> must
    //if o isn't associated with this structure -->must not
    //intersection of all must, known as res1
    // res1 diff m, for all

    //das kontext ein Array ist, ist blödsinn
    var self = this;
    var context = this.getAttribute("context");
    var structures;
    if (context !== 0) {
        //is an object with id -> bool
        structures = context.getAttribute("structures");
    }
    //this is just a hack and gonna be removed when context is finished
    else {
        structures = this.getRoom().getAllStructures();
    }
    if (structures === 0) {
        console.log("Debug: Keine Strukturen vorhanden");
    } else {
        var objectMustBePositioned = [];
        var objectMustNotBePositioned = [];
        var objectIsStructuredBy = this.getAttribute("structures");
        for (var index in structures) {
            var tempStructure = Modules.ObjectManager.getObject(self.get('inRoom'), index, self.context);
            if (structures[index] && (objectIsStructuredBy[index] == true)) {
                objectMustBePositioned.push(tempStructure);
            } else {
                objectMustNotBePositioned.push(tempStructure);
            }
        }
        //console.log("drin");
        //console.log(objectMustBePositioned);
        //console.log("nicht drin");
        //console.log(objectMustNotBePositioned);
        var solution = objectMustBePositioned[0].getValidPositions();
        for (var i = 1; i < objectMustBePositioned.length; i++) {
            var tempPositions = objectMustBePositioned[i].getValidPositions();
            var cpr = new Modules.Clipper.Clipper();

            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);
            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
            var solution_paths = new Modules.Clipper.Paths();
            var succeeded = cpr.Execute(Modules.Clipper.ClipType.ctIntersection, solution_paths);
            solution = solution_paths;
        }
        for (var i = 1; i < objectMustNotBePositioned.length; i++) {
            var tempPositions = objectMustNotBePositioned[i].getValidPositions();
            var cpr = new Modules.Clipper.Clipper();

            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);
            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
            var solution_paths = new Modules.Clipper.Paths();
            var succeeded = cpr.Execute(Modules.Clipper.ClipType.ctDifference, solution_paths);
            solution = solution_paths;
        }
        //in solution ist ein array, dass wiederum aus verschiedenen arrays bestehen kann
        
        
        
        




    }
}

