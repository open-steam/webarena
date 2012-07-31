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

var GeneralObject=Object.create(Object);

GeneralObject.data=false;	  //the attributes
GeneralObject.attributes=GeneralObject.data;
GeneralObject.attributeManager=false;
GeneralObject.translationManager=false;
GeneralObject.actionManager=false;
GeneralObject.isCreatable=false;
GeneralObject.isGraphical=true;
GeneralObject.selected=false;
GeneralObject.category = 'Graphical Elements';
GeneralObject.ObjectManager=Modules.ObjectManager;
GeneralObject.moveByTransform = false;			//TODO cient only??

GeneralObject.duplicateWithLinkedObjects = false; //duplicate this object if a linked object gets duplicated
GeneralObject.duplicateLinkedObjects = false; //duplicate linked objects if this object gets duplicated

GeneralObject.contentURLOnly = true; //content is only accessible via URL


GeneralObject.register=function(type){
	
	var that=this;
	var ObjectManager=this.ObjectManager;
	
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
    
	this.registerAttribute('hasContent',{type:'boolean',hidden:true});
  
	this.attributeManager.registerAttribute('layer',{type:'layer',readonly:false,category:'Dimensions', changedFunction: function(object, value) {
		GUI.updateLayers();
	}});
	
	this.attributeManager.registerAttribute('x',{type:'number',min:0,category:'Dimensions'});
	this.attributeManager.registerAttribute('y',{type:'number',min:0,category:'Dimensions'});
	
	this.attributeManager.registerAttribute('width',{type:'number',min:5,standard:100,unit:'px',category:'Dimensions', checkFunction: function(object, value) {
		
		if (object.resizeProportional()) {
			object.setAttribute("height", object.getAttribute("height")*(value/object.getAttribute("width")));
		}

		return true;
		
	}});
	
	this.attributeManager.registerAttribute('height',{type:'number',min:5,standard:100,unit:'px',category:'Dimensions', checkFunction: function(object, value) {
		
		if (object.resizeProportional()) {
			object.setAttribute("width", object.getAttribute("width")*(value/object.getAttribute("height")));
		}

		return true;
		
	}});
	
	this.attributeManager.registerAttribute('fillcolor',{type:'color',standard:'transparent',category:'Appearance'});
	this.attributeManager.registerAttribute('linecolor',{type:'color',standard:'black',category:'Appearance'});
	this.attributeManager.registerAttribute('linesize',{type:'number',min:1,standard:1,category:'Appearance'});
	this.attributeManager.registerAttribute('shadow',{type:'boolean',standard:false,category:'Appearance'});
	
	this.attributeManager.registerAttribute('hidden',{type:'boolean',standard:false,category:'Basic',changedFunction: function(object, value, local) {
		if (local) {
			GUI.toggleHidden();
		} else {
			GUI.updateHiddenObjects();
		}
	}});
	this.attributeManager.registerAttribute('locked',{type:'boolean',standard:false,category:'Basic',checkFunction: function(object, value) {
		
		window.setTimeout(function() {
			object.deselect();
			object.select();
		}, 10);

		return true;
		
	}});
	
	this.attributeManager.registerAttribute('visible',{type:'boolean',standard:true,category:'Basic',checkFunction: function(object, value) {
		
		if (!object.hasLinkedObjects() && value == false) {
			return "you need at least one link from or to this object to hide it";
		} else {
			return true;
		}
		
	}});
	
	this.attributeManager.registerAttribute('link',{type:'object_id',multiple: true, standard:[],category:'Functionality',changedFunction: function(object, value) {
		
		var objects = ObjectManager.getObjects();
		
		for (var index in objects) {
			var object = objects[index];

			if (!object.hasLinkedObjects() && object.getAttribute("visible") != true) {
				object.setAttribute("visible", true);
			}
			
		}
		
		return true;
		
	}});
	
	this.attributeManager.registerAttribute('group',{type:'group',readonly:false,category:'Basic',standard:0});
	
	this.registerAction('Delete',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.deleteIt();
			
		}
		
	},false);
	
	this.registerAction('Duplicate',function(){
		
		var selected = ObjectManager.getSelected();
		
		var date = new Date();
		var groupID = date.getTime();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.duplicate(groupID);
			
		}
		
	},false);
	
	
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

/**
*
*	Call this on actual objects! (should be done by the object manager)
*
*	@param id the id of the actual object
*/	
GeneralObject.init=function(id){
	if (!this.data) this.data=new Modules.DataSet;
	
	if(this.data.id) return;
	
	this.data.id=id;
	this.id=id;
	this.data.type=this.type;
}

GeneralObject.toString=function(){
	    if (!this.data) {
	    	return 'type '+this.type;
	    }
		return this.type+' #'+this.data.id;//+' '+this.data;
}

GeneralObject.getCategory=function(){
	return this.category;
}

GeneralObject.registerAttribute=function(attribute,setter,type,min,max){
	return this.attributeManager.registerAttribute(attribute, setter,type, min, max);
}

GeneralObject.setAttribute=function(attribute,value,forced){
	
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

GeneralObject.getAttribute=function(attribute){
	return this.attributeManager.getAttribute(this,attribute);
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

GeneralObject.performAction=function(name){
	return this.actionManager.performAction(name,this);
}

GeneralObject.getActions=function(){
	return this.actionManager.getActions();
}

GeneralObject.translate=function(language, text){
	if (!this.translationManager) return text;
	return this.translationManager.get(language, text);
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
	return ObjectManager.currentRoom.data.id;
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
	this.setAttribute('hidden',true);
}

GeneralObject.unHide=function(){
	this.setAttribute('hidden',false);
}

/**
*	move the object by dx,dy pixels
*/
GeneralObject.move=function(dx,dy){
	this.setAttribute('x',this.getAttribute('x')+dx);
	this.setAttribute('y',this.getAttribute('y')+dy);
}		
	
/**
*	put the top left edge of the bounding box to x,y
*/
GeneralObject.setPosition=function(x,y){
	
	/*
	this.setAttribute('x',x);
	this.setAttribute('y',y);
	*/
	this.setAttribute('position',{'x':x,'y':y});
}
		
/**
*	update the object's width and height
*/
GeneralObject.setDimensions=function(width,height){
	if (!height) height=width;
	this.setAttribute('width',width);
	this.setAttribute('height',height);
}

	
/**
*	determine if a given point is within the current object
*/
GeneralObject.boxContainsPoint=function(px,py){
	return this.boxIntersectsWith(px,py,0,0);
}

/**
*	determine if the current object intersects with the square x1,y1,x2,y2
*/
GeneralObject.boxIntersectsWith=function(otherx,othery,otherwidth,otherheight){
	
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();
	
	if (otherx+otherwidth<thisx) return false;
	if (otherx>thisx+thisw) return false;
	if (othery+otherheight<thisy) return false;
	if (othery>thisy+thish) return false;
	
	return true;
	
}

GeneralObject.intersectsWith=function(other){
	return false;
	//TODO
}

GeneralObject.contains=function(other){
	return false;
	//TODO
}

GeneralObject.hasPixelAt=function(x,y){
	
	//assume, that the GeneralObject is full of pixels.
	//override this if you can determine better, where there
	//object is nontransparent
	
	return this.boxIntersectsWith(x,y,0,0);
	//TODO: duplicate of GeneralObject.boxContainsPoint !?
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
	this.toFront();
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
	
	this.refreshDelay=setTimeout(function(){
		that.refresh();
	},200);
}

GeneralObject.getRoomID=function(){
	return this.data.inRoom;
}



GeneralObject.getID=function(){
	return this.id;
}

GeneralObject.remove=function(){
	Modules.ObjectManager.remove(this);
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
			return Modules.ObjectManager.getObject(self.data.inRoom, id, self.context);
		}
		var getObjects = function() {
			return Modules.ObjectManager.getObjects(self.data.inRoom, self.context);
		}
	} else {
		/* client */
		var getObject = function(id) {
			return ObjectManager.getObject(id);
		}
		var getObjects = function() {
			return ObjectManager.getObjects();
		}
	}

	/* get objects linked by this object */
	var ownLinkedObjectsIds = [];

	if (this.data.link instanceof Array) {
		ownLinkedObjectsIds.concat(this.data.link);
	} else {
		ownLinkedObjectsIds.push(this.data.link);
	}
	
	/* get objects which link to this object */
	var linkingObjectsIds = [];
	

	var objects = getObjects();

	for (var index in objects) {
		var object = objects[index];

		if (object.data.link) {
			
			if (object.data.link instanceof Array) {

				for (var index in object.data.link) {
					var objectId = object.data.link[index];
				
					if (objectId == self.data.id) {
						linkingObjectsIds.push(object.data.id);
					}
					
				}
				
			} else {

				if (object.data.link == self.data.id) {
					linkingObjectsIds.push(object.data.id);
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
		
		if (obj.data.id != this.data.id && obj.getAttribute("group") == this.getAttribute("group")) {
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
	
	list[self.data.id] = true; //add this object to list
	
	var linkedObjects = this.getLinkedObjects();

	for (var id in linkedObjects) {
		var target = linkedObjects[id];
		var targetObject = target.object;
		
		if (!list[targetObject.data.id]) {
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

	if (!this.data.link || this.data.link == "") {
		return;
	}
	
	var update = function(id) {

		if (idTranslationList[id] != undefined) {
			id = idTranslationList[id];
		}
		return id;
	}
	
	if (this.data.link instanceof Array) {

		for (var i in this.data.link) {
			this.setAttribute("link", update(this.data.link[i]));
		}
		
	} else {
		this.setAttribute("link", update(this.data.link));
	}
	
}

GeneralObject.deleteIt=GeneralObject.remove;

//returns the Evaluated position of an object. returns false if an object cannot be positioned
GeneralObject.getEvaluatedPosition=function(){
	return this.getRoom().getEvaluatedPositionFor(this);
}

//evaluates the position for an object. If there was no evaluation, false is returned.
//if there was one, it returns an array of attributes which shall be set
GeneralObject.evaluatePosition=function(x,y){
	return false;
	//return this.getRoom().evaluatePositionFor(this,x,y);
}

module.exports=GeneralObject;

