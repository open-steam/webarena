"use strict";

/* SVG */
// http://keith-wood.name/svgRef.html


/**
 * Refresh the SVG
 */
GUI.refreshSVG = function() {
	$("#room").hide().show();
	GUI.updateLayers();
}


/**
 * Create the SVG area
 */
GUI.initSVG = function() {
	
	// initialize svg canvas
	$("#content").svg();
	var canvas = $("#content svg");
	$(canvas).attr('id', 'canvas');

	var contentSVG = $("#content").svg('get');
	GUI.svg = contentSVG;
	GUI.svgDefs = contentSVG.defs();

	// initialize two nested svgs for concurrent view of two rooms
	var room_wrapper = contentSVG.svg();
	$(room_wrapper).attr('id', 'room_wrapper');
	var room = contentSVG.group(room_wrapper);
	$(room).attr('id', 'room');

	$("#content").droppable({
		scope: "ContentDrag", 		
		drop: function( event, ui ) {
			if(ui.helper[0].className == "jstree-icon ui-draggable-dragging"){
				GUI.trashbasket.restoreObject(event.pageX, event.pageY-33);
				return;
			}
			if(ui.helper[0].className == "jstree-icon file ui-draggable-dragging"){
				GUI.cloud.copyObject(event.pageX, event.pageY-33);
				return;
			}
			if(ui.helper[0].currentSrc.indexOf("objectIcons") > -1){
				ui.helper[0].callback(ui.offset.left, ui.offset.top);
			}
		}
	});
	
}


/**
 * Resort all svg elements by their layer
 */
GUI.updateLayers = function() {

	/* check if layers must be updated */
	var oldOrder = "";
	
	$("#room").children().each(function(i, el) {
	
		var id = $(el).attr("id");
		
		if (id !== undefined && id != "") {
			oldOrder += id+"###";
		}
		
	});
	
	var newOrder = "";
	
	var objectsArray = ObjectManager.getObjectsByLayer(); //get all objects ordered by layer

	for (var i in objectsArray){
		var obj = objectsArray[i];
		
		newOrder += obj.id+"###";
		
	}
	
	if (oldOrder == newOrder) return;

	var objectsArray = ObjectManager.getObjectsByLayerInverted(); //get all objects ordered by layer

	for (var i in objectsArray){
		var obj = objectsArray[i];
		
		var rep = obj.getRepresentation();
		
		$(rep).prependTo("#room");
		
	}
}

GUI.updateLayersDelayedTimer = undefined;

/**
 * Resort all svg elements by their layer (delayed by 1 sec.)
 */
GUI.updateLayersDelayed = function() {
	
	if (GUI.updateLayersDelayedTimer !== undefined) window.clearTimeout(GUI.updateLayersDelayedTimer);
	
	GUI.updateLayersDelayedTimer = window.setTimeout(function() {
		window.clearTimeout(GUI.updateLayersDelayedTimer);
		GUI.updateLayers();
	}, 1000);
}


/**
 * Get DOM ID of svg marker (svg markers are used to define design of arrow line caps)
 * @param {String} type Type of the marker (e.g. "arrow")
 * @param {String} color Color of the marker
 * @param {bool} up True if the direction of the marker is up
 */
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