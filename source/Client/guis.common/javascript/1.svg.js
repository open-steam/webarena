"use strict";

/* SVG */

GUI.refreshSVG = function() {
	$("#content").hide().show();
	GUI.updateLayers();
}

/* setup SVG */

GUI.initSVG = function() {
	
	$("#content").svg();
	
	GUI.svg = $("#content").svg('get');
	GUI.svgDefs = GUI.svg.defs();


}


GUI.updateLayers = function() {

	var objectsArray = ObjectManager.getObjectsByLayerInverted(); //get all objects ordered by layer
	
	for (var i in objectsArray){
		var obj = objectsArray[i];
		
		var rep = obj.getRepresentation();
		
		$(rep).prependTo("#content>svg");
		
	}
	
}

GUI.updateLayersDelayedTimer = undefined;

GUI.updateLayersDelayed = function() {
	
	if (GUI.updateLayersDelayedTimer !== undefined) window.clearTimeout(GUI.updateLayersDelayedTimer);
	
	GUI.updateLayersDelayedTimer = window.setTimeout(function() {
		window.clearTimeout(GUI.updateLayersDelayedTimer);
		GUI.updateLayers();
	}, 1000);
}



GUI.getSvgMarkerId = function(type, color, up) {
	
	var defs = GUI.svgDefs;

	if (up) {
		var upS = "1";
	} else {
		var upS = "0";
	}
	
	var colorId = color;
	colorId = colorId.replace(/\#/g, '');
	colorId = colorId.replace(/\ /g, '');
	colorId = colorId.replace(/\(/g, '');
	colorId = colorId.replace(/\)/g, '');
	colorId = colorId.replace(/\,/g, '_');

	var markerId = "svgMarker_"+type+"_"+colorId+"_"+upS;

	if ($(defs).find("#"+markerId).length > 0) {
		//marker found
		return markerId;
	} else {
		//marker not found --> create
		
		if (type == "arrow") {
			
			if (up) {
				var refX = 0;
			} else {
				var refX = 10;
			}

			var arrowMarker = GUI.svg.marker(defs, markerId, refX, 5, 4, 3);

			$(arrowMarker).attr("viewBox", "0 0 10 10");
			$(arrowMarker).attr("markerUnits", "strokeWidth");

			var path = GUI.svg.createPath();
			
			if (up) {
				var p = GUI.svg.path(arrowMarker, path.move(0, 0).line(10, 5).line(0, 10).close());
			} else {
				var p = GUI.svg.path(arrowMarker, path.move(10, 0).line(10, 10).line(0, 5).close());
			}

			$(p).attr("fill", color);
			
		} else {
			console.error("Unknown marker type '"+type+"'!");
			return;
		}
		
		return markerId;
		
	}
	

	
}





