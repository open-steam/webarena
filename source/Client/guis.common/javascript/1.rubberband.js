"use strict";

/* rubberband */

/**
 * Called when a user clicks on the rooms background to start the rubberband (called by DOM event)
 * @param {event} event Mouse/Touch down DOM event
 */
GUI.rubberbandStart = function(event) {

	if (GUI.shiftKeyDown) return;
	
	$("#content").find(".webarenaRubberband").remove();
	
	if (GUI.paintModeActive) return;

	/* deselect all objects */
	GUI.deselectAllObjects();

	var contentPosition = $("#content").offset();

	var pageX = event.pageX;
	var pageY = event.pageY-contentPosition.top;
	

	GUI.rubberbandStartX = pageX;
	GUI.rubberbandStartY = pageY;
	GUI.rubberbandWidth = 0;
	GUI.rubberbandHeight = 0;
	GUI.rubberbandX = 0;
	GUI.rubberbandY = 0;

	GUI.rubberband = GUI.svg.rect($('#room'),
		GUI.rubberbandStartX, //x
		GUI.rubberbandStartY, //y
		0, //width
		0 //height
	);
	
	$(GUI.rubberband).attr("fill", "none");
	$(GUI.rubberband).attr("stroke", "#CCCCCC");
	$(GUI.rubberband).attr("style", "stroke-dasharray: 9, 5; stroke-width: 1");
	$(GUI.rubberband).attr("class", "webarenaRubberband");
	
	GUI.rubberbandX = GUI.rubberbandStartX;
	GUI.rubberbandY = GUI.rubberbandStartY;
	
	var move = function(event) {
		
		event.preventDefault();
	
		GUI.rubberbandWidth = event.pageX-GUI.rubberbandStartX;
		GUI.rubberbandHeight = event.pageY-GUI.rubberbandStartY-contentPosition.top;		
		
		GUI.rubberbandX = GUI.rubberbandStartX;
		GUI.rubberbandY = GUI.rubberbandStartY;
		
		if (GUI.rubberbandWidth < 0) {
			GUI.rubberbandX = GUI.rubberbandX+GUI.rubberbandWidth;
			GUI.rubberbandWidth = GUI.rubberbandWidth*(-1);
		}
		
		if (GUI.rubberbandHeight < 0) {
			GUI.rubberbandY = GUI.rubberbandY+GUI.rubberbandHeight;
			GUI.rubberbandHeight = GUI.rubberbandHeight*(-1);
		}
		
		
		$(GUI.rubberband).attr("width", GUI.rubberbandWidth);
		$(GUI.rubberband).attr("height", GUI.rubberbandHeight);
		
		$(GUI.rubberband).attr("x", GUI.rubberbandX);
		$(GUI.rubberband).attr("y", GUI.rubberbandY);
					
	}
	
	var end = function(event) {

		if (GUI.rubberbandWidth || GUI.rubberbandHeight){

			if (GUI.rubberbandWidth < 4) GUI.rubberbandWidth = 4;
			if (GUI.rubberbandHeight < 4) GUI.rubberbandHeight = 4;
		
			var count = 0;
		
			$.each(ObjectManager.getObjects('left'), function(index, object) {
			
				if (!object.getAttribute("visible")) return;
				
				var val;
				if(typeof object.objectIntersectsWith == 'function'){ 
					val = object.objectIntersectsWith(GUI.rubberbandX, GUI.rubberbandY, GUI.rubberbandWidth, GUI.rubberbandHeight); 
				}
				else{
					val = object.boxIntersectsWith(GUI.rubberbandX, GUI.rubberbandY, GUI.rubberbandWidth, GUI.rubberbandHeight);
				}
				
				if (val) {
					if (object.isGraphical) {
						object.select(true);
						count++;
					}
				}
				
			});
			
			if (count == 0) {
				/* clicked on background */
				GUI.updateInspector();
			}
		}
	
		$("#content>svg").unbind("mousemove.webarenaRubberband");

		$("#content>svg").unbind("mouseup.webarenaRubberband");
		
		$(GUI.rubberband).remove();
		
	}
	
	$("#content>svg").bind("mousemove.webarenaRubberband", move);
	
	$("#content>svg").bind("mouseup.webarenaRubberband", end);
	
}