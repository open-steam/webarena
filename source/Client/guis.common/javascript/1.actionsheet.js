"use strict";

/**
 * actionsheets are horizontal context menus
 */

/**
 * hide currently visible actionsheet
 */
GUI.hideActionsheet = function() {
	$("#actionsheet").hide();

	$(document).unbind("click.actionsheetHide");
}

/**
 * Show actionsheet at position x,y (opt.: bound to a webarena object)
 *
 * @param {int} x initial x position
 * @param {int} y initial y position
 * @param {webarenaObject} webarenaObject webarena object to bind actionsheet to
 * @param {bool} isWebarenaObject ?
 */
GUI.showActionsheet = function(x, y, webarenaObject, isWebarenaObject) {
    //{
    //actions : [
    // {"actionName": "ex1", "actionFunction" : fnc},
    // {"actionName": "ex2", "actionFunction" : fnc}
    //]
    //}
    if (isWebarenaObject === undefined) {
        isWebarenaObject = true;
    }

	if (Modules.Config.presentationMode) return;

	$(document).unbind("click.actionsheetHide");

	// correct the values because of toolbar
	var offsetTop = 13;
	var offsetLeft = 21;
	
	var actionsheet = $("#actionsheet");
	actionsheet.css("width", 1000);
	actionsheet.addClass("actionsheet");
	actionsheet.html('<div class="actionsheet_triangle"></div><div class="actionsheet_buttons"></div>'); //clear actionsheet

    //if (isWebarenaObject) {

    var actionsCollection = new Array();

    async.forEachOfSeries(ObjectManager.getActionsForSelected(), function (action, key, callback) {
        if (_.contains(Modules.ACLManager.notForEveryOne, action)) {
            var resource = Modules.ACLManager.makeACLName(webarenaObject.id);

            Modules.ACLManager.isAllowed(resource, action.toLowerCase(), function (err, result) {
                if (!err && result) {
                    if (action == 'object.decoupling.action') {
                        Modules.ACLManager.whatRolesAllowed(resource, 'couple', function(roles) {
                            if (roles.length > 0) {
                                actionsCollection.push(action);
                            }

                            callback(null);
                        });
                    } else {
                        actionsCollection.push(action);
                        callback(null);
                    }
                } else {
                    callback(err);
                }
            });
        } else {
            actionsCollection.push(action);
            callback(null);
        }
    }, function (err) {

        $.each(actionsCollection, function(key, action) {
            var newButton = document.createElement("div");

            if (isWebarenaObject) {
                var text = webarenaObject.translate(GUI.currentLanguage, action);
                $(newButton).html(text);
            }

            $(newButton).addClass("actionsheet_button");

            $(newButton).bind("click", function() {
                ObjectManager.performActionForSelected(action, webarenaObject);
                actionsheet.hide();
            });

            /* effects: */
            newButton.addEventListener("touchstart", function() {
                $(newButton).addClass("actionsheet_button_hover");
            }, false);

            newButton.addEventListener("touchend", function() {
                $(newButton).removeClass("actionsheet_button_hover");
            }, false);

            $(newButton).bind("mousedown", function() {
                $(newButton).addClass("actionsheet_button_hover");
            });

            $(newButton).bind("mouseup", function() {
                $(newButton).removeClass("actionsheet_button_hover");
            });

            actionsheet.find(".actionsheet_buttons").append(newButton);
        });

        /* calculate dimensions and show (little delay to ensure working width/height DOM getter methods) */
        window.setTimeout(function() {
            var actionsheetWidth = actionsheet.find(".actionsheet_buttons").outerWidth() + 1; //+1 (little extra space for firefox ;-) )

            actionsheet.css("width", actionsheetWidth);

            /* set new position of actionsheet */

            var actionsheetHeight = actionsheet.outerHeight();

            var actionsheetLeft = x + offsetLeft;
            var actionsheetTop = y + offsetTop;

            if (actionsheetLeft < 5) {
                actionsheetLeft = 5;
            }

            if (actionsheetTop < 5) {
                actionsheetTop = 5;
            }

            actionsheet.css("left", actionsheetLeft).css("top", actionsheetTop);
            actionsheet.css("opacity", 1);

            // automatically scroll to actionsheet if it is not visible in current scroll position
            if (!GUI.couplingModeActive) {
                var scrollTop = $(document).scrollTop();
                var scrollLeft = $(document).scrollLeft();

                if (actionsheetLeft + actionsheetWidth > scrollLeft + $(window).width()) {
                    // actionsheet flows over right window border
                    scrollLeft = actionsheetLeft - 10;
                }

                if (actionsheetTop + actionsheetHeight > scrollTop + $(window).height()) {
                    // actionsheet flows over bottom window border
                    scrollTop = actionsheetTop - 300;
                }

                if (scrollTop > actionsheetTop) {
                    // actionsheet y coordinate not inside viewing pane
                    scrollTop = actionsheetTop - 40;
                }

                if (scrollLeft > actionsheetLeft) {
                    // actionsheet x coordinate not inside viewing pane
                    scrollLeft = actionsheetLeft - 10;
                }

                $(document).scrollTo( {top: scrollTop, left: scrollLeft}, 800 );
            }

        }, 10);

        actionsheet.css("opacity", 0);
        actionsheet.show();

        /* little trick (the handler was called immediately by the current click which causes the actionsheet to show up) */
        window.setTimeout(function() {

            $(document).bind("click.actionsheetHide", function() {
                GUI.hideActionsheet();
            });

        }, 300);
    });
}
