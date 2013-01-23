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
	
	
	var toolbar_locked_elements = {};
	
	$.each(types, function(key, object) { 

		var newCategoryIcon = document.createElement("img");
		$(newCategoryIcon).attr("src", "../../guis.common/images/categories/"+object[0].category+".png").attr("alt", "");
		$(newCategoryIcon).attr("width", "24").attr("height", "24");

		$("#header>div.header_left").append(newCategoryIcon);

		if (object.length > 1) {
			
			$(newCategoryIcon).attr("title", GUI.translate(object[0].category));
			
			/* add Popover */
			
			$(newCategoryIcon).jPopover({
				positionOffsetY : $("#header").height()-7,
				onSetup : function(domEl, popover) {
					
					var page = popover.addPage(GUI.translate(key));
					var section = page.addSection();

					$.each(object, function(key, object) {

						var name = object.translate(GUI.currentLanguage,object.type);

						var element = section.addElement('<img src="/objectIcons/'+object.type+'" alt="" width="24" height="24" /> '+name);

						var click = function(attributes) {

							popover.hide();

							var proto = ObjectManager.getPrototype(object.type);
							
							if (!Modules.Config.presentationMode) {

								proto.create(attributes);
								
							} else {
								alert(GUI.translate("You cannot create objects in presentation mode"));	
							}
							
						}

						if (GUI.isTouchDevice) {
							$(element.getDOM()).bind("touchstart", function() { click(); });
						} else {
							$(element.getDOM()).bind("click", function() { click(); });
						}
						
						
						/* make draggable */
						var helper = $('<img src="/objectIcons/'+object.type+'" alt="" width="24" height="24" />');
						helper.get(0).callback = function(offsetX,offsetY) {
							
							var svgpos = $("#content").offset();
							
							var top = offsetY-svgpos.top;
							var left = offsetX;

							click({
								"x" : left,
								"y" : top
							});
						
						}
						
						$(element.getDOM()).addClass("toolbar_draggable");
						$(element.getDOM()).draggable({
							revert: true,
							distance : 20,
							cursor: "move",
							helper: function(event) {
								return helper;
							}
						});

					});
					
				}
			});
		
		} else {
			
			/* add link to icon (no Popover) */
			
			$(newCategoryIcon).attr("title", object[0].translate(GUI.currentLanguage, object[0].type));
			
			var click = function(attributes) {

				if (toolbar_locked_elements[object[0].type] === true) return; //element is locked

				if (object[0].type == "Paint" || object[0].type == "Highlighter") {
					
					toolbar_locked_elements[object[0].type] = true;
					
					/* create unlock timer */
					window.setTimeout(function() {
						toolbar_locked_elements[object[0].type] = undefined;
					}, 2000);
					
				}

				jPopoverManager.hideAll();

				var proto = ObjectManager.getPrototype(object[0].type);
				
				if (!Modules.Config.presentationMode) {
					proto.create(attributes);
				} else {
					alert(GUI.translate("You cannot create objects in presentation mode"));	
				}
				
			}
			
			if (GUI.isTouchDevice) {
				$(newCategoryIcon).bind("touchstart", function() { click(); });
			} else {
				$(newCategoryIcon).bind("click", function() { click(); });
			}
			
			
			if (object[0].type != "Paint" && object[0].type != "Highlighter") {
				
				/* make draggable */
				var helper = $('<img src="../../guis.common/images/categories/'+object[0].category+'.png" alt="" width="24" height="24" />');
				helper.get(0).callback = function(offsetX,offsetY) {

					var svgpos = $("#content").offset();

					var top = offsetY-svgpos.top;
					var left = offsetX;

					click({
						"x" : left,
						"y" : top
					});

				}

				$(newCategoryIcon).addClass("toolbar_draggable");
				$(newCategoryIcon).draggable({
					revert: true,
					distance : 20,
					cursor: "move",
					helper: function(event) {
						return helper;
					}
				});
				
			}
			
	
		}
		
		var effect = function() {
			$(this).animate({ opacity: 1 }, 500, function() {
				$(this).animate({ opacity: 0.6 }, 500);
			});
		}
		
		if (GUI.isTouchDevice) {
			$(newCategoryIcon).bind("touchstart", effect);
		} else {
			$(newCategoryIcon).bind("mousedown", effect);
		}
	
	});
	
	
	
	
	
	
	/* add hidden-mode toggle */
	
	if (!Modules.Config.presentationMode) {
	
		var hiddenButton = document.createElement("img");
		$(hiddenButton).attr("src", "../../guis.common/images/hidden.png").attr("alt", "");
		$(hiddenButton).attr("width", "24").attr("height", "24");

		$(hiddenButton).attr("id", "hidden_button");
		$(hiddenButton).attr("title", GUI.translate("Toggle hidden mode"));

		GUI.onToggleHidden = function(hiddenMode) {

			if (hiddenMode) {
				//hidden mode is active (hidden objects are visible)
				$("#hidden_button").addClass("active");
			} else {
				//hidden mode is inactive (no hidden objects are visible)
				$("#hidden_button").removeClass("active");
			}

		}


		if (GUI.isTouchDevice) {
			$(hiddenButton).bind("touchstart", GUI.toggleHidden);
		} else {
			$(hiddenButton).bind("mousedown", GUI.toggleHidden);
		}

		$("#header > .header_right").append(hiddenButton);
	
	}
	
	
	
	/* add bug report toggle */
	if (!Modules.Config.presentationMode) {
		
		var bugButton = document.createElement("img");
		$(bugButton).attr("src", "../../guis.common/images/bugreport.png").attr("alt", "");
		$(bugButton).attr("width", "24").attr("height", "24");

		$(bugButton).attr("id", "bug_button");
		$(bugButton).addClass("sidebar_button");
		
		$(bugButton).attr("title", GUI.translate("Bugreport"));

		$("#header > .header_right").append(bugButton);
		
		var click = function() {
			GUI.sidebar.openPage("bug", bugButton);
		}
		
		if (GUI.isTouchDevice) {
			$(bugButton).bind("touchstart", click);
		} else {
			$(bugButton).bind("mousedown", click);
		}
		
	}
	
	
	/* add chat toggle */
	
	if (!Modules.Config.presentationMode) {

		var chatButton = document.createElement("img");
		$(chatButton).attr("src", "../../guis.common/images/chat.png").attr("alt", "");
		$(chatButton).attr("width", "24").attr("height", "24");

		$(chatButton).attr("id", "chat_button");
		$(chatButton).addClass("sidebar_button");
		
		$(chatButton).attr("title", GUI.translate("Chat"));

		$("#header > .header_right").append(chatButton);


		var chatNotifier = document.createElement("span");
		$(chatNotifier).attr("id", "chat_notifier");
		$(chatNotifier).html("");

		$(chatNotifier).css("opacity", 0);

		var buttonPos = $(chatButton).position();

		$(chatNotifier).css("left", buttonPos.left).css("top", buttonPos.top);

		$("#header > .header_right").append(chatNotifier);
		
		
		var click = function() {
			GUI.sidebar.openPage("chat", chatButton);
		}
		
		if (GUI.isTouchDevice) {
			$(chatButton).bind("touchstart", click);
			$(chatNotifier).bind("touchstart", click);
		} else {
			$(chatButton).bind("mousedown", click);
			$(chatNotifier).bind("mousedown", click);
		}
	
	}
	
	/* add inspector toggle */
	
	if (!Modules.Config.presentationMode) {
	
		var inspectorButton = document.createElement("img");
		$(inspectorButton).attr("src", "../../guis.common/images/inspector.png").attr("alt", "");
		$(inspectorButton).attr("width", "24").attr("height", "24");

		$(inspectorButton).attr("id", "inspector_button");
		$(inspectorButton).addClass("sidebar_button");

		$(inspectorButton).attr("title", GUI.translate("Object inspector"));

		var click = function() {
			GUI.sidebar.openPage("inspector", inspectorButton);
		}
		
		if (GUI.isTouchDevice) {
			$(inspectorButton).bind("touchstart", click);
		} else {
			$(inspectorButton).bind("mousedown", click);
		}

		$("#header > .header_right").append(inspectorButton);

		GUI.sidebar.openPage("inspector", inspectorButton);
	
	}
	

	
	
	
}