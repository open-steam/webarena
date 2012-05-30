"use strict";

GUI.initToolbar = function() {

	/* insert icons for creating new objects: */
	
	var types = {};
	
	$.each(ObjectManager.getTypes(), function(key, object) { 
	
		if (object.isCreatable) {
			
			if (object.category == undefined) {
				object.category = "default";
			}
			
			if (types[object.category] == undefined) {
				types[object.category] = [];
			}
			
			types[object.category].push(object);
			
		}
	
	});
	
	
	
	$.each(types, function(key, object) { 

		var newCategoryIcon = document.createElement("img");
		$(newCategoryIcon).attr("src", "../../guis.common/images/categories/"+object[0].category+".png").attr("alt", "");
		$(newCategoryIcon).attr("width", "24").attr("height", "24");

		$("#header>div.header_left").append(newCategoryIcon);

		if (object.length > 1) {
			
			/* add Popover */
			
			$(newCategoryIcon).jPopover({
				positionOffsetY : $("#header").height()-7,
				onSetup : function(domEl, popover) {
					
					var page = popover.addPage(GUI.translate(key));
					var section = page.addSection();

					$.each(object, function(key, object) {

						var name = object.translate(GUI.currentLanguage,object.type);

						var element = section.addElement('<img src="/objectIcons/'+object.type+'" alt="" width="24" height="24" /> '+name);

						var click = function() {

							var proto = ObjectManager.getPrototype(object.type);
							
							proto.create();
							
							popover.hide();
							
						}

						if (GUI.isTouchDevice) {
							$(element.getDOM()).bind("touchstart", click);
						} else {
							$(element.getDOM()).bind("mousedown", click);
						}

					});
					
				}
			});
		
		} else {
			
			/* add link to icon (no Popover) */
			
			var click = function(event) {

				var proto = ObjectManager.getPrototype(object[0].type);
				
				proto.create();
				
				jPopoverManager.hideAll();
				
			}
			
			if (GUI.isTouchDevice) {
				$(newCategoryIcon).bind("touchstart", click);
			} else {
				$(newCategoryIcon).bind("mousedown", click);
			}
			
		}
	
	});
	
}