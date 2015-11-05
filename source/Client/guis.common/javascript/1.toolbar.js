"use strict";

/* SETTINGS */
var popover_positionOffsetX = 8;
var popover_positionOffsetY = 20;

var numberOfIcons = 0;

/**
 * Init. the toolbar
 */
GUI.initToolbar = function() {

	$(window).resize(function() {		
		GUI.resizeToolbar();
	});

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

		numberOfIcons++;
	
        var newCategoryIcon = document.createElement("img");
        $(newCategoryIcon).attr("src", "/categoryIcons/" + object[0].category).attr("alt", "");
        $(newCategoryIcon).attr("width", "24").attr("height", "24");

        $("#header>div.header_left").append(newCategoryIcon);

        //if (object.length > 1) { //more than one object in the category

		$(newCategoryIcon).attr("title", GUI.translate(object[0].category));

		/* add Popover */

		$(newCategoryIcon).jPopover({
			positionOffsetX: popover_positionOffsetX,
			positionOffsetY: popover_positionOffsetY,
			onSetup: function(domEl, popover) {

				var page = popover.addPage(GUI.translate(key));
				var section = page.addSection();

				$.each(object, function(key, object) {

					var name = object.translate(GUI.currentLanguage, object.type);

					var element = section.addElement('<img src="/objectIcons/' + object.type + '" alt="" width="24" height="24" /> ' + name);

					var dragging = false;
					
					var click = function(attributes, drag) {

						popover.hide();

						var proto = ObjectManager.getPrototype(object.type);

						if (!Modules.Config.presentationMode) {

							if (drag) {
								GUI.startNoAnimationTimer();
								proto.create(attributes);
								dragging = false;
							}
							else {
								if(GUI.isTouchDevice){
									proto.create(attributes);
								}
								else{
									if (object.type == 'Arrow' || object.type == 'Line'){
										GUI.setCursorText(GUI.translate("Choose " + object.type + "-Startpoint"));
									}
									else {
										$("body").css('cursor', 'url(../../guis.common/images/cursor/'+object.type+'.cur), auto');
									}
								}
							}
						}
						else {
							alert(GUI.translate("You cannot create objects in presentation mode"));
						}
					}


					if (GUI.isTouchDevice) {
						$(element.getDOM()).bind("touchend", function(event) {
							if(!dragging){
								click({
									"x": window.pageXOffset + 40,
									"y": window.pageYOffset + 40
								}, false);
							}
						});
					} else {
						$(element.getDOM()).bind("click", function() {
							click({
								"x": window.pageXOffset + 40,
								"y": window.pageYOffset + 40
							}, false);
						});
					}


					/* make draggable */
					var helper = $('<img src="/objectIcons/' + object.type + '" alt="" width="24" height="24" />');
					helper.get(0).callback = function(offsetX, offsetY) {
					
						var svgpos = $("#content").offset();

						var top = offsetY - svgpos.top;
						var left = offsetX;

						click({
							"x": left,
							"y": top
						}, true);

					}

					$(element.getDOM()).addClass("toolbar_draggable");
					$(element.getDOM()).draggable({
						revert:  "invalid",
						distance: 20,
						scope: "ContentDrag", 
						cursor: "move",
						helper: function(event) {
							dragging = true;
							return helper;
						}
					});

				});

			}
		});

		
        //} else { //one object in the category

            /* add link to icon (no Popover) 
			
            $(newCategoryIcon).attr("title", object[0].translate(GUI.currentLanguage, object[0].type));

            var click = function(attributes, drag) {

                if (toolbar_locked_elements[object[0].type] === true)
                    return; //element is locked

                if (object[0].type == "Paint" || object[0].type == "Highlighter") {

                    toolbar_locked_elements[object[0].type] = true;

                    // create unlock timer
                    window.setTimeout(function() {
                        toolbar_locked_elements[object[0].type] = undefined;
                    }, 2000);

                }

                jPopoverManager.hideAll();

                var proto = ObjectManager.getPrototype(object[0].type);

                if (!Modules.Config.presentationMode) {

                    if (drag) {
                        GUI.startNoAnimationTimer();
                        proto.create(attributes);
                    }
                    else {
                        $("body").css('cursor', 'url(/objectIcons/' + object[0].type + '), auto');
                    }

                }
                else {
                    alert(GUI.translate("You cannot create objects in presentation mode"));
                }

            }

            if (GUI.isTouchDevice) {
                $(newCategoryIcon).bind("touchstart", function() {
                    click({
                        "x": window.pageXOffset + 40,
                        "y": window.pageYOffset + 40
                    }, false);
                });
            } else {
                $(newCategoryIcon).bind("click", function() {
                    click({
                        "x": window.pageXOffset + 40,
                        "y": window.pageYOffset + 40
                    }, false);
                });
            }

            //All objects (except for Paint and Highlighter) can be created by dragging them to the svg area
            if (object[0].type != "Paint" && object[0].type != "Highlighter") {

                //make draggable
                var helper = $('<img src="categoryIcons/' + object[0].category + '" alt="" width="24" height="24" />');
                helper.get(0).callback = function(offsetX, offsetY) {

                    var svgpos = $("#content").offset();

                    var top = offsetY - svgpos.top;
                    var left = offsetX;

                    click({
                        "x": left,
                        "y": top
                    }, true);

                }

                $(newCategoryIcon).addClass("toolbar_draggable");
                $(newCategoryIcon).draggable({
                    revert: true,
                    distance: 20,
                    cursor: "move",
                    helper: function(event) {
                        return helper;
                    }
                });

            }

        }
		*/
		
        var effect = function() {
            $(this).animate({opacity: 1}, 500, function() {
                $(this).animate({opacity: 0.6}, 500);
            });
        }

        if (GUI.isTouchDevice) {
            $(newCategoryIcon).bind("touchstart", effect);
        } else {
            $(newCategoryIcon).bind("mousedown", effect);
        }

    });
	
	
    /*add menu button*/
    var menuButton = document.createElement("img");
    $(menuButton).attr("src", "../../guis.common/images/menu.png").attr("alt", "");
    $(menuButton).attr("width", "24").attr("height", "24");

    $(menuButton).attr("id", "menu_button");
    $(menuButton).addClass("sidebar_button");

    $(menuButton).attr("title", GUI.translate("Menu"));
	$(menuButton).css("margin-right", "0px");
    $("#header > .header_right").append(menuButton);

    $(menuButton).jPopover({
        positionOffsetX: popover_positionOffsetX,
        positionOffsetY: popover_positionOffsetY,
        arrowOffsetRight: 12,
        onSetup: function(domEl, popover) {

            Object.defineProperty(popover.options, 'positionOffsetX', {
                get: function() {
                    return -4 - popover_positionOffsetX + $("#header > .header_right").position().left;
                }
            });
            Object.defineProperty(popover.options, 'arrowOffsetRight', {
                get: function() {
                    return 30 + $("#header > .header_right").position().left;
                }
            });

            var page = popover.addPage(GUI.translate("Welcome") + " " + Modules.Helper.capitalize(GUI.username));
            var section = page.addSection();

			
			/*add paste button*/
			var pasteButton = document.createElement("img");
			$(pasteButton).attr("src", "../../guis.common/images/paste_grey.png").attr("alt", "");
			$(pasteButton).attr("width", "24").attr("height", "24");
			$(pasteButton).attr("id", "paste_button");
			$(pasteButton).addClass("sidebar_button");
			$(pasteButton).attr("title", GUI.translate("Paste"));
			var btnPaste = section.addElement($(pasteButton).prop('outerHTML') + GUI.translate("Paste")); //add menu icon
			$(pasteButton).attr("src", "../../guis.common/images/paste.png").attr("alt", "");	
			numberOfIcons++;
			$("#header > .header_right").append(pasteButton); //add header icon
			var clickPaste = function() { //click handler
				Modules.ObjectManager.pasteObjects();
                popover.hide();
            };
  
			
			/*add undo button*/
			var undoButton = document.createElement("img");
			$(undoButton).attr("src", "../../guis.common/images/undo_grey.png").attr("alt", "");
			$(undoButton).attr("width", "24").attr("height", "24");
			$(undoButton).attr("id", "undo_button");
			$(undoButton).addClass("sidebar_button");
			$(undoButton).attr("title", GUI.translate("Undo"));
			var btnUndo = section.addElement($(undoButton).prop('outerHTML') + GUI.translate("Undo")); //add menu icon
			$(undoButton).attr("src", "../../guis.common/images/undo.png").attr("alt", "");	
			numberOfIcons++;
			$("#header > .header_right").append(undoButton); //add header icon
			var clickUndo = function() { //click handler
				Modules.Dispatcher.query("undo", {"userID": GUI.userid});
                popover.hide();
            };
			
			
            /*add coupling button*/
            if (Modules.Config.couplingMode) {
				var couplingButton = document.createElement("img");
				$(couplingButton).attr("src", "../../guis.common/images/coupling_grey.png").attr("alt", "");
				$(couplingButton).attr("width", "24").attr("height", "24");
				$(couplingButton).attr("id", "coupling_button");
				$(couplingButton).addClass("sidebar_button");
				$(couplingButton).attr("title", GUI.translate("Coupling"));
				var btnCoupling = section.addElement($(couplingButton).prop('outerHTML') + GUI.translate("Coupling")); //add menu icon
				$(couplingButton).attr("src", "../../guis.common/images/coupling.png").attr("alt", "");	
				numberOfIcons++;
				$("#header > .header_right").append(couplingButton); //add header icon
				var clickCoupling = function() { //click handler
					GUI.enterCouplingMode();
                    popover.hide();
				};
            }

			
            /*add parent button*/
			var parentButton = document.createElement("img");
			$(parentButton).attr("src", "../../guis.common/images/parent_grey.png").attr("alt", "");
			$(parentButton).attr("width", "24").attr("height", "24");
			$(parentButton).attr("id", "parent_button");
			$(parentButton).addClass("sidebar_button");
			$(parentButton).attr("title", GUI.translate("Environment"));
			var btnParent = section.addElement($(parentButton).prop('outerHTML') + GUI.translate("Environment")); //add menu icon
			$(parentButton).attr("src", "../../guis.common/images/parent.png").attr("alt", "");	
			numberOfIcons++;
			$("#header > .header_right").append(parentButton); //add header icon
			var clickParent = function() { //click handler
				Modules.ObjectManager.goParent();
                popover.hide();
			};
  

            /*add home button*/
			var homeButton = document.createElement("img");
			$(homeButton).attr("src", "../../guis.common/images/home_grey.png").attr("alt", "");
			$(homeButton).attr("width", "24").attr("height", "24");
			$(homeButton).attr("id", "home_button");
			$(homeButton).addClass("sidebar_button");
			$(homeButton).attr("title", GUI.translate("Home"));
			var btnHome = section.addElement($(homeButton).prop('outerHTML') + GUI.translate("Home")); //add menu icon
			$(homeButton).attr("src", "../../guis.common/images/home.png").attr("alt", "");	
			numberOfIcons++;
			$("#header > .header_right").append(homeButton); //add header icon
			var clickHome = function() { //click handler
				Modules.ObjectManager.goHome();
                popover.hide();
			};
			

            /*add paint button*/
			if (Modules.Config.paintMode) {
				var paintButton = document.createElement("img");
				$(paintButton).attr("src", "../../guis.common/images/paint_grey.png").attr("alt", "");
				$(paintButton).attr("width", "24").attr("height", "24");
				$(paintButton).attr("id", "paint_button");
				$(paintButton).addClass("sidebar_button");
				$(paintButton).attr("title", GUI.translate("Paint"));
				var btnPaint = section.addElement($(paintButton).prop('outerHTML') + GUI.translate("Paint")); //add menu icon
				$(paintButton).attr("src", "../../guis.common/images/paint.png").attr("alt", "");	
				numberOfIcons++;
				$("#header > .header_right").append(paintButton); //add header icon
				var clickPaint = function() { //click handler
					GUI.editPaint();
					popover.hide();
				};
			}
			

            /*add logout button*/
			var logoutButton = document.createElement("img");
			$(logoutButton).attr("src", "../../guis.common/images/log_out_grey.png").attr("alt", "");
			$(logoutButton).attr("width", "24").attr("height", "24");
			$(logoutButton).attr("id", "logout_button");
			$(logoutButton).addClass("sidebar_button");
			$(logoutButton).attr("title", GUI.translate("Logout"));
			var btnLogout = section.addElement($(logoutButton).prop('outerHTML') + GUI.translate("Logout")); //add menu icon
			$(logoutButton).attr("src", "../../guis.common/images/log_out.png").attr("alt", "");
			numberOfIcons++;
			$("#header > .header_right").append(logoutButton); //add header icon
            var clickLogout = function() { //click handler
                location.replace(location.origin);
                popover.hide();
				GUI.deleteUserData();
            };


            if (GUI.isTouchDevice) {
				//header:
				$(pasteButton).bind("touchstart", clickPaste);
				$(undoButton).bind("touchstart", clickUndo);
				if(Modules.Config.couplingMode) $(couplingButton).bind("touchstart", clickCoupling);
				$(parentButton).bind("touchstart", clickParent);
				$(homeButton).bind("touchstart", clickHome);
				if(Modules.Config.paintMode) $(paintButton).bind("touchstart", clickPaint);
				$(logoutButton).bind("touchstart", clickLogout);
				//menu:
				$(btnPaste.getDOM()).bind("touchstart", clickPaste);
				$(btnUndo.getDOM()).bind("touchstart", clickUndo);
				if(Modules.Config.couplingMode) $(btnCoupling.getDOM()).bind("touchstart", clickCoupling);
				$(btnParent.getDOM()).bind("touchstart", clickParent);
				$(btnHome.getDOM()).bind("touchstart", clickHome);
				if(Modules.Config.paintMode) $(btnPaint.getDOM()).bind("touchstart", clickPaint);
                $(btnLogout.getDOM()).bind("touchstart", clickLogout);
            } else {
				//header:
				$(pasteButton).bind("mousedown", clickPaste);
				$(undoButton).bind("mousedown", clickUndo);
				if(Modules.Config.couplingMode) $(couplingButton).bind("mousedown", clickCoupling);
				$(parentButton).bind("mousedown", clickParent);
				$(homeButton).bind("mousedown", clickHome);
				if(Modules.Config.paintMode) $(paintButton).bind("mousedown", clickPaint);
				$(logoutButton).bind("mousedown", clickLogout);
				//menu:
				$(btnPaste.getDOM()).bind("mousedown", clickPaste);
				$(btnUndo.getDOM()).bind("mousedown", clickUndo);
				if(Modules.Config.couplingMode) $(btnCoupling.getDOM()).bind("mousedown", clickCoupling);
				$(btnParent.getDOM()).bind("mousedown", clickParent);
				$(btnHome.getDOM()).bind("mousedown", clickHome);
				if(Modules.Config.paintMode) $(btnPaint.getDOM()).bind("mousedown", clickPaint);
                $(btnLogout.getDOM()).bind("mousedown", clickLogout);
            }
        }
    });


    /* add bug report toggle */
    if (!Modules.Config.presentationMode && Modules.config.bugReport) {
		var bugButton = document.createElement("img");
		$(bugButton).attr("src", "../../guis.common/images/bugreport.png").attr("alt", "");
		$(bugButton).attr("width", "24").attr("height", "24");

		$(bugButton).attr("id", "bug_button");
		$(bugButton).addClass("sidebar_button header_tab");

		$(bugButton).attr("title", GUI.translate("Bugreport"));

		$("#header > .header_tabs_sidebar").append(bugButton);

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
    if (!Modules.Config.presentationMode && Modules.config.chat) {
		var chatButton = document.createElement("img");
		$(chatButton).attr("src", "../../guis.common/images/chat.png").attr("alt", "");
		$(chatButton).attr("width", "24").attr("height", "24");

		$(chatButton).attr("id", "chat_button");
		$(chatButton).addClass("sidebar_button header_tab");

		$(chatButton).attr("title", GUI.translate("Chat"));

		$("#header > .header_tabs_sidebar").append(chatButton);

		var chatNotifier = document.createElement("span");
		$(chatNotifier).attr("id", "chat_notifier");
		$(chatNotifier).html("");

		$(chatNotifier).css("opacity", 0);

		var buttonPos = $(chatButton).position();

		$(chatNotifier).css("left", buttonPos.left).css("top", buttonPos.top);

		$("#header > .header_tabs_sidebar").append(chatNotifier);


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
        $(inspectorButton).addClass("sidebar_button header_tab");

        $(inspectorButton).attr("title", GUI.translate("Object inspector"));

        var click = function() {
            GUI.sidebar.openPage("inspector", inspectorButton);
        }

        if (GUI.isTouchDevice) {
            $(inspectorButton).bind("touchstart", click);
        } else {
            $(inspectorButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(inspectorButton);

        GUI.sidebar.openPage("inspector", inspectorButton);

        if (!Modules.Config.showSidebarbydefault) {
            GUI.sidebar.closeSidebar(false);
        }

    }

	
	/* add trashbasket toggle */
    if (!Modules.Config.presentationMode && Modules.config.trash) {
	
        var trashButton = document.createElement("img");
        $(trashButton).attr("src", "../../guis.common/images/trash.png").attr("alt", "");
        $(trashButton).attr("width", "24").attr("height", "24");

        $(trashButton).attr("id", "trash_button");
        $(trashButton).addClass("sidebar_button header_tab");

        $(trashButton).attr("title", GUI.translate("Trash basket"));

        var click = function() {
            GUI.sidebar.openPage("trashbasket", trashButton);
        }

        if (GUI.isTouchDevice) {
            $(trashButton).bind("touchstart", click);
        } else {
            $(trashButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(trashButton);

    }
	

	/* add cloud toggle */
    if (!Modules.Config.presentationMode && Modules.config.cloud) {

        var cloudButton = document.createElement("img");
        $(cloudButton).attr("src", "../../guis.common/images/cloud.png").attr("alt", "");
        $(cloudButton).attr("width", "24").attr("height", "24");

        $(cloudButton).attr("id", "cloud_button");
        $(cloudButton).addClass("sidebar_button header_tab");

        $(cloudButton).attr("title", GUI.translate("Cloud"));

        var click = function() {
            GUI.sidebar.openPage("cloud", cloudButton);
        }

        if (GUI.isTouchDevice) {
            $(cloudButton).bind("touchstart", click);
        } else {
            $(cloudButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(cloudButton);

    }
	
	/* add recent changes toggle */
    if (!Modules.Config.presentationMode && Modules.config.recentChanges) {

        var recentChangesButton = document.createElement("img");
        $(recentChangesButton).attr("src", "../../guis.common/images/clock.png").attr("alt", "");
        $(recentChangesButton).attr("width", "24").attr("height", "24");

        $(recentChangesButton).attr("id", "recentChanges_button");
        $(recentChangesButton).addClass("sidebar_button header_tab");

        $(recentChangesButton).attr("title", GUI.translate("Recent Changes"));

        var click = function() {
            GUI.sidebar.openPage("recentChanges", recentChangesButton);
        }

        if (GUI.isTouchDevice) {
            $(recentChangesButton).bind("touchstart", click);
        } else {
            $(recentChangesButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(recentChangesButton);

    }
	
    $("#header_toggle_sidebar_hide").on("click", function() {
        $(".jPopover").hide();
        GUI.sidebar.closeSidebar(true);
    });

    $("#header_toggle_sidebar_show").on("click", function() {
        $(".jPopover").hide();
        GUI.sidebar.openSidebar();
    });
	
}


/**
 * add a notification if a user entered or left the room or if an object was deleted or restored
 */
GUI.showNotification = function(add, icon){
	
	console.trace();
	console.log('showNotification '+add+' '+icon);
	
	var button = "";
	var IconEnter = "";
	var IconLeft = "";
	var TextEnter = "";
	var TextLeft = "";
	var title = "";
	if(icon == "chat"){
		if(GUI.sidebar.currentElement == "chat") return;
		button = "chat_button";
		IconEnter = "newUser.png";
		IconLeft = "lostUser.png";
		TextEnter = GUI.translate("A user entered this room");
		TextLeft = GUI.translate("A user left this room");
		title = GUI.translate("Chat");
	}
	if(icon == "trash"){
		if(GUI.sidebar.currentElement == "trash") return;
		button = "trash_button";
		IconEnter = "trashadd.png";
		IconLeft = "trashleft.png";
		TextEnter = GUI.translate("An object was deleted");
		TextLeft = GUI.translate("An object was restored");
		title = GUI.translate("Trash basket");
	}
	
	if(add){
		$("#"+button).attr("src", "../../guis.common/images/"+IconEnter).attr("alt", "");
		$("#"+button).attr("title", TextEnter);
	}
	else{
		$("#"+button).attr("src", "../../guis.common/images/"+IconLeft).attr("alt", "");
		$("#"+button).attr("title", TextLeft);
	}
	
	var counter = 0;
	function blink(){
		if(counter < 4){
			counter++;
			$("#"+button).delay(200).fadeTo(500,0).delay(200).fadeTo(500,1, blink);
		}
		else{
			$("#"+button).css("opacity", '');
			$("#"+button).attr("src", "../../guis.common/images/"+icon+".png").attr("alt", "");
			$("#"+button).attr("title", title);
			
		}
	}
	blink();
}


/**
 * decides which icons are shown in the toolbar, depending on the free space  
 */
GUI.resizeToolbar = function(){

	if(!GUI.paintModeActive && !GUI.couplingModeActive){

		var space = $(window).width();
		space = space - (numberOfIcons*44); //subtract icons

		if(space < -10){
			if(GUI.sidebar.open){
				GUI.sidebar.saveStateAndHide();
			}
			$("#header_toggle_sidebar_show").hide();
		}
		else{
			if(GUI.sidebar.open){
				$("#header_toggle_sidebar_hide").show();
				$("#header_toggle_sidebar_show").hide();
			}
			else{
				$("#header_toggle_sidebar_show").show();
				$("#header_toggle_sidebar_hide").hide();
			}
		}
		if((space < 270 && GUI.sidebar.open) || (space < 40 && !GUI.sidebar.open)){
			$("#header > .header_right > img").hide();
			$("#menu_button").show();
		}
		else{
			$("#header > .header_right > img").show();
			$("#menu_button").hide();
		}
	}
}