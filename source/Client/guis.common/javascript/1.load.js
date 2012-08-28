"use strict";

GUI.loaded = false;
GUI.isLoggedIn = false;

GUI.loggedIn = function() {
	if (GUI.isLoggedIn) return;
	
	GUI.isLoggedIn = true;
	
	GUI.progressBarManager.updateProgress("login", 30, GUI.translate('loading room'));
	
}

GUI.subscribed = function() {
	
	GUI.loadGUI(2);
	
}

GUI.loginFailed = function(err) {
	GUI.progressBarManager.removeProgress("login");
	GUI.showLogin(err);
}

GUI.loadGUI = function(step) {

	if (GUI.loaded) return;
	
	/* not logged in? */
	if (!GUI.username) {
		
		/* setup svg area */
		GUI.initSVG(); //build svg area using div #content //needs: nothing
		
		GUI.showLogin();
		return;
	}
	
	if (step == undefined || step == 1) {
		GUI.progressBarManager.updateProgress("login", 20);

		/* login to server */
		ObjectManager.login(GUI.username, GUI.password);
		
	} else if (step == 2) {
		GUI.progressBarManager.updateProgress("login", 40);

		GUI.loadListOfPreviewableMimeTypes();

		window.setTimeout(function() {
			GUI.loadGUI(3);
		}, 200);
		
	} else if (step == 3) {
		GUI.progressBarManager.updateProgress("login", 60, GUI.translate('loading GUI'));
		
		/* toolbar */
		GUI.initToolbar(); //needs: ObjectManager

		/* adjust svg area */
		GUI.adjustContent(); //first scaling of svg area (>= viewport) //needs: ObjectManager.getCurrentRoom

		/* key handling */
		GUI.initObjectDeletionByKeyboard(); //handle delete key events to delete selected objects //needs: ObjectManager.getSelected on keydown
		GUI.initShiftKeyHandling(); //handle shift key events //needs: nothing
		GUI.initMoveByKeyboard(); //handle arrow key events to move objects //needs: ObjectManager.getSelected on keydown	

		/* window resizing */
		GUI.initResizeHandler(); //scale up room if it's too small //needs: ObjectManager.getCurrentRoom on document resize

		/* inspector */
		GUI.setupInspector(); //add inspector buttons, ...
		GUI.initInspectorAttributeUpdate(); //init updating of attributes in inspector


		window.setTimeout(function() {
			GUI.loadGUI(4);
		}, 200);
		
	} else if (step == 4) {
		GUI.progressBarManager.updateProgress("login", 80, GUI.translate('rendering objects'));
		
		/* load objects */
		GUI.hideHiddenObjects(); //hide hidden objects / initially create representations when calling getRepresentation() //needs: ObjectManager.getObjects, SVG
		
		GUI.initMouseHandler();
		
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