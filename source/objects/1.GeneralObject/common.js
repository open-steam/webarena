/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject common elements for view and server
*
*/

// functions and properties defined here are the same on the server and client side

var Modules=require('../../server.js');

/**
 * GeneralObject
 * @class
 * @classdesc Common elements for view and server
 */
var GeneralObject=Object.create(Object);

GeneralObject.attributeManager=false;
GeneralObject.translationManager=false;
GeneralObject.actionManager=false;
GeneralObject.isCreatable=false;
GeneralObject.isGraphical=true;
GeneralObject.selected=false;
GeneralObject.category = 'Graphical Elements';
GeneralObject.ObjectManager=Modules.ObjectManager;
GeneralObject.alwaysOnTop = function() {return false;};

GeneralObject.makeSensitive=function(){
	this.isSensitiveFlag=true;
}

GeneralObject.makeStructuring=function(){
	this.isStructuringFlag=true;
}

GeneralObject.isSensitive=function(){
	return this.isSensitiveFlag||false;
}

GeneralObject.isStructuring=function(){
	return this.isStructuringFlag||false;
}


GeneralObject.utf8={};

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
        str +=  byteArray[i] <= 0x7F?
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
GeneralObject.moveByTransform = function(){return false;}

/**
 * True if the object has a special area where it can be moved
 */
GeneralObject.restrictedMovingArea = false;

/**
 * duplicate this object if a linked object gets duplicated
 */
GeneralObject.duplicateWithLinkedObjects = false;

/**
 * duplicate linked objects if this object gets duplicated
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
GeneralObject.register=function(type){
	
	var that=this;
	var ObjectManager=this.ObjectManager;
	var AttributeManager=this.attributeManager;
	
	this.type=type;
	this.standardData=new Modules.DataSet;
	ObjectManager.registerType(type,this);
	this.attributeManager=Object.create(Modules.AttributeManager);
	this.actionManager=Object.create(Modules.ActionManager);
	this.attributeManager.init(this);
	this.translationManager=Object.create(Modules.TranslationManager);
	this.translationManager.init(this);
	this.actionManager.init(this);
	
	
	this.registerAttribute('id',{type:'number',readonly:true});
	this.registerAttribute('type',{type:'text',readonly:true});
	this.registerAttribute('name',{type:'text'});
    
	this.registerAttribute('hasContent',{type:'boolean',hidden:true,standard:false});
	this.registerAttribute('layer',{type:'layer',readonly:false,category:'Dimensions', changedFunction: function(object, value) {GUI.updateLayers();}});
	
	this.registerAttribute('x',{type:'number',min:0,category:'Dimensions'});
	this.registerAttribute('y',{type:'number',min:0,category:'Dimensions'});
	this.registerAttribute('width',{type:'number',min:5,standard:100,unit:'px',category:'Dimensions', checkFunction: function(object, value) {
		
		if (object.resizeProportional()) {
			object.setAttribute("height", object.getAttribute("height")*(value/object.getAttribute("width")));
		}

		return true;
		
	}});
	
	this.registerAttribute('height',{type:'number',min:5,standard:100,unit:'px',category:'Dimensions', checkFunction: function(object, value) {
		
		if (object.resizeProportional()) {
			object.setAttribute("width", object.getAttribute("width")*(value/object.getAttribute("height")));
		}

		return true;
		
	}});

	
	this.registerAttribute('fillcolor',{type:'color',standard:'transparent',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('fillcolor', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});
	this.registerAttribute('linecolor',{type:'color',standard:'transparent',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('linecolor', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});
	this.registerAttribute('linesize',{type:'number',min:1,standard:1,max:30,category:'Appearance'});

	this.registerAttribute('locked',{type:'boolean',standard:false,category:'Basic',checkFunction: function(object, value) {
		
		window.setTimeout(function() {
			object.deselect();
			object.select();
		}, 10);

		return true;
		
	}});
	
	this.registerAttribute('visible',{type:'boolean',standard:true,category:'Basic',checkFunction: function(object, value) {
		
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
	
	this.registerAttribute('link',{type:'object_id',multiple: true, hidden: true, standard:[],category:'Functionality',changedFunction: function(object, value) {
		
		var objects = ObjectManager.getObjects();
		
		for (var index in objects) {
			var object = objects[index];

			if (!object.hasLinkedObjects() && object.getAttribute("visible") != true) {
				object.setAttribute("visible", true);
			}
			
		}
		
		return true;
		
	}});
	
	this.registerAttribute('group',{type:'group',readonly:false,category:'Basic',standard:0});
	
	this.registerAction('Delete',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.deleteIt();
			
		}
		
	},false);
	
	this.registerAction('Duplicate',function(){
		
		ObjectManager.duplicateObjects(ObjectManager.getSelected());
		
	},false);

	this.registerAction('Copy',function(){
	
		ObjectManager.copyObjects(ObjectManager.getSelected());
		
	}, false);

	this.registerAction('Cut',function(){
	
		ObjectManager.cutObjects(ObjectManager.getSelected());
		
	}, false);

    this.registerAction(
        'Link',
        function(lastClicked){
            var selected = ObjectManager.getSelected();
            var lastSelectedId = lastClicked.getId();

            var newLinks = [];
            var oldLinks = lastClicked.getAttribute('link');

            //check if there already existing links
            //	if yes - reinsert them
            if(_.isArray(oldLinks)){
                newLinks = newLinks.concat(oldLinks)
            } else if(oldLinks){
                newLinks.push(oldLinks);
            }
            
            //check if selected object already is a link of the object
            //	if no - add it
            _.each(selected, function(current){
                var selectedId = current.getId()
                if(selectedId!==lastSelectedId && !_.contains(newLinks, current.getId())) newLinks.push(current.getId());
            })

            lastClicked.setAttribute("link", newLinks);
            _.each(selected, function(current){
                current.deselect()
                //current.select()
            })
            lastClicked.select();
        },
        false,
        function(){
            return (ObjectManager.getSelected().length > 1)
        }
    );
	
	
	this.registerAction('Group',function(){
		
		var selected = ObjectManager.getSelected();
		
		var date = new Date();
		var groupID = date.getTime();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.setAttribute("group", groupID);
			
		}
		
	},false, function() {

		var selected = ObjectManager.getSelected();
		
		/* only one object --> no group */
		if (selected.length == 1) return false;
		
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
		if (group == 0) return true;
		
		return false;
		
	});
	
	
	
	this.registerAction('Ungroup',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.setAttribute("group", 0);
			
		}
		
	},false, function() {

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
	
	
	
	var r=Modules.Helper.getRandom(0,200);
	var g=Modules.Helper.getRandom(0,200);
	var b=Modules.Helper.getRandom(0,200);
	var width=100;		

	this.standardData.fillcolor='rgb('+r+','+g+','+b+')';
	this.standardData.width=width;
	this.standardData.height=width;
	
	
	this.registerAction('to front',function(){
	
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")+999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);
	
	this.registerAction('to back',function(){
		
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")-999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);
	

}


GeneralObject.get=function(key){
	return this.attributeManager.get(this.id,key);
}

GeneralObject.set=function(key,value){
	return this.attributeManager.set(this.id,key,value);
}

GeneralObject.setAll=function(data){
	return this.attributeManager.setAll(this.id,data);
}

/**
* Call this on actual objects! (should be done by the object manager)
*
* @param {int} id the id of the actual object
*/	
GeneralObject.init=function(id){
	if (!id) return;
	this.id=id;
	if(this.get(id,'id')) return;
	
	this.set('id',id);
	this.set('type',this.type);
}

GeneralObject.toString=function(){
	    if (!this.get('id')) {
	    	return 'type '+this.type;
	    }
		return this.type+' #'+this.get('id');
}

GeneralObject.getCategory=function(){
	return this.category;
}

GeneralObject.registerAttribute=function(attribute,setter,type,min,max){
	return this.attributeManager.registerAttribute(attribute, setter,type, min, max);
}

GeneralObject.setAttribute=function(attribute,value,forced, transactionId){
	
	
	if (this.mayChangeAttributes()){
		
		//rights could also be checked in the attribute manager but HAVE to
		//be checked on the server side.
		
		var ret = this.attributeManager.setAttribute(this,attribute,value,forced);
		
		if (this.afterSetAttribute) this.afterSetAttribute();
		
		return ret;
		
	} else {
		GUI.error('Missing rights','No right to change '+attribute+' on '+this,this);
		return false;
	}
}
GeneralObject.setAttribute.public = true;
GeneralObject.setAttribute.neededRights = {
    write : true
}

GeneralObject.getAttribute=function(attribute,noevaluation){
	return this.attributeManager.getAttribute(this,attribute,noevaluation);
}



GeneralObject.hasAttribute=function(attribute){
	return this.attributeManager.hasAttribute(this,attribute);
}

GeneralObject.getAttributes=function(){
	
	var attInfo=this.attributeManager.getAttributes();
	
	if (!Helper) {
		var Helper = Modules.Helper;
	}
	attInfo=Helper.getCloneOfObject(attInfo);
	
	for (var i in attInfo){
		var info=attInfo[i];
		info.value=this.getAttribute(i);
		attInfo[i]=info;
	}
	return attInfo;
}

GeneralObject.registerAction=function(name, func, single, visibilityFunc){
	return this.actionManager.registerAction(name,func, single, visibilityFunc);
}

GeneralObject.unregisterAction=function(name){
	return this.actionManager.unregisterAction(name);
}

GeneralObject.performAction=function(name, clickedObject){
	return this.actionManager.performAction(name,clickedObject);
}

GeneralObject.getActions=function(){
	return this.actionManager.getActions();
}

GeneralObject.translate=function(language, text){
	if (!this.translationManager) return text;
	return this.translationManager.get(language, text);
}

GeneralObject.setLanguage=function(currentLanguage) {
	this.currentLanguage = currentLanguage;
}

GeneralObject.setTranslations=function(language,data){
	return this.translationManager.addTranslations(language, data);
}

GeneralObject.setTranslation=GeneralObject.setTranslations;
	

GeneralObject.getType=function(){
	return this.getAttribute('type');
}

GeneralObject.getName=function(){
	return this.getAttribute('name');
}

GeneralObject.getId=function(){
	return this.getAttribute('id');
}

GeneralObject.getCurrentRoom=function(){
	return this.getAttribute("inRoom");
}

GeneralObject.stopOperation=function(){
}

/*
* rights
*/


GeneralObject.mayReadContent=function() {
	return true; //TODO
}

GeneralObject.mayChangeAttributes=function(){
	return true; //TODO
}

GeneralObject.mayChangeContent=function(){
	return true; //TODO
}

GeneralObject.hide=function(){
	this.setAttribute('visible',true);
}

GeneralObject.unHide=function(){
	this.setAttribute('visible',false);
}

GeneralObject.unhide=GeneralObject.unHide;	
	
/**
*	put the top left edge of the bounding box to x,y
*/
GeneralObject.setPosition=function(x,y){

	this.setAttribute('position',{'x':x,'y':y});
}
		
/**
*	update the object's width and height
*/
GeneralObject.setDimensions=function(width,height){
	if (height===undefined) height=width;
	this.setAttribute('width',width);
	this.setAttribute('height',height);
}


GeneralObject.toFront=function(){
	ObjectManager.performAction("toFront");
}

GeneralObject.toBack=function(){
	ObjectManager.performAction("toBack");
}


GeneralObject.isMovable=function(){
	return this.mayChangeAttributes();
}

GeneralObject.isResizable=function(){
	return this.isMovable();
}

GeneralObject.resizeProportional=function(){
	return false;
}


/* following functions are used by the GUI. (because the three functions above will be overwritten) */
GeneralObject.mayMove=function() {
	if (this.getAttribute('locked')) {
		return false;
	} else {
		return this.isMovable();
	}
}

GeneralObject.mayResize=function() {
	if (this.getAttribute('locked')) {
		return false;
	} else {
		return this.isResizable();
	}
}

GeneralObject.mayResizeProportional=function() {
	if (this.getAttribute('locked')) {
		return false;
	} else {
		return this.resizeProportional();
	}
}


GeneralObject.execute=function(){
	this.select();
	this.selectedClickHandler();
}

GeneralObject.isSelected = function() {
	return this.selected;
}

GeneralObject.refresh=function(){
	//This should be overwritten for GUI updates and object repainting
}

GeneralObject.refreshDelayed=function(){
	if (this.refreshDelay){
		clearTimeout(this.refreshDelay);
	}
	
	var that=this;
	
	//this timer is the time in which changes on the same object are discarded
	var theTimer=400;
	
	this.refreshDelay=setTimeout(function(){
		//If the current room has changed in the meantime, do not refresh at all
		if (GUI.couplingModeActive) {
			if (that.getAttribute('inRoom') != ObjectManager.getRoomID('left') && that.getAttribute('inRoom') != ObjectManager.getRoomID('right')){
				return;
			}
		} else {
			if (that.getAttribute('inRoom') != ObjectManager.getRoomID()){
				return;
			}
		}

		that.refresh();
	},theTimer);
}

GeneralObject.getRoomID=function(){
	return this.get('inRoom');
}



GeneralObject.getID=function(){
	return this.id;
}

GeneralObject.remove=function(){
	Modules.ObjectManager.remove(this);
}

GeneralObject.removeLinkedObjectById = function(removeId){
    var filteredIds = _.filter(this.get('link'), function(elem){return elem != removeId})

    this.setAttribute("link", filteredIds);

}

GeneralObject.hasLinkedObjects=function() {
	
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

GeneralObject.getLinkedObjects=function() {
	var self = this;
	
	/* getObject (this is different on server and client) */
	if (self.ObjectManager.isServer) {
		/* server */
		var getObject = function(id) {
			return Modules.ObjectManager.getObject(self.get('inRoom'), id, self.context);
		}
		var getObjects = function() {
			return Modules.ObjectManager.getObjects(self.get('inRoom'), self.context);
		}
	} else {
		/* client */
		var getObject = function(id) {
			return ObjectManager.getObject(id);
		}
		var getObjects = function() {
			return ObjectManager.getObjects(ObjectManager.getIndexOfObject(self.getId()));
		}
	}

	/* get objects linked by this object */
	var ownLinkedObjectsIds = [];


	if (this.get('link') instanceof Array) {
        ownLinkedObjectsIds = ownLinkedObjectsIds.concat(this.get('link'));
	} else {
		ownLinkedObjectsIds.push(this.get('link'));
	}

	/* get objects which link to this object */
	var linkingObjectsIds = [];
	

	var objects = getObjects();

	for (var index in objects) {
		var object = objects[index];

		if (object.get('link')) {
			
			if (object.get('link') instanceof Array) {

				for (var index in object.get('link')) {
					var objectId = object.get('link')[index];
				
					if (objectId == self.get('id')) {
						linkingObjectsIds.push(object.get('id'));
					}
					
				}
				
			} else {

				if (object.get('link') == self.get('id')) {
					linkingObjectsIds.push(object.get('id'));
				}
				
			}
			
		}
		
	}

	var links = {};

	if (ownLinkedObjectsIds) {

		for (var index in ownLinkedObjectsIds) {
			var objectId = ownLinkedObjectsIds[index];

			if (!objectId) break;

			var webarenaObject = getObject(objectId);

			links[objectId] = {
				object : webarenaObject,
				direction : "out"
			}

		}
	}
	
	
	if (linkingObjectsIds) {

		for (var index in linkingObjectsIds) {
			var objectId = linkingObjectsIds[index];
			
			if (!objectId) break;

			var webarenaObject = getObject(objectId);

			links[objectId] = {
				object : webarenaObject,
				direction : "in"
			}

		}
	}

	return links;
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


GeneralObject.getObjectsToDuplicate = function(list) {
	
	var self = this;
	
	if (list == undefined) {
		/* init new list */
		
		/* list of objects which will be duplicated */
		var list = {};
		
	}
	
	list[self.get('id')] = true; //add this object to list
	
	var linkedObjects = this.getLinkedObjects();

	for (var id in linkedObjects) {
		var target = linkedObjects[id];
		var targetObject = target.object;
		
		if (targetObject && targetObject && !list[targetObject.get('id')]) {
			targetObject.getObjectsToDuplicate(list);
		}
		
	}


	var arrList = [];
	
	for (var objectId in list) {

		arrList.push(objectId);
		
	}
	
	return arrList;
	
}

GeneralObject.updateLinkIds = function(idTranslationList) {

	if (!this.get('link') || this.get('link') == "") {
		return;
	}
	
	var update = function(id) {

		if (idTranslationList[id] != undefined) {
			id = idTranslationList[id];
		}
		return id;
	}
	
	if (this.get('link') instanceof Array) {

		for (var i in this.get('link')) {
			this.setAttribute("link", update(this.get('link')[i]));
		}
		
	} else {
		this.setAttribute("link", update(this.get('link')));
	}
	
}

GeneralObject.deleteIt=GeneralObject.remove;

module.exports=GeneralObject;

