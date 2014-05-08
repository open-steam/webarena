// This is the client side ObjectManager

"use strict";

var Modules=false;

/**
 * Object providing functions for object management
 */
var ObjectManager={};

ObjectManager.isServer=false;
ObjectManager.objects={};
ObjectManager.currentRoomID=undefined;
ObjectManager.currentRoom=false;
ObjectManager.clientID = new Date().getTime()-1296055327011;
ObjectManager.prototypes={};
ObjectManager.user={};
ObjectManager.clipBoard={};

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

ObjectManager.getObject=function(objectID){
	
	//room?
	if (objectID==this.currentRoomID){
		return this.currentRoom;
	}
	
    return ObjectManager.objects[objectID];
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

    if (object.get('id') != this.currentRoomID) {
        this.objects[object.id]=object;
    } else {

        this.currentRoom=object;
        
        this.currentRoom.isGraphical=false; // the current room cannot be positioned
		
    }

    return object;

}

/**
 * getObjects - get an array of all objects including the room
 */
ObjectManager.getObjects=function(){
    return this.objects;
}
ObjectManager.getInventory=ObjectManager.getObjects;

/**
 * getObjectsByLayer - get an array of all objects ordered by layer (highest layer first)
 */
ObjectManager.getObjectsByLayer=function() {
	
    var objects = this.getObjects();
	
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
ObjectManager.getObjectsByLayerInverted=function() {
	
    var objects = ObjectManager.getObjectsByLayer();
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
		
    } else {
    	
        object = ObjectManager.buildObject(data.type,data);
    }
	
    object.refreshDelayed();
	
}

ObjectManager.attributeChanged=function(object,key,newValue,local){
	
    if (!object.attributeManager.getAttributes()[key]) return;
	
    var changedFunction=object.attributeManager.getAttributes()[key].changedFunction;
	
    if (changedFunction) changedFunction(object,newValue,local);
	
    if (this.informGUI) this.informGUI(object,key,newValue,local)
    else console.log('GUI is not listening to attribute changes. (use Modules.ObjectManager.registerAttributeChangedFunction)');
	
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
	
    //remove representation
	
    if (object.removeRepresentation){
        object.removeRepresentation();
    }
	
    //remove from local structure
    delete(ObjectManager.objects[data.id]);

    // delete associated pad
    ObjectManager.Pads.deletePadFor(data.id);
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
	var parent=ObjectManager.getCurrentRoom().getAttribute('parent');
	if (parent){
		ObjectManager.loadRoom(ObjectManager.getCurrentRoom().getAttribute('parent'));
	} else {
		alert(GUI.translate('This room has no parent.'))
	}
}

ObjectManager.goHome=function(){
	ObjectManager.loadRoom(ObjectManager.user.home);
}

ObjectManager.loadRoom=function(roomid,byBrowserNav,callback){
	
	var self = this;
	
	Modules.Dispatcher.query('enter',roomid,function(error){

		if (error !== true) {

			var objects = self.getObjects();

		    for (var i in objects) {
		        var obj = objects[i];
		        ObjectManager.removeLocally(obj);
		    }

		    if(!roomid) roomid='public';
		    self.currentRoomID=roomid;
		   
		    if (!byBrowserNav){
				history.pushState({ 'room':roomid }, roomid, '/room/'+roomid);
		    }

		    if (callback) setTimeout(callback, 1200);

            // Create and display a pad for the room
            ObjectManager.Pads.createRoomPad(ObjectManager.getRoomID());
		}
		
    });

}

ObjectManager.createObject=function(type,attributes,content,callback) {
	
    var data={
        'roomID':this.currentRoomID,
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
	
    Modules.Dispatcher.registerCall('objectDelete',function(data){
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
	
}

ObjectManager.getRoomID=function(){
    return this.currentRoomID;
}

ObjectManager.getCurrentRoom=function(){
	return this.currentRoom;
}


ObjectManager.getSelected=function(){
		
    var result=[];
	
    for (var i in this.objects) {
        var obj = this.objects[i];
		
        if (obj.isSelected()) {
            result.push(obj);
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

ObjectManager.inform=function(type,content){
	var data={};
	data.message={};
	data.message[type]=content;
	data.room=this.getRoomID();
	data.user=this.getUser().username;
	data.color=this.getUser().color;
	data.userId=this.getUser().id;
	ObjectManager.Modules.Dispatcher.query('inform',data);
}

ObjectManager.tell=function(text){
	ObjectManager.inform('text',text);
}

ObjectManager.informAboutSelection = function(id) {
    // show/create pad for the selected object
    ObjectManager.Pads.showPadFor(id);

	ObjectManager.inform('selection',id);
}

ObjectManager.informAboutDeselection = function(id) {
    // update CollText object upon deselection
    if (ObjectManager.getObject(id).get('type') === 'CollText') {
        ObjectManager.Pads.updateRepresentation(id);
    }

    // clear pad panel if nothing is selected
    ObjectManager.Pads.showDefault();

	ObjectManager.inform('deselection',id);
}

ObjectManager.requestAttentionToObject=function(id){
	ObjectManager.inform('requestAttention',id);
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

			// select new objects after duplication
		    var newIDs=[];
		    var minX = Number.MAX_VALUE;
		    var minY = Number.MAX_VALUE;
		    var selectNewObjects = function() {
				for (var key in newIDs) {
					var newObject = ObjectManager.getObject(newIDs[key]);
					newObject.select(true);

					// determine left most and top most coordinates of pasted objects in case of scrolling
					if (newObject.getAttribute('x') < minX) {
						minX = newObject.getAttribute('x');
					}
					if (newObject.getAttribute('y') < minY) {
						minY = newObject.getAttribute('y');
					}
				}

				// if objects were moved between rooms scroll to position of pasted objects
				if (requestData.fromRoom != requestData.toRoom) {
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
			};

			Modules.Dispatcher.query('duplicateObjects',requestData, function(idList){
				newIDs = idList;
				GUI.deselectAllObjects();
				setTimeout(selectNewObjects, 200);
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
			requestData.fromRoom=this.getRoomID();
			requestData.toRoom=this.getRoomID();
		    requestData.objects=array;
		    requestData.cut=false;

		    // select new objects after duplication
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
}

//************************************
//****** ETHERPAD FUNCTIONALITY ******
//************************************

ObjectManager.Pads = {
    // access token required to use Etherpad HTTP API
    apikey: 'SOpqBlUnNKJSOS92lBhZHrovhqdWQ8qV',


    // displays the pad associated with currently selected object
    // in the pad panel or creates one if it doesn't exist
    showPadFor: function(id) {
        top.frames['padframe'].location.href =
            'http://localhost:9001/p/' +        // etherpad server + base address
             ObjectManager.getRoomID() + id +   // this will be the pad name
            '?showLineNumbers=false' +
            '&showChat=false' +
            '&noColors=true';
    },

    // creates a pad for specified room and displays it
    createRoomPad: function(roomID) {
        var defaultText = 'Describe current room here.';

        $.get('http://localhost:9001/api/1.2.7/createPad' +
              '?apikey=' + this.apikey +
              '&padID=' + roomID +
              '&text=' + encodeURIComponent(defaultText) )
        .always(this.showDefault());
    },

    // reverts the pad panel to default state
    showDefault: function() {
        top.frames['padframe'].location.href =
            'http://localhost:9001/p/' +
             ObjectManager.getRoomID() +
            '?showLineNumbers=false' +
            '&showChat=false' +
            '&noColors=true';
    },


    // deletes the pad associated with specified object id
    deletePadFor: function(id) {
        $.get('http://localhost:9001/api/1.2.7/deletePad' +
              '?apikey=' + this.apikey +
              '&padID=' + ObjectManager.getRoomID() + id);
    },


    // updates the collText object with current contents of its associated pad
    updateRepresentation: function(id) {
        $.ajax({
            url: 'http://localhost:9001/api/1.2.7/getText' +
                 '?apikey=' + this.apikey +
                 '&padID=' + ObjectManager.getRoomID() + id,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(res) {
                ObjectManager.getObject(id).setContent(res.data.text.substr(0,200));
            }
        });
    }
    
}
