/**
 * @namespace Holding methods and variables for displaying a sidebar
 */
GUI.sidebar = {};

/**
 * True if the sidebar is shown
 */
GUI.sidebar.open = false;

/**
 * Currently shown element
 */
GUI.sidebar.currentElement = undefined;

/**
 * A saved state of the sidebar
 */
GUI.sidebar.savedState = undefined;

/**
 * Available sidebar pages
 */
GUI.sidebar.elementConfig = {
    "inspector" : {
        order : 0
		//onOpen : GUI.chat.closed
    },
    "chat" : {
        order : 1,
        onOpen : GUI.chat.opened
    },
    "bug" : {
        order : 2
		//onOpen : GUI.chat.closed
    },
    "pad" : {
        order : 3
		//onOpen : GUI.chat.closed
    },
	"trashbasket" : {
		order : 4,
		onOpen : GUI.trashbasket.opened
	}
};

/**
 * move (scroll) sidebar to x position
 * @param {DomElement} target The targets DOM element
 * @param {int} x The x position to move the sidebar to
 */
GUI.sidebar.transformX = function(target, x) {

    var trans = "translate3d("+x+"px,0,0)";

    target.css("-webkit-transform", trans);
    target.css("-moz-transform", trans);
    target.css("-o-transform", trans);
	target.css("-ms-transform", trans);
	target.css("transform", trans);

}

/**
 * open a sidebar page
 * @param {String} element The name of the page to open (see GUI.sidebar.elementConfig)
 * @param {DomElement} [button] The button which triggered the opening
 */
GUI.sidebar.openPage = function(element, button) {

    /* check if the given element name exists */
    if (GUI.sidebar.elementConfig[element] == undefined) {
        console.error("Open Sidebar: Unknown element ID");
        return;
    }

    /* check if the page is already open */
    if (GUI.sidebar.currentElement == element && GUI.sidebar.open) {
        //GUI.sidebar.closeSidebar();
        return;
    }

    /* set currently opened element/page */
    GUI.sidebar.currentElement = element;

    var left = GUI.sidebar.elementConfig[element]['order']*$("#sidebar").width()*(-1);

    /* check if sidebar is shown */
    if (!GUI.sidebar.open) {
        /* disable page flip animation and open sidebar (prevent multiple animations at once) */

        //disable animation for the next 500ms
        $("#sidebar_content>div").removeClass("animate");

        window.setTimeout(function() {
            $("#sidebar_content>div").addClass("animate");
        }, 500);

        GUI.sidebar.openSidebar();

    }

    GUI.sidebar.transformX($("#sidebar_content").children("div"), left);

    $("#sidebar_title").children("span").html(GUI.sidebar.elementConfig[element]['title']);

    $(".sidebar_button").removeClass("active");

    if (GUI.sidebar.elementConfig[element]['onOpen'] !== undefined) {
        GUI.sidebar.elementConfig[element]['onOpen']();
    }


    if (button !== undefined) {
        GUI.sidebar.elementConfig[element]['button'] = button;
    }

    if (GUI.sidebar.elementConfig[element]['button'] !== undefined) {
        $(GUI.sidebar.elementConfig[element]['button']).addClass("active");
    }

    $("#sidebar_content").scrollTop(0);

}


/**
 * open the sidebar using animation
 */
GUI.sidebar.openSidebar = function() {

    GUI.sidebar.transformX($("#sidebar"), 0);
    GUI.sidebar.transformX($("#header>.header_right"), -250);
	GUI.sidebar.transformX($("#header>.header_tabs_sidebar"), 0);
	
	$("#"+GUI.sidebar.currentElement+"_button").addClass("active");
	
    GUI.sidebar.open = true;

	GUI.resizeToolbar();
	
}

/**
 * close the sidebar
 * @param {bool} noReset True if the current element should not be reset (used by GUI.sidebar.saveStateAndHide)
 */
GUI.sidebar.closeSidebar = function(noReset) {

    GUI.sidebar.transformX($("#sidebar"), 230);
    GUI.sidebar.transformX($("#header>.header_right"), -20);
	GUI.sidebar.transformX($("#header>.header_tabs_sidebar"), 230);

    GUI.sidebar.open = false;

	GUI.resizeToolbar();
	
    if (noReset !== true) {
        GUI.sidebar.currentElement = undefined;
    }

    $(".sidebar_button").removeClass("active");
	
	$("#header_toggle_sidebar_hide").hide();
	$("#header_toggle_sidebar_show").show();

}


/**
 * saves the current sidebar state and hides it
 */
GUI.sidebar.saveStateAndHide = function() {

    GUI.sidebar.savedState = {
        "open" : GUI.sidebar.open,
        "currentElement" : GUI.sidebar.currentElement
    };

    GUI.sidebar.closeSidebar(true);

}

/**
 * restores the sidebar from the saved state and shows it
 */
GUI.sidebar.restoreFromSavedState = function() {

    if (GUI.sidebar.savedState.open) {

        GUI.sidebar.openSidebar();

        if (GUI.sidebar.elementConfig[GUI.sidebar.savedState.currentElement]['button'] !== undefined) {
            $(GUI.sidebar.elementConfig[GUI.sidebar.savedState.currentElement]['button']).addClass("active");
        }

    }

}

/**
 * init. the sidebar
 */
GUI.sidebar.init = function() {
    $("#sidebar_content>div").addClass("animate");
    $("#sidebar_content").dontScrollParent();
	
	GUI.sidebar.elementConfig.inspector.title = GUI.translate("Object inspector");
	GUI.sidebar.elementConfig.chat.title = GUI.translate("Chat");
    GUI.sidebar.elementConfig.bug.title = GUI.translate("Bugreport");
	GUI.sidebar.elementConfig.pad.title = GUI.translate("Annotations");
	GUI.sidebar.elementConfig.trashbasket.title = GUI.translate("Trash basket");

	$("#header_toggle_sidebar_hide").attr('title', GUI.translate('Hide sidebar'));
	$("#header_toggle_sidebar_show").attr('title', GUI.translate('Show sidebar'));
	
}