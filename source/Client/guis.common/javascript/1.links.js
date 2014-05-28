"use strict";

/**
 * Functions for displaying links between objects
 */

/**
 * The object for which the links are shown
 */
GUI.currentLinkObject = undefined;


/**
 * update all links for the current object
 */
GUI.updateLinks = function() {
	//GUI.hideLinks(GUI.currentLinkObject);
	//GUI.showLinks(GUI.currentLinkObject);
}

//called when leaving a room
GUI.deleteLinkRepresentations = function(){
	
	for (var id1 in ObjectManager.getObjects()){
		for (var id2 in ObjectManager.getObjects()){
			$(".webarenaLink_between_"+id1+"_and_"+id2).remove();
			$(".webarenaLink_between_"+id2+"_and_"+id1).remove();
		}
	}
}

//called when an object is deleted
GUI.removeLinksfromObject = function(object){

	var linkedObjects = object.getAttribute("link");

	$.each(linkedObjects, function(index, value) {
	
		var targetID = value.destination;
		var target = ObjectManager.getObject(targetID);
				
		//destroy the links
		$(".webarenaLink_between_"+object.id+"_and_"+target.id).remove();
		$(".webarenaLink_between_"+target.id+"_and_"+object.id).remove();
						
		//remove the object ids from the attribute lists
        object.removeLinkedObjectById(target.id);
        target.removeLinkedObjectById(object.id);
		
	});
}

//called every time an object is moved
GUI.moveLinks = function(object){
	
	var linkedObjects = object.getAttribute("link");
	
	$.each(linkedObjects, function(index, value) {
		
		var targetId = value.destination;
		var target = ObjectManager.getObject(targetId);
			
		if (!target) return;
		
		var arrowheadToTarget1 = $(".webarenaLink_between_"+target.id+"_and_"+object.id).attr("marker-start");
		var arrowheadToTarget2 = $(".webarenaLink_between_"+object.id+"_and_"+target.id).attr("marker-end");
		var arrowheadToObject1 = $(".webarenaLink_between_"+target.id+"_and_"+object.id).attr("marker-end");
		var arrowheadToObject2 = $(".webarenaLink_between_"+object.id+"_and_"+target.id).attr("marker-start");
		
		var objectCenterX = object.getViewBoundingBoxX()+(object.getViewBoundingBoxWidth()/2);
		var objectCenterY = object.getViewBoundingBoxY()+(object.getViewBoundingBoxHeight()/2);
		var targetCenterX = target.getViewBoundingBoxX()+(target.getViewBoundingBoxWidth()/2);
		var targetCenterY = target.getViewBoundingBoxY()+(target.getViewBoundingBoxHeight()/2);
		
		var a1 = new Object();
		var a2 = new Object();
		a1.x = objectCenterX;
		a1.y = objectCenterY;
		a2.x = targetCenterX;
		a2.y = targetCenterY;
		
		if(arrowheadToTarget1 == "url(#svgMarker_arrow_black_0)" || arrowheadToTarget2 == "url(#svgMarker_arrow_black_1)"){ //arrowhead to target 
		
			var Intersection = target.IntersectionObjectLine(a1, a2);
			
			//there is no Intersection between the target and the line --> the center of the object is inside the target --> let the line end in the center of target and object
			if(typeof Intersection == 'undefined'){ 
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',objectCenterX);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',objectCenterY);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x1',targetCenterX);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y1',targetCenterY);
		
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',objectCenterX);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',objectCenterY);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x2',targetCenterX);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y2',targetCenterY);
			}
			else{	//Intersection
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x1',Intersection.x);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y1',Intersection.y);
		
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x2',Intersection.x);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y2',Intersection.y);
			}
		}
		if(arrowheadToObject1 == "url(#svgMarker_arrow_black_1)"|| arrowheadToObject2 == "url(#svgMarker_arrow_black_0)"){ //arrowhead to object
		
			var Intersection = object.IntersectionObjectLine(a1, a2);
				
			//there is no Intersection between the object and the line --> the center of the target is inside the target --> let the line end in the center of object and target	
			if(typeof Intersection == 'undefined'){ 
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',objectCenterX);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',objectCenterY);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x1',targetCenterX);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y1',targetCenterY);
		
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',objectCenterX);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',objectCenterY);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x2',targetCenterX);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y2',targetCenterY);
			}	
			else{   //Intersection
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',Intersection.x);
				$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',Intersection.y);
		
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',Intersection.x);
				$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',Intersection.y);
			}
		}
		else{ //no arrowhead to object, the line can end in the center of the object
						
			$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',objectCenterX);
			$(".webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',objectCenterY);
		
			$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',objectCenterX);
			$(".webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',objectCenterY);	
		}
	});
}

//show or hide links in the current room (via checkbox in the inspector)
GUI.showLinks = function(value) {
	
	for (var id1 in ObjectManager.getObjects()){
		for (var id2 in ObjectManager.getObjects()){
			if(value){ //show
				$(".webarenaLink_between_"+id1+"_and_"+id2).show();
				$(".webarenaLink_between_"+id2+"_and_"+id1).show();
			}
			else{ //hide
				$(".webarenaLink_between_"+id1+"_and_"+id2).hide();
				$(".webarenaLink_between_"+id2+"_and_"+id1).hide();
			}
		}
	}
}

//called after enter a room
GUI.createLinkRepresentations = function(){

	for (var id in ObjectManager.getObjects()){
	
		var object = ObjectManager.getObject(id);
			
		GUI.createLinks(object);
	}
}

//create new Links or change properties of existing links
GUI.createLinks = function(object) {

	if (object == undefined) return;
	
	/* set current link object */
	GUI.currentLinkObject = object;
	
	/* check if more than one object is selected */
	if (ObjectManager.getSelected().length > 1) {
	
		/* hide links for all selected objects */
		$.each(ObjectManager.getSelected(), function(index, obj) {
			GUI.showLinks(false);
		});
	
		return;
	}
		
	var newLinks1 = [];
	var oldLinks1 = object.getAttribute("link");
	if (_.isArray(oldLinks1)){
		newLinks1 = newLinks1.concat(oldLinks1);
	}else if (oldLinks1){
		newLinks1.push(oldLinks1);
	}
	
	/**
	 * get all objects linked with this object
	 */
	//$.each(object.getLinkedObjects(), function(index, target) {
	
	$.each(newLinks1, function( index, value ) {
			
		var targetID = value.destination;
		var target = ObjectManager.getObject(targetID);
	
		if (!target) return;
					
		var arrowheadAtotherObject = value.arrowhead;
		var arrowheadAtthisObject;
		
		var newLinks2 = [];
		var oldLinks2 = target.getAttribute("link");
		if (_.isArray(oldLinks2)){
			newLinks2 = newLinks2.concat(oldLinks2);
		}else if (oldLinks2){
			newLinks2.push(oldLinks2);
		}
		
		$.each(newLinks2, function( i, val ) {
			
			if(val.destination==object.id){
				arrowheadAtthisObject = val.arrowhead;
			}
		});
						
		//destroy old links
		$(".webarenaLink_between_"+object.id+"_and_"+target.id).remove();
		$(".webarenaLink_between_"+target.id+"_and_"+object.id).remove();
				
		//calculate middle of objects		
		var objectCenterX = object.getViewBoundingBoxX()+(object.getViewBoundingBoxWidth()/2);
		var objectCenterY = object.getViewBoundingBoxY()+(object.getViewBoundingBoxHeight()/2);
		var targetCenterX = target.getViewBoundingBoxX()+(target.getViewBoundingBoxWidth()/2);
		var targetCenterY = target.getViewBoundingBoxY()+(target.getViewBoundingBoxHeight()/2);
				
		/* draw link line */
		var parent = $('#room_'+ObjectManager.getIndexOfObject(object.getId()));
		var line = GUI.svg.line(parent, objectCenterX, objectCenterY, targetCenterX, targetCenterY, {
			strokeWidth: 6,
			stroke: "#CCCCCC"
		});
		
		$(line).addClass("webarenaLink_between_"+object.id+"_and_"+target.id);

		$(line).css("opacity", 0);

        $(line).bind("mousedown",function(event){
            event.preventDefault();
            event.stopPropagation();
        })
		
		//add arrowheads
		if(arrowheadAtthisObject){
			var markerId = GUI.getSvgMarkerId("arrow", "black", false);
			$(line).attr("marker-start", "url(#"+markerId+")");
		}
		if(arrowheadAtotherObject){
			markerId = GUI.getSvgMarkerId("arrow", "black", true);
			$(line).attr("marker-end", "url(#"+markerId+")");
		}
		
		GUI.moveLinks(object);
		
        $(line).bind("mouseup", function(event){
            var x = (parseFloat($(this).attr("x1")) + parseFloat($(this).attr("x2")))/2
            var y = (parseFloat($(this).attr("y1")) + parseFloat($(this).attr("y2")))/2

			if (GUI.couplingModeActive) {
				var index = ObjectManager.getIndexOfObject(object.getId());
				if (index === 'right') {
					x += parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX(index);
				} else {
					x += GUI.getPanX(index);
				}
				y += GUI.getPanY(index);
			}
			
			var deletion = object.translate(GUI.currentLanguage, "Delete");
			var changeDirection = object.translate(GUI.currentLanguage, "change direction");

            GUI.showActionsheet(x,y, {
                "actions" : [
                    {
                        "actionName" : deletion,
                        "actionFunction" : function(){
						
							//destroy links
							$(".webarenaLink_between_"+object.id+"_and_"+target.id).remove();
							$(".webarenaLink_between_"+target.id+"_and_"+object.id).remove();
						
							//remove the object ids from the attribute lists
                            object.removeLinkedObjectById(target.id);
                            target.removeLinkedObjectById(object.id);
                        }
					},
					{
						"actionName" : changeDirection,
                        "actionFunction" : function(){
						
							_.each(ObjectManager.getObjects(), function(current) {
								current.deselect();
							});
				
							object.select();
						
							var arrowheadAtotherObject;
							var arrowheadAtthisObject;
												
							var undirected = object.translate(GUI.currentLanguage, "undirected");
							var objectAsTarget = object.translate(GUI.currentLanguage, "object as target");
							var objectAsSource = object.translate(GUI.currentLanguage, "object as source");
							var bidirectional = object.translate(GUI.currentLanguage, "bidirectional");
							var linkDirection = object.translate(GUI.currentLanguage, "link direction:");
							
							//Dialog for changing the link direction
							var DirectionDialog = document.createElement("div");
							$(DirectionDialog).attr("title", linkDirection);

							var dialogButtons = {};
							dialogButtons[undirected] = function() {
								arrowheadAtotherObject = false;
								arrowheadAtthisObject = false;
								buildLinks();
								$(this).dialog("close");
							}
							dialogButtons[objectAsTarget] = function() {
								arrowheadAtotherObject = false;
								arrowheadAtthisObject = true;
								buildLinks();
								$(this).dialog("close");
							}
							dialogButtons[objectAsSource] = function() {
								arrowheadAtotherObject = true;
								arrowheadAtthisObject = false;
								buildLinks();
								$(this).dialog("close");
							}
							dialogButtons[bidirectional] = function() {
								arrowheadAtotherObject = true;
								arrowheadAtthisObject = true;
								buildLinks();
								$(this).dialog("close");
							}

							$(DirectionDialog).dialog("option", "buttons", dialogButtons);
						
							$(DirectionDialog).dialog({
								modal: true,
								resizable: false,
								buttons: dialogButtons
							});
							
							var buildLinks = function(){

								var newLinks3 = [];
								var oldLinks3 = object.getAttribute("link");
								if (_.isArray(oldLinks3)){
									newLinks3 = newLinks3.concat(oldLinks3);
								}else if (oldLinks3){
								newLinks3.push(oldLinks3);
								}
								
								var newLinks4 = [];
								var oldLinks4 = target.getAttribute("link");
								if (_.isArray(oldLinks4)){
									newLinks4 = newLinks4.concat(oldLinks4);
								}else if (oldLinks4){
								newLinks4.push(oldLinks4);
								}
							
								$.each(newLinks3, function( index, value ) {
							
									if(value.destination==target.id){
										value.arrowhead = arrowheadAtotherObject;
									}
								});
											
								$.each(newLinks4, function( index, value ) {
							
									if(value.destination==object.id){
										value.arrowhead = arrowheadAtthisObject;
									}
								});
													
								target.setAttribute("link", newLinks4);
								object.setAttribute("link", newLinks3);
																
								GUI.createLinks(object);
							
							}
                        }
                    }
                ]
            }, false)
        });

        $(line).hover(
            function(event){
                $(this).attr("stroke-width", 10)
            },
            function(event){
                $(this).attr("stroke-width", 6)
            }
        );
		
		
		/* ghost objects */
		var rep = target.getRepresentation();
		
		if (target.get('visible') == false) {
			$(rep).css("opacity", 0.4);
			$(rep).css("visibility", "visible");
			$(rep).addClass("webarena_ghost");
		}
		
		
		window.setTimeout(function() {

			$(line).css("opacity", 1);

		}, 1);

        parent.prepend($(line));
		
	});
}