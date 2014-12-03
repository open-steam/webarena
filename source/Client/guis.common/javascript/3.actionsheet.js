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
 * show actionsheet at position x,y (opt.: bound to a webarena object)
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
    if(isWebarenaObject === undefined){
        isWebarenaObject = true;
    }


	if (Modules.Config.presentationMode) return;

	$(document).unbind("click.actionsheetHide");

	var offsetTop = 22;
	
	var actionsheet = $("#actionsheet");
	
	actionsheet.css("width", 1000);
	
	actionsheet.addClass("actionsheet");
	
	actionsheet.html('<div class="actionsheet_arrow"></div><div class="actionsheet_buttons"></div>'); //clear actionsheet

    if(isWebarenaObject){
        $.each(ObjectManager.getActionsForSelected(), function(key, action) {

            var newButton = document.createElement("div");
            if(isWebarenaObject){
                $(newButton).html(webarenaObject.translate('de', action));
            } else {

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
    } else {

        $.each(webarenaObject.actions, function(key, action) {
            var newButton = document.createElement("div");

            $(newButton).html(action.actionName );


            $(newButton).addClass("actionsheet_button");

            $(newButton).bind("click", function() {
                action.actionFunction()

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
    }
	
	
	/* calculate dimensions and show (little delay to ensure working width/height DOM getter methods) */
	window.setTimeout(function() {

		var actionsheetWidth = actionsheet.find(".actionsheet_buttons").outerWidth()+1; //+1 (little extra space for firefox ;-) )

		actionsheet.css("width", actionsheetWidth);
		
		/* set new position of actionsheet */

		var actionsheetHeight = actionsheet.outerHeight();

		var actionsheetLeft = x-actionsheetWidth/2;
		var actionsheetTop = y+offsetTop-actionsheetHeight;

		var arrowLeft = (actionsheetWidth/2)-15;

		if (actionsheetLeft < 5) {
			arrowLeft = arrowLeft+actionsheetLeft;
			actionsheetLeft = 5;
		}

		if (actionsheetTop < 5) {
			actionsheetTop = 5;
		}

		if (arrowLeft < 10) {
			arrowLeft = 10;
		}

		if ((arrowLeft+40) > actionsheetWidth) {
			arrowLeft = actionsheetWidth-40;
		}


		actionsheet.css("left", actionsheetLeft).css("top", actionsheetTop);

		actionsheet.find(".actionsheet_arrow").css("left", arrowLeft);
		
		actionsheet.css("opacity", 1);

        // automatically scroll to actionsheet if it is not visible in current scroll position
        if (!GUI.couplingModeActive) {
            var scrollTop = $(document).scrollTop();
            var scrollLeft = $(document).scrollLeft();
            if (actionsheetLeft + actionsheetWidth > scrollLeft + $(window).width()) {
                // actionsheet flows over right window border
                scrollLeft = actionsheetLeft - 10;
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
	
}