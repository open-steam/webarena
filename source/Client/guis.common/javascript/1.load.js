"use strict";

/**
 * indicated if the GUI is fully loaded
 */
GUI.loaded = false;

/**
 * called when a room is entered
 */
GUI.entered = function() {

	if (GUI.loaded) {
		//GUI was loaded before --> this is a room change
		GUI.progressBarManager.addProgress(GUI.translate('changing room'), "login");
	}
	
	GUI.loadGUI(2);
	
}

/**
 * Load of GUI (seperated in different steps to ensure working dependencies)
 * @param {int} step Loading step which should be performed
 */
GUI.loadGUI = function(step) {
    this.setScrollPosition();
    this.checkCurrentsGUIObjects();
	/* not logged in? */
	if (!GUI.username) {
		
		/* setup svg area */
		GUI.initSVG();
		
		GUI.showLogin();
		return;
	}
	
	if (step == undefined || step == 1) {
		GUI.progressBarManager.updateProgress("login", 20);

		if (!GUI.loaded) GUI.chat.init();
		GUI.chat.clear(); //clear chats messages

		if (!GUI.loaded) GUI.sidebar.init(); //init sidebar


		/* login to server */
		ObjectManager.login(GUI.username, GUI.password, GUI.externalSession);
		GUI.externalSession = false;
		
	} else if (step == 2) {
		GUI.progressBarManager.updateProgress("login", 40);

		if (!GUI.loaded)
		GUI.loadListOfPreviewableMimeTypes();

		window.setTimeout(function() {
			GUI.loadGUI(3);
		}, 200);
		
	} else if (step == 3) {
		
		GUI.progressBarManager.updateProgress("login", 60, GUI.translate('loading GUI'));

		
		GUI.startNoAnimationTimer(); //timer to prevent "flying" objects when getting the new list of objects for the room

		if (!GUI.loaded) GUI.initInspectorAttributeUpdate(); //init updating of attributes in inspector
	
		/* key handling */
		if (!GUI.loaded) GUI.initObjectDeletionByKeyboard(); //handle delete key events to delete selected objects //needs: ObjectManager.getSelected on keydown
		if (!GUI.loaded) GUI.initUndoByKeyboard();
	
		if (!GUI.loaded) GUI.initCursorDeletionByKeyboard(); //handle Escape-Key events, currently only deletion of cursors which represents objects
	
		if (!GUI.loaded) GUI.initShiftKeyHandling(); //handle shift key events //needs: nothing

		if (!GUI.loaded) GUI.initMoveByKeyboard(); //handle arrow key events to move objects //needs: ObjectManager.getSelected on keydown		
	
		if (!GUI.loaded) GUI.initReturnKeyHandler(); //handle return key events to save changes during the inplace editing
	
		if (!GUI.loaded) GUI.initObjectCopyCutPasteHandlingByKeyboard(); //handle ctrl+c, ctrl+x, ctrl+v for copy, cut and paste objects //needs: ObjectManager.cutObjects, ObjectManager.copyObjects, ObjectManager.pasteObjets, ObjectManager.getSelected on keydown

		/* toolbar */
		if (!GUI.loaded) {
			//needs: ObjectManager
			GUI.initToolbar();
		}
		

		/* adjust svg area */
		GUI.adjustContent(); //first scaling of svg area (>= viewport) //needs: ObjectManager.getCurrentRoom

		/* window resizing */
		if (!GUI.loaded) GUI.initResizeHandler(); //scale up room if it's too small //needs: ObjectManager.getCurrentRoom on document resize

		/* inspector */
		if (!GUI.loaded) GUI.setupInspector(); //add inspector buttons, ...
	
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
		GUI.updateInspector();
		GUI.trashbasket.update();
		
		GUI.loaded = true;
		GUI.hideLogin();
		
		GUI.drawAllLinks(); //draw all existing links in the new room


		//Load application-GUI elements
		Modules.ApplicationManager.applicationCall("getApplicationGuiElements", null, function(callback){
			console.log("ApplicationManager called from load.js got "+ callback);
		});
		
		setTimeout(function(){
		
			ObjectManager.getCurrentRoom().serverCall("writePermission",function(result){
				GUI.writePermission=result;
				console.log("Write permission: ",GUI.writePermission);
				GUI.fadeoutActionElements();
			});
		}, 200);

	} else {
		console.error("unknown load step");
	}

}

GUI.fadeoutActionElements = function(){
	if(GUI.writePermission){

	}else{
		$(".header_left").css("display","none");
		$("#paste_button").css("display","none");
		$("#undo_button").css("display","none");
		$("#trash_button").css("display","none");
	}
};

GUI.checkCurrentsGUIObjects = function(){
        $(".ui-dialog-content").dialog("close");
}

GUI.setScrollPosition = function(){
    window.scrollTo( 0, 0 );
}
/**
 * start loading with step 1 when the document is ready
 */
$(function() {

	GUI.loadGUI(1);
	
});