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


/**
 * set width of room / svg area
 * @param {int} width new width of the room
 */
GUI.setRoomWidth = function(width) {
	
	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	currentRoom.setAttribute("width", width);
	
	if (width < $(window).width()) {
		width = $(window).width();
	}

	$("#content").css("width", width );
	$("#content > svg").css("width", width );
	
	GUI.input.offset();
	GUI.resizePaintModeCanvas();
}

/**
 * set height of room / svg area
 * @param {int} height new height of the room
 */
GUI.setRoomHeight = function(height) {

	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	currentRoom.setAttribute("height", height);

	if (height < $(window).height()) {
		height = $(window).height();
	}
	
	$("#content").css("height", height);
	$("#content > svg").css("height", height);
	
	GUI.input.offset();
	GUI.resizePaintModeCanvas();
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
 * add event handlers for object movement by arrow-keys
 */
GUI.initMoveByKeyboard = function() {

	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) != undefined) return;
	
		if (GUI.shiftKeyDown) {
			var d = 10;
		} else {
			var d = 1;
		}
	
		$.each(ObjectManager.getSelected(), function(index, object) {
			
			if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
				event.preventDefault();
			} else {
				return;
			}
			
			GUI.hideActionsheet();
			
			if (event.keyCode == 37) {
				object.moveBy(d*(-1), 0);
			}
			
			if (event.keyCode == 39) {
				object.moveBy(d, 0);
			}
			
			if (event.keyCode == 38) {
				object.moveBy(0, d*(-1));
			}
			
			if (event.keyCode == 40) {
				object.moveBy(0, d);
			}
			
		});
		
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

							if ($(object.getRepresentation()).data("jActionsheet")) {
								$(object.getRepresentation()).data("jActionsheet").remove();
							}

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
 * set the final position of an arrow or line after creation via the selecting-points-method
 */
GUI.setFinalPosition = function(object){
	
	var title = $('#besideMouse').attr('title');
	
	var point = title.split(',');
	
	var x1 = parseInt(point[0])-15;
	var y1 = parseInt(point[1])-35; 
	var x2 = parseInt(point[2])-15;
	var y2 = parseInt(point[3])-35; 
		
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

		if (GUI.couplingModeActive) {
			GUI.closeCouplingMode();
		}

		GUI.relogin = false;

		GUI.login();
	}
	
}

/**
 * display a error message on disconnect
 */
GUI.showDisconnected = function() {
	
	if ($("#disconnected_message").length == 0)
	$("body").append('<div id="disconnected_message"><div>Die Verbindung wurde getrennt.</div></div>');

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