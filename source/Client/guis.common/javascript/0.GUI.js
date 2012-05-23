var GUI={};

GUI.currentLanguage='de';


GUI.translationManager=Object.create(TranslationManager);
GUI.translationManager.init(undefined);


GUI.setTranslations=function(language,data){
	return this.translationManager.addTranslations(language, data);
}

GUI.translate=function(text){
	
	return this.translationManager.get(this.currentLanguage, text);
	
}




/* ---> needed!? <--- */
GUI.objectSaved=function(object){
}

GUI.objectRemoved=function(object){
}

GUI.objectSelected=function(object){
}

GUI.objectUnselected=function(object){
}




GUI.isTouchDevice = false;




GUI.updateGUI = function(webarenaObject) {
	
	var rep = webarenaObject.getRepresentation();
	
	if (webarenaObject.getAttribute("hidden")) {
		/* object is hidden */
		if (GUI.hiddenObjectsVisible) {
			GUI.showObject(webarenaObject);
		} else {
			GUI.hideObject(webarenaObject);
		}
	} else {
		/* object is not hidden */
		if (GUI.hiddenObjectsVisible) {
			GUI.hideObject(webarenaObject);
		} else {
			GUI.showObject(webarenaObject);
		}
	}

}



GUI.initResizeHandler = function() {

	$(document).bind("resize", function() {
		GUI.adjustContent();
	});
	
}


GUI.adjustContent = function(webarenaObject) {
	
	if (webarenaObject != undefined) {

		if (!webarenaObject.isGraphical) return;

		/* check if new position of webarenaObject needs a new room width/height */

		var currentRoom = ObjectManager.getCurrentRoom();
		
		var maxX = webarenaObject.getViewBoundingBoxX()+webarenaObject.getViewBoundingBoxWidth();
		var maxY = webarenaObject.getViewBoundingBoxY()+webarenaObject.getViewBoundingBoxHeight();
		
		if (maxX > currentRoom.getAttribute("width")) {
			currentRoom.setAttribute("width", maxX);
			$("#content").css("width", maxX);
			$("#content > svg").css("width", maxX);
		}
		
		if (maxY > currentRoom.getAttribute("height")) {
			currentRoom.setAttribute("height", maxY);
			$("#content").css("height", maxY);
			$("#content > svg").css("height", maxY);
		}
		
	} else {
		/* set room width/height */
		var currentRoom = ObjectManager.getCurrentRoom();
		
		if (!currentRoom) return;
		
		var width = currentRoom.getAttribute("width");
		var height = currentRoom.getAttribute("height");
		
		if (width < $(document).width()) {
			width = $(document).width();
		}
		
		if (height < $(document).height()) {
			height = $(document).height();
		}
		
		$("#content").css("width", width);
		$("#content").css("height", height);
		
		
		$("#content > svg").css("width", width);
		$("#content > svg").css("height", height);
	}
	
}





/* object selection */

GUI.deselectAllObjects = function() {
	
	$.each(ObjectManager.getSelected(), function(index, object) {
		object.deselect();
	});
	
}






/* multi selection */

GUI.shiftKeyDown = false;

GUI.initShiftKeyHandling = function() {

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

GUI.blockKeyEvents = false;

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




GUI.initObjectDeletionByKeyboard = function() {
	
	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) == undefined) {
		
			if (event.which == 8 || event.which == 46) {

				event.preventDefault();

				/* delete selected objects */
				$.each(ObjectManager.getSelected(), function(key, object) {

					if ($(object.getRepresentation()).data("jActionsheet")) {
						$(object.getRepresentation()).data("jActionsheet").remove();
					}

					object.deleteIt();

				});
			}
			
		}
		
	});
	
}




/* mouse handler */
GUI.initMouseHandler = function() {
	return; //TODO: build this
	var mousedown = function(event) {
		
		event.preventDefault();
		
		var contentPosition = $("#content").offset();
		
		var clickedObject = GUI.getObjectAt(event.pageX, event.pageY-contentPosition.top);
		
		if (clickedObject) {

			clickedObject.select();

		} else {
			/* clicked on background */
			GUI.rubberbandStart(event)
		}
		
	}
	
	$("#content>svg").bind("mousedown", mousedown);
	
	
}


/* get the topmost object at point x,y */
GUI.getObjectAt = function(x,y) {
	
	var clickedObject = false;
	
	$.each(ObjectManager.getObjectsByLayer(), function(key, object) {

		if (object.hasPixelAt(x,y)) {
			clickedObject = object;
			return;
		}

	});
	
	return clickedObject;
	
}







GUI.previewableMimeTypes = undefined;

GUI.loadListOfPreviewableMimeTypes=function() {
	/* get list of inline displayable mime types */
			
	Modules.Dispatcher.query('getPreviewableMimeTypes',{},function(list){
		GUI.previewableMimeTypes = list;
	});
	
}

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





