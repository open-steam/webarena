/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2015
 *
 *	  As every webArena object type inherits from GeneralObject, GeneralObject/common.js,
 *	  GeneralObject/server.js etc. contain very basic code for object interaction.
 *
 *	  This common.js file contains code which is equally valid on the client as
 *	  well as on the server side.
 *
 */

// functions and properties defined here are the same on the server and client side

var Modules = require('../../../server.js');  // The modules variable provides access
											  // to the basic managers as well as
											  // to the configuration

var GeneralObject = Object.create(Object);

// these are some general flags for every object type which can (and should be) over-
// written.

GeneralObject.isCreatable = false;  // set this to true if object types can be created
GeneralObject.isGraphical = true;   // set this to true if the object has a graphical representation
GeneralObject.alwaysOnTop = false;  // set this to true if the object should be displayed above all layers
GeneralObject.contentURLOnly = true; // set this to true if the object contains content which should not be
									 // automatically synchronized between client and server but which is
									 // accessed by URL.

/**
 * Registers the object
 *
 * The register function is automatically called during the server startup sequence
 * where the server looks for object definition and calls its register function.
 *
 * @param {ObjectType} type The type of the object
 */
GeneralObject.register = function(type) {

    var ObjectManager = Modules.ObjectManager;  // for convenience only

    this.type = type; 
    
    this.standardData = new Modules.DataSet; // DataSet is a set of very basic attributes like x and y
    
    ObjectManager.registerType(type, this); // Register this object type on the object manager.
    										// (on ther server as well as on the client)
    
    // Objects need to have access to a number of managers:
    //
    // ObjectManager: handles object creation and object retrieval 
    // (see the respective ObjectManager on the client and on the server side
    
    this.objectManager = Modules.ObjectManager;
    this.ObjectManager = Modules.ObjectManager;
    
    // AttributeManager: handles an object's attributes (see common/AttributeManager)
    
    this.attributeManager = Object.create(Modules.AttributeManager);
    this.attributeManager.init(this);
    
    // Further managers exist only on the client side and are found in the clientRegister function.
    
    // Now registering basic attributes
    
    
    if (Modules.Config.debugMode){
    	this.registerAttribute('debug1', {type: 'text', category: 'Debug'});
    	this.registerAttribute('debug2', {type: 'text', category: 'Debug'});
    	this.registerAttribute('debug3', {type: 'text', category: 'Debug'});
    	this.registerAttribute('debug4', {type: 'text', category: 'Debug'});
    }
    
    this.registerAttribute('id', {type: 'number', readonly: true});
    this.registerAttribute('type', {type: 'text', readonly: true});
    this.registerAttribute('name', {type: 'text'});

    this.registerAttribute('hasContent', {type: 'boolean', hidden: true, standard: false});
    
    this.registerAttribute('layer', {type: 'layer', readonly: false, category: 'Dimensions', changedFunction: function(object, value) {
            GUI.updateLayers();
        }});

    this.registerAttribute('x', {type: 'number', min: 0, category: 'Dimensions'});
    this.registerAttribute('y', {type: 'number', min: 0, category: 'Dimensions'});
    
    this.registerAttribute('cx',{hidden:true, mobile: false,getFunction:function(object){		return Math.floor(object.getAttribute('x')+object.getAttribute('width')/2);	},setFunction:function(object,value){		object.setAttribute('x',Math.floor(value-object.getAttribute('width')/2));	}});	this.registerAttribute('cy',{hidden:true, mobile: false,getFunction:function(object){		return Math.floor(object.getAttribute('y')+object.getAttribute('height')/2);	},setFunction:function(object,value){		object.setAttribute('y',Math.floor(value-object.getAttribute('height')/2));	}});
    
    
    this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

        }});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

        }});

    this.registerAttribute('fillcolor', {type: 'color', standard: 'rgba(0, 0, 0, 0)', category: 'Appearance', checkFunction: function(object, value) {

            if (object.checkTransparency('fillcolor', value)) {
                return true;
            } else
                return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

        }});

    this.registerAttribute('linecolor', {type: 'color', standard: 'rgba(0, 0, 0, 0)', category: 'Appearance', checkFunction: function(object, value) {

            if (object.checkTransparency('linecolor', value)) {
                return true;
            } else
                return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

        }});

    this.registerAttribute('linesize', {type: 'number', min: 1,max:10, standard: 1, category: 'Appearance'});

    this.registerAttribute('fixed', {type: 'boolean', standard: false, category: 'Basic', checkFunction: function(object, value) {

            window.setTimeout(function() {
                object.deselect();
                object.select();
            }, 10);

            return true;

        }});

    this.registerAttribute('visible', {type: 'boolean', standard: true, category: 'Basic', checkFunction: function(object, value) {

            if (value != false) {
                return true;
            }

            var linkedVisibleObjectsCounter = 0;

            var linkedObjects = object.getLinkedObjects();

            for (var i in linkedObjects) {
                var linkedObject = linkedObjects[i];

                if (linkedObject.object.getAttribute("visible") == true) {
                    linkedVisibleObjectsCounter++;
                }
            }

            if (linkedVisibleObjectsCounter == 0) {
                return object.translate(GUI.currentLanguage, "you need at least one link from or to this object to hide it");
            } else {
                return true;
            }

        }});

    this.registerAttribute('link', {multiple: true, hidden: true, standard: [], category: 'Functionality', changedFunction: function(object, value) {

            var objects = ObjectManager.getObjects();

            GUI.drawLinks(object);

            for (var index in objects) {
                var object = objects[index];

                if (!object.hasLinkedObjects() && object.getAttribute("visible") != true) {
                    object.setAttribute("visible", true);
                }

            }

            return true;

        }});

    this.registerAttribute('group', {type: 'group', readonly: false, category: 'Basic', standard: 0});
	
    var r = Modules.Helper.getRandom(0, 200);
    var g = Modules.Helper.getRandom(0, 200);
    var b = Modules.Helper.getRandom(0, 200);
    var width = 100;

    this.standardData.fillcolor = 'rgb(' + r + ',' + g + ',' + b + ')';
    this.standardData.width = width;
    this.standardData.height = width;
	
}  // End of register function

/**
 * The init function is called by the objectManager. In contrast to the register function
 * it is called on the actual object rather than on the object prototype.
 *
 * @param {int} id the id of the actual object
 */
GeneralObject.init = function(id) {
    if (!id)
        return;
    this.id = id;
    if (this.get(id, 'id'))
        return;

    this.set('id', id);
    this.set('type', this.type);
}

/**
 * A toString method for debug purposes
 */
GeneralObject.toString = function() {
    if (!this.get('id')) {
        return 'type ' + this.type;
    }
    return this.type + ' #' + this.get('id');
}

/**
 * Attribute handling
 *
 * The following attributes are mostly a shortcut to the object's attribute manager
 *
 * the get and set function set an object's value without any futher check and should
 * only be used with caution (e.g. in situations where checks would fail as the attributes
 * subject to the chech are just created)
 */

GeneralObject.get = function(key) {
    return this.attributeManager.get(this.id, key);
}

GeneralObject.set = function(key, value) {
    return this.attributeManager.set(this.id, key, value);
}

GeneralObject.setAll = function(data) {
    return this.attributeManager.setAll(this.id, data);
}


GeneralObject.registerAttribute = function(attribute, setter, type, min, max) {
    return this.attributeManager.registerAttribute(attribute, setter, type, min, max);
}

GeneralObject.setAttribute = function(attribute, value, forced, transactionId) {
	
  return this.attributeManager.setAttribute(this, attribute, value, forced);

}
GeneralObject.setAttribute.public = true;
GeneralObject.setAttribute.neededRights = {write: true}

GeneralObject.getAttribute = function(attribute, noevaluation) {
    return this.attributeManager.getAttribute(this, attribute, noevaluation);
}

GeneralObject.hasAttribute = function(attribute) {
    return this.attributeManager.hasAttribute(this, attribute);
}

GeneralObject.getAttributes = function() {

    var attInfo = this.attributeManager.getAttributes();

    if (!Helper) {
        var Helper = Modules.Helper;
    }
    attInfo = Helper.getCloneOfObject(attInfo);

    for (var i in attInfo) {
        var info = attInfo[i];
        info.value = this.getAttribute(i);
        attInfo[i] = info;
    }
    return attInfo;
}

// several getters and setters

GeneralObject.getCategory = function() {
    return this.category;
}

GeneralObject.getType = function() {
    return this.getAttribute('type');
}

GeneralObject.getName = function() {
    return this.getAttribute('name');
}

GeneralObject.getRoomID = function() {
    return this.get('inRoom');
}
GeneralObject.getCurrentRoom=GeneralObject.getRoomID;


GeneralObject.getID = function() {
    return this.get('id');
}
GeneralObject.getId = GeneralObject.getID;


//function for deleting the current object

GeneralObject.remove = function() {
    Modules.ObjectManager.remove(this);
}

GeneralObject.deleteIt = GeneralObject.remove;


//returns if an object has links to other objects or not
GeneralObject.hasLinkedObjects = function() {

    var counter = 0;

    var linkedObjects = this.getLinkedObjects();

    for (var id in linkedObjects) {
        var object = linkedObjects[id];

        counter++;

    }

    if (counter > 0) {
        return true;
    } else {
        return false;
    }

}

//getGroupMembers
//
//returns an array of object which belong to the same group
GeneralObject.getGroupMembers = function() {

    var list = [];

    var objects = ObjectManager.getObjects();

    for (var i in objects) {
        var obj = objects[i];

        if (obj.get('id') != this.get('id') && obj.getAttribute("group") == this.getAttribute("group")) {
            list.push(obj);
        }

    }

    return list;

}


//update the links after duplicate an object
//TODO: This should maybe be transferred to the object duplacation code as it is never used elsewhere
GeneralObject.updateLinkIds = function(idTranslationList) {

    var links = this.getAttribute('link');

    var that = this;

    links.forEach(function(link) {
        if (typeof idTranslationList[link.destination] != 'undefined') { // this destination was also copied
            link.destination = idTranslationList[link.destination];
            that.setAttribute('link', links);
            that.persist();
        }
        else { //this destination was not copied		
            var dest = Modules.ObjectManager.getObject(that.inRoom, link.destination, that.context);

            if (typeof dest.inRoom === 'undefined') { //the object and the destination are in different rooms now, so remove the links
                links = links.filter(function(element) {
                    return element.destination !== link.destination;
                });
                that.setAttribute('link', links);
            }
            else {

                var newLink = {
                    destination: that.id,
                    arrowheadOtherEnd: link.arrowheadOtherEnd,
                    arrowheadThisEnd: link.arrowheadThisEnd,
                    width: link.width,
                    style: link.style,
                    padding: link.padding
                }
                var destLinks = dest.getAttribute('link');
                destLinks.push(newLink);
                dest.setAttribute('link', destLinks);
                dest.persist();
            }
        }
    });
}


/**
*     LINK HANDLING
*/



/**
*	create Links between this object and other object (by adding entries in the link-attribute of all objects)
* @param {array} targetIds    array with ids of the target objects
* @param {boolean} arrowheadOtherEnd    Show an arrow on the distant end of the link. Default value: false (if not specified)
* @param {boolean} arrowheadThisEnd    Show an arrow on the near end of the link. Default value: false (if not specified) 
* @param {int} width    Width of the link. Default value: 5 (if not specified) 
* @param {string} style    Style of the link. Possibilities: stroke, dotted, dashed. Default value: stroke (if not specified) 
* @param {int} padding    Space between the objects and the link. Default value: 5 (if not specified) 
*/
GeneralObject.createLinks = function(targetIds, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding){

	for(var i = 0; i<targetIds.length; i++){
		this.createLink(targetIds[i], arrowheadOtherEnd, arrowheadThisEnd, width, style, padding);
	}
	
}


/**
* create a Link between this object and one other object (by adding an entry in the link-attribute of both objects)
* @param {string} targetId    the id of the target object
*  other parameters: see above 
*/
GeneralObject.createLink = function(targetId, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding){

	var target;
	var object;

	if(typeof this.context == "undefined"){ //client side call
		target = ObjectManager.getObject(targetId);
		object = this;
	}
	else{ //server side call
		target = Modules.ObjectManager.getObject(this.inRoom, targetId, this.context); 
		object = Modules.ObjectManager.getObject(this.inRoom, this.id, this.context); 
	}

	object.setLinkAttribute(targetId, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding);
	target.setLinkAttribute(this.id, arrowheadThisEnd, arrowheadOtherEnd, width, style, padding);
	
}


/**
*	change the Links between this object and all other object (by changing the entries in the link-attribute)
*  @param  {array} targetIds     array with ids of the target objects
*  other parameters: see above 
*/
GeneralObject.changeLinks = function(targetIds, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding){

	for(var i = 0; i<targetIds.length; i++){
		this.changeLink(targetIds[i], arrowheadOtherEnd, arrowheadThisEnd, width, style, padding);
	}

}


/**
*	change the Link between this object and one other object (by changing the entry in the link-attribute)
*  @param {string} targetId    the id of the target object
*  other parameters: see above 
*/
GeneralObject.changeLink = function(targetId, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding){

	var target;
	var object;

	if(typeof this.context == "undefined"){ //client side call
		target = ObjectManager.getObject(targetId);
		object = this;
	}
	else{ //server side call
		target = Modules.ObjectManager.getObject(this.inRoom, targetId, this.context); 
		object = Modules.ObjectManager.getObject(this.inRoom, this.id, this.context); 
	}

	object.setLinkAttribute(targetId, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding);
	target.setLinkAttribute(this.id, arrowheadThisEnd, arrowheadOtherEnd, width, style, padding);

}


/**
*	delete all Links between this object and all other object (by removing the entries from the link-attribute)
*/
GeneralObject.deleteLinks = function(){

	var links = this.getAttribute('link');
	
	for(var i = 0; i<links.length; i++){
		this.deleteLink(links[i].destination);
	}

}


/**
*	delete the Link between this object and one other object (by removing the entry from the link-attribute)
* @param {string} targetId     the id of the target object
*/
GeneralObject.deleteLink = function(targetId){

	var target;
	var object;

	if(typeof this.context == "undefined"){ //client side call
		target = ObjectManager.getObject(targetId);
		object = this;
	}
	else{ //server side call
		target = Modules.ObjectManager.getObject(this.inRoom, targetId, this.context); 
		object = Modules.ObjectManager.getObject(this.inRoom, this.id, this.context); 
	}

	object.removeLinkAttribute(targetId);
	target.removeLinkAttribute(this.id);

}


/**
*
*	internal
*
*   set the Link attribute of this object
*/
GeneralObject.setLinkAttribute = function(targetId, arrowheadOtherEnd, arrowheadThisEnd, width, style, padding){

	var newLinks = [];
	var oldLinks = this.getAttribute('link');
	
	//check if there already existing links, if yes: reinsert them
	if(oldLinks.length != 0){
		for(var i = 0; i<oldLinks.length; i++){
			newLinks.push(oldLinks[i]);
		}
	}
	
	//define default values
	var link = {
		destination: targetId,
		arrowheadOtherEnd: false,
		arrowheadThisEnd: false,
		width: 5,
		style: "stroke",
		padding: 5
	};
	
	for(var i = 0; i<newLinks.length; i++){
		if(newLinks[i].destination == targetId){ //link is already specified-->overwrite the default values with the existing values
			for (var attribute in newLinks[i]){
				link[attribute] = newLinks[i][attribute]; 
			}
			newLinks.splice(i, 1);
		}
	}
	
	if(arrowheadOtherEnd == true || arrowheadOtherEnd == false){
		link.arrowheadOtherEnd = arrowheadOtherEnd;
	}
	
	if(arrowheadThisEnd == true || arrowheadThisEnd == false){
		link.arrowheadThisEnd = arrowheadThisEnd;
	}
		
	if(typeof width == "number" && width > 0){
		link.width = width;
	}
	
	if(style == "stroke" || style == "dashed" || style == "dotted"){
		link.style = style;
	}
		
	if(typeof padding == "number" && padding > -1){
		link.padding = padding;
	}	

	newLinks.push(link);
	
    this.setAttribute("link", newLinks); 

	if(typeof this.context == "undefined"){ //client side call
		//show all links (if 'showLinks' is deactivated, activate it)
		var room = this.getRoom(); 
		room.setAttribute('showLinks', true); 
	}
	
}


/**
*
*	internal
*
*   remove an entry from the Link attribute of this object
*/
GeneralObject.removeLinkAttribute = function(targetId){

	var newLinks = [];
	var oldLinks = this.getAttribute('link');

	//check if there already existing links, if yes and they are unequal to the targetId: reinsert them
	if(oldLinks.length != 0){
		for(var i = 0; i<oldLinks.length; i++){
			if(oldLinks[i].destination != targetId){
				newLinks.push(oldLinks[i]);
			}
		}
	}
	
    this.setAttribute("link", newLinks);

}


/**
*
*	 SENSITIVE AND STRUCTURING OBJECTS
*
*	 here in the common.js, only flags are set. Actual logic is provided in the client and server files
*
*/

GeneralObject.makeSensitive=function(){	this.isSensitiveFlag=true;}

GeneralObject.makeStructuring=function(){	this.isStructuringFlag=true;}GeneralObject.makeActive=function(){	this.isActiveFlag=true;}GeneralObject.isActive=function(){	return this.isActiveFlag||false;}GeneralObject.isIllustrating=function(){	return !(this.isActive());}GeneralObject.isStructuring=function(){	return this.isStructuringFlag||false;}

GeneralObject.isSensitive=function(){	return this.isSensitiveFlag||false;}

module.exports = GeneralObject;