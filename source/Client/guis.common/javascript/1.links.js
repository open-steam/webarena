"use strict";


/**
 * Functions for displaying links between objects
 */

 
/**
 * called when leaving a room
 */
GUI.eraseAllLinks = function(){
	
	$(".webarenaLink").remove();
	
}


/**
 * called every time an object is moved
 */
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
		
		var a1 = new Object(); //object's centerpoint 
		var a2 = new Object(); //target's centerpoint
		a1.x = object.getViewBoundingBoxX()+(object.getViewBoundingBoxWidth()/2);
		a1.y = object.getViewBoundingBoxY()+(object.getViewBoundingBoxHeight()/2);
		a2.x = target.getViewBoundingBoxX()+(target.getViewBoundingBoxWidth()/2);
		a2.y = target.getViewBoundingBoxY()+(target.getViewBoundingBoxHeight()/2);
		
		var arrows = 0;
		var Intersection1 = target.IntersectionObjectLine(a1, a2);
		var Intersection2 = object.IntersectionObjectLine(a1, a2);
		
		//get current width of the link
		var w;
		var w1 = $("#webarenaLink_between_"+target.id+"_and_"+object.id).attr("stroke-width");
		var w2 = $("#webarenaLink_between_"+object.id+"_and_"+target.id).attr("stroke-width");
		
		if(typeof w1 !== "undefined"){
			w = parseInt(w1);
		}
		if(typeof w2 !== "undefined"){
			w = parseInt(w2);
		}
		
		if(value.arrowheadOtherEnd || (parseInt(value.padding) > 0)){ //arrowhead to target 
		
			arrows++;
			
			//padding (because of the markers which extend the line and optional space between the object and the marker)
			var padding = parseInt(value.padding);
			
			if(value.arrowheadOtherEnd) padding += 3*w;
				
			if(typeof Intersection1 == 'undefined'){ //there is no Intersection between the target and the line --> the center of the object is inside the target -->  hide the link
			
				GUI.showLink(object.id, target.id, false); 
			}
			if(Intersection1 != "coincident" && Intersection1 != "no intersection"){ //Intersection
				
				//padding
				var dx;
				var dy;
		
				dx = a1.x - a2.x;
				dy = a1.y - a2.y;
			
				var l = Math.sqrt(dx*dx+dy*dy);
				dx = dx/l;
				dy = dy/l;
			
				var Intp1 = {
					x : Intersection1.x + dx*padding,
					y : Intersection1.y + dy*padding
				};

				
				$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('x1',Intp1.x);
				$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('y1',Intp1.y);
		
				$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('x2',Intp1.x);
				$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('y2',Intp1.y);
			}
		}
		
		if(value.arrowheadThisEnd || (parseInt(value.padding) > 0)){ //arrowhead to object
		
			arrows++;
			
			//padding (because of the markers which extend the line and optional space between the object and the marker)
			var padding = parseInt(value.padding);
			
			if(value.arrowheadThisEnd) padding += 3*w;
				
			if(typeof Intersection2 == 'undefined'){ //there is no Intersection between the object and the line --> the center of the target is inside the target --> hide the link	
			
				GUI.showLink(object.id, target.id, false); 	
			}	
			if(Intersection2 != "coincident" && Intersection2 != "no intersection"){ //Intersection		
						
				//padding
				var dx;
				var dy;
			
				dx = a2.x - a1.x;
				dy = a2.y - a1.y;
			
				var l = Math.sqrt(dx*dx+dy*dy);
				dx = dx/l;
				dy = dy/l;
			
				var Intp2 = {
					x : Intersection2.x + dx*padding,
					y : Intersection2.y + dy*padding
				};
				
					
				$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',Intp2.x);
				$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',Intp2.y);
		
				$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',Intp2.x);
				$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',Intp2.y);
			}
		}
		else{ //no arrowhead to object and no padding, the line can end in the center of the object
				
			$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('x2',a1.x);
			$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr('y2',a1.y);
		
			$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('x1',a1.x);
			$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr('y1',a1.y);	
		}
		
		//if two objects get too close to each other, make the link width smaller 
		var distance = Math.sqrt(Math.pow(Intersection1.x - Intersection2.x, 2) + Math.pow(Intersection1.y - Intersection2.y, 2));
		distance = distance - (parseInt(value.padding)*2);
		var maxWidth;
		if(arrows == 1){
			maxWidth = 1/3*distance - 1.5;
		}
		if(arrows == 2){
			maxWidth = 1/6*distance - 1;
		}
	
		if(maxWidth < 0){
			GUI.showLink(object.id, target.id, false); 
			return;
		}
		if(parseInt(value.width) > maxWidth){
			$("#webarenaLink_between_"+target.id+"_and_"+object.id).attr("stroke-width", maxWidth);
			$("#webarenaLink_between_"+object.id+"_and_"+target.id).attr("stroke-width", maxWidth);
		}
		
	});
}


/**
 * show or hide all links in the current room (via checkbox in the inspector, only if both objects are visible)
 */
GUI.showLinks = function(val) {
	
	for (var id1 in ObjectManager.getObjects()){
		var object1 = ObjectManager.getObject(id1);
		if(object1.getAttribute("visible")){
		
			var linkedObjects = object1.getAttribute("link");
	
			$.each(linkedObjects, function(index, v) {
		
				var id2 = v.destination;
				var object2 = ObjectManager.getObject(id2);
				
				if(object2.getAttribute("visible")){
					GUI.showLink(id1,id2,val);
				}
			});
		}
	}
	
}


/**
 * show or hide one link
 */
GUI.showLink = function(id1, id2, val) {
	
	var object1 = ObjectManager.getObject(id1);
	var object2 = ObjectManager.getObject(id2);
	var room = object1.getRoom();
	
	var rep1 = object1.getRepresentation();
	
	var rep2 = object2.getRepresentation();
	
	if(val && room.getAttribute('showLinks') && $(rep1).css('opacity') > 0 && $(rep2).css('opacity') > 0){ //show
		$("#webarenaLink_between_"+id1+"_and_"+id2).show();
		$("#webarenaLink_between_"+id2+"_and_"+id1).show();
	}
	else{ //hide
		$("#webarenaLink_between_"+id1+"_and_"+id2).hide();
		$("#webarenaLink_between_"+id2+"_and_"+id1).hide();
	}
}


/**
 * called after entering a room
 */
GUI.drawAllLinks = function(){ 

	for (var id in ObjectManager.getObjects()){
	
		var object = ObjectManager.getObject(id);
			
		GUI.drawLinks(object);
	}
}


/**
 * draw all links which are specified in the object's link attribute
 */
GUI.drawLinks = function(object) { 

	if (object == undefined) return;
		
	var newLinks1 = [];
	var oldLinks1 = object.getAttribute("link");
	if (_.isArray(oldLinks1)){
		newLinks1 = newLinks1.concat(oldLinks1);
	}else if (oldLinks1){
		newLinks1.push(oldLinks1);
	}
		
	//destroy old links of this object
	$( "line[id*='"+object.id+"']" ).remove();
		
	$.each(newLinks1, function( index, value ) {
			
		var targetID = value.destination;
		var target = ObjectManager.getObject(targetID);
	
		if (!target) return;
				
		//calculate middle of objects		
		var objectCenterX = object.getViewBoundingBoxX()+(object.getViewBoundingBoxWidth()/2);
		var objectCenterY = object.getViewBoundingBoxY()+(object.getViewBoundingBoxHeight()/2);
		var targetCenterX = target.getViewBoundingBoxX()+(target.getViewBoundingBoxWidth()/2);
		var targetCenterY = target.getViewBoundingBoxY()+(target.getViewBoundingBoxHeight()/2);
				
		/* draw link line */
		var parent = $('#room_'+'left').parent();
		
		var line = GUI.svg.line(parent, objectCenterX, objectCenterY, targetCenterX, targetCenterY, {
			strokeWidth: value.width,
			stroke: "#000000"
		});
		
		$(line).addClass("webarenaLink");
		$(line).attr("id", "webarenaLink_between_"+object.id+"_and_"+target.id);

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
		if(value.arrowheadThisEnd){
			var markerId = GUI.getSvgMarkerId("arrow", "black", false);
			$(line).attr("marker-start", "url(#"+markerId+")");
		}
		if(value.arrowheadOtherEnd){
			markerId = GUI.getSvgMarkerId("arrow", "black", true);
			$(line).attr("marker-end", "url(#"+markerId+")");
		}
				
		GUI.moveLinks(object);
		
        $(line).bind("mouseup", function(event){
            var x = (parseFloat($(this).attr("x1")) + parseFloat($(this).attr("x2")))/2
            var y = (parseFloat($(this).attr("y1")) + parseFloat($(this).attr("y2")))/2
			
			var deletion = object.translate(GUI.currentLanguage, "Delete");
			var changeProperties = object.translate(GUI.currentLanguage, "change properties");

            GUI.showActionsheet(x,y, {
                "actions" : [
                    {
                        "actionName" : deletion,
                        "actionFunction" : function(){
						
							//destroy links
							$("#webarenaLink_between_"+object.id+"_and_"+target.id).remove();
							$("#webarenaLink_between_"+target.id+"_and_"+object.id).remove();
						
							//remove the object ids from the attribute lists
							object.deleteLink(target.id);
							//target.deleteLink(object.id);
                        }
					},
					{
						"actionName" : changeProperties,
                        "actionFunction" : function(){
						
							_.each(ObjectManager.getObjects(), function(current) {
								current.deselect();
							});
				
							object.select();
								
							GUI.showLinkPropertyDialog(object, target, changeProperties, false);	
							
                        }
                    }
                ]
            }, false)
        });

		/*
        $(line).hover(
            function(event){
                $(this).attr("stroke-width", parseInt(value.width)+4)
            },
            function(event){
                $(this).attr("stroke-width", value.width)
            }
        );
		*/
	
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
	
	
/**
 * Dialog for setting/changing the link properties
 */
GUI.showLinkPropertyDialog = function(object, target, title, justcreated){   
	
	var selected = ObjectManager.getSelected();
	var targetIds = new Array();
	for(var i = 0; i<selected.length; i++){
		var currentId = selected[i].getId()
		if(currentId != object.id){
			targetIds.push(currentId);
			selected[i].deselect();
		}
	}
	
	var select1;
	var select2;
	var select3;
	var select4;
	
	var select5;
	var select6;
	var select7;
	
	var linkWidth = 5;
	var padding = 5;
	
	var links = object.getAttribute("link");
	
	//check the properties of the current link to select them in the dialog
	links.forEach(function(link) {
		if(link.destination == target.id){
		
			if(link.arrowheadOtherEnd){
				if(link.arrowheadThisEnd){
					select4 = 'selected="selected"';
				}
				else{
					select3 = 'selected="selected"';
				}
			}
			else{
				if(link.arrowheadThisEnd){
					select2 = 'selected="selected"';
				}
				else{
					select1 = 'selected="selected"';
				}
			}
			
			switch (link.style) {
				case "stroke":
					select5 = 'selected="selected"';
				break;
				case "dotted":
					select6 = 'selected="selected"';
				break;
				case "dashed":
					select7 = 'selected="selected"';
				break;
			}
			
			linkWidth = link.width;
			padding = link.padding;
		}
	});
	
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
	var pad = object.translate(GUI.currentLanguage, "distance between object and link");
	
	var PropertyDialog = document.createElement("div");
	$(PropertyDialog).attr("title", title);
	
	var content = '<p>'+direction+'<br>';
		content += 		'<select id="direction">';
		content += 			'<option value="undirected"'+select1+'>'+undirected+'</option>';
		content += 			'<option value="toObject"'+select2+'>'+objectAsTarget+'</option>';
		content += 			'<option value="fromObject"'+select3+'>'+objectAsSource+'</option>';
		content += 			'<option value="bidirectional"'+select4+'>'+bidirectional+'</option>';
		content += 		'</select>';
		content += '</p>';
		content += '<p>'+style+'<br>';
		content += 		'<select id="style">';
		content += 			'<option value="stroke"'+select5+'>'+stroke+'</option>';
		content += 			'<option value="dotted"'+select6+'>'+dotted+'</option>';
		content += 			'<option value="dashed"'+select7+'>'+dashed+'</option>';
		content += 		'</select>';
		content += '</p>';
		content += '<p>';
		content += 		'<p>'+width+'<br>';
		content += 		'<input type="number" id="lineWidth" name="value" value="'+linkWidth+'" min="1">';
		content += '</p>';
		content += '<p>';
		content += 		'<p>'+pad+'<br>';
		content += 		'<input type="number" id="linePadding" name="value" value="'+padding+'" min="0">';
		content += '</p>';
		
	var buttons = {};
	var lineWidth;
	var direction;
	var lineStyle;
	var linePadding;
	
	var arrowheadAtotherObject;
	var arrowheadAtthisObject;

	buttons[object.translate(GUI.currentLanguage, "save")] = function(domContent){
	
		lineWidth = parseInt($('#lineWidth').attr("value"));
		direction = $('#direction').val();
		lineStyle = $('#style').val();
		linePadding = parseInt($('#linePadding').attr("value"));
		
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
			object.createLinks(targetIds, arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle, linePadding);
			//object.buildLinks(arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle, linePadding);
		}
		else{
			//GUI.changeLinks(object, target, arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle, linePadding);
			object.changeLink(target.id, arrowheadAtotherObject, arrowheadAtthisObject, lineWidth, lineStyle, linePadding);
		}	
	};

	GUI.dialog(title, $(content), buttons, 300, false);
		
}