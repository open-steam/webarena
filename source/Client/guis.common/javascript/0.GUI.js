"use strict";

/**
 * @namespace holds methods and variables for GUI
 */
var GUI={};

/**
 * language of the client (used by translate function)
 * @default de
 */
GUI.currentLanguage=Modules.Config.language;


//This is called then forward or backwards-buttons are used in the browser.
//See ObjectManager.onload for pushState
window.onpopstate = function(event) {
 
  if (!event.state) return;
  var room=event.state.room;
  if (!room) return;
  if (GUI.isLoggedIn){
  	ObjectManager.loadRoom(room,true);
  }

};


GUI.translationManager=Object.create(TranslationManager);
GUI.translationManager.init(undefined);


GUI.setTranslations=function(language,data){
	return this.translationManager.addTranslations(language, data);
}

GUI.translate=function(text){
	
	return this.translationManager.get(this.currentLanguage, text);
	
}


/**
 * variable to check if client is a touch device (to add suitable event handlers)
 */
GUI.isTouchDevice = false;


/**
 * @deprecated still needed?
 */
GUI.updateGUI = function(webarenaObject) {

}


/**
 * check room size on browser window resize
 */
GUI.initResizeHandler = function() {

	$(document).bind("resize", function() {
		GUI.adjustContent();
	});
	
}


/**
 * set room width and height depending on objects in room
 * @param {webarenaObject} [webarenaObject] concrete object to check for
 */
GUI.adjustContent = function(webarenaObject) {
	
	if (webarenaObject != undefined) {

		if (!webarenaObject.isGraphical) return;

		/* check if new position of webarenaObject needs a new room width/height */

		var currentRoom = ObjectManager.getCurrentRoom();
		
		var maxX = Math.round(webarenaObject.getViewBoundingBoxX()+webarenaObject.getViewBoundingBoxWidth())+300;
		var maxY = Math.round(webarenaObject.getViewBoundingBoxY()+webarenaObject.getViewBoundingBoxHeight())+300;

		if (maxX > currentRoom.getAttribute("width")) {
			GUI.setRoomWidth(maxX);
		}

		if (maxY > currentRoom.getAttribute("height")) {
			GUI.setRoomHeight(maxY);
		}

		
	} else {
		/* set room width/height */
		var currentRoom = ObjectManager.getCurrentRoom();
		if (!currentRoom) return;
		
		var width = currentRoom.getAttribute("width");
		var height = currentRoom.getAttribute("height");
		
		var maxX = 0;
		var maxY = 0;
		
		$.each(ObjectManager.getObjects(), function(key, object) {

			var mx = Math.round(object.getAttribute("x")+object.getAttribute("width"));
			var my = Math.round(object.getAttribute("y")+object.getAttribute("height"));
			
			if (mx > maxX) {
				maxX = mx;
			}
			
			if (my > maxY) {
				maxY = my;
			}

		});

		maxX += 300;
		maxY += 300;
		
		if (maxX < width) {
			width = maxX;
		}
		
		if (maxY < height) {
 			height = maxY;
		}
		
		GUI.setRoomWidth(width);
		GUI.setRoomHeight(height);
		
	}
	
}


//the current canvas size (depending on the leftmost and the bottommost objects)
GUI.maxWidth = 0;
GUI.maxHeight = 0;


/**
 * set width of room / svg area
 * @param {int} width new width of the room
 */
GUI.setRoomWidth = function(width) {
	
	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	if(width > GUI.maxWidth){
		GUI.maxWidth = width;
		
		//currentRoom.setAttribute("width", width);
	
		if (width < $(window).width()) {
			width = $(window).width();
		}

		$("#content").css("width", width );
		$("#content > svg").css("width", width );
	}	

}

/**
 * set height of room / svg area
 * @param {int} height new height of the room
 */
GUI.setRoomHeight = function(height) {

	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	if(height > GUI.maxHeight){
		GUI.maxHeight = height;
	
		//currentRoom.setAttribute("height", height);

		if (height < $(window).height()) {
			height = $(window).height();
		}
	
		$("#content").css("height", height);
		$("#content > svg").css("height", height);
	}
}



/**
 * deselects all objects in the current room
 */
GUI.deselectAllObjects = function() {
	
	$.each(ObjectManager.getSelected(), function(index, object) {
		object.deselect();
	});
	
}


/* multi selection */

/**
 * set to true if the clients shift key is pressed (used for multiple selection)
 */
GUI.shiftKeyDown = false;


/**
 * add event handlers for shift key
 */
GUI.initShiftKeyHandling = function() {

    $(document).click(function(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

	$(document).bind("keydown", function(event) {
		
		if (event.keyCode == 16) {
			GUI.shiftKeyDown = true;
		}
		
	});
	
	$(document).bind("keyup", function(event) {
		
		if (event.keyCode == 16) {
			GUI.shiftKeyDown = false;
		}
		
	});
	
}


/* move by keyboard */

/**
 * @deprecated ?
 */
GUI.blockKeyEvents = false;


/**
 * set to true if a client arrow key is pressed
 */
GUI.arrowKeyDown = false;

/**
 * add event handlers for object movement by arrow-keys
 */
GUI.initMoveByKeyboard = function() {

	var interval;

	$(document).bind("keydown", function(event) {
	
		if ($("input:focus,textarea:focus").get(0) != undefined) return;
	
		if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
			event.preventDefault();
		} else {
			return;
		}
	
		if(GUI.arrowKeyDown){
			return;
		}
		else{
			GUI.arrowKeyDown = true;
	
			if (GUI.shiftKeyDown) {
				var d = 10;
			} else {
				var d = 1;
			}
	
			GUI.hideActionsheet();
	
			var x = 0;
			var y = 0;
	
			if (event.keyCode == 37) {
				x = d*(-1);
			}
				
			if (event.keyCode == 39) {
				x = d;
			}
				
			if (event.keyCode == 38) {
				y = d*(-1);
			}
				
			if (event.keyCode == 40) {
				y = d;
			}
	
			interval = setInterval(function () {
				$.each(ObjectManager.getSelected(), function(index, object) {
			
					object.moveBy(x, y);
			
				});
			}, 30);
			
		}
		
	});
	
	
	$(document).bind("keyup", function(event) {
		
		if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
			event.preventDefault();
			GUI.arrowKeyDown = false;
			clearInterval(interval);
		} else {
			return;
		}
		
	});
}


GUI.initUndoByKeyboard = function(){

    $(document).bind("keydown", function(event) {
        var ctrlDown = event.ctrlKey||event.metaKey
        if(ctrlDown && event.which == 90){
            event.preventDefault();

            Modules.Dispatcher.query("undo", {"userID" : GUI.userid});
        }
    });
}


/**
 * add event handler for removing selected objects by pressing delete-key
 */
GUI.initObjectDeletionByKeyboard = function() {
	
	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) == undefined) {
		
			if (event.which == 8 || event.which == 46) {

				event.preventDefault();
				
				//the cursor shows an object --> change the cursor to the default one	
				var cursor = $("body").css('cursor');
				if(cursor != "auto"){ 
						
					$("body").css( 'cursor', 'auto' );
				}
				else{
					var result = confirm(GUI.translate('Do you really want to delete the selected objects?'));

					if (result) {
						/* delete selected objects */
						$.each(ObjectManager.getSelected(), function(key, object) {

							object.deleteIt();

						});
					}
				}
			}
		}
		
	});
	
}


/**
 * add event handler for removing the cursor which represents an object by pressing the Escape-key
 */
GUI.initCursorDeletionByKeyboard = function() {
	
	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) == undefined) {
		
			if (event.which == 27) {

				event.preventDefault();
				
				//remove objects from cursor 
				var cursor = $("body").css('cursor');
				if(cursor != "auto"){ 
						
					$("body").css( 'cursor', 'auto' );
				}
			}
		}
	});
}


/**
 * add event handler for copy, cut and paste by ctrl + c, ctrl + x, ctrl + v
 */
GUI.initObjectCopyCutPasteHandlingByKeyboard = function() {
	
	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) == undefined) {
		
			var ctrlDown = event.ctrlKey||event.metaKey // Mac support
			
		
			if (ctrlDown && event.which == 67) {
				event.preventDefault();
				ObjectManager.copyObjects(ObjectManager.getSelected());
			}

			if (ctrlDown && event.which == 88) {
				event.preventDefault();
				ObjectManager.cutObjects(ObjectManager.getSelected());
			}
		
			if (ctrlDown && event.which == 86) {
				event.preventDefault();
				ObjectManager.pasteObjects();
			}
			
		}
		
	});
}


/**
 * add event handler for object selection (based on clicked position and layers)
 */
GUI.initMouseHandler = function() {

	if (GUI.isTouchDevice) {
		
		var touchHandler = function(event) {
			
			jPopoverManager.hideAll();
			
			GUI.saveChanges(event);
			
			var contentPosition = $("#content").offset();

			var x = event.pageX-contentPosition.left;
			var y = event.pageY-contentPosition.top;
			
			if (event.touches.length >= 1) {
				var x = event.touches[event.touches.length-1].pageX-contentPosition.left;
				var y = event.touches[event.touches.length-1].pageY-contentPosition.top;
			}
			
			/* find objects at this position */
			var clickedObject = GUI.getObjectAt(x, y);

			if (clickedObject && clickedObject.isAccessible() && event.target != $("#content>svg").get(0)) {
				event.preventDefault();
				event.stopPropagation();
				clickedObject.click(event);
			} else {
				GUI.deselectAllObjects();
				GUI.updateInspector();
			}
			
		}
		
		$("#content>svg").get(0).addEventListener("touchstart", touchHandler, false);
		
	} else {
		
		var mousedown = function(event) {
			jPopoverManager.hideAll();
			
			GUI.saveChanges(event);

			var contentPosition = $("#content").offset();
			
			var temp=event.target;
				
			//object creation via object symbols
			var cursor = $("body").css('cursor');	
			if(cursor != "auto"){
				
				var objType=GUI.creatingObject;
				var proto = ObjectManager.getPrototype(objType);
			
				GUI.startNoAnimationTimer();
						
				proto.create({
						"x" : event.pageX-30, 
						"y" : event.pageY-65
				});
			
				$("body").css( 'cursor', 'auto' );			
			}
			
			//arrow/line: after selecting the startpoint change the cursor text to choose endpoint
			if(GUI.getCursorText().indexOf("Start") > -1){
				if(GUI.getCursorText()==GUI.translate('Choose Arrow-Startpoint')){
					GUI.setCursorText(GUI.translate("Choose Arrow-Endpoint"));
				}
				else{
					GUI.setCursorText(GUI.translate("Choose Line-Endpoint"));
				}
				
				$('#besideMouse').attr('title', event.pageX+','+event.pageY);
				
			}
			
			//arrow/line: after selecting the endpoint create the object and set the position with GUI.setFinalPosition
			if(GUI.getCursorText().indexOf("End") > -1){
				var proto;
				if(GUI.getCursorText()==GUI.translate('Choose Arrow-Endpoint')){
					proto = ObjectManager.getPrototype('Arrow');
				}
				else{
					proto = ObjectManager.getPrototype('Line');
				}
			
				GUI.setCursorText("");
			
				GUI.startNoAnimationTimer();
				
				var title = $('#besideMouse').attr('title');
				
				$('#besideMouse').attr('title', title+','+event.pageX+','+event.pageY);
										
				var attributes;
				var content;			
					
				ObjectManager.createObject(proto.type,attributes,content,GUI.setFinalPosition);	
			}
			
			while (temp && !temp.dataObject) {
				temp=$(temp).parent()[0];
			}
			
			var clickedObject=(temp)?temp.dataObject:false;

			if (clickedObject && clickedObject.isAccessible()) {

				// Objects with restricted moving areas should get the "native" events
				// Only if clicked on the moving area, e.g. actionbar the default event handling
				// should be prevented
                if(! clickedObject.restrictedMovingArea || $(event.target).hasClass("moveArea")){
					if(clickedObject.input != true){
						event.preventDefault();
						event.stopPropagation();
					}
					else{
						return;
					}
                }

				clickedObject.click(event);
			} else {
				/* clicked on background or unaccessible object*/
                event.preventDefault();
                event.stopPropagation();
				GUI.rubberbandStart(event);
				GUI.updateInspector(true);
			}

		}
		
		var mousemove = function(event) {
			
			var x=event.clientX;
			var y=event.clientY;
			
			var images=$('image');
			
			$.each(images, function(index, image) {
				
				var parent=$(image).parent();
				
				if (!image.hasPixelAtMousePosition) {
					//console.log('Missing hasPixelAtMousePosition for ',parent);
					return;
				}
				
				if(image.hasPixelAtMousePosition(x,y)){
					parent.attr('pointer-events','visiblePainted');
				} else {
					parent.attr('pointer-events','none');
				}
				
			});

		}		
		
		$("#content>svg").bind("mousedown", mousedown);
		$("#content>svg").bind("mousemove", mousemove);
		
	}
	
}


/**
 * initialize the return key handling (save changes during the inplace editing)
 */
GUI.initReturnKeyHandler = function(){

	$(document).bind("keyup", function(event) {
		
		if (event.keyCode == 13){
			if(GUI.inPlaceEditingObject){
				var object = ObjectManager.getObject(GUI.inPlaceEditingObject);
				if (!object.doNotSaveOnEnterKey) object.saveChanges();
			}
		}
		
	});

}


/**
 * set the final position of an arrow or line after creation via the selecting-points-method
 */
GUI.setFinalPosition = function(object){
	
	var title = $('#besideMouse').attr('title');
	
	var point = title.split(',');
	
	var x1 = parseInt(point[0]);
	var y1 = parseInt(point[1])-33; 
	var x2 = parseInt(point[2]);
	var y2 = parseInt(point[3])-33; 
		
	var direction1;
	var direction2;	
	
	var x;
	var y;
	var width;
	var height;
	
	//calculate x,y, width and height
	if(x1>x2){
		x = x2;
		width = x1-x2;
		direction1 = false;
	}
	else{
		x = x1;
		width = x2-x1
		direction1 = true;
	}
	if(y1>y2){
		y = y2;
		height = y1-y2;
		direction2 = false;
	}
	else{
		y = y1;
		height = y2-y1;
		direction2 = true;
	}
	
	//calculate and set direction
	if(direction1){
		if(direction2){
			object.setAttribute("direction", 1);
		}
		else{
			object.setAttribute("direction", 4);
		}
	}
	else{
		if(direction2){
			object.setAttribute("direction", 2);
		}
		else{
			object.setAttribute("direction", 3);
		}
	}
	
	//set x,y, width and height
	object.setAttribute('x', x);
	object.setAttribute('y', y);
	object.setAttribute('width', width);
	object.setAttribute('height', height);
	object.setViewWidth(width);
	object.setViewHeight(height); 
	
	$('#besideMouse').attr('title', "");
	
}




/**
 * get the topmost object at point x,y which is visible
 * @param {int} x x position
 * @param {int} y y position
 */
GUI.getObjectAt = function(x,y) {

	var clickedObject = false;
	
	$.each(ObjectManager.getObjectsByLayer(), function(key, object) {

		var rep = object.getRepresentation();

		if (!object.getAttribute("visible") && !$(rep).hasClass("webarena_ghost")) return;

		if (object.hasPixelAt(x,y)) {
			clickedObject = object;
			return;
		}

	});

	return clickedObject;
	
}


/**
 * list of object mime types which can be represented by a preview image
 */
GUI.previewableMimeTypes = undefined;

/**
 * load list of mime types for GUI.previewableMimeTypes
 */
GUI.loadListOfPreviewableMimeTypes=function() {
	/* get list of inline displayable mime types */
			
	Modules.Dispatcher.query('getPreviewableMimeTypes',{},function(list){
		GUI.previewableMimeTypes = list;
	});
	
}

/**
 * check if a preview image can be generated for an object with the given mime type
 * @param {String} mimeType mime type to check for
 */
GUI.mimeTypeIsPreviewable=function(mimeType) {
	
	if (GUI.previewableMimeTypes == undefined) {
		GUI.loadListOfPreviewableMimeTypes();
		return false;
	} else {
		if (GUI.previewableMimeTypes[mimeType]) {
			return true;
		} else {
			return false;
		}
	}
	
}

/**
 * GUI specific display of general messages (and complex control dialogs)
 * @param {String} heading A title for the dialog
 * @param {String|DOMObject} content A message or DOM object that will be used as the body of the dialog
 * @param {Object} [buttons] The Buttons of the dialog (e.g. close, save, ...)
 * @param {int} [dialogWidth=auto] The width of the dialog
 * @param {bool} [passThrough] Additional options for the dialog
 * @returns {jQueryDialogObject} The created jQuery dialog object
 *
 * Form of buttons param:
 *
 * {
 * 		"title of this button" : function() {
 * 			//button callback
 * 		},
 * 		...
 * }
 *
 */
GUI.dialog = function(heading, content, buttons, dialogWidth, passThrough) {

    GUI.blockKeyEvents = true;

    if (buttons == undefined) {

        var buttons = {};

        buttons[GUI.translate("close")] = function() {
            //nothing
        }

    }

    var dialogContent = document.createElement("div");
    $(dialogContent).attr("title", heading);
    $(dialogContent).append(content);

    var buttons2 = {};

    $.each(buttons, function(title, callback) {

        buttons2[title] = function() {
            callback(dialogContent);
            $(this).dialog("close");
        }

    });

    if (dialogWidth == undefined) {
        dialogWidth = "auto";
    }

    var dialogOptions = {
        modal: true,
        resizable: false,
        buttons: buttons2,
        zIndex: 100000,
        width : dialogWidth,
        close: function() {
            $(this).remove();
            GUI.blockKeyEvents = false;
        }
    }

    if(typeof passThrough === "object"){
        $.extend(dialogOptions, passThrough)
    }


    return $(dialogContent).dialog(dialogOptions);


};

/**
 * GUI specific display of errors
 * @param {String} heading A title for the upload dialog
 * @param {String} message A message including the errors message
 * @param {webarenaObject} [webarenaObject] An optional webarena object the error is related to
 * @param {bool} fatal True if the error is fatal and the webpage has to be reloaded after displaying the error
 */
GUI.error = function(heading, message, webarenaObject, fatal) {

    var translate = function(text) {
        if (!webarenaObject) {
            return GUI.translate(text);
        } else {
            return webarenaObject.translate(GUI.currentLanguage, text);
        }
    }

    var errorButtons = {};

    if (fatal) {
        errorButtons[GUI.translate("Reload")] = function() {
            window.location.reload();
        }
    } else {
        errorButtons[GUI.translate("Close Dialog")] = function() {
            $(this).dialog("close");
        }
    }

    var heading = translate(heading);
    var message = '<p>'+translate(message)+'</p>';

    GUI.dialog(heading, message, errorButtons);

}

/**
 * called when the socket is disconnected
 */
GUI.disconnected = function() {
	
	GUI.showDisconnected();
	GUI.isLoggedIn = false;
	
}


/**
 * called when the socket is connected
 */
GUI.connected = function() {

	if (GUI.relogin === true) {
		
		window.setTimeout(function(){
			var message=$("#disconnected_message")[0];
			
			if (!message) return;
			
			message.style.display='none';
		 	$(message).empty(); //get rid of the disconnected message
		},1000);
		
		GUI.relogin = false;

		GUI.login();
	}
	
}

/**
 * display a error message on disconnect
 */
GUI.showDisconnected = function() {

	if ($("#disconnected_message").length == 0)
	$($("body")[0]).append('<div id="disconnected_message"><div>'+GUI.translate('Lost connection to the server.')+'</div></div>');

	GUI.isLoggedIn = false;
	GUI.relogin = true;
	
}


/**
 * timer to prevent objects "flying in" when getting a bunch of new objects (room load)
 */
GUI.startNoAnimationTimer = function() {
	GUI.noAnimation = window.setTimeout(function() {
		GUI.noAnimation = undefined;
	}, 2000);
}

/**
 * ask user to confirm the question in the message
 */
GUI.confirm = function(message) {
	return confirm(message);
}

GUI.setMode=function(mode){
	
	if (!Modules.Config.structuringMode){
		console.log('setMode?');
		console.trace();
		return;
	}
		//Eigenschaften des Vordergrunds	var className='fgmode';	var text='Edit background';	var toMode='background';	//Eigenschaften des Hintergrunds	if (mode=='background'){		className='bgmode';		text='Exit';		toMode='foreground';	}		var header=document.getElementById('header');	var sidebar=document.getElementById('sidebar');	var sidebar_title=document.getElementById('sidebar_title');
	var sidebarContent=document.getElementById('sidebar_content');	    //optical changes	if (header) header.className=className;	if (sidebar) sidebar.className=className;	if (sidebar_title) sidebar_title.className=className;		sidebarContent.className=className;	    //set the button	$( "#switchbutton" ).remove();		$( "<button id=\"switchbutton\">"+text+"</button>" ).appendTo(sidebar);		var switchbutton=document.getElementById('switchbutton');	switchbutton.onclick=function(){		GUI.setMode(toMode);	}		ObjectManager.getCurrentRoom().setAttribute('mode',mode);	}

/**
 * set text which is displayed near to the cursor
 */
GUI.setCursorText = function(text){
	$(document).mousemove(function(e){
		var cpos = { top: e.pageY + 15, left: e.pageX + 15 };
		$('#besideMouse').offset(cpos);
		$('#besideMouse').html(text);	
	});
}

/**
 * get text which is displayed near to the cursor
 */
GUI.getCursorText = function(){
	return $('#besideMouse').html();	
}


//id of the current inplace editing object (or false if the inplace editing is not active)
GUI.inPlaceEditingObject = false;

/**
 * if inplace editing is active, call the saveChanges method of the related object 
 */
GUI.saveChanges = function(event){
	
	if(GUI.inPlaceEditingObject){
		if(event.target.localName == "input" || event.target.localName == "textarea"){ 
			return;
		}
		else{	//mouseclick outside of the inplace editing field
			var object = ObjectManager.getObject(GUI.inPlaceEditingObject);
			object.saveChanges();
		}
	}
}