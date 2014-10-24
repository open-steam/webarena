/**
 *    Webarena Touch Support
 *    @author Dominik Roß, University of Paderborn, 2014
 *
 */
 
"use strict";

/**
 * variable to check if client is a touch device (to add suitable event handlers)
 */
GUI.isTouchDevice = false;

/**
 * variable to check if client support ms-pointer api
 */
GUI.isPointerDevice = false;

/**
 * @namespace holds methods and variables for touch support
 */
GUI.touch = Object.create(Object);

/**
 * variable to check if touch support is active
 */
GUI.touch.active = false;

/**
 * variable to check if someone is touching ;-)
 */
GUI.touch.ing = false;

/**
 * inits touch support
 */
GUI.touch.init = function() {
	if (GUI.isTouchDevice) {
		GUI.touch.active = true;
		
		$("#content>svg").get(0).addEventListener("touchstart", GUI.touch.handler, false);
		
		//TODO listen to touch (and pointer events) divide by sessions
		
		(function loop(){
			//window.requestAnimationFrame(loop);
			
			//TODO render();
		})();
	}
}

/**
 * @private variable to store touches
 */
GUI.touch.es = [];

/**
 * @private variable to store sessions
 */
GUI.touch.sessions = [];
GUI.touch.sessionsPointer = [];

/**
 * @private variable for timer
 */
GUI.touch.timer = false;

/**
 * @private function to block mouse events for 700ms because
 * 1 - mobile browsers dispatch mouse events 300ms after touchend
 * 2 - chrome for android dispatch mousedown for long-touch about 650ms
 */
GUI.touch.setTouchTimer = function() {
     GUI.touch.ing = true;
	
     clearTimeout(GUI.touch.timer);
	
     GUI.touch.timer = setTimeout(function () {
          GUI.touch.ing = false;
	}, 700);
}

/**
 * class for touch sessions
 */
function TouchSession() {
	//TODO
}

/**
 * class for pointer sessions
 */
function PointerSession() {
	//TODO
}

/*
 * polyfill for requestAnimationFrame 
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/******************************************************************************************
 * TODO delete
 * old touch handler for object selection
 */
GUI.touch.handler = function(event) {
	GUI.touch.setTouchTimer();
	
	jPopoverManager.hideAll();
	
	var contentPosition = $("#content").offset();

	var x = event.pageX-contentPosition.left;
	var y = event.pageY-contentPosition.top;
	
	if (event.touches.length >= 1) {
		var x = event.touches[event.touches.length-1].pageX-contentPosition.left;
		var y = event.touches[event.touches.length-1].pageY-contentPosition.top;
	}
	
	/* find objects at this position */
	var clickedObject = GUI.getObjectAt(x, y);

	if (clickedObject && event.target != $("#content>svg").get(0)) {
		event.preventDefault();
		event.stopPropagation();
		clickedObject.click(event);
	} else {
		GUI.deselectAllObjects();
		GUI.updateInspector();
	}
}