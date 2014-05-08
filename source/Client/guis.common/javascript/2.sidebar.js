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
        order : 0,
        title : GUI.translate("Object inspector"),
    },
    "chat" : {
        order : 1,
        title : GUI.translate("Chat"),
        onOpen : GUI.chat.opened
    },
    "bug" : {
        order : 2,
        title : GUI.translate("Bugreport"),
    },
    "pad" : {
        order : 3,
        title : GUI.translate("Description"),
    },
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
        GUI.sidebar.closeSidebar();
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
    GUI.sidebar.transformX($("#header>.header_right"), -230);

    GUI.sidebar.open = true;

}

/**
 * close the sidebar
 * @param {bool} noReset True if the current element should not be reset (used by GUI.sidebar.saveStateAndHide)
 */
GUI.sidebar.closeSidebar = function(noReset) {

    GUI.sidebar.transformX($("#sidebar"), 230);
    GUI.sidebar.transformX($("#header>.header_right"), 0);

    GUI.sidebar.open = false;

    if (noReset !== true) {
        GUI.sidebar.currentElement = undefined;
    }

    $(".sidebar_button").removeClass("active");

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
}