/* Links */

GUI.currentLinkObject = undefined;

GUI.updateLinks = function() {
	GUI.hideLinks(GUI.currentLinkObject);
	GUI.showLinks(GUI.currentLinkObject);
}

GUI.showLinks = function(object) {

	if (object == undefined) return;

	GUI.currentLinkObject = object;

	if (ObjectManager.getSelected().length > 1) {
	
		$.each(ObjectManager.getSelected(), function(index, obj) {
			GUI.hideLinks(obj);
		});
	
		return;
	}


	$.each(object.getLinkedObjects(), function(index, target) {
	
		if (!target.object) return;
	
		var objectX = object.getViewBoundingBoxX()+(object.getViewBoundingBoxWidth()/2);
		var objectY = object.getViewBoundingBoxY()+(object.getViewBoundingBoxHeight()/2);

		var targetX = target.object.getViewBoundingBoxX()+(target.object.getViewBoundingBoxWidth()/2);
		var targetY = target.object.getViewBoundingBoxY()+(target.object.getViewBoundingBoxHeight()/2);
	
		var line = GUI.svg.line(objectX, objectY, targetX, targetY, {
			strokeWidth: 1,
			stroke: "#CCCCCC"
		});
		
		$(line).attr("layer", -100);
		$(line).addClass("webarenaLink_"+object.data.id);
		$(line).css("opacity", 0);
		
		
		
		/* ghost objects */

		var rep = target.object.getRepresentation();
		
		if (target.object.data.visible == false) {
			$(rep).css("opacity", 0.4);
			$(rep).css("visibility", "visible");
			$(rep).addClass("webarena_ghost");
		}
		
		
		
		
		window.setTimeout(function() {

			$(line).css("opacity", 1);

		}, 1);
		
	});
	
}

GUI.hideLinks = function(object) {
	
	$(".webarenaLink_"+object.data.id).remove();

	$.each(ObjectManager.getObjects(), function(index, object) {
		
		/* ghost objects */

		var rep = object.getRepresentation();
		
		if ($(rep).hasClass("webarena_ghost")) {
			$(rep).css("opacity", 1);
			$(rep).css("visibility", "hidden");
			$(rep).removeClass("webarena_ghost");
		}
		
	});
	
}