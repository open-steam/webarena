"use strict";

/* SETTINGS */
var popover_positionOffsetX = 8;
var popover_positionOffsetY = 20;

var numberOfIcons = 0;
GUI.writePermission = false;

GUI.initToolbar = function (){
	var rightCheckFunction = function(){
		ObjectManager.getCurrentRoom().serverCall("writePermission",function(result){
			console.log(result);
			GUI.writePermission=result;
			GUI.buildToolbar();
		});
	}; 
	
	rightCheckFunction();
	console.log(GUI.writePermission);
}
/**
 * Init. the toolbar
 */
GUI.buildToolbar = function() {

	$(window).resize(function() {		
		GUI.resizeToolbar();
	});

    /* insert icons for creating new objects: */

    var types = {};
	
	
    /* get types of objects */
    $.each(ObjectManager.getTypes(), function(key, object) {

        if (object.isCreatable && GUI.writePermission) {

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
										$("body").css('cursor', 'url(/objectIcons/'+object.type+'), auto');
										GUI.creatingObject=object.type;
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
			if(GUI.writePermission){
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
			}
			
  
			
			/*add undo button*/
		if(GUI.writePermission){
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

            /*add bugReport button*/
			var bugButton = document.createElement("img");
			$(bugButton).attr("src", "../../guis.common/images/bugreport.png").attr("alt", "");
			$(bugButton).attr("width", "24").attr("height", "24");
			$(bugButton).attr("id", "bug_button");
			$(bugButton).addClass("sidebar_button");
			$(bugButton).attr("title", GUI.translate("Bugreport"));
			$(bugButton).addClass("sidebar_button");
			$(bugButton).attr("title", GUI.translate("Bugreport"));
			var btnBug = section.addElement($(bugButton).prop('outerHTML') + "Feedback"); //add menu icon
			$(bugButton).attr("src", "../../guis.common/images/bugreport.png").attr("alt", "");
			numberOfIcons++;
			$("#header > .header_right").append(bugButton); //add header icon
			var that = this;
            var clickBug = function(feedbackDialogfeedbackDialog) { //click handler
							
    			var html;
				var dialog_width =690;
				var content = [];

				html = '<div id="bug"><div>Ist Ihnen bei der Benutzung ein Fehler aufgefallen? Teilen Sie uns ihn doch bitte mit.<br />Bitte haben Sie Verständnis dafür, dass wir nicht auf jede Anfrage persönlich antworten können.<span><br /><br />Beachten Sie: Mit Ihrer Fehlermeldung wird eine Liste aller Objekte gesendet, um uns eine Auswertung des Fehlers zu ermöglichen.</span></div><div id="bug_report"><span>Was wollten Sie tun?</span><textarea id="dialog_bug_task"></textarea><span>Welches Problem ist aufgetreten?</span><textarea id="dialog_bug_problem"></textarea><span>Ihre Email-Adresse:</span><input type="email" id="dialog_bug_email" /><p></p></div><div id="bug_result"></div></div>';

				content.push(html);
				
				var dialog_buttons = {};
				dialog_buttons[GUI.translate("Send")] = function() {

					var task = $("#dialog_bug_task").val();
					var problem = $("#dialog_bug_problem").val();
					var email = $("#dialog_bug_email").val();

					var objectsString = "";
					var objects = ObjectManager.getObjects();
					for (var i in objects) {
						var object = objects[i];

						objectsString += "\n"+i+":\n--------------------\n";

						var data=object.get();
						for (var name in data) {
							objectsString += name+": "+data[name]+"\n";
						}
					}

					ObjectManager.reportBug({
						"task" : task,
						"problem" : problem,
						"user" : GUI.username,
						"email" : email,
						"objects" : objectsString,
						"userAgent" : navigator.userAgent
					}, function(result) {
						
						var content = [];
						var html;
						
						if (result === true) {
							html='<p class="bug_success">Vielen Dank für Ihren Fehlerbericht.<br />Unsere Entwickler wurden informiert und werden sich schnellst möglich um das Problem kümmern.</p>';
						} else {
							html='<p class="bug_error">Leider konnte der Fehlerbericht nicht gesendet werden. Bitte versuchen Sie es später noch einmal.</p>';
						}
						content.push(html);
						
						var feedbackDialog = GUI.dialog(
							"Feedback",
							content,
							null,
							dialog_width
							);
					});
				};
				dialog_buttons[GUI.translate("Close")] = function() {
					return false;
				};

				var feedbackDialog = GUI.dialog(
							"Feedback",
							content,
							dialog_buttons,
							dialog_width
							);
				
            };
			
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
				if(GUI.writePermission){
					$(pasteButton).bind("touchstart", clickPaste);
					$(undoButton).bind("touchstart", clickUndo);
				}
				$(parentButton).bind("touchstart", clickParent);
				$(homeButton).bind("touchstart", clickHome);
				$(bugButton).bind("touchstart", clickBug);
				$(logoutButton).bind("touchstart", clickLogout);
				//menu:
				$(btnPaste.getDOM()).bind("touchstart", clickPaste);
				$(btnUndo.getDOM()).bind("touchstart", clickUndo);
				$(btnParent.getDOM()).bind("touchstart", clickParent);
				$(btnHome.getDOM()).bind("touchstart", clickHome);
                $(btnLogout.getDOM()).bind("touchstart", clickLogout);
            } else {
				//header:
				if(GUI.writePermission){
					$(pasteButton).bind("mousedown", clickPaste);
					$(undoButton).bind("mousedown", clickUndo);
				}
				$(parentButton).bind("mousedown", clickParent);
				$(homeButton).bind("mousedown", clickHome);
				$(bugButton).bind("mousedown", clickBug);
				$(logoutButton).bind("mousedown", clickLogout);
				//menu:
				if(GUI.writePermission){
					$(btnPaste.getDOM()).bind("mousedown", clickPaste);
					$(btnUndo.getDOM()).bind("mousedown", clickUndo);
				}
				$(btnParent.getDOM()).bind("mousedown", clickParent);
				$(btnHome.getDOM()).bind("mousedown", clickHome);
                $(btnLogout.getDOM()).bind("mousedown", clickLogout);
            }
        }
    });


    /* add bug report toggle */
/*    if (!Modules.Config.presentationMode && Modules.config.bugReport) {
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
    }*/


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
    if (!Modules.Config.presentationMode && Modules.config.trash && GUI.writePermission) {
	
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
	
	/* add ObjectList toggle */
    if (!Modules.Config.presentationMode && Modules.config.objectlist) {
	
        var objectlistButton = document.createElement("img");
        $(objectlistButton).attr("src", "../../guis.common/images/objectlist.png").attr("alt", "");
        $(objectlistButton).attr("width", "24").attr("height", "24");

        $(objectlistButton).attr("id", "trash_button");
        $(objectlistButton).addClass("sidebar_button header_tab");

        $(objectlistButton).attr("title", GUI.translate("ObjectList"));

        var click = function() {
            GUI.sidebar.openPage("objectList", objectlistButton);
        }

        if (GUI.isTouchDevice) {
            $(objectlistButton).bind("touchstart", click);
        } else {
            $(objectlistButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(objectlistButton);

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
	/*
	if(add){
		$("#"+button).attr("src", "../../guis.common/images/"+IconEnter).attr("alt", "");
		$("#"+button).attr("title", TextEnter);
	}
	else{
		$("#"+button).attr("src", "../../guis.common/images/"+IconLeft).attr("alt", "");
		$("#"+button).attr("title", TextLeft);
	}
    */
    
	var counter = 0;
}


/**
 * decides which icons are shown in the toolbar, depending on the free space  
 */
GUI.resizeToolbar = function(){

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