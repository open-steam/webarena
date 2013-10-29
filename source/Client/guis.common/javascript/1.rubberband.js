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

	// coupling adjustments
	var index = 'left';
	if (GUI.couplingModeActive) {
		// no rubberband if vertical bar was clicked
		if ($('#couplingBar:hover').length != 0) return;

		// adjust position according to current pan state in corresponding room (left or right)
		if (event.pageX > $('#couplingBar').attr('x1')) {
			var index = 'right';
			var pageX = event.pageX - $('#couplingBar').attr('x1') - GUI.getPanX('right');
			var pageY = event.pageY - contentPosition.top - GUI.getPanY('right');
		} else {
			var index = 'left';
			var pageX = event.pageX - GUI.getPanX('left');
			var pageY = event.pageY - contentPosition.top - GUI.getPanY('left');
		}
	} else {
		var pageX = event.pageX;
		var pageY = event.pageY-contentPosition.top;
	}

	GUI.rubberbandStartX = pageX;
	GUI.rubberbandStartY = pageY;
	GUI.rubberbandWidth = 0;
	GUI.rubberbandHeight = 0;
	GUI.rubberbandX = 0;
	GUI.rubberbandY = 0;

	GUI.rubberband = GUI.svg.rect($('#room_'+index),
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
		
		if (GUI.couplingModeActive) {
			if (index === 'right') {
				GUI.rubberbandWidth = event.pageX-GUI.rubberbandStartX-$('#couplingBar').attr('x1')-GUI.getPanX('right');
				GUI.rubberbandHeight = event.pageY-GUI.rubberbandStartY-contentPosition.top-GUI.getPanY('right');
			} else {
				GUI.rubberbandWidth = event.pageX-GUI.rubberbandStartX-GUI.getPanX('left');
				GUI.rubberbandHeight = event.pageY-GUI.rubberbandStartY-contentPosition.top-GUI.getPanY('left');
			}
		} else {
			GUI.rubberbandWidth = event.pageX-GUI.rubberbandStartX;
			GUI.rubberbandHeight = event.pageY-GUI.rubberbandStartY-contentPosition.top;
		}
		
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
		
			$.each(ObjectManager.getObjects(index), function(index, object) {
			
				if (!object.getAttribute("visible")) return;
				
				if (object.boxIntersectsWith(GUI.rubberbandX, GUI.rubberbandY, GUI.rubberbandWidth, GUI.rubberbandHeight)) {
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