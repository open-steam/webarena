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

    async.forEachOfSeries(ObjectManager.getTypes(), function (object, key, callback) {
        if (object.isCreatable) {
            var resource = ('/ui/static/' + object.category + '/' + object.type).toLowerCase();

            Modules.ACLManager.isAllowed(resource, "create", function (err, result) {
                if(!err && result) {
                        if (object.category == undefined) {
                            object.category = "default";
                        }

                        if (types[object.category] == undefined) {
                            types[object.category] = [];
                        }

                        types[object.category].push(object);
                }

                callback();
            });
        } else {
            callback();
        }
    }, function (err) {
        if (err) console.error(err.message);

        initToolbarAux(types);
    })
}

/**
 * If a user enter or leave the room, a flashing icon is shown
 */
GUI.flashNewUserIcon = function(newUser){
	
	if(newUser){
		$("#new_user_icon").attr("src", "../../guis.common/images/newUser.png").attr("alt", "");
		$("#new_user_icon").attr("title", GUI.translate("A user entered this room"));
	}
	else{
		$("#new_user_icon").attr("src", "../../guis.common/images/lostUser.png").attr("alt", "");
		$("#new_user_icon").attr("title", GUI.translate("A user left this room"));
	}
	
	var flashes = 5;
	var counter = 0;
	function blink(){
		counter ++;
		if(counter <= flashes){
			$("#new_user_icon").delay(200).fadeTo(400,1).delay(200).fadeTo(400,0, blink);
		}
		else{
			$("#new_user_icon").attr("title", "");
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

function initToolbarAux(types) {
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
                            } else {
                                if(GUI.isTouchDevice){
                                    proto.create(attributes);
                                } else{
                                    if (object.type == 'Arrow' || object.type == 'Line'){
                                        GUI.setCursorText(GUI.translate("Choose " + object.type + "-Startpoint"));
                                    } else {
                                        $("body").css('cursor', 'url(../../guis.common/images/cursor/'+object.type+'.cur), auto');
                                    }
                                }
                            }
                        } else {
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
                        revert: true,
                        distance: 20,
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

    /* add menu button */
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

            /* add paste button */
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

            /* add undo button */
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

            /* add coupling button */
            if (Modules.Config.couplingMode) {
                Modules.ACLManager.isAllowed('/ui/static/tools/coupling', "create", function (err, result) {
                    if (!err && result) {
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

                        if (GUI.isTouchDevice) {
                            $(couplingButton).bind("touchstart", clickCoupling);
                            $(btnCoupling.getDOM()).bind("touchstart", clickCoupling);
                        } else {
                            $(btnCoupling.getDOM()).bind("mousedown", clickCoupling);
                            $(couplingButton).bind("mousedown", clickCoupling);
                        }
                    }
                })
            }

            /* add parent button */
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

            /* add home button */
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

            /* add paint button */
            if (Modules.Config.paintIcon) {
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

//            /* add logout button */
//            var logoutButton = document.createElement("img");
//            $(logoutButton).attr("src", "../../guis.common/images/log_out_grey.png").attr("alt", "");
//            $(logoutButton).attr("width", "24").attr("height", "24");
//            $(logoutButton).attr("id", "logout_button");
//            $(logoutButton).addClass("sidebar_button");
//            $(logoutButton).attr("title", GUI.translate("Logout"));
//            var btnLogout = section.addElement($(logoutButton).prop('outerHTML') + GUI.translate("Logout")); //add menu icon
//            $(logoutButton).attr("src", "../../guis.common/images/log_out.png").attr("alt", "");
//            numberOfIcons++;
//            $("#header > .header_right").append(logoutButton); //add header icon
//            var clickLogout = function() { //click handler
//               // Change 07.06.2015
//
//                // location.replace(location.origin);
//                location.pathname = "/logout";
//                popover.hide();
//                //GUI.deleteUserData();
//            };

            if (GUI.isTouchDevice) {
                // header:
                $(pasteButton).bind("touchstart", clickPaste);
                $(undoButton).bind("touchstart", clickUndo);

                $(parentButton).bind("touchstart", clickParent);
                $(homeButton).bind("touchstart", clickHome);

                if(Modules.Config.paintIcon) $(paintButton).bind("touchstart", clickPaint);

                // menu:
                $(btnPaste.getDOM()).bind("touchstart", clickPaste);
                $(btnUndo.getDOM()).bind("touchstart", clickUndo);

                $(btnParent.getDOM()).bind("touchstart", clickParent);
                $(btnHome.getDOM()).bind("touchstart", clickHome);

                if(Modules.Config.paintIcon) $(btnPaint.getDOM()).bind("touchstart", clickPaint);

//                $(logoutButton).bind("touchstart", clickLogout);
//                $(btnLogout.getDOM()).bind("touchstart", clickLogout);
            } else {
                // header:
                $(pasteButton).bind("mousedown", clickPaste);
                $(undoButton).bind("mousedown", clickUndo);

                $(parentButton).bind("mousedown", clickParent);
                $(homeButton).bind("mousedown", clickHome);

                if (Modules.Config.paintIcon) $(paintButton).bind("mousedown", clickPaint);

                // menu:
                $(btnPaste.getDOM()).bind("mousedown", clickPaste);
                $(btnUndo.getDOM()).bind("mousedown", clickUndo);

                $(btnParent.getDOM()).bind("mousedown", clickParent);
                $(btnHome.getDOM()).bind("mousedown", clickHome);

                if (Modules.Config.paintIcon) $(btnPaint.getDOM()).bind("mousedown", clickPaint);

//                $(logoutButton).bind("mousedown", clickLogout);
//                $(btnLogout.getDOM()).bind("mousedown", clickLogout);
            }
        }
    });

    /* add bug report toggle */
    if (!Modules.Config.presentationMode) {
        if (Modules.Config.bugreportIcon) {

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
    }

    /* add chat toggle */
    if (!Modules.Config.presentationMode) {
        if (Modules.Config.chatIcon) {
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

    /* add etherpad toggle */
    if (!Modules.Config.presentationMode && Modules.config.collaborativeEditor) {
        var padButton = document.createElement("img");
        $(padButton).attr("src", "../../guis.common/images/etherpad.png").attr("alt", "");
        $(padButton).attr("width", "24").attr("height", "24");

        $(padButton).attr("id", "pad_button");
        $(padButton).addClass("sidebar_button header_tab");

        $(padButton).attr("title", GUI.translate("Description"));

        var click = function() {
            GUI.sidebar.openPage("pad", padButton);
        }

        if (GUI.isTouchDevice) {
            $(padButton).bind("touchstart", click);
        } else {
            $(padButton).bind("mousedown", click);
        }

        $("#header > .header_tabs_sidebar").append(padButton);

        GUI.sidebar.openPage("pad", padButton);
    }

    $("#header_toggle_sidebar_hide").on("click", function() {
        $(".jPopover").hide();
        GUI.sidebar.closeSidebar(true);
    });

    $("#header_toggle_sidebar_show").on("click", function() {
        $(".jPopover").hide();
        GUI.sidebar.openSidebar();
    });

    /*add new user notification*/
    var newUserIcon = document.createElement("img");
    $(newUserIcon).attr("width", "24").attr("height", "24");
    $(newUserIcon).attr("id", "new_user_icon");
    $(newUserIcon).css("opacity", 0);
    $(newUserIcon).css("float", "right");
    $(newUserIcon).css("top", "4px");
    $(newUserIcon).css("cursor", "auto");

    $("#header > .header_tabs_sidebar").append(newUserIcon);
}