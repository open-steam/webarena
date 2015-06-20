/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *	 GeneralObject common elements for view and server
 *
 */

// functions and properties defined here are the same on the server and client side

var Modules = require('../../../server.js');

/**
 * GeneralObject
 * @class
 * @classdesc Common elements for view and server
 */
var GeneralObject = Object.create(Object);

GeneralObject.attributeManager = false;
GeneralObject.translationManager = false;
GeneralObject.actionManager = false;
GeneralObject.isCreatable = false;
GeneralObject.isGraphical = true;
GeneralObject.selected = false;
GeneralObject.category = 'Graphical Elements';
GeneralObject.ObjectManager = Modules.ObjectManager;
GeneralObject.alwaysOnTop = function() {
    return false;
};
GeneralObject.onMobile = false;
GeneralObject.isSelectedOnMobile = false;
GeneralObject.hasMobileRep = false;
GeneralObject.hasEditableMobileContent = false;
GeneralObject.isCreatableOnMobile = false;

GeneralObject.makeSensitive = function() {
    this.isSensitiveFlag = true;
}

GeneralObject.makeStructuring = function() {
    this.isStructuringFlag = true;
}

GeneralObject.isSensitive = function() {
    return this.isSensitiveFlag || false;
}

GeneralObject.isStructuring = function() {
    return this.isStructuringFlag || false;
}


GeneralObject.utf8 = {};

GeneralObject.utf8.toByteArray = function(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++)
        if (str.charCodeAt(i) <= 0x7F)
            byteArray.push(str.charCodeAt(i));
        else {
            var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
            for (var j = 0; j < h.length; j++)
                byteArray.push(parseInt(h[j], 16));
        }
    return byteArray;
};

GeneralObject.utf8.parse = function(byteArray) {
    var str = '';
    for (var i = 0; i < byteArray.length; i++)
        str += byteArray[i] <= 0x7F ?
                byteArray[i] === 0x25 ? "%25" : // %
                String.fromCharCode(byteArray[i]) :
                "%" + byteArray[i].toString(16).toUpperCase();
    try {
        return decodeURIComponent(str);
    } catch (e) {
    }
    return '';
};

/**
 * Checks if an objects is moved by transform
 * @returns {bool} True if moved by transform
 * TODO: client only??
 */
GeneralObject.moveByTransform = function() {
    return false;
}

/**
 * True if the object has a special area where it can be moved
 */
GeneralObject.restrictedMovingArea = false;

/**
 * duplicate this object if a linked object gets duplicated
 * TODO: remove, is not used any more
 */
GeneralObject.duplicateWithLinkedObjects = false;

/**
 * duplicate linked objects if this object gets duplicated
 * TODO: remove, is not used any more
 */
GeneralObject.duplicateLinkedObjects = false;

/**
 * content is only accessible via URL
 */
GeneralObject.contentURLOnly = true;

/**
 * The currrent language
 */
GeneralObject.currentLanguage = Modules.Config.language;

/**
 * Registers the object
 * @param {ObjectType} type The type of the object
 */
GeneralObject.register = function(type) {

    var that = this;
    var ObjectManager = this.ObjectManager;
    var AttributeManager = this.attributeManager;

    this.type = type;
    this.standardData = new Modules.DataSet;
    ObjectManager.registerType(type, this);
    this.attributeManager = Object.create(Modules.AttributeManager);
    this.actionManager = Object.create(Modules.ActionManager);
    this.attributeManager.init(this);
    this.translationManager = Object.create(Modules.TranslationManager);
    this.translationManager.init(this);
    this.actionManager.init(this);


    this.registerAttribute('id', {type: 'number', readonly: true});
    this.registerAttribute('type', {type: 'text', readonly: true});
    this.registerAttribute('name', {type: 'text'});
	this.registerAttribute('oldRoomID', {type: 'text', hidden:true});

    this.registerAttribute('hasContent', {type: 'boolean', hidden: true, standard: false});
    this.registerAttribute('layer', {type: 'layer', readonly: false, category: 'Dimensions', changedFunction: function(object, value) {
            GUI.updateLayers();
        }, mobile: false});

    this.registerAttribute('x', {type: 'number', min: 0, category: 'Dimensions', mobile: false});
    this.registerAttribute('y', {type: 'number', min: 0, category: 'Dimensions', mobile: false});
    this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

        }, mobile: false});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

        }, mobile: false});

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

    this.registerAttribute('linesize', {type: 'number', min: 1, standard: 1, category: 'Appearance'});

    this.registerAttribute('locked', {type: 'boolean', standard: false, category: 'Basic', checkFunction: function(object, value) {

            window.setTimeout(function() {
                object.deselect();
                object.select();
            }, 10);

            return true;

        }, mobile: false});

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

        }, mobile: false});

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

	this.registerAttribute('destination', {type: 'Hyperlink', standard: "choose", linkFunction: function(object) {
            object.showExitDialog()
        }, category: 'Functionality', changedFunction: function(object) {
            if(object.updateIcon){object.updateIcon()};
        }});
    this.registerAttribute('destinationObject', {type: 'Hyperlink', standard: "choose", hidden: true, linkFunction: function(object) {
            object.showExitDialog()
        }, category: 'Functionality'});
    this.registerAttribute('filterObjects', {type: 'boolean', standard: false, hidden: true});
	
	this.registerAttribute('open destination on double-click',{type:'boolean',standard:false,category:'Functionality'});
	
	this.registerAttribute('open in',{type:'selection',standard:'same Tab',options:['same Tab','new Tab','new Window'],category:'Functionality'});
	
    //this.registerAttribute('onMobile', {type:'boolean', standard:false, category:'Basic', mobile: false});

    this.registerAction('Delete', function() {

        var selected = ObjectManager.getSelected();

        for (var i in selected) {
            var object = selected[i];

            object.deleteIt();

        }

    }, false);

    this.registerAction('Duplicate', function() {

        ObjectManager.duplicateObjects(ObjectManager.getSelected());

    }, false);

    this.registerAction('Copy', function() {

        ObjectManager.copyObjects(ObjectManager.getSelected());

    }, false);

    this.registerAction('Cut', function() {

        ObjectManager.cutObjects(ObjectManager.getSelected());

    }, false);

    this.registerAction(
            'Link',
            function(lastClicked) {

                var linkProperties = lastClicked.translate(GUI.currentLanguage, "select properties");

                GUI.showLinkPropertyDialog(lastClicked, lastClicked, linkProperties, true);

            },
            false,
            function() {
                return (ObjectManager.getSelected().length > 1)
            }
    );


    this.registerAction('Group', function() {

        var selected = ObjectManager.getSelected();

        var date = new Date();
        var groupID = date.getTime();

        for (var i in selected) {
            var obj = selected[i];

            obj.setAttribute("group", groupID);

        }

    }, false, function() {

        var selected = ObjectManager.getSelected();

        /* only one object --> no group */
        if (selected.length == 1)
            return false;

        /* prevent creating a group if all objects are in the same group */
        var group = undefined;

        for (var i in selected) {
            var obj = selected[i];

            if (group == undefined) {
                group = obj.getAttribute("group");
            } else {

                if (group != obj.getAttribute("group")) {
                    return true;
                }

            }

        }

        /* if the common group is 0 there is no group */
        if (group == 0)
            return true;

        return false;

    });


    this.registerAction('Ungroup', function() {

        var selected = ObjectManager.getSelected();

        for (var i in selected) {
            var obj = selected[i];

            obj.setAttribute("group", 0);

        }

    }, false, function() {

        var selected = ObjectManager.getSelected();

        /* prevent ungrouping if no selected element is in a group */
        var hasGroups = false;

        for (var i in selected) {
            var obj = selected[i];

            if (obj.getAttribute("group") != 0) {
                hasGroups = true;
            }

        }

        return hasGroups;

    });
    this.registerAction('copy format', function(lastClicked){
        var selected = ObjectManager.getSelected();
        //console.log(lastClicked);
        if(selected.length > 1){
            lastClicked.showFormatDialog(selected);
        }else{
            alert("Es muss mehr als ein Objekt selektiert sein. Ansonsten gibt es keine Objekte, auf die die Formatierung übertragen werden kann!");
        } 
    });
    /*this.registerAction('paste format', function(){
        var selected = ObjectManager.getSelected();
        ObjectManager.pasteFormatAttributes(selected);
    }); */


    var r = Modules.Helper.getRandom(0, 200);
    var g = Modules.Helper.getRandom(0, 200);
    var b = Modules.Helper.getRandom(0, 200);
    var width = 100;

    this.standardData.fillcolor = 'rgb(' + r + ',' + g + ',' + b + ')';
    this.standardData.width = width;
    this.standardData.height = width;


    this.registerAction('to front', function() {

        /* set a very high layer for all selected objects (keeping their order) */
        var selected = ObjectManager.getSelected();

        for (var i in selected) {
            var obj = selected[i];

            obj.setAttribute("layer", obj.getAttribute("layer") + 999999);

        }

        ObjectManager.renumberLayers();

    }, false);

    this.registerAction('to back', function() {

        /* set a very low layer for all selected objects (keeping their order) */
        var selected = ObjectManager.getSelected();

        for (var i in selected) {
            var obj = selected[i];

            obj.setAttribute("layer", obj.getAttribute("layer") - 999999);

        }

        ObjectManager.renumberLayers();

    }, false);

    this.registerAction('Open destination', function(object) {
        object.follow(object.getAttribute("open in"));
    }, true);
	
}


GeneralObject.get = function(key) {
    return this.attributeManager.get(this.id, key);
}

GeneralObject.set = function(key, value) {
    return this.attributeManager.set(this.id, key, value);
}

GeneralObject.setAll = function(data) {
    return this.attributeManager.setAll(this.id, data);
}

/**
 * Call this on actual objects! (should be done by the object manager)
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

GeneralObject.toString = function() {
    if (!this.get('id')) {
        return 'type ' + this.type;
    }
    return this.type + ' #' + this.get('id');
}

GeneralObject.getCategory = function() {
    return this.category;
}

GeneralObject.registerAttribute = function(attribute, setter, type, min, max) {
    return this.attributeManager.registerAttribute(attribute, setter, type, min, max);
}

GeneralObject.setAttribute = function(attribute, value, forced, transactionId) {


    if (this.mayChangeAttributes()) {

        //rights could also be checked in the attribute manager but HAVE to
        //be checked on the server side.

        var ret = this.attributeManager.setAttribute(this, attribute, value, forced);

        if (this.afterSetAttribute)
            this.afterSetAttribute();

        return ret;

    } else {
        GUI.error('Missing rights', 'No right to change ' + attribute + ' on ' + this, this);
        return false;
    }
}
GeneralObject.setAttribute.public = true;
GeneralObject.setAttribute.neededRights = {
    write: true
}

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

GeneralObject.registerAction = function(name, func, single, visibilityFunc) {
    return this.actionManager.registerAction(name, func, single, visibilityFunc);
}

GeneralObject.unregisterAction = function(name) {
    return this.actionManager.unregisterAction(name);
}

GeneralObject.performAction = function(name, clickedObject) {
    return this.actionManager.performAction(name, clickedObject);
}

GeneralObject.getActions = function() {
    return this.actionManager.getActions();
}

GeneralObject.translate = function(language, text) {
    if (!this.translationManager)
        return text;
    return this.translationManager.get(language, text);
}

GeneralObject.setLanguage = function(currentLanguage) {
    this.currentLanguage = currentLanguage;
}

GeneralObject.setTranslations = function(language, data) {
    return this.translationManager.addTranslations(language, data);
}

GeneralObject.setTranslation = GeneralObject.setTranslations;

GeneralObject.getType = function() {
    return this.getAttribute('type');
}

GeneralObject.getName = function() {
    return this.getAttribute('name');
}

GeneralObject.getId = function() {
    return this.getAttribute('id');
}

GeneralObject.getCurrentRoom = function() {
    return this.getAttribute("inRoom");
}

GeneralObject.stopOperation = function() {
}

/*
 * rights
 */

GeneralObject.mayReadContent = function() {
    return true; //TODO
}

GeneralObject.mayChangeAttributes = function() {
    return true; //TODO
}

GeneralObject.mayChangeContent = function() {
    return true; //TODO
}


/**
 *	put the top left edge of the bounding box to x,y
 */
GeneralObject.setPosition = function(x, y) {

    this.setAttribute('position', {'x': x, 'y': y});
}

/**
 *	update the object's width and height
 */
GeneralObject.setDimensions = function(width, height) {
    if (height === undefined)
        height = width;
    this.setAttribute('width', width);
    this.setAttribute('height', height);
}


GeneralObject.toFront = function() {
    ObjectManager.performAction("toFront");
}

GeneralObject.toBack = function() {
    ObjectManager.performAction("toBack");
}


GeneralObject.isMovable = function() {
    return this.mayChangeAttributes();
}

GeneralObject.isResizable = function() {
    return this.isMovable();
}

GeneralObject.resizeProportional = function() {
    return false;
}


/* following functions are used by the GUI. (because the three functions above will be overwritten) */
GeneralObject.mayMove = function() {
    if (this.getAttribute('locked')) {
        return false;
    } else {
        return this.isMovable();
    }
}

GeneralObject.mayResize = function() {
    if (this.getAttribute('locked')) {
        return false;
    } else {
        return this.isResizable();
    }
}

GeneralObject.mayResizeProportional = function() {
    if (this.getAttribute('locked')) {
        return false;
    } else {
        return this.resizeProportional();
    }
}


GeneralObject.execute = function() {
    this.select();
    this.selectedClickHandler();
}

GeneralObject.isSelected = function() {
    return this.selected;
}

GeneralObject.refresh = function() {
    //This should be overwritten for GUI updates and object repainting
}

GeneralObject.refreshDelayed = function() {
    if (this.refreshDelay) {
        clearTimeout(this.refreshDelay);
    }

    var that = this;

    //this timer is the time in which changes on the same object are discarded
    var theTimer = 400;

    this.refreshDelay = setTimeout(function() {
        //If the current room has changed in the meantime, do not refresh at all
        if (GUI.couplingModeActive) {
            if (that.getAttribute('inRoom') != ObjectManager.getRoomID('left') && that.getAttribute('inRoom') != ObjectManager.getRoomID('right')) {
                return;
            }
        } else {
            if (that.getAttribute('inRoom') != ObjectManager.getRoomID()) {
                return;
            }
        }

        that.refresh();
    }, theTimer);
}

GeneralObject.getRoomID = function() {
    return this.get('inRoom');
}

GeneralObject.getID = function() {
    return this.id;
}

GeneralObject.remove = function() {
    Modules.ObjectManager.remove(this);
}


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

GeneralObject.follow = function(openMethod) {

    var destination = this.getAttribute('destination');
	
    if (!destination || destination == "choose") {
        return this.showExitDialog();
    } else {
        var self = this;

        var callback = false;
        if (self.getAttribute("destinationObject") !== '') {
            callback = function() {
                if (document.getElementById(self.getAttribute("destinationObject"))) {
                    if (!GUI.couplingModeActive) {
                        $(document).scrollTo(
                                $('#' + self.getAttribute("destinationObject")),
                                1000,
                                {
                                    offset: {
                                        top: (self.getAttribute("height") / 2) - ($(window).height() / 2),
                                        left: (self.getAttribute("width") / 2) - ($(window).width() / 2)
                                    }
                                }
                        );
                    }
                }
            }
        }

		
        if(openMethod == 'new Tab'){
            window.open(destination);
			return;
		}
        if(openMethod == 'new Window'){
			var newWindow = window.open(destination, Modules.Config.projectTitle, "height="+window.outerHeight+", width="+window.outerWidth);
			return;
        }
	
		//open in same tab
		if(String(destination).indexOf("http://www.") != 0){
			ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')), callback);
		}
		else{
			window.open(destination,"_self")
		}
    }

	
	
}


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

GeneralObject.deleteIt = GeneralObject.remove;

module.exports = GeneralObject;
