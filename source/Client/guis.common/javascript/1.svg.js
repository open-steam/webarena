"use strict";

/* SVG */

GUI.refreshSVG = function() {
	$("#content").hide().show();
	GUI.updateLayers();
}

/* setup SVG */

GUI.initSVG = function() {
	
	$("#content").svg();
	
//	$("#content").css("background-color", "#D8EFFF");
	
	GUI.svg = $("#content").svg('get');
	
	/* shadow effect filter */
	var filter = GUI.svg.filter("svg-drop-shadow", "-20%", "-20%", "200%", "200%");

    /*
	GUI.svg.filters.offset(filter, "offOut", "SourceGraphic", 1, 1); //move shadow graphic by 1px in each direction
	
	GUI.svg.filters.colorMatrix(filter, "matrixOut", "offOut", "matrix", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"); //this colormatrix sets the alpha channel to 50% (soft shadow)
	
	GUI.svg.filters.gaussianBlur(filter, "blurOut", "matrixOut", 2, 2); //blur by 2px in each direction
	GUI.svg.filters.blend(filter, "blendOut", "normal", "SourceGraphic", "blurOut"); //blend source and shadow graphics

*/
	/* selected effect filter */

	var filter = GUI.svg.filter("svg-selected", "-300%", "-300%", "800%", "800%");
	
	/* the following shadow graphics will be created by moving SourceAlpha (this is the alpha channel of the graphic and black) */
	/*GUI.svg.filters.offset(filter, "borderTopLeft", "SourceAlpha", -1, -1); //move shadow graphic to left/top
	GUI.svg.filters.offset(filter, "borderTopRight", "SourceAlpha", 1, -1); //move shadow graphic to right/top
	GUI.svg.filters.blend(filter, "borderTop", "normal", "borderTopLeft", "borderTopRight"); //merge both shadow graphics (this will result in an 1px border on left, top and right)
	
	GUI.svg.filters.offset(filter, "borderBottomLeft", "SourceAlpha", 1, 1); //move shadow graphic to right/bottom
	GUI.svg.filters.offset(filter, "borderBottomRight", "SourceAlpha", -1, 1); //move shadow graphic to left/bottom
	GUI.svg.filters.blend(filter, "borderBottom", "normal", "borderBottomLeft", "borderBottomRight"); //merge both shadow graphics (this will result in an 1px border on left, bottom and right)
	
	GUI.svg.filters.blend(filter, "border", "normal", "borderTop", "borderBottom"); //merge both shadow graphics (top and bottom)
	
	GUI.svg.filters.colorMatrix(filter, "borderColorized", "border", "matrix", "0 0 0 0 0, 0 0 0 0 0.2, 0 0 0 0 1, 0 0 0 1 0"); //colorize the black shadow graphic

	GUI.svg.filters.blend(filter, "out", "normal", "SourceGraphic", "borderColorized"); //merge graphic and shadow graphic
*/
	
	var clickHandler = function(event) {
		if (event.target == $("#content>svg").get(0)) {
			
			/* deselect all objects */
			GUI.deselectAllObjects();
			
			GUI.updateInspector();
			
			GUI.hideActionsheet();
			
		}
	};
	
	if (GUI.isTouchDevice) {
		$("#content>svg").get(0).addEventListener("touchstart", clickHandler, false);
	} else {
		$("#content>svg").click(clickHandler);
	}
	
}


GUI.updateLayers = function() {
	
	/* get all objects and order by layer */
	var objects = ObjectManager.getObjects();
	
	var objectsArray = [];
	
	for (var i in objects){
		var obj = objects[i];
		objectsArray.push(obj);
	}

	objectsArray.sort(function(a,b) {
		
		if (a.getAttribute("layer") > b.getAttribute("layer")) {
			return -1;
		} else {
			return 1;
		}
		
	});
	
	for (var i in objectsArray){
		var obj = objectsArray[i];
		
		var rep = obj.getRepresentation();
		
		$(rep).prependTo("#content>svg");
		
	}
	
	
}









