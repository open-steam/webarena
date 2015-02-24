/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 *	 GeneralObject server component
 *
 */

"use strict";

// The server side defintion of the object extends the common parts

var theObject = Object.create(require('./common.js'));

// The Modules variable provides access to server modules such as
// Module.ObjectManager

var Modules = require('../../../server.js');
var _ = require('lodash');

// Make the object public
module.exports = theObject;




// ****************************************************************
// * MAKE STRUCTURING *********************************************
// ****************************************************************

theObject.makeStructuring = function() {

    if (!Modules.config.structuringMode) {
        console.log('Cannot make ' + this + ' structuring because structuring is turned off in config.');
    } else {
        console.log(this + ' is now structuring');
    }

    this.isStructuringFlag = true;

    var theObject = this;

    this.onObjectMove = function(changeData) {

        this.getRoom().setAttribute('repositionNeeded', true);

    }
    theObject.removeAssociationToAnActiveObject = function(objectId) {
        var activeObjects = this.getAttribute('activeObjects');
        activeObjects[objectId] = false;
       console.log(this.setAttribute('activeObjects', activeObjects));
    }
    theObject.createAssociationToAnActiveObject = function(objectId) {
        var activeObjects = this.getAttribute('activeObjects');
        activeObjects[objectId] = true;
        this.setAttribute('activeObjects', activeObjects);      
    }
    // theObject.getValidPositions = function() {
    //     console.log("You have to implement the function getValidPositions for a specific structure");
    // }

    theObject.bBoxIntersects = function(thisX, thisY, thisWidth, thisHeight, otherX, otherY, otherWidth, otherHeight) {

        if ((otherX + otherWidth) < thisX) {
            //console.log('too far left');
            return false;
        }
        if ((otherY + otherHeight) < thisY) {
            //console.log('too far up');
            return false;
        }
        if (otherX > (thisX + thisWidth)) {
            //console.log('too far right');
            return false;
        }
        if (otherY > (thisY + thisHeight)) {
            //console.log('too far bottom');
            return false;
        }

        //console.log('intersects');
        return true;

    }

    /**
     *	intersects
     *
     *	determines, if this Active object intersects another object.
     *	In this simple implementation, this is done by bounding box comparison.
     **/
    theObject.intersects = function(otherX, otherY, otherWidth, otherHeight) {

        if (typeof otherX == 'object') {
            var other = otherX.getBoundingBox();
            otherX = other.x;
            otherY = other.y;
            otherWidth = other.width;
            otherHeight = other.height;
        }

        var bbox = this.getBoundingBox();

        return this.bBoxIntersects(bbox.x, bbox.y, bbox.width, bbox.height, otherX, otherY, otherWidth, otherHeight);

    }
    /**
     *	getOverlappingObjcts
     *
     *	get an array of all overlapping objects
     **/
    theObject.getOverlappingObjects = function() {
        var result = [];

        var inventory = this.getRoom().getInventory();

        for (var i in inventory) {
            var test = inventory[i];
            if (test.id == this.id)
                continue;
            if (this.intersects(test)) {
                result.push(test);
            }
        }

        return result;
    }


    /**
     *	Structuring Objects evaluate other objects in respect to themselves.
     *
     *	object the object that shall be evaluated
     *	changeData old and new values of positioning (e.g. changeData.old.x) 
     **/
    theObject.evaluateObject = function(object, changeData) {
        //complete data
        var oldData = {};
        var newData = {};
        var fields = ['x', 'y', 'cx', 'cy', 'width', 'height'];

        for (var i in fields) {
            var field = fields[i];
            oldData[field] = changeData['old'][field] || object.getAttribute(field);
            newData[field] = changeData['new'][field] || object.getAttribute(field);
        }

        //determine intersections

        var oldIntersects = this.intersects(oldData.x, oldData.y, oldData.width, oldData.height);
        var newIntersects = this.intersects(newData.x, newData.y, newData.width, newData.height);

        //handle move
        if (oldIntersects && newIntersects)
            return this.onMoveWithin(object, newData);
        if (!oldIntersects && !newIntersects)
            return this.onMoveOutside(object, newData);
        if (oldIntersects && !newIntersects)
            return this.onLeave(object, newData);
        if (!oldIntersects && newIntersects)
            return this.onEnter(object, newData);
    }

    if (!theObject.onMoveWithin)
        theObject.onMoveWithin = function(object, data) {
            this.fireEvent('object::' + this.id + '::moveWithin', object.id);
        };

    if (!theObject.onMoveOutside)
        theObject.onMoveOutside = function(object, data) {
            this.fireEvent('object::' + this.id + '::moveOutside', object.id);
        };

    if (!theObject.onLeave)
        theObject.onLeave = function(object, data) {
            this.fireEvent('object::' + this.id + '::leave', object.id);
        };

    if (!theObject.onEnter)
        theObject.onEnter = function(object, data) {
            this.fireEvent('object::' + this.id + '::enter', object.id);
        };


    if (!this.structures)
        this.structures = function(obj) {

            //determines, if a given object is to be structured by this structuring object

            if (this.id == obj.id)
                return false;

            if (obj.isStructuring())
                return false;
            if (obj.isIllustrating())
                return false;

            return true;
        }

    theObject.evaluateObjectNoData = function(object) {
        var x = object.getAttribute('x');
        var y = object.getAttribute('y');
        var width = object.getAttribute('width');
        var height = object.getAttribute('height');
        var intersects = this.intersects(x, y, width, height);

        if (intersects) {
            this.onEnter(object);
            return true;
        } else {
            this.onLeave(object);
            return false;
        }
    }

}


theObject.onDrop = function(objectId, data) {
    this.fireEvent('object::' + this.id + '::drop', objectId);
};
theObject.onDrop.public = true;

/**
 *	getAttributeSet
 *
 *	all of the objects Attributes as key,value pairs.
 *	This may be different from actual object data
 *	as evaluations may be involved
 */
theObject.getAttributeSet = function() {
    return Modules.AttributeManager.getAttributeSet(this);
}

/**
 *	updateClient
 *
 *	send a message to a client (identified by its socket)
 */
theObject.updateClient = function(socket, mode) {
    if (!mode)
        mode = 'objectUpdate';
    var object = this;
    process.nextTick(function() {
        var SocketServer = Modules.SocketServer;
        SocketServer.sendToSocket(socket, mode, object.getAttributeSet());
    });
}

/**
 *	persist
 *
 *	call this whenever an object has changed. It is saved
 *	through the current connector, the evaluation is called
 *	and a message is sent to the clients
 *
 */
theObject.persist = function() {
    var data = this.get();
    if (data) {
        Modules.Connector.saveObjectData(this.inRoom, this.id, data, false, this.context);
        this.updateClients();
    }
}

/**
 *	updateClients
 *
 *	send an upadate message to all clients which are subscribed
 *	to the object's room
 */
theObject.updateClients = function(mode) {

    if (!mode)
        mode = 'objectUpdate';

    var connections = Modules.UserManager.getConnectionsForRoom(this.inRoom);

    for (var i in connections) {
        this.updateClient(connections[i].socket, mode);
    }

}

/**
 *	hasContent
 *
 *	determines, if the object has content or not
 */
theObject.hasContent = function() {
    return this.getAttribute('hasContent');
}

/**
 *	setContent
 *
 *	set a new content. If the content is base64 encoded png data,
 *	it is decoded first.
 */
theObject.setContent = function(content, callback) {

    //console.log(content);

    if ((typeof content) != "object" && content.substr(0, 22) == 'data:image/png;base64,') {

        var base64Data = content.replace(/^data:image\/png;base64,/, ""),
                content = new Buffer(base64Data, 'base64');
    }

    Modules.Connector.saveContent(this.inRoom, this.id, content, callback, this.context);

    this.set('hasContent', !!content);
    this.set('contentAge', new Date().getTime());

    //send object update to all listeners
    this.persist();
    this.updateClients('contentUpdate');
}
theObject.setContent.public = true;
theObject.setContent.neededRights = {
    write: true
}


theObject.copyContentFromFile = function(filename, callback) {

    Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, this.context, callback);

    this.set('hasContent', true);
    this.set('contentAge', new Date().getTime());

    //send object update to all listeners
    this.persist();
    this.updateClients('contentUpdate');

}

theObject.getCurrentUserName = function() {
    if (!this.context)
        return 'root';
    return this.context.user.username;
}

/**
 *	getContent
 *
 *	get the object's content
 */
theObject.getContent = function(callback) {
    if (!this.context)
        throw new Error('Missing context in GeneralObject.getContent');

    var content = Modules.Connector.getContent(this.inRoom, this.id, this.context);

    if (_.isFunction(callback))
        callback(content);
    else
        return content;

}
theObject.getContent.public = true;
theObject.getContent.neededRights = {
    read: true
}

theObject.getContentAsString = function(callback) {
    if (callback === undefined) {
        return GeneralObject.utf8.parse(this.getContent());
    } else {
        this.getContent(function(content) {
            callback(GeneralObject.utf8.parse(content));
        });
    }
}

theObject.getContentFromApplication = function(applicationName, callback) {
    var eventName = "applicationevent::" + applicationName + "::getContent"
    var event = {
        objectID: this.getID(),
        callback: callback
    }
    Modules.EventBus.emit(eventName, event);
}

/**
 *	getInlinePreview
 *
 *	get the object's inline preview
 */
theObject.getInlinePreview = function(callback, mimeType) {
    return Modules.Connector.getInlinePreview(this.inRoom, this.id, mimeType, this.context, callback);
}

theObject.getInlinePreviewMimeType = function(callback) {
    Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


theObject.evaluatePosition = function(key, value, oldvalue) {
    if (this.runtimeData.evaluatePositionData === undefined) {
        this.runtimeData.evaluatePositionData = {};
        this.runtimeData.evaluatePositionData.old = {};
        this.runtimeData.evaluatePositionData.new = {};
    }

    if (this.runtimeData.evaluatePositionData.delay) {
        clearTimeout(this.runtimeData.evaluatePositionData.delay);
        this.runtimeData.evaluatePositionData.delay = false;
    }

    this.runtimeData.evaluatePositionData['new'][key] = value;
    if (!this.runtimeData.evaluatePositionData['old'][key]) {
        this.runtimeData.evaluatePositionData['old'][key] = oldvalue;
        //if there yet is a value here, we have concurrent modifications
    }

    var posData = this.runtimeData.evaluatePositionData;
    var self = this;

    //Within this time, we collect data for evaluation. This is important
    //as often data that logically belongs together is sent seperately

    var timerLength = 200;

    this.runtimeData.evaluatePositionData.delay = setTimeout(function() {

        var data = {};
        data.old = posData.old;
        data.new = posData.new ;

        //self.evaluatePositionInt(data);
        self.updateEvaluationStatus(data);
        self.runtimeData.evaluatePositionData = undefined;
    }, timerLength);

}
theObject.evaluateCurrentPosition = function() {
    var room = this.getRoom();

    if (!room)
        return;

    room.evaluateCurrentPosition(this);
}

theObject.evaluatePositionInt = function(data) {

    var room = this.getRoom();

    if (!room)
        return;

    room.evaluatePositionFor(this, data);

}
theObject.updateEvaluationStatus = function(data) {
    var room = this.getRoom();

    if (!room)
        return;

    room.updateEvaluationStatus(this, data);

}


theObject.getRoom = function(callback) {

    if (!this.context)
        return;

    //search the room in the context and return the room this object is in

    for (var index in this.context.rooms) {
        var test = this.context.rooms[index];
        if (test && test.hasObject && test.hasObject(this)) {
            return test;
        }
    }

    return false;
}

theObject.getBoundingBox = function() {

    var x = this.getAttribute('x');
    var y = this.getAttribute('y');
    var width = this.getAttribute('width');
    var height = this.getAttribute('height');
    return {'x': x, 'y': y, 'width': width, 'height': height};

}

theObject.fireEvent = function(name, data) {

    //console.log('event fired',name,data);

    if (!data) {
        console.log('#### NO DATA');
        return;
    }

    data.context = this.context;

    Modules.EventBus.emit(name, data);
}

theObject.fireEvent.public = true; //Function can be accessed by customObjectFunctionCall
