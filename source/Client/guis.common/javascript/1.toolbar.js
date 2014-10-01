"use strict";

/**
 * Init. the toolbar
 */
GUI.initToolbar = function() {

	/* insert icons for creating new objects: */
	
	var types = {};
	
	/* get types of objects */
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
	
	/* build categories for each type */
	$.each(types, function(key, object) { 

		var newCategoryIcon = document.createElement("img");
		$(newCategoryIcon).attr("src", "/categoryIcons/"+object[0].category).attr("alt", "");
		$(newCategoryIcon).attr("width", "24").attr("height", "24");

		$("#header>div.header_left").append(newCategoryIcon);

		if (object.length > 1) { //more than one object in the category
			
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
						
						var click = function(attributes, drag) {
						
							popover.hide();

							var proto = ObjectManager.getPrototype(object.type);
							
							if (!Modules.Config.presentationMode) {

								if(drag){
									GUI.startNoAnimationTimer();
									proto.create(attributes);
								}
								else{
									if(object.type=='Arrow' || object.type=='Line'){

										GUI.setCursorText(GUI.translate("Choose "+object.type+"-Startpoint"));
						
									}
									else{
										$("body").css( 'cursor', 'url(/objectIcons/'+object.type+'), auto' );
									}	
								}
							} 
							else {
								alert(GUI.translate("You cannot create objects in presentation mode"));	
							}
							
						}
						

						if (GUI.isTouchDevice) {
							$(element.getDOM()).bind("touchstart", function() {
								click({
									"x" : window.pageXOffset + 40, 
									"y" : window.pageYOffset + 40
								}, false); 
							});
						} else {
							$(element.getDOM()).bind("click", function() { 
								click({
									"x" : window.pageXOffset + 40, 
									"y" : window.pageYOffset + 40
								}, false); 
							});
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
							}, true);
						
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
		
		} else { //one object in the category
			
			/* add link to icon (no Popover) */
			
			$(newCategoryIcon).attr("title", object[0].translate(GUI.currentLanguage, object[0].type));
			
			var click = function(attributes, drag) {

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
			
					if(drag){
						GUI.startNoAnimationTimer();
						proto.create(attributes);
					}
					else{
						$("body").css( 'cursor', 'url(/objectIcons/'+object[0].type+'), auto' );
					}
					
				} 
				else {
					alert(GUI.translate("You cannot create objects in presentation mode"));	
				}
				
			}
			
			if (GUI.isTouchDevice) {
				$(newCategoryIcon).bind("touchstart", function() { 
					click({
						"x" : window.pageXOffset + 40, 
						"y" : window.pageYOffset + 40
					}, false); 
				});
			} else {
				$(newCategoryIcon).bind("click", function() {
					click({
						"x" : window.pageXOffset + 40, 
						"y" : window.pageYOffset + 40
					}, false); 
				});
			}
			
			/* All objects (except for Paint and Highlighter) can be created by dragging them to the svg area */
			if (object[0].type != "Paint" && object[0].type != "Highlighter") {
				
				/* make draggable */
				var helper = $('<img src="categoryIcons/'+object[0].category+'" alt="" width="24" height="24" />');
				helper.get(0).callback = function(offsetX,offsetY) {

					var svgpos = $("#content").offset();

					var top = offsetY-svgpos.top;
					var left = offsetX;

					click({
						"x" : left,
						"y" : top
					}, true);

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

	/*add coupling button*/
	if (Modules.Config.couplingMode) {
		var couplingButton = document.createElement("img");
		$(couplingButton).attr("src", "../../guis.common/images/coupling.png").attr("alt", "");
		$(couplingButton).attr("width", "24").attr("height", "24");

		$(couplingButton).attr("id", "coupling_button");
		$(couplingButton).addClass("sidebar_button");

		$(couplingButton).css("padding-left", "20px");
		$(couplingButton).css("padding-right", "20px");
		$(couplingButton).css("margin-right", "20px");
		$(couplingButton).css("border-right", "1px solid #636363");
		
		$(couplingButton).attr("title", GUI.translate("Coupling"));

		$("#header > .header_right").append(couplingButton);
		
		var click = function() {
			GUI.enterCouplingMode();
		}
		
		if (GUI.isTouchDevice) {
			$(couplingButton).bind("touchstart", click);
		} else {
			$(couplingButton).bind("mousedown", click);
		}
	}

		
	/*add parent button*/
	var parentButton = document.createElement("img");
	$(parentButton).attr("src", "../../guis.common/images/parent.png").attr("alt", "");
	$(parentButton).attr("width", "24").attr("height", "24");

	$(parentButton).attr("id", "parent_button");
	$(parentButton).addClass("sidebar_button");
	
	$(parentButton).attr("title", GUI.translate("Parent"));

	$("#header > .header_right").append(parentButton);
	
	var click = function() {
		Modules.ObjectManager.goParent();
	}
	
	if (GUI.isTouchDevice) {
		$(parentButton).bind("touchstart", click);
	} else {
		$(parentButton).bind("mousedown", click);
	}
	
	/*add home button*/
	var homeButton = document.createElement("img");
	$(homeButton).attr("src", "../../guis.common/images/home.png").attr("alt", "");
	$(homeButton).attr("width", "24").attr("height", "24");

	$(homeButton).attr("id", "home_button");
	$(homeButton).addClass("sidebar_button");
	
	$(homeButton).attr("title", GUI.translate("Home"));

	$("#header > .header_right").append(homeButton);
	
	var click = function() {
		Modules.ObjectManager.goHome();
	}
	
	if (GUI.isTouchDevice) {
		$(homeButton).bind("touchstart", click);
	} else {
		$(homeButton).bind("mousedown", click);
	}
	
	/*add paint button*/
	if (Modules.Config.paintIcon) {
		var paintButton = document.createElement("img");
		$(paintButton).attr("src", "../../guis.common/images/painting.png").attr("alt", "");
		$(paintButton).attr("width", "24").attr("height", "24");

		$(paintButton).attr("id", "paint_button");
		$(paintButton).addClass("sidebar_button");
	
		$(paintButton).attr("title", GUI.translate("Paint"));

		$("#header > .header_right").append(paintButton);
	
		var click = function() {
			GUI.editPaint();
		}
	
		if (GUI.isTouchDevice) {
			$(paintButton).bind("touchstart", click);
		} else {
			$(paintButton).bind("mousedown", click);
		}
	}

	/*add paste button*/
	var pasteButton = document.createElement("img");
	$(pasteButton).attr("src", "../../guis.common/images/paste.png").attr("alt", "");
	$(pasteButton).attr("width", "24").attr("height", "24");

	$(pasteButton).attr("id", "paste_button");
	$(pasteButton).addClass("sidebar_button");

	$(pasteButton).css("padding-left", "20px");
	//$(pasteButton).css("padding-right", "20px");
	$(pasteButton).css("margin-right", "20px");
	$(pasteButton).css("border-left", "1px solid #636363");
	//$(pasteButton).css("border-right", "1px solid #636363");
	
	$(pasteButton).attr("title", GUI.translate("Paste"));

	$("#header > .header_right").append(pasteButton);
	
	var click = function() {
		Modules.ObjectManager.pasteObjects();
	}
	
	if (GUI.isTouchDevice) {
		$(pasteButton).bind("touchstart", click);
	} else {
		$(pasteButton).bind("mousedown", click);
	}
	
	/*add undo button*/
	var undoButton = document.createElement("img");
	$(undoButton).attr("src", "../../guis.common/images/undo.png").attr("alt", "");
	$(undoButton).attr("width", "24").attr("height", "24");

	$(undoButton).attr("id", "undo_button");
	$(undoButton).addClass("sidebar_button");

	//$(undoButton).css("padding-left", "20px");
	$(undoButton).css("padding-right", "20px");
	$(undoButton).css("margin-right", "20px");
	//$(undoButton).css("border-left", "1px solid #636363");
	$(undoButton).css("border-right", "1px solid #636363");
	
	$(undoButton).attr("title", GUI.translate("undo"));

	$("#header > .header_right").append(undoButton);
	
	var click = function() {
		Modules.Dispatcher.query("undo", {"userID" : GUI.userid});
	}
	
	if (GUI.isTouchDevice) {
		$(undoButton).bind("touchstart", click);
	} else {
		$(undoButton).bind("mousedown", click);
	}
	
	/* add bug report toggle */
	if (!Modules.Config.presentationMode) {
		if (Modules.Config.bugreportIcon) {
	
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
	}
	
	
	/* add chat toggle */
	if (!Modules.Config.presentationMode) {
		if (Modules.Config.chatIcon) {
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
		
		if (!Modules.Config.showSidebarbydefault){
			GUI.sidebar.closeSidebar(false);
		}

	}
	
	/* add pad toggle */
	if (!Modules.Config.presentationMode && Modules.config.collaborativeEditor) {
	
		var padButton = document.createElement("img");
		$(padButton).attr("src", "../../guis.common/images/categories/Texts.png").attr("alt", "");
		$(padButton).attr("width", "24").attr("height", "24");

		$(padButton).attr("id", "pad_button");
		$(padButton).addClass("sidebar_button");

		$(padButton).attr("title", GUI.translate("Description"));

		var click = function() {
			GUI.sidebar.openPage("pad", padButton);
		}
		
		if (GUI.isTouchDevice) {
			$(padButton).bind("touchstart", click);
		} else {
			$(padButton).bind("mousedown", click);
		}

		$("#header > .header_right").append(padButton);

		GUI.sidebar.openPage("pad", padButton);
	
	}
	
}
