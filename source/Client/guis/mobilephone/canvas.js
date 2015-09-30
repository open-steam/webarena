"use strict";

var Canvas = {};

Canvas.init = function() {
	// Create the canvas.
	/*$("#objectview").svg({settings: {width: '0px', height: '0px'}});
	var canvas = $("#objectview svg");
	$(canvas).attr('id', 'canvas');

	var objectViewSVG = $("#objectview").svg('get');
	GUI.svg = objectViewSVG;
	GUI.svgDefs = objectViewSVG.defs();*/
	
	// Register callbacks to the object manager to synchronize with server.
	ObjectManager.registerAttributeChangedFunction(Canvas.update);
}

Canvas.update = function(object, key, newValue, local) {
	// Update mobile gui content on changes.
    ObjectList.update(object, key, newValue, local);
	ObjectView.update(object, key, newValue, local);
}