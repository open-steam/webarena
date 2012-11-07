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
							
							if (!Modules.Config.presentationMode) {
								proto.create();
							} else {
								alert(GUI.translate("You cannot create objects in presentation mode"));	
							}
							
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
				
				if (!Modules.Config.presentationMode) {
								proto.create();
							} else {
								alert(GUI.translate("You cannot create objects in presentation mode"));	
							}
				
				jPopoverManager.hideAll();
				
			}
			
			if (GUI.isTouchDevice) {
				$(newCategoryIcon).bind("touchstart", click);
			} else {
				$(newCategoryIcon).bind("mousedown", click);
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

		GUI.onToggleHidden = function(hiddenMode) {

			if (hiddenMode) {
				//hidden mode is active (hidden objects are visible)
				$("#hidden_button").addClass("active");
			} else {
				//hidden mode is inactive (no hidden objects are visible)
				$("#hidden_button").removeClass("active");
			}

		}

		$(hiddenButton).bind("click", function() {

			GUI.toggleHidden();

		});

		$("#header > .header_right").append(hiddenButton);
	
	}
	
	
	
	
	
	/* add chat toggle */
	
	if (!Modules.Config.presentationMode) {
	
		var chatButton = document.createElement("img");
		$(chatButton).attr("src", "../../guis.common/images/chat.png").attr("alt", "");
		$(chatButton).attr("width", "24").attr("height", "24");

		$(chatButton).attr("id", "chat_button");
		$(chatButton).addClass("sidebar_button");

		$(chatButton).bind("click", function() {

			GUI.sidebar.openPage("chat", chatButton);

		});

		$("#header > .header_right").append(chatButton);

		var chatNotifier = document.createElement("span");
		$(chatNotifier).attr("id", "chat_notifier");
		$(chatNotifier).html("15");
		$(chatNotifier).click(function (){
			$(chatButton).click();
		});
		$(chatNotifier).css("opacity", 0);

		var buttonPos = $(chatButton).position();

		$(chatNotifier).css("left", buttonPos.left).css("top", buttonPos.top);

		$("#header > .header_right").append(chatNotifier);
	
	}
	
	/* add inspector toggle */
	
	if (!Modules.Config.presentationMode) {
	
		var inspectorButton = document.createElement("img");
		$(inspectorButton).attr("src", "../../guis.common/images/inspector.png").attr("alt", "");
		$(inspectorButton).attr("width", "24").attr("height", "24");

		$(inspectorButton).attr("id", "inspector_button");
		$(inspectorButton).addClass("sidebar_button");

		$(inspectorButton).bind("click", function() {

			GUI.sidebar.openPage("inspector", inspectorButton);

		});

		$("#header > .header_right").append(inspectorButton);

		GUI.sidebar.openPage("inspector", inspectorButton);
	
	}
	

	
	
	
}