"use strict";

/* hidden objects */

GUI.hiddenObjectsVisible = false;


GUI.hideObject = function(webarenaObject) {

	var rep = webarenaObject.getRepresentation();
	
	if (webarenaObject.getAttribute("hidden")) {
		$(rep).hide();
	} else {
		$(rep).css("opacity", 0.1);
	}
	
	//webarenaObject.draw();
	
}


GUI.showObject = function(webarenaObject) {

	var rep = webarenaObject.getRepresentation();
	
	if (!$(rep).hasClass("webarena_ghost") && !GUI.paintModeActive) {
		
		if (webarenaObject.normalOpacity != 1) {
			$(rep).css("opacity", webarenaObject.normalOpacity);
		} else {
			$(rep).css("opacity", 1);
		}
		
	}
	
	$(rep).show();
	
	//webarenaObject.draw();

}


GUI.showHiddenObjects = function() {

	$.each(ObjectManager.getObjects(), function(index, object) {
			
		if (object.getAttribute("hidden")) {
			GUI.showObject(object);
		} else {
			GUI.hideObject(object);
		}
		
	});
	
}


GUI.hideHiddenObjects = function() {

	$.each(ObjectManager.getObjects(), function(index, object) {

		if (object.getAttribute("hidden")) {
			GUI.hideObject(object);
		} else {
			GUI.showObject(object);
		}
		
	});
	
}


GUI.toggleHidden = function() {

	GUI.deselectAllObjects();

	if (GUI.hiddenObjectsVisible) {
		/* hide hidden objects */

		GUI.hideHiddenObjects();
		GUI.hiddenObjectsVisible = false;
		
		GUI.onToggleHidden(false);
		
		return false;
		
	} else {
		/* show hidden objects */
		
		GUI.showHiddenObjects();
		GUI.hiddenObjectsVisible = true;
		
		GUI.onToggleHidden(true);
		
		return true;
		
	}
	
}

GUI.updateHiddenObjects = function() {
	
	if (GUI.hiddenObjectsVisible) {
		GUI.showHiddenObjects();
	} else {
		GUI.hideHiddenObjects();
	}	
	
}