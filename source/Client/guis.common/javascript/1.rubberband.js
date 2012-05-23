/* rubberband */

GUI.initRubberband = function() {

	if (GUI.isTouchDevice) return;

	$("#content>svg").bind("mousedown", GUI.rubberbandStart);
	
}

GUI.rubberbandStart = function(event) {

	if (event.target.id) {
		var webarenaObject = ObjectManager.getObject(event.target.id);
		if (webarenaObject) {
			return;
		}
	} else if ($(event.target).parent()) {
		if ($(event.target).parent().attr("id")) {
			var webarenaObject = ObjectManager.getObject($(event.target).parent().attr("id"));
			if (webarenaObject && webarenaObject.selected) {
				return;
			}
		}
	}

	if (GUI.shiftKeyDown) return;
	
	if ($(event.target).hasClass("webarenaControl")) return;
	
	$("#content").find(".webarenaRubberband").remove();
	
	if (GUI.paintModeActive) return;
	
	/* deselect all objects */
	GUI.deselectAllObjects();

	var contentPosition = $("#content").offset();

	GUI.rubberbandStartX = event.pageX;
	GUI.rubberbandStartY = event.pageY-contentPosition.top;
	GUI.rubberbandWidth = 0;
	GUI.rubberbandHeight = 0;
	GUI.rubberbandX = 0;
	GUI.rubberbandY = 0;

	GUI.rubberband = GUI.svg.rect(
		GUI.rubberbandStartX, //x
		GUI.rubberbandStartY, //y
		0, //width
		0 //height
	);
	
	$(GUI.rubberband).attr("fill", "none");
	$(GUI.rubberband).attr("stroke", "#CCCCCC");
	$(GUI.rubberband).attr("style", "stroke-dasharray: 9, 5; stroke-width: 1");
	$(GUI.rubberband).attr("class", "webarenaRubberband");
	
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
	
	
		$.each(ObjectManager.getObjects(), function(index, object) {
		
			if (!object.getAttribute("visible")) return;
		
			if (object.boxIntersectsWith(GUI.rubberbandX, GUI.rubberbandY, GUI.rubberbandWidth, GUI.rubberbandHeight)) {
				if (object.isGraphical) {
					object.select(true);
				}
			}
			
		});
	
		$("#content>svg").unbind("mousemove.webarenaRubberband");

		$("#content>svg").unbind("mouseup.webarenaRubberband");
		
		$(GUI.rubberband).remove();
		
	}
	
	$("#content>svg").bind("mousemove.webarenaRubberband", move);
	
	$("#content>svg").bind("mouseup.webarenaRubberband", end);
	
}