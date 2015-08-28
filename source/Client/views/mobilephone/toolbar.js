"use strict";

var Toolbar = {};

Toolbar.init = function() {
	var resource = 'mb_ui_static_graphical_menu';

	Modules.ACLManager.isAllowed(resource, "create", function (err, result) {
		if (!err && result) {

			/* Create main menu and add it to the header. */
			var menu = document.createElement("img");
			$(menu).attr("src", "../../guis/mobilephone/images/menu.png");
			$(menu).attr("width", "24").attr("height", "24");
			$(menu).attr("style", "margin-left: 4px; margin-right: 4px; padding-left: 0px");
			$("#header>div.header_left").append(menu);

			/* Build the main menu and its entries. */
			Toolbar.buildMenu();

			/* Build event handler for the main menu. */
			if (GUI.isTouchDevice) {
				$(menu).bind("touchstart", function toggleCreateMenu(event) {
					// Toggle main menu.
					if (toggleCreateMenu.isVisible == undefined) {
						toggleCreateMenu.isVisible = false;
					}

					if (toggleCreateMenu.isVisible) {
						$("#objectlist").fadeIn("slow");
						$("#createmenu").fadeOut("slow");
					} else {
						$("#objectlist").fadeOut("slow");
						$("#createmenu").fadeIn("slow");
					}

					toggleCreateMenu.isVisible = !toggleCreateMenu.isVisible;
					event.stopImmediatePropagation();
				});
			} else {
				$(menu).bind("mousedown", function toggleCreateMenu(event) {
					// Toggle main menu.
					if (toggleCreateMenu.isVisible == undefined) {
						toggleCreateMenu.isVisible = false;
					}

					if (toggleCreateMenu.isVisible) {
						$("#objectlist").fadeIn("slow");
						$("#createmenu").fadeOut("slow");
					} else {
						$("#objectlist").fadeOut("slow");
						$("#createmenu").fadeIn("slow");
					}

					toggleCreateMenu.isVisible = !toggleCreateMenu.isVisible;
					event.stopImmediatePropagation();
				});
			}

			// Hide main menu on startup.
			$("#createmenu").hide();
		}
	});

	/* Create a button a for showing user info. */
	var userInfoButton = document.createElement("img");
	$(userInfoButton).attr("src", "../../guis.common/images/userinfo.png").attr("alt", "");
	$(userInfoButton).attr("width", "24").attr("height", "24");

	$(userInfoButton).attr("id", "userinfo_button");
	$(userInfoButton).addClass("sidebar_button");

	$(userInfoButton).attr("title", GUI.translate("User Info"));

	$("#header > .header_right").append(userInfoButton);

	var cookie = JSON.parse($.cookie('WADIV').replace("j:", ""));

	var click = function() {
		var content = "Name: " + cookie['name'] + "\n";
		content += "WADIV: " + cookie['WADIV'] + "\n";

		Modules.ACLManager.userRoles(function (err, result) {
			var role = _.contains(result, 'admin') ? "admin" : "user";
			content += "Role: " + role;

			alert(content);
		});
	}

	if (GUI.isTouchDevice) {
		$(userInfoButton).bind("touchstart", click);
	} else {
		$(userInfoButton).bind("mousedown", click);
	}
	
	/* Create button for switching to the parent room. */
	var parentButton = document.createElement("img");
	$(parentButton).attr("src", "../../guis.common/images/parent.png").attr("alt", "");
	$(parentButton).attr("width", "24").attr("height", "24");
	
	$(parentButton).attr("id", "bug_button");
	$(parentButton).addClass("sidebar_button");
	
	$(parentButton).attr("title", GUI.translate("Home"));
	
	$("#header > .header_right").append(parentButton);
	
	var click = function() {
		Modules.ObjectManager.goParent();
	}
	
	if (GUI.isTouchDevice) {
		$(parentButton).bind("touchstart", click);
	} else {
		$(parentButton).bind("mousedown", click);
	}
	
	/* Create button for switching to the home room. */
	var homeButton = document.createElement("img");
	$(homeButton).attr("src", "../../guis.common/images/home.png").attr("alt", "");
	$(homeButton).attr("width", "24").attr("height", "24");
	
	$(homeButton).attr("id", "bug_button");
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
}

Toolbar.buildMenu = function() {
	var types = {};
	
	/* Get types of objects for the creation menu. */
	$.each(ObjectManager.getTypes(), function(key, object) {
		// Store only types which are creatable and accessible on the mobile phone.
		if (object.isCreatableOnMobile && object.onMobile) {
			if (object.category == undefined) {
				object.category = "default";
			}
			if (types[object.category] == undefined) {
				types[object.category] = [];
			}
			// Add the object to the list.
			types[object.category].push(object);
		}
	});
    
    // Build the menu.
	$.each(types, function(key, object) {
		// Build the category icon for this type.
		var newCategoryIcon = document.createElement("img");
		$(newCategoryIcon).addClass("menuImg");
		$(newCategoryIcon).attr("src", "../../guis.common/images/categories/"+object[0].category+".png").attr("alt", "");
		$(newCategoryIcon).attr("width", "24").attr("height", "24");
		
		// Build the menu header for this type.
		var categoryName = document.createTextNode(GUI.translate(object[0].category));
		var containerHeader = document.createElement("h3");
		$(containerHeader).addClass("menu");
		$(containerHeader).append(newCategoryIcon);
		$(containerHeader).append(categoryName);
		
		// Append the menu header to the create menu.
		$("#createmenu").append(containerHeader);
		
		/* Add all object types which can created by the given category on the mobile phone. */
		if (object.length > 0) {
			$.each(object, function(key, object) {
				// Build and add a container for the entries to the submenu.
				var entryContainer = document.createElement("div");
				$(entryContainer).addClass("menuEntry");
				$("#createmenu").append(entryContainer);
				
				var typeName = document.createTextNode(object.translate(GUI.currentLanguage, object.type));
				var typeImg = document.createElement("img");
				$(typeImg).addClass("menuImg");
				$(typeImg).attr("src", "/objectIcons/" + object.type);
				$(typeImg).attr("width", 24);
				$(typeImg).attr("height", 24);
				
				$(entryContainer).append(typeImg);
				$(entryContainer).append(typeName);
				
				var create = function(attributes) {
					$("#createmenu").hide();
					$("#objectlist").show();
			
					var proto = ObjectManager.getPrototype(object.type);
							
					if (!Modules.Config.presentationMode) {
						proto.create(attributes);
						/*
						window.setTimeout(function() {
							GUI.updateContainer(object.getCategory());
						}, 500);
						*/
					} else {
						alert(GUI.translate("You cannot create objects in presentation mode"));	
					}
				}
			
				if (GUI.isTouchDevice) {
					$(entryContainer).bind("touchstart", function() {
						create({
							"x" : window.pageXOffset + 40, 
							"y" : window.pageYOffset + 40,
							"onMobile" : true
						});
						event.stopImmediatePropagation();
					});
				} else {
					$(entryContainer).bind("click", function() { 
						create({
							"x" : window.pageXOffset + 40, 
							"y" : window.pageYOffset + 40,
									"onMobile" : true
						});
						event.stopImmediatePropagation();
					});
				}
			});
		}
	});
}
