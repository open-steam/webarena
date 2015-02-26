/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2013
 *
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../../server.js');


theObject.updateEvaluationStatus = function(object, data) {
    //
//
    //
    //Prüfe, ob der Kontext derselbe ist. Oder ob ein anderer Kntext vorliegt!?!?!!
    //Annahme erstmal: Es gibt immer nur ein Kontext
    //Also das Objekt wird immer innerhalb des Kontextes bewegt.

    //Falls das bewegte Objekt eine Struktur oder ein Kontext ist, dann wird gespeichert, dass es bewegt wurde.
    //Wenn der Hintergrund verändert wurde, wissen wir, dass die Objekte zu repositionieren sind.
    if (object.onObjectMove) {
        //Vielleicht sollte ich das am Raum speichern
        return object.onObjectMove(data);
    } else if (object.isActive && object.isActive()) {
        //Dieser Teil ist wird bei Bewegung von Anwendungsobjekten ausgeführt.
        var allObjects = this.getInventory();
        for (var i in allObjects) {
            if (allObjects[i].isStructuring && allObjects[i].isStructuring()) {
                allObjects[i].evaluateObject(object, data);
            }
        }
    }


}
theObject.evaluateCurrentPosition = function(object, data) {
    if (object.onObjectMove) {
        return object.onObjectMove(data);
    } else {
        var inventory = this.getInventory();
        var isPositioned = false;
        for (var key in inventory) {
            var obj = inventory[key];
            if (obj.isStructuring()) {
                var bool = obj.evaluateObjectNoData(object);
                isPositioned = isPositioned || bool;
            }
        }
        if (isPositioned) {
            object.setAttribute('positionStatus', 'positioned');
        } else {
            object.setAttribute('positionStatus', 'unpositioned');
        }

    }
}

//is called when ANY object is repositioned within a room
theObject.evaluatePositionFor = function(object, data) {
    //when the object is structuring, its onObjectMove function is called
    if (object.onObjectMove) {
        return object.onObjectMove(data);
    } else {
        console.log("room eval position for");
    }
}


theObject.getInventory = function() {
    return Modules.ObjectManager.getObjects(this.id, this.context);
}

theObject.getInventoryAsync = function(cb) {
    return Modules.ObjectManager.getObjects(this.id, this.context, cb);
}

theObject.getObject = function(objID, callback) {
    this.getInventoryAsync(function(inventory) {
        for (var i in inventory) {
            var candidate = inventory[i];
            if (candidate.id == objID) {
                callback(candidate);
            }
        }
    });
}

theObject.createObject = function(type, callback) {
    return Modules.ObjectManager.createObject(this.id, type, false, false, this.context.socket, false, callback);
}

theObject.saveUserPaintingData = function(content, callback) {
    var self = this;

    if (content.substr(0, 22) == 'data:image/png;base64,') {

        var base64Data = content.replace(/^data:image\/png;base64,/, ""),
                content = new Buffer(base64Data, 'base64');
    }

    Modules.Connector.savePainting(this.inRoom, content, function() {
        if (callback)
            callback();
        self.updateClients('paintingsUpdate');
    }, this.context);


}
theObject.saveUserPaintingData.public = true;
theObject.saveUserPaintingData.neededRights = {
    write: true
}

theObject.getUserPaintings = function(callback) {

    Modules.Connector.getPaintings(this.inRoom, this.context, function(rawData) {

        //This data should be improved
        callback(rawData);

    });

}
theObject.getUserPaintings.public = true;
theObject.getUserPaintings.neededRights = {
    read: true
}

theObject.deleteUserPainting = function() {
    var self = this;

    Modules.Connector.deletePainting(this.inRoom, function() {
        self.updateClients('paintingsUpdate');
    }, this.context);

}
theObject.deleteUserPainting.public = true;
theObject.deleteUserPainting.neededRights = {
    write: true
}
//output association object
theObject.getAllStructures = function() {
    var inventory = this.getInventory();
    var structures = {};
    for (var index in inventory) {
        if (inventory[index].isStructuring && inventory[index].isStructuring()) {
            structures[inventory[index].id] = true;
        }
    }
    if (inventory.length === 0)
        return 0;
    else
        return structures;
}
theObject.repositionAllObjects = function(objects) {

    console.log("test");

    var inventory = this.getInventory();
    var structures = [];
    var activeObjects = [];

    if (objects.length > 0) {
        for (var i in inventory) {
            if (inventory[i].isStructuring && inventory[i].isStructuring()) {
                structures.push(inventory[i]);
            }
        }
        for(var j in objects){
            activeObjects.push(objects[j]);
        }
    } else {
        for (var i in inventory) {
            if (inventory[i].isStructuring && inventory[i].isStructuring()) {
                structures.push(inventory[i]);
            } else if (inventory[i].isActive && inventory[i].isActive()) {
                activeObjects.push(inventory[i]);
            }
        }
    }
    var xStructMax = 0;
    var yStructMax = 0;
    for (var s in structures) {
        var xTemp = structures[s].getAttribute("x") + structures[s].getAttribute("width");
        var yTemp = structures[s].getAttribute("y") + structures[s].getAttribute("height");

        if (xStructMax < xTemp) {
            xStructMax = xTemp;
        }
        if (yStructMax < yTemp) {
            yStructMax = yTemp;
        }
    }
    //Um zu prüfen, ob ein Objekt anhand seiner Bewertung zu einer Struktur gehört, erhält jede Struktur ein Methode,
    //die das prüft.

    for (var index in activeObjects) {
        var objectMustBePositioned = [];
        var objectMustNotBePositioned = [];
        var ao = activeObjects[index];

        for (var i in structures) {
            if (structures[i].isStructuringObject(ao)) {
                objectMustBePositioned.push(structures[i]);
            } else {
                objectMustNotBePositioned.push(structures[i]);
            }
        }

        var solution;
        if (objectMustBePositioned.length === 0) {
            //Normalerweise sollte an dieser Stelle ein Kontext auf freie Fläche geprüft werden.
            //Prototyp nimmt jedoch erst einmal einen Raum als Kontext an.
            //Annahme: Benutzer haben Mindestauflösung von 1024 * 768

            var x1 = 0;
            var x2 = xStructMax < 1024 ? 1024 : xStructMax;
            var y1 = 0;
            var y2 = yStructMax < 768 ? 768 : yStructMax;

            solution = [[{X: x1, Y: y1}, {X: x2, Y: y1}, {X: x2, Y: y2}, {X: x1, Y: y2}]]
        } else {
            solution = objectMustBePositioned[0].getValidPositions(ao);
        }

        for (var i = 1; i < objectMustBePositioned.length; i++) {
            var tempPositions = objectMustBePositioned[i].getValidPositions(ao);
            var cpr = new Modules.Clipper.Clipper();

            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);
            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
            var solution_paths = new Modules.Clipper.Paths();
            var succeeded = cpr.Execute(0, solution_paths, 0, 0);
            solution = solution_paths;

        }
        for (var i = 0; i < objectMustNotBePositioned.length; i++) {
            var tempPositions = objectMustNotBePositioned[i].getInvalidPositions(ao);
            var cpr = new Modules.Clipper.Clipper();

            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);

            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
            var solution_paths = new Modules.Clipper.Paths();

            var succeeded = cpr.Execute(Modules.Clipper.ClipType.ctDifference, solution_paths, 0, 0);
            solution = solution_paths;

        }

        if (solution.length === 0) {
            ao.setAttribute("linecolor", "rgb(204,0,0)");
            ao.setAttribute("linesize", "5");
        } else {
            ao.setAttribute("linecolor", "transparent");
            var minX = Number.MAX_VALUE;
            var maxX = 0;
            var minY = Number.MAX_VALUE;
            var maxY = 0;

            var aoWidth = ao.getAttribute("width");
            var aoHeight = ao.getAttribute("height");

            for (var j in solution[0]) {
                if (solution[0][j].X < minX) {
                    minX = solution[0][j].X;
                }
                if (solution[0][j].X > maxX) {
                    maxX = solution[0][j].X;
                }
                if (solution[0][j].Y < minY) {
                    minY = solution[0][j].Y;
                }
                if (solution[0][j].Y > maxY) {
                    maxY = solution[0][j].Y;
                }

            }

            if ((maxX - minX) > aoWidth) {
                maxX -= aoWidth;
            }
            if ((maxY - minY) > aoHeight) {
                maxY -= aoHeight;
            }

            var inPolyFlag = false;
            var counter = 0;
            var randomX;
            var randomY;

            while (!inPolyFlag && counter < 100) {
                var randomX = Math.floor(minX + (Math.random() * (maxX - minX)));
                var randomY = Math.floor(minY + (Math.random() * (maxY - minY)));
                var pt = new Modules.Clipper.IntPoint(randomX, randomY);
                var inPolyFlagHelper = true;
                for (var i in solution) {
                    var inpoly = Modules.Clipper.Clipper.PointInPolygon(pt, solution[i]);
                    if ((i === 0 && inpoly === 0) || (i > 0 && inpoly !== 0)) {
                        inPolyFlagHelper = false;
                        break;
                    }
                }
                counter++;
                inPolyFlag = inPolyFlagHelper;
            }
            ao.setAttribute("x", randomX);
            ao.setAttribute("y", randomY);
        }
    }

}

module.exports = theObject;