"use strict";

var Canvas = {};

Canvas.init = function() {	
	// Register callbacks to the object manager to synchronize with server.
	ObjectManager.registerAttributeChangedFunction(Canvas.update);
}

Canvas.update = function(object, key, newValue, local) {
	// Update mobile gui content on changes.
    ObjectList.update(object, key, newValue, local);
	ObjectView.update(object, key, newValue, local);
}