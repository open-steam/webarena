"use strict";

GUI.loaded = false;

GUI.entered = function() {
	
	GUI.loadGUI(2);
	
}


GUI.loadGUI = function(step) {

	/* not logged in? */
	if (!GUI.username) {
		
		/* setup svg area */
		GUI.initSVG(); //build svg area using div #content //needs: nothing
		
		GUI.showLogin();
		return;
	}
	
	if (step == undefined || step == 1) {
		GUI.progressBarManager.updateProgress("login", 20);

		if (!GUI.loaded) GUI.chat.init();
		GUI.chat.clear();
		
		if (!GUI.loaded) GUI.sidebar.init();

		/* login to server */
		ObjectManager.login(GUI.username, GUI.password);
		
	} else if (step == 2) {
		GUI.progressBarManager.updateProgress("login", 40);

		if (!GUI.loaded)
		GUI.loadListOfPreviewableMimeTypes();

		window.setTimeout(function() {
			GUI.loadGUI(3);
		}, 200);
		
	} else if (step == 3) {
		GUI.progressBarManager.updateProgress("login", 60, GUI.translate('loading GUI'));
		
		GUI.startNoAnimationTimer();
		
		/* toolbar */
		if (!GUI.loaded) GUI.initToolbar(); //needs: ObjectManager

		/* adjust svg area */
		GUI.adjustContent(); //first scaling of svg area (>= viewport) //needs: ObjectManager.getCurrentRoom

		/* key handling */
		if (!GUI.loaded) GUI.initObjectDeletionByKeyboard(); //handle delete key events to delete selected objects //needs: ObjectManager.getSelected on keydown
		if (!GUI.loaded) GUI.initShiftKeyHandling(); //handle shift key events //needs: nothing
		if (!GUI.loaded) GUI.initMoveByKeyboard(); //handle arrow key events to move objects //needs: ObjectManager.getSelected on keydown	

		/* window resizing */
		if (!GUI.loaded) GUI.initResizeHandler(); //scale up room if it's too small //needs: ObjectManager.getCurrentRoom on document resize

		/* inspector */
		if (!GUI.loaded) GUI.setupInspector(); //add inspector buttons, ...
		if (!GUI.loaded) GUI.initInspectorAttributeUpdate(); //init updating of attributes in inspector

		window.setTimeout(function() {
			GUI.loadGUI(4);
		}, 200);
		
	} else if (step == 4) {
		GUI.progressBarManager.updateProgress("login", 80, GUI.translate('rendering objects'));
		
		if (!GUI.loaded) GUI.initMouseHandler();
		
		window.setTimeout(function() {
			GUI.loadGUI(5);
		}, 200);
		
	} else if (step == 5) {
		GUI.progressBarManager.updateProgress("login", 90, GUI.translate('aligning objects'));
		
		GUI.updateLayers(); //update z-order by layer-attribute
		
		GUI.loaded = true;
		
		GUI.hideLogin();
		
	} else {
		console.error("unknown load step");
	}

}

$(function() {

	GUI.loadGUI(1);
	
});