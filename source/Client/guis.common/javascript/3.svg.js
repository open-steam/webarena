"use strict";

/* SVG */
// http://keith-wood.name/svgRef.html

/**
 * Refresh the SVG
 */
GUI.refreshSVG = function() {
	$("#room_left").hide().show();
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
	var room_left_wrapper = contentSVG.svg();
	$(room_left_wrapper).attr('id', 'room_left_wrapper');
	var room_left = contentSVG.group(room_left_wrapper);
	$(room_left).attr('id', 'room_left');
	var room_right_wrapper = contentSVG.svg();
	$(room_right_wrapper).attr('id', 'room_right_wrapper');
	var room_right = contentSVG.group(room_right_wrapper);
	$(room_right).attr('id', 'room_right');

	$("#content").droppable({
		accept: ".toolbar_draggable",
		drop: function( event, ui ) {
			$(ui.helper).hide();
			ui.helper[0].callback(ui.offset.left, ui.offset.top);
		}
	});
}

/**
 * Resort all svg elements by their layer
 */
GUI.updateLayers = function() {
	// in coupling mode refresh layers of both rooms
	if (GUI.couplingModeActive) {
		var roomIndex = Array();
		for (var index in ObjectManager.currentRoom) {
			roomIndex.push(index);
		}
	} else {
		var roomIndex = Array("left");
	}

	for (var key = 0; key < roomIndex.length; key++) {
		var index = roomIndex[key];

		/* check if layers must be updated */
		var oldOrder = "";
		
		$("#room_"+index).children().each(function(i, el) {
		
			var id = $(el).attr("id");
			
			if (id !== undefined && id != "") {
				oldOrder += id+"###";
			}
			
		});
		
		var newOrder = "";
		
		var objectsArray = ObjectManager.getObjectsByLayer(index); //get all objects ordered by layer

		for (var i in objectsArray){
			var obj = objectsArray[i];
			
			newOrder += obj.id+"###";
			
		}
		
		if (oldOrder == newOrder) continue; //no change of order

		var objectsArray = ObjectManager.getObjectsByLayerInverted(index); //get all objects ordered by layer

		for (var i in objectsArray){
			var obj = objectsArray[i];
			
			var rep = obj.getRepresentation();
			
			$(rep).prependTo("#room_"+index);
			
		}
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





