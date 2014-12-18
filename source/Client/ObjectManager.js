// This is the client side ObjectManager

"use strict";

var Modules=false;

/**
 * Object providing functions for object management
 */
var ObjectManager={};

ObjectManager.isServer=false;
ObjectManager.objects={'left':{},'right':{}};
ObjectManager.objectsRight={'left':{},'right':{}};
ObjectManager.currentRoomID={'left':false,'right':false};
ObjectManager.currentRoom={'left':false,'right':false};
ObjectManager.clientID = new Date().getTime()-1296055327011;
ObjectManager.prototypes={};
ObjectManager.user={};
ObjectManager.clipBoard={};
ObjectManager.roomChangeCallbacks = [];
ObjectManager.newIDs = [];

ObjectManager.registerType=function(type,constr){
    this.prototypes[type]=constr;
};

ObjectManager.getTypes=function(){
    return ObjectManager.prototypes;
};

ObjectManager.getPrototype=function(objType){
    var prototypes=this.prototypes;
    if (prototypes[objType]) return prototypes[objType];
    if (prototypes['UnknownObject']) return prototypes['UnknownObject'];
    if (prototypes['GeneralObject']) return prototypes['GeneralObject'];
    return;
}

ObjectManager.getIndexOfObject=function(objectID) {
	// room?
	for (var index in this.currentRoomID) {
		if (this.currentRoomID[index] === objectID) {
			return index;
		}
	}

	for (var index in this.currentRoomID) {
    	if (ObjectManager.objects[index][objectID] != undefined) {
    		return index;
    	}
    }
    return false;
}

ObjectManager.getObject=function(objectID){
	//room?
	for (var index in this.currentRoomID) {
    	if (objectID==this.currentRoomID[index]) {
    		return this.currentRoom[index];
    	}
    }

    for (var index in this.currentRoomID) {
    	if (ObjectManager.objects[index][objectID] != undefined) {
    		return ObjectManager.objects[index][objectID];
    	}
    }
}

ObjectManager.buildObject=function(type, attributes){
	
	if (!type) console.trace();

    var proto=this.getPrototype(type);
    var object=Object.create(proto);

	object.setLanguage(GUI.currentLanguage);

    object.init(attributes.id);

    object.setAll(attributes);
    object.type=proto.type;
    object.set('type',proto.type);

    var isRoom = false;
    for (var currentRoomIndex in this.currentRoomID) {
    	if (object.get('id') == this.currentRoomID[currentRoomIndex]) {
    		isRoom = true;
    		this.currentRoom[currentRoomIndex]=object;
        	this.currentRoom[currentRoomIndex].isGraphical=false; // the current room cannot be positioned
    	}
    }
    if (!isRoom) {
    	var index = ObjectManager.getIndexOfObject(attributes.inRoom);
    	this.objects[index][object.id]=object;
    }

    if(typeof object.afterCreation == "function"){
        object.afterCreation();
    }
	
	if(this.newIDs.indexOf(attributes.id) != -1){ //object was duplicated
		this.afterDuplicate(object);
	}
	
    return object;

}

/**
 * getObjects - get an array of all objects including the room
 */
ObjectManager.getObjects=function(index){
	if (!index) index = 'left';
    return this.objects[index];
}
ObjectManager.getInventory=ObjectManager.getObjects;

/**
 * getObjectsByLayer - get an array of all objects ordered by layer (highest layer first)
 */
ObjectManager.getObjectsByLayer=function(index) {
	
    var objects = this.getObjects(index);
	
    var objectsArray = [];
	
    for (var i in objects){
        var obj = objects[i];
        objectsArray.push(obj);
    }

    objectsArray.sort(function(a,b) {
		
		if (a.alwaysOnTop() === true) {
			return 1;
		}
		
		if (b.alwaysOnTop() === true) {
			return -1;
		}
		
        if (a.getAttribute("layer") > b.getAttribute("layer")) {
            return 1;
        } else {
            return -1;
        }
		
    });
	
    return objectsArray;
	
}


/**
 * getObjectsByLayer - get an array of all objects ordered by layer (lowest layer first)
 */
ObjectManager.getObjectsByLayerInverted=function(index) {
	
    var objects = ObjectManager.getObjectsByLayer(index);
	objects.reverse();
	
    return objects;
	
}


/**
*	hasObject - determine, if an object is within the current inventory
*/
ObjectManager.hasObject=function(obj){
    return !!this.getObject(obj.getAttribute('id'));
}

ObjectManager.objectUpdate=function(data){
	
    var object=ObjectManager.getObject(data.id);
	
    if (object){
		
        if (object.moving) return;
		
        var oldData=object.get();
		
        object.setAll(data);
		
        /**
        
        TODO Room updated come with no object type. Why?
        
        if (!data.type){
    		console.log('No type');
    		console.log(data);
    		console.trace();
    	}
    	**/
        
		
        for (var key in oldData){
            var oldValue=oldData[key];
            var newValue=data[key];
            if (oldValue!=newValue){
                this.attributeChanged(object,key,newValue);
            }
        }

        object.refreshDelayed();
    } else {
	
        object = ObjectManager.buildObject(data.type,data);

        if (GUI.couplingModeActive) {
        	// to enable smooth dragging of objects between rooms display new objects immediately 
        	// exceptions: SimpleText and Textarea need to load their content first else they are invisible or empty
        	if (data.type !== "SimpleText" && data.type !== "Textarea") {
        		object.refresh();
        	} else {
        		object.refreshDelayed();
        	}
        } else {
        	object.refreshDelayed();
        }
    }
	
	if (this.informGUI) {
		this.informGUI(object);
	}
}

ObjectManager.attributeChanged=function(object,key,newValue,local){
	
    if (!object.attributeManager.getAttributes()[key]) return;
	
    var changedFunction=object.attributeManager.getAttributes()[key].changedFunction;
	
    if (changedFunction) changedFunction(object,newValue,local);
	
    if (this.informGUI) this.informGUI(object,key,newValue,local)
    else console.log('GUI is not listening to attribute changes. (use Modules.ObjectManager.registerAttributeChangedFunction)');
	
}

ObjectManager.onObjectRemoveListeners = [];
ObjectManager.registerOnObjectRemoveListener = function(listener) {
	this.onObjectRemoveListeners.push(listener);
}
ObjectManager.onObjectRemove = function(object) {
	for (var i = 0; i < this.onObjectRemoveListeners.length; ++i) {
		this.onObjectRemoveListeners[i](object);
	}
}



ObjectManager.informGUI=false;
ObjectManager.registerAttributeChangedFunction=function(theFunction){
    this.informGUI=theFunction;
}

ObjectManager.contentUpdate=function(data){
    var object=ObjectManager.getObject(data.id);
    object.contentUpdated();
}

ObjectManager.remove=function(object){
    var that = this;
    if(! this.transactionId){
        that.transactionId = new Date().getTime();
    } else {
        window.transactionTimer = window.setTimeout(function(){
            //calculate new transactionId
            //TODO: isn't safe - concurrent users may result in same timestamp
            that.transactionId = new Date().getTime();
        }, this.transactionTimeout);
    }

    Modules.SocketClient.serverCall('deleteObject',{
        'roomID':object.getRoomID(),
        'objectID':object.getID(),
        'transactionId': that.transactionId,
        'userId' : GUI.userid
    });
}

ObjectManager.removeLocally=function(data){
	
    var object=ObjectManager.getObject(data.id);
	
	this.onObjectRemove(object);
		
    //remove representation
    if (object.removeRepresentation){
        object.removeRepresentation();
    }
	
    delete(ObjectManager.objects[ObjectManager.getIndexOfObject(data.id)][data.id]);
    
    // delete associated pad
    if (Modules.config.collaborativeEditor) ObjectManager.Pads.deletePadFor(data.id);
	
	GUI.hideActionsheet();
	
	GUI.updateInspector();
	
}


ObjectManager.login=function(username, password, externalSession){
    if (!username) username='guest';
    if (!password) password='';
    Modules.SocketClient.serverCall('login',{
        'username':username,
        'password':password,
		'externalSession' : externalSession
    });
}


ObjectManager.goParent=function(){
	var currentRoomID = ObjectManager.currentRoomID['left'];
	var currentRoom = ObjectManager.getObject(currentRoomID);
	var parentID = currentRoom.getAttribute('parent');
	
	if (parentID){
		ObjectManager.loadRoom(parentID);
	} else {
		alert(GUI.translate('This room has no parent.'))
	}
	
}


ObjectManager.goHome=function(){
	ObjectManager.loadRoom(ObjectManager.user.home);
}

ObjectManager.registerRoomChangeCallbacks = function(doOnChange){
    this.roomChangeCallbacks.push(doOnChange);
}

ObjectManager.executeRoomChangeCallbacks = function(){
    while(this.roomChangeCallbacks.length > 0){
        this.roomChangeCallbacks.pop().call(this);
    }
}

ObjectManager.loadRoom=function(roomid, byBrowserNav, index, callback){

	var self = this;
	
	GUI.eraseAllLinks(); //erase the existing links in the old room
	
    this.executeRoomChangeCallbacks();

	if (!index) var index = 'left';
		
	// in coupling mode: do not load room if it is already displayed
	var proceed = true;
	if (GUI.couplingModeActive && (ObjectManager.getRoomID('left') == roomid || ObjectManager.getRoomID('right') == roomid)) {
		proceed = false;
	}

	if (proceed) {
		Modules.Dispatcher.query('enter',{'roomID':roomid,'index':index},function(error){

			if (error !== true) {
				var objects = self.getObjects(index);
				for (var i in objects) {
					var obj = objects[i];
				    ObjectManager.removeLocally(obj);
				}

				if(!roomid) roomid='public';
				
				self.currentRoomID[index]=roomid;
				   
				if (!byBrowserNav && index === 'left'){
					history.pushState({ 'room':roomid }, roomid, '/room/'+roomid);
				}
				    
				if (GUI.couplingModeActive) {
		    		GUI.defaultZoomPanState(index, true);
		    	}
								
				if (callback) setTimeout(callback, 1200);
				
				// Create and display an annotation pad for the room
                if (Modules.config.collaborativeEditor) ObjectManager.Pads.createRoomPad(ObjectManager.getRoomID());
			}
		});
	} else {
		alert(GUI.translate("Room already displayed"));
	}
}

ObjectManager.leaveRoom=function(roomid,index,serverCall) {
	
	var self = this;

	if (!index) var index = 'right'; 
	
	if (serverCall) {
		Modules.Dispatcher.query('leave',{'roomID':roomid,'index':index,'user':self.getUser()},function(error){
		
			if (error !== true) {
		
			    var objects = self.getObjects(index);
			    for (var i in objects) {
			        var obj = objects[i];
			        ObjectManager.removeLocally(obj);
			    }
				
				self.currentRoomID[index] = false;
				self.currentRoom[index] = false;
			
			}
			
	    });
	} else {
		var objects = self.getObjects(index);
		for (var i in objects) {
			var obj = objects[i];
			ObjectManager.removeLocally(obj);
		}

		self.currentRoomID[index] = false;
		self.currentRoom[index] = false;

	}	
}

ObjectManager.createObject=function(type,attributes,content,callback,index) {
	if (!index) var index = 'left';
	
    var data={
        'roomID':this.currentRoomID[index],
        'type':type,
        'attributes':attributes,
        'content':content
    };
	
    Modules.Dispatcher.query('createObject',data,function(objectID){
        //objectID is the id of the newly created object
        //the object may not yet be loaded so we wait for it
		
        var runs=0;
        var object=false;
        var interval=setInterval(function(){
            if (runs==50) {
                console.log('ERROR: Timeout while waiting for the object');
                clearTimeout(interval);
                return;
            }
            object=Modules.ObjectManager.getObject(objectID);
            if (object){
                clearTimeout(interval);

				ObjectManager.renumberLayers(true);
				
				object.setAttribute('name', GUI.translate(type));

                object.justCreated();
				if (callback != undefined) callback(object);
                return;
            }
            runs++;
        },100);
		
    });
}

ObjectManager.init=function(){
    this.transactionId = false;
    this.transactionTimeout = 500;
    var that = this;
	
	ObjectManager.startEtherpad();
	
	Modules.Dispatcher.registerCall('infotext', function(text){
        var translatedText = GUI.translate(text);
		//GUI.error("warning", text, false, false);
		$().toastmessage('showToast', {
			'text': translatedText,
			'sticky': false,
			'position' : 'top-left'
		});
	});

    Modules.Dispatcher.registerCall('welcome',function(data){

    });
	
    Modules.Dispatcher.registerCall('loggedIn',function(data){
        GUI.loggedIn();
        ObjectManager.user = data.userData;
		ObjectManager.userHash = data.userhash;

		if (GUI.startRoom !== undefined && GUI.startRoom != '') {
			ObjectManager.loadRoom(GUI.startRoom);
		} else if (data.home !== undefined) {
			ObjectManager.loadRoom(data.home);
		} else {
			GUI.error("Unable to load room", "Unable to load room. (no room defined)", false, true);
		}
        
    });
	
    Modules.Dispatcher.registerCall('loginFailed',function(data){
        GUI.loginFailed(data);
    });

    Modules.Dispatcher.registerCall('objectUpdate',function(data){
		ObjectManager.objectUpdate(data);
    })
	
	Modules.Dispatcher.registerCall('paintingsUpdate',function(data){ 	
        ObjectManager.paintingUpdate(data);
    })
	
    Modules.Dispatcher.registerCall('objectDelete',function(data){
		ObjectManager.getObject(data.id).deleteLinks();  //delete all links which ends or starts in this object
        ObjectManager.removeLocally(data);
    });
	
    Modules.Dispatcher.registerCall('contentUpdate',function(data){
        ObjectManager.contentUpdate(data);
    });

	Modules.Dispatcher.registerCall('entered',function(data){
		GUI.entered();
    });
	
    Modules.Dispatcher.registerCall('error',function(data){
        GUI.error("server error", data, false, true);
    });
    
    Modules.Dispatcher.registerCall('inform',function(data){

		if (data.message.awareness !== undefined && data.message.awareness.present !== undefined) {
			//list of users
			var users = [];
			for (var i = 0; i < data.message.awareness.present.length; i++) {
				var d = data.message.awareness.present[i];
				users.push(d);
			}
			GUI.chat.setUsers(users);
			GUI.userMarker.removeOfflineUsers(users);
		}
		
		if (data.message.text !== undefined) {
			GUI.chat.addMessage(data.user, data.message.text, data.color, data.message.read);
		}
		
		if (data.message.selection) {
			if (data.userId != ObjectManager.user.id) { //do not display own selections
				
				GUI.userMarker.select({
					"objectId" : data.message.selection,
					"title" : data.user,
					"identifier" : data.userId,
					"color" : data.color
				});
				
			}
			
		}
		
		if (data.message.deselection) {
			
			if (data.userId != ObjectManager.user.id) { //do not display own selections
			
				GUI.userMarker.deselect({
					"objectId" : data.message.deselection,
					"identifier" : data.userId,
				});
			
			}
			
		}

    });


    Modules.Dispatcher.registerCall('askForChoice', function(data){

        var dialogTitle = data.title;
        var choices = data.choices;

        var onSave = function(){
            var responseEvent = 'response::askForChoice::' + data.responseID
            var choice = $(dialog).find('input:radio:checked').val();
            console.log(choice);
            Modules.Socket.emit(responseEvent, {choice : choice});
        }
        var onExit = function(){return false;};

        var dialogButtons = {
            "Antworten" : onSave,
            "Abbrechen" : onExit
        };

        var content = '<form>';
        content = _(choices).reduce(function(accum, choice){
            //TODO perhaps need to escape whitesapces in choice
            return accum + "<input type='radio' name='some-choice' value='" + choice + "'>" + choice + "<br/>";
        }, content)
        content += "</form>";
        console.log(content);
        console.log(data);

        var dialog = GUI.dialog(dialogTitle, content, dialogButtons);


    });
}

ObjectManager.getRoomID=function(index){
	if (!index) var index = 'left';
    return this.currentRoomID[index];
}

ObjectManager.getCurrentRoom=function(index){
	if (!index) var index = 'left';
	return this.currentRoom[index];
}


ObjectManager.getSelected=function(){
	var result=[];
	
	for (var index in this.objects) {
	    for (var i in this.objects[index]) {
	        var obj = this.objects[index][i];
			
	        if (obj.isSelected()) {
	            result.push(obj);
	        }
			
	    }
	}
    return result;
}


ObjectManager.getActionsForSelected = function() {
	
    var selectedObjects = this.getSelected();

    var actions = new Array();
	
    for (var key in selectedObjects) {
        var object = selectedObjects[key];

        var objActions = new Array();
		
        var a = object.getActions();

        for (var actionName in a) {
            var actionData = a[actionName];

            if ((!actionData.single || selectedObjects.length == 1) && (!actionData.visibilityFunc || actionData.visibilityFunc())) {
                objActions.push(actionName);
            }
			
        }

        actions = Helper.getIntersectionOfArrays(actions, objActions);

    }
	
    return actions;
	
}


ObjectManager.performActionForSelected = function(actionName, clickedObject) {
	
	var selectedObjects = this.getSelected();
	
	if (!selectedObjects) return;
	
	selectedObjects[0].performAction(actionName, clickedObject);
	
}


ObjectManager.renumberLayers = function(noUpdate) {
	
    /* get all objects and order by layer */
    var objects = ObjectManager.getObjects();
	
    var objectsArray = [];
	
    for (var i in objects){
        var obj = objects[i];
        objectsArray.push(obj);
    }

    objectsArray.sort(function(a,b) {
		
        if (a.getAttribute("layer") > b.getAttribute("layer")) {
            return 1;
        } else {
            return -1;
        }
		
    });
	
    /* set new layers */
    var layer = 1;
	
    for (var i in objectsArray){
        var obj = objectsArray[i];
		
        obj.setAttribute("layer", layer);
        layer++;
		
    }
	
	if (noUpdate === undefined) {
    	GUI.updateLayers();
	}
	
}

ObjectManager.getUser=function(){
	return this.user;
}

ObjectManager.serverMemoryInfo=function(){
	ObjectManager.Modules.Dispatcher.query('memoryUsage','',console.log);
}

ObjectManager.inform=function(type,content,index){
	var data={};
	data.message={};
	data.message[type]=content;
	data.room=this.getRoomID(index);
	data.user=this.getUser().username;
	data.color=this.getUser().color;
	data.userId=this.getUser().id;
	ObjectManager.Modules.Dispatcher.query('inform',data);
}

ObjectManager.tell=function(text){
	ObjectManager.inform('text',text);
}

ObjectManager.informAboutSelection=function(id){
	// show the annotation pad for the selected object
    if (Modules.config.collaborativeEditor) ObjectManager.Pads.showPadFor(id);
	
	ObjectManager.inform('selection',id,ObjectManager.getIndexOfObject(id));
}

ObjectManager.informAboutDeselection=function(id){
    // show room's annotation if nothing is selected
    if (Modules.config.collaborativeEditor) ObjectManager.Pads.showDefault();
    
	ObjectManager.inform('deselection',id,ObjectManager.getIndexOfObject(id));
}

ObjectManager.requestAttentionToObject=function(id){
	ObjectManager.inform('requestAttention',id,ObjectManager.getIndexOfObject(id));
}

ObjectManager.reportBug=function(data, callback){
    ObjectManager.Modules.Dispatcher.query('bugreport',data,callback);
}

ObjectManager.showAll=function() {

	var objects = ObjectManager.getObjects();

    for (var i in objects){
        var obj = objects[i];
        obj.setAttribute("visible", true);
    }

}

ObjectManager.clientErrorMessage=function(data, callback){
        ObjectManager.Modules.Dispatcher.query('clientErrorMessage', data, callback);
}


ObjectManager.copyObjects=function(objects) {
	if (objects != undefined && objects.length > 0) {
		ObjectManager.clipBoard.cut = false;

		var array = new Array();

		for (var key in objects) {
	        var object = objects[key];
	        array.push(object.getId());
	    }
	    
	    ObjectManager.clipBoard.room = objects[0].getCurrentRoom();
		ObjectManager.clipBoard.objects = array;
	}
}

ObjectManager.cutObjects=function(objects) {
	if (objects != undefined && objects.length > 0) {
		ObjectManager.clipBoard.cut = true;

		var array = new Array();

		for (var key in objects) {
	        var object = objects[key];
	        array.push(object.getId());
	    }
	    
	    ObjectManager.clipBoard.room = objects[0].getCurrentRoom();
		ObjectManager.clipBoard.objects = array;
	}
}

ObjectManager.pasteObjects=function() {

	if (ObjectManager.clipBoard.objects != undefined && ObjectManager.clipBoard.objects.length > 0) {

		var paste = false;
		if (ObjectManager.clipBoard.objects.length <= 5) {
			paste = true;
		} else {
			paste = GUI.confirm(GUI.translate('You are pasting') + ' ' + ObjectManager.clipBoard.objects.length + ' ' + GUI.translate('objects') + '.\n' 
					+ GUI.translate('Do you want to continue?'));
		}

		if (paste) {
			var requestData={};
			
			requestData.fromRoom=ObjectManager.clipBoard.room;
			requestData.toRoom=this.getRoomID();
		    requestData.objects=ObjectManager.clipBoard.objects;
		    requestData.cut=ObjectManager.clipBoard.cut;
		    requestData.attributes={};

			Modules.Dispatcher.query('duplicateObjects',requestData, function(idList){
				
				for(var key in idList){
					if(ObjectManager.newIDs.indexOf(idList[key]) == -1){
						ObjectManager.newIDs.push(idList[key]);
					}
				}
				GUI.deselectAllObjects();
			});

			if (ObjectManager.clipBoard.cut) {
				ObjectManager.clipBoard={};
			}
		}
	}
}


ObjectManager.duplicateObjects=function(objects) {
	if (objects != undefined && objects.length > 0) {

		var duplicate = false;
		if (objects.length <= 5) {
			duplicate = true;
		} else {
			duplicate = GUI.confirm(GUI.translate('You are duplicating') + ' ' + objects.length + ' ' + GUI.translate('objects') + '.\n' 
						+ GUI.translate('Do you want to continue?'));
		}

		if (duplicate) {
			var array = new Array();

			for (var key in objects) {
		        var object = objects[key];
		        array.push(object.getId());
		    }
		    
		    var requestData={};
			requestData.fromRoom=objects[0].getCurrentRoom();
			requestData.toRoom=objects[0].getCurrentRoom();
		    requestData.objects=array;
		    requestData.cut=false;
		    requestData.attributes={};

			Modules.Dispatcher.query('duplicateObjects',requestData, function(idList) {
				for(var key in idList){
					if(ObjectManager.newIDs.indexOf(idList[key]) == -1){
						ObjectManager.newIDs.push(idList[key]);
					}
				}
				GUI.deselectAllObjects();
			});
		}
	}
}


// select new objects after duplication and build the links
ObjectManager.afterDuplicate=function(newObject) {

	var minX = Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	
	GUI.deselectAllObjects();
	
	newObject.select(true);
	
	GUI.drawLinks(newObject);
	
	this.newIDs.splice(this.newIDs.indexOf(newObject.id), 1);
	
	// determine left most and top most coordinates of pasted objects in case of scrolling
	if (newObject.getAttribute('x') < minX) {
		minX = newObject.getAttribute('x');
	}
	if (newObject.getAttribute('y') < minY) {
		minY = newObject.getAttribute('y');
	}
	
	//scroll to position of pasted objects (TODO: only in new room...)
	if (!GUI.couplingModeActive) {
		if (minX - 30 < 0) minX = 30;
		if (minY - 30 < 0) minY = 30;
			
		$(document).scrollTo(
			{ 
				top: minY - 30, 
				left: minX - 30
			},
			1000
		);
	}
}



ObjectManager.moveObjectBetweenRooms=function(fromRoom,toRoom,cut) {
	var objects = ObjectManager.getSelected();
	
	if (objects != undefined && objects.length > 0) {

		var array = new Array();

		var positions = {};
		for (var key in objects) {
		    var object = objects[key];
			array.push(object.getId());

			positions[object.getId()] = {};
			positions[object.getId()]['x'] = object.getViewX();
			positions[object.getId()]['y'] = object.getViewY(); 
		}

		var requestData={};
		requestData.fromRoom=fromRoom;
		requestData.toRoom=toRoom;
		requestData.objects=array;
		requestData.cut=cut;
		requestData.attributes=positions;

		var newIDs=[];
		var selectNewObjects = function() {
			for (var key in newIDs) {
				var newObject = ObjectManager.getObject(newIDs[key]);
				newObject.select(true);
			}
		};

		Modules.Dispatcher.query('duplicateObjects',requestData, function(idList) {
			newIDs = idList;
			GUI.deselectAllObjects();
			setTimeout(selectNewObjects, 200);
		});
	}
}

ObjectManager.paintingUpdate = function(data){

	if ( !ObjectManager.getCurrentRoom().getAttribute("showUserPaintings") ) return;
	
	ObjectManager.getCurrentRoom().getUserPaintings(function(paintings)
	{
		for ( var n = 0 ; n < paintings.length ; n++ )
		{
			if ( $("#userPainting_" + paintings[n]).length == 0 )
			{
				var img = document.createElement("img");
				
				img.setAttribute("id", "userPainting_" + paintings[n]);
				img.style.pointerEvents = "none";
				img.style.position = "absolute";
				img.style.left = 0;
				img.style.top = 0;
				img.style.zIndex = n + 1;
				
				document.getElementById("content").appendChild(img);
			}
			
			$("#userPainting_" + paintings[n]).attr("src", ObjectManager.getCurrentRoom().getUserPaintingURL(paintings[n]));
		}
	});	
}

ObjectManager.startEtherpad = function(){

	if (Modules.config.collaborativeEditor){

		//************************************
		//****** ETHERPAD FUNCTIONALITY ******
		//************************************
		ObjectManager.Pads = {};
		
		
		// Access token required to use Etherpad Lite's HTTP API
		ObjectManager.Pads.apikey = '634ae1cab746c3a2e5ef6bf2de903e380835edbcdde06a08948d5dde4d7389dc';
		
		// Etherpad Lite server address
		ObjectManager.Pads.server = 'http://localhost:9001';
		
		
		// Displays the pad containing the annotation for the currently
		// selected object or creates one if it doesn't exist.
		ObjectManager.Pads.showPadFor = function(id) {
			top.frames['padframe'].location.href =
				this.server + '/p/' +              // base address for pads
				ObjectManager.getRoomID() + id +   // this will be the pad name
				'?showLineNumbers=false' +
				'&showChat=false';
		}
		
		
		// Creates an annotation pad for the specified room and displays it.
		ObjectManager.Pads.createRoomPad = function(roomID) {
			var defaultText = 'Sie können diesen Raum hier beschreiben.';
		
			$.get( this.server + '/api/1.2.7/createPad' +
				   '?apikey=' + this.apikey +
				   '&padID=' + roomID +
				   '&text=' + encodeURIComponent(defaultText) )
			.always( this.showDefault() );
		}
		
		
		// Reverts the pad panel to default state,
		// i.e., shows the current room's annotation.
		ObjectManager.Pads.showDefault = function() {
			top.frames['padframe'].location.href =  this.server + '/p/' +
													ObjectManager.getRoomID() +
													'?showLineNumbers=false' +
													'&showChat=false' +
													'&noColors=true';
		}
		
		
		// Deletes the pad associated with the specified object ID.
		ObjectManager.Pads.deletePadFor = function(id) {
			$.get(  this.server + '/api/1.2.7/deletePad' +
					'?apikey=' + this.apikey +
					'&padID=' + ObjectManager.getRoomID() + id);
		
			// also delete the content pad of a CollText object
			$.get(  this.server + '/api/1.2.7/deletePad' +
					'?apikey=' + this.apikey +
					'&padID=' + ObjectManager.getRoomID() + id + 'content');
		}
		
		
		// Updates the specified CollText object with current contents of its content pad.
		// Also updates the linked master document if it exists.
		ObjectManager.Pads.updateRepresentation = function(id) {
			var cText = ObjectManager.getObject(id);
		
			if (cText.getType() !== 'CollText') return;
		
			// update the object with current pad content
			$.ajax({
				url: this.server + '/api/1.2.7/getText' +
					 '?apikey=' + this.apikey +
					 '&padID=' + ObjectManager.getRoomID() + id + 'content',
				dataType: 'jsonp',
				jsonp: 'jsonp',
				success: function(response) {
					cText.setContent(response.data.text);
				}
			});
		
			// check if text is a part of a master document
			if (cText.hasLinkedObjects()) {
				var links = cText.getLinkedObjects(),
					count = 0,
					targetID = '',
					target = null;
		
				// count the CollTexts this object is linked to
				// subdocuments must be linked to exactly 1 CollText - the master document
				for (var lid in links) {
					if (links[lid].object && links[lid].object.getType() === 'CollText') {
						count++;
						targetID = lid;
						target = links[lid].object;
					}
				}
		
				if (count === 1) {
					// check if the target of connection is really the master document,
					// i.e., is connected to more than 1 CollText. Not checking for this
					// can result in an infinite loop
					var targetCount = 0,
						targetLinks = target.getLinkedObjects();
		
					for (var lid in targetLinks) {
						if (targetLinks[lid].object && targetLinks[lid].object.getType() === 'CollText') {
							targetCount++;
						}
					}
		
					if (targetCount > 1) this.merge(target, targetID);
				}
		
			}
		}
		
		// Merges the content of all linked CollTexts into the master document.
		ObjectManager.Pads.merge = function(master, masterID) {
			var links = master.getLinkedObjects(),
				subs = [],
				content = [];
		
			// discard any linked non-CollText objects
			for (var id in links) {
				if (links[id].object && links[id].object.getType() !== 'CollText') delete links[id];
			}
		
			// sort connected subdocuments by Y coordinate
			while (!$.isEmptyObject(links)) {
				var min = 1000000, topmost = '';
		
				for (var id in links) {
					if (links[id].object) {
						var yPos = links[id].object.get('y');
		
						if (yPos < min) {
							min = yPos;
							topmost = id;
						}
					}
				}
				subs.push(topmost);
				delete links[topmost];
			}
				
			// retrieve content from subdocuments and merge into master
			for (var i = 0; i < subs.length; i++) {
				$.ajax({
					url:    this.server + '/api/1.2.7/getText' +
							'?apikey=' + this.apikey +
							'&padID=' + ObjectManager.getRoomID() + subs[i] + 'content',
					dataType: 'jsonp',
					jsonp: 'jsonp',
					success: function(index) {
						return function(response) {
							content[index] = response.data.text;
		
							// check if all parts retrieved
							var fetched = 0;
							for (var idx in content) {
								if (!isNaN(idx) && content[idx] !== undefined) fetched++;
							}
		
							if (fetched === subs.length) {
								// all parts there, merge into master
								$.get(  ObjectManager.Pads.server + '/api/1.2.7/setText' +
										'?apikey=' + ObjectManager.Pads.apikey +
										'&padID=' + ObjectManager.getRoomID() + masterID + 'content' +
										'&text=' + encodeURIComponent(content.join('\n')) )
								.done(ObjectManager.Pads.updateRepresentation(masterID));
							}
						}
					}(i)
				});
			}
		}
	} // End of Pads code
}
ObjectManager.writeToServerConsole = function(data){
    ObjectManager.Modules.Dispatcher.query('writeToServerConsole', data, function(){});
}