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
		$(".webarenaLink_between_"+object.id+"_and_"+targetID).remove();
		$(".webarenaLink_between_"+targetID+"_and_"+object.id).remove();
				
		if(!target) return;
				
		//remove the object id from the attribute list of the target
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
		
		
		if(object.intersectsWith(target)){ //the objects intersects each other--->do not show any links
			GUI.showLink(object.id, target.id, false); 
			return;
		}

		GUI.showLink(object.id, target.id, true); 
		
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
				
			if(typeof Intersection == 'undefined'){ //there is no Intersection between the target and the line --> the center of the object is inside the target -->  hide the link
			
				GUI.showLink(object.id, target.id, false); 
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
				
			if(typeof Intersection == 'undefined'){ //there is no Intersection between the object and the line --> the center of the target is inside the target --> hide the link	
			
				GUI.showLink(object.id, target.id, false); 	
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

//show or hide links in the current room (via checkbox in the inspector, only if both objects are visible)
GUI.showLinks = function(value) {
	
	for (var id1 in ObjectManager.getObjects()){
		var object1 = ObjectManager.getObject(id1);
		if(object1.getAttribute("visible")){
			for (var id2 in ObjectManager.getObjects()){
				var object2 = ObjectManager.getObject(id2);
				if(object2.getAttribute("visible")){
					GUI.showLink(id1,id2,value);
				}
			}
		}
	}
}

//show or hide a link
GUI.showLink = function(id1, id2, value) {
	
	var object1 = ObjectManager.getObject(id1);
	var object2 = ObjectManager.getObject(id2);
	var room = object1.getRoom();
	
	if(value && room.getAttribute('showLinks') && object1.isVisible() > 0 && object2.isVisible() > 0){ //show
		$(".webarenaLink_between_"+id1+"_and_"+id2).show();
		$(".webarenaLink_between_"+id2+"_and_"+id1).show();
	}
	else{ //hide
		$(".webarenaLink_between_"+id1+"_and_"+id2).hide();
		$(".webarenaLink_between_"+id2+"_and_"+id1).hide();
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
			strokeWidth: value.width,
			stroke: "#000000"
		});
		
		$(line).addClass("webarenaLink_between_"+object.id+"_and_"+target.id);

		$(line).css("opacity", 0);
		
		switch (value.style){
			case 'dotted':var dasharray='5,5';break;
			case 'dashed':var dasharray='10,5';break;
			default:var dasharray='1,0';break;
		}
		
		$(line).attr("layer", 0);
		
		$(line).attr("stroke-dasharray", dasharray);

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
			var changeProperties = object.translate(GUI.currentLanguage, "change properties");

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
						"actionName" : changeProperties,
                        "actionFunction" : function(){
						
							_.each(ObjectManager.getObjects(), function(current) {
								current.deselect();
							});
				
							object.select();
								
							GUI.createDialog(object, target, changeProperties, false);	
							
                        }
                    }
                ]
            }, false)
        });

        $(line).hover(
            function(event){
                $(this).attr("stroke-width", parseInt(value.width)+4)
            },
            function(event){
                $(this).attr("stroke-width", value.width)
            }
        );
		
	
		window.setTimeout(function() {

			$(line).css("opacity", 1);

		}, 1);

        parent.prepend($(line));
		
		//after loading a room, hide links if "showLinks" is false or if the object/target is invisible 
		var room = object.getRoom();
		var show = room.getAttribute('showLinks');
		if (target.get('visible') == false || !show){
			window.setTimeout(function() {

				GUI.showLink(object.id, target.id, false);

			}, 100);	
		}
		
	});
	
}
	
//Dialog for setting/changing the link properties
GUI.createDialog = function(object, target, title, justcreated){
	
	var arrowheadAtotherObject;
	var arrowheadAtthisObject;
										
	var undirected = object.translate(GUI.currentLanguage, "undirected");
	var objectAsTarget = object.translate(GUI.currentLanguage, "object as target");
	var objectAsSource = object.translate(GUI.currentLanguage, "object as source");
	var bidirectional = object.translate(GUI.currentLanguage, "bidirectional");
	var linkProperties = object.translate(GUI.currentLanguage, "select properties");
	var direction = object.translate(GUI.currentLanguage, "direction");
	var stroke = object.translate(GUI.currentLanguage, "stroke");
	var dotted = object.translate(GUI.currentLanguage, "dotted");
	var dashed = object.translate(GUI.currentLanguage, "dashed");
	var style = object.translate(GUI.currentLanguage, "style");
	var width = object.translate(GUI.currentLanguage, "width");
							
	var PropertyDialog = document.createElement("div");
	$(PropertyDialog).attr("title", title);
							
	var content = '<p>'+direction+'<br>';
		content += 		'<select id="direction">';
		content += 			'<option value="undirected">'+undirected+'</option>';
		content += 			'<option value="toObject">'+objectAsTarget+'</option>';
		content += 			'<option value="fromObject">'+objectAsSource+'</option>';
		content += 			'<option value="bidirectional">'+bidirectional+'</option>';
		content += 		'</select>';
		content += '</p>';
		content += '<p>'+style+'<br>';
		content += 		'<select id="style">';
		content += 			'<option value="stroke">'+stroke+'</option>';
		content += 			'<option value="dotted">'+dotted+'</option>';
		content += 			'<option value="dashed">'+dashed+'</option>';
		content += 		'</select>';
		content += '</p>';
		content += '<p>';
		content += 		'<label for="lineWidth">'+width+'</label>';
		content += 		'<input type="number" id="lineWidth" name="value" value="5" min="1">';
		content += '</p>';
					
	var buttons = {};
	var lineWidth;
	var direction;
	var lineStyle;

	buttons[object.translate(GUI.currentLanguage, "save")] = function(domContent){
	
		lineWidth = $('#lineWidth').attr("value");
		direction = $('#direction').val();
		lineStyle = $('#style').val();
		
		if(direction=="undirected"){
			arrowheadAtotherObject = false;
			arrowheadAtthisObject = false;
		}
		if(direction=="toObject"){
			arrowheadAtotherObject = false;
			arrowheadAtthisObject = true;
		}
		if(direction=="fromObject"){
			arrowheadAtotherObject = true;
			arrowheadAtthisObject = false;
		}
		if(direction=="bidirectional"){
			arrowheadAtotherObject = true;
			arrowheadAtthisObject = true;
		}

		if(justcreated){
			object.buildLinks(arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle);
		}
		else{
			GUI.changeLinks(object, target, arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle);
		}	
	};

	GUI.dialog(title, $(content), buttons, 300, false);
		
}	

//handle the desired changes which was made in the change-properties-dialog
//especially: changing the link attribute
GUI.changeLinks = function(object, target, arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle){

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
			value.width = lineWidth;
			value.style = lineStyle;
		}
	});
				
	$.each(newLinks4, function( index, value ) {

		if(value.destination==object.id){
			value.arrowhead = arrowheadAtthisObject;
			value.width = lineWidth;
			value.style = lineStyle;
		}
	});
						
	target.setAttribute("link", newLinks4);
	object.setAttribute("link", newLinks3);
									
	GUI.createLinks(object);

}