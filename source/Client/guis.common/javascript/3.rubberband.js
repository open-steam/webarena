"use strict";

/* rubberband */

/**
 * Called when a user clicks on the rooms background to start the rubberband
 * @param {GUI.input.Session} session event object
 */
GUI.input.bind("start", function(session) {

	if (GUI.shiftKeyDown 
	|| GUI.rubberbandActive
	|| session.object != false
	|| session.target != GUI.input.artboardSVG
	|| GUI.paintModeActive)  return;

	/* deselect all objects */
	GUI.deselectAllObjects();

	var contentPosition = GUI.input.artboardOffset;

	// coupling adjustments
	var index = 'left';
	if (GUI.couplingModeActive) {
		// no rubberband if vertical bar was clicked
		if ($('#couplingBar:hover').length != 0) return;

		// adjust position according to current pan state in corresponding room (left or right)
		if (session.getX() > $('#couplingBar').attr('x1')) {
			var index = 'right';
			var pageX = session.getX() - $('#couplingBar').attr('x1') - GUI.getPanX('right');
			var pageY = session.getY() - contentPosition.top - GUI.getPanY('right');
		} else {
			var index = 'left';
			var pageX = session.getX() - GUI.getPanX('left');
			var pageY = session.getY() - contentPosition.top - GUI.getPanY('left');
		}
	} else {
		var pageX = session.getX();
		var pageY = session.getY()-contentPosition.top;
	}

	GUI.rubberbandActive = true;
	GUI.rubberbandIndex = index;
	GUI.rubberbandStartX = pageX;
	GUI.rubberbandStartY = pageY;
	GUI.rubberbandWidth = 0;
	GUI.rubberbandHeight = 0;
	GUI.rubberbandX = 0;
	GUI.rubberbandY = 0;

	GUI.rubberband = GUI.svg.rect($('#room_'+GUI.rubberbandIndex),
		GUI.rubberbandStartX, //x
		GUI.rubberbandStartY, //y
		0, //width
		0 //height
	);
	
	$(GUI.rubberband).attr("fill", "none");
	$(GUI.rubberband).attr("stroke", "#CCCCCC");
	$(GUI.rubberband).attr("style", "stroke-dasharray: 9, 5; stroke-width: 1; z-index: 10000;");
	$(GUI.rubberband).attr("class", "webarenaRubberband");
	
	GUI.rubberbandX = GUI.rubberbandStartX;
	GUI.rubberbandY = GUI.rubberbandStartY;	
	
	session.bind("move", function(session) {
		if(!GUI.rubberbandActive) return;
		
		var contentPosition = GUI.input.artboardOffset;
		
		if (GUI.couplingModeActive) {
			if (GUI.rubberbandIndex === 'right') {
				GUI.rubberbandWidth = session.getX()-GUI.rubberbandStartX-$('#couplingBar').attr('x1')-GUI.getPanX('right');
				GUI.rubberbandHeight = session.getY()-GUI.rubberbandStartY-contentPosition.top-GUI.getPanY('right');
			} else {
				GUI.rubberbandWidth = session.getX()-GUI.rubberbandStartX-GUI.getPanX('left');
				GUI.rubberbandHeight = session.getY()-GUI.rubberbandStartY-contentPosition.top-GUI.getPanY('left');
			}
		} else {
			GUI.rubberbandWidth = session.getX()-GUI.rubberbandStartX;
			GUI.rubberbandHeight = session.getY()-GUI.rubberbandStartY-contentPosition.top;
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

		if (!GUI.couplingModeActive) {
			// scrolling if mouse curser is close to window boundaries
			var scrollPixel = 15; // how many pixels to scroll each event
			var scrollSensitivity = 15; // boundary for scrolling
			/* enlarge room dimensions if scrolling over boundaries
			var currentRoom = ObjectManager.getCurrentRoom();
			if (GUI.rubberbandX + GUI.rubberbandWidth >= $('#content').width() - visibleWidth) {
				GUI.setRoomWidth(parseInt(currentRoom.getAttribute("width")) + scrollPixel);
			}
			if (GUI.rubberbandY + GUI.rubberbandHeight >= $('#content').height() - scrollSensitivity) {
				GUI.setRoomHeight(parseInt(currentRoom.getAttribute("height")) + scrollPixel);
			}*/
			var visibleWidth = scrollSensitivity;
			if (GUI.sidebar.open) {
				visibleWidth += parseInt($("#sidebar").css("width"), 10);
			}
			// right
			if ((session.getX() >= $(document).scrollLeft() + $(window).width() - visibleWidth) && (GUI.rubberbandX + GUI.rubberbandWidth >= $(document).scrollLeft() + $(window).width() - visibleWidth)) {
				$(document).scrollLeft($(document).scrollLeft() + scrollPixel);
			}
			// left
			if ((session.getX() - $(document).scrollLeft() <= scrollSensitivity) && (GUI.rubberbandX - $(document).scrollLeft() <= scrollSensitivity)) {
				$(document).scrollLeft($(document).scrollLeft() - scrollPixel);
			}
			// bottom
			if ((session.getY() >= $(document).scrollTop() + $(window).height() - contentPosition.top - scrollSensitivity) && (GUI.rubberbandY + GUI.rubberbandHeight >= $(document).scrollTop() + $(window).height() - contentPosition.top - scrollSensitivity)) {
				$(document).scrollTop($(document).scrollTop() + scrollPixel);
			}
			// top
			if ((session.getY() - contentPosition.top - $(document).scrollTop() <= scrollSensitivity) && (GUI.rubberbandY - $(document).scrollTop() <= scrollSensitivity)) {
				$(document).scrollTop($(document).scrollTop() - scrollPixel);
			}
		}
	});

	session.bind("end", function(session) {

		if(!GUI.rubberbandActive) return;
			
		if (GUI.rubberbandWidth || GUI.rubberbandHeight) {

			if (GUI.rubberbandWidth < 4) GUI.rubberbandWidth = 4;
			if (GUI.rubberbandHeight < 4) GUI.rubberbandHeight = 4;
		
			var bigControls = (session.type == GUI.input.TYPE_TOUCH);
			var count = 0;
		
			$.each(ObjectManager.getObjects(GUI.rubberbandIndex), function(index, object) {
			
				if (!object.getAttribute("visible")) return;
				
				if (object.boxIntersectsWith(GUI.rubberbandX, GUI.rubberbandY, GUI.rubberbandWidth, GUI.rubberbandHeight)) {
					if (object.isGraphical) {
						object.bigControls = bigControls;
						object.select(true);
						count++;
					}
				}
				
			});
			
			if (count == 0) {
				/* clicked on background */
				GUI.updateInspector(true);
			}
		}
		
		GUI.rubberbandActive = false;
		$(GUI.rubberband).remove();
	});
});