/**
 *    Webarena Mouse, Touch and Pen Support
 *    @author Dominik Roﬂ, University of Paderborn, 2014
 *
 */

/**
 * variable to check if client is a touch device (to add suitable event handlers)
 */
GUI.isTouchDevice = false;

/**
 * variable to check if client support ms-pointer api
 */
GUI.isPointerDevice = false;

/**
 * variable to check if client is a mobile device
 */
GUI.isMobileDevice = false;

/**
 * @namespace holds methods and variables for mouse, touch and pen support
 */
GUI.input = {

	/**
	 * constants
	 */
	TYPE_TOUCH: "touch",
	TYPE_PEN: "pen",
	TYPE_MOUSE: "mouse",
	
	STATE_START: 1,
	STATE_MOVE: 2,
	STATE_END: 3,
	
	WAIT_TIME: 100,

	/**
	 * inits event handlers and so on
	 */
	init: function() {
	
		//check device functions
		GUI.isTouchDevice = ('ontouchstart' in window);
		GUI.isPointerDevice = ('PointerEvent' in window) || ('MSPointerEvent' in window);
		GUI.isMobileDevice = /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent);
		
		//check if mutlitouch is possible
		if(window.navigator.maxTouchPoints <= 1 && GUI.input.touch.multi)
			GUI.input.touch.multi = false;
		
		//init event handlers
		if(GUI.isPointerDevice) {
			GUI.input.touch.simulatePen = false;
			
			//pointer switcher
			var pointerhandler = function(event) {
				var type = event.pointerType;
				
				if(window.MSPointerEvent) {
					switch(event.pointerType) {
					case 2:
						type = GUI.input.TYPE_TOUCH;
					break;
					case 3:
						type = GUI.input.TYPE_PEN;
					break;
					case 4:
						type = GUI.input.TYPE_MOUSE;
					break;
					}
				}
				
				if(type == GUI.input.TYPE_TOUCH) {
					event.preventDefault();
					event.stopPropagation();
					GUI.input.touch.singleTouchHandler(event.pointerId, event.type.toLowerCase(), event.target, event.clientX, event.clientY, event.width, event.height, 0);
				}
				else if(type == GUI.input.TYPE_PEN)
					GUI.input.pen.handler(event);
				else if(type == GUI.input.TYPE_MOUSE)
					GUI.input.mouse.handler(event);
			}
			
			//IE10 - pointer
			if(window.MSPointerEvent) {
				$("#content").get(0).addEventListener("MSPointerDown", pointerhandler, false);
				$("#content").get(0).addEventListener("MSPointerMove", pointerhandler, false);
				$("#content").get(0).addEventListener("MSPointerUp", pointerhandler, false);
				$("#content").get(0).addEventListener("MSPointerCancel", pointerhandler, false);
				$("#content").get(0).addEventListener("MSPointerLeave", pointerhandler, false);
			}
			//pointer
			else {
				$("#content").get(0).addEventListener("pointerdown", pointerhandler, false);
				$("#content").get(0).addEventListener("pointermove", pointerhandler, false);
				$("#content").get(0).addEventListener("pointerup", pointerhandler, false);
				$("#content").get(0).addEventListener("pointercancel", pointerhandler, false);
				$("#content").get(0).addEventListener("pointerleave", pointerhandler, false);
			}
		}
		else if(GUI.isTouchDevice && GUI.isMobileDevice) {
			//touch
			$("#content").get(0).addEventListener("touchstart", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchmove", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchend", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchcancel", GUI.input.touch.handler, false);
		}
		else if(!GUI.isTouchDevice) {
			//mouse
			$("#content").get(0).addEventListener("mousedown", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mousemove", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mouseleave", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mouseup", GUI.input.mouse.handler, false);
		}
		else {
			//touch
			$("#content").get(0).addEventListener("touchstart", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchmove", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchend", GUI.input.touch.handler, false);
			$("#content").get(0).addEventListener("touchcancel", GUI.input.touch.handler, false);
			
			//mouse
			$("#content").get(0).addEventListener("mousedown", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mousemove", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mouseleave", GUI.input.mouse.handler, false);
			$("#content").get(0).addEventListener("mouseup", GUI.input.mouse.handler, false);
		}
		
		//animation loop 60 frames per second
		//see 0.functions.js polyfill for requestAnimationFrame
		(function loop() {
			window.requestAnimationFrame(loop);
			GUI.input.render();
		})();
	},
	
	/**
	 * render session frame
	 */
	render: function() {
		if(!$.isEmptyObject(GUI.input.mouse.session))
			GUI.input.mouse.session.render();
		
		if(!$.isEmptyObject(GUI.input.pen.session))
			GUI.input.pen.session.render();
		
		if(GUI.input.touch.multi) {
			//TODO multi touch
		}
		else {
			$.each(GUI.input.touch.sessions, function(id, session) {
				session.render();
			});
		}
	},
	
	/**
	 * @private variable for event handlers
	 */
	handlers: {},
	
	/**
	 * bind one or more events (start, move, end)
	 * @param {string} events
	 * @param {function} handler
	 */
	bind: function(events, handler) {
		var handlers = GUI.input.handlers;
		$.each(events.trim().split(/\s+/g), function(i, event) {
			handlers[event] = handlers[event] || [];
			handlers[event].push(handler);
		});
	},
	
	/**
	 * unbind one or more events (start, move, end)
	 * @param {string} events
	 * @param {function} [handler]
	 */
	unbind: function(events, handler) {
		var handlers = GUI.input.handlers;
		$.each(events.trim().split(/\s+/g), function(event) {
			if(!handler) delete handlers[event];
			else handlers[event].splice($.inArray(handlers[event], handler), 1);
		});
	},
	
	/**
	 * trigger event (start, move, end)
	 * @param {string} event
	 * @param {session} session
	 */
	trigger: function(event, session) {
		if(session instanceof GUI.input.Session) {
			var handlers = GUI.input.handlers[event] && GUI.input.handlers[event].slice();
			if(!handlers || !handlers.length) return;
			
			for(var i=0, len=handlers.length; i<len; i++)
				handlers[i](session);
		}
	},
	
	/**
	 * @namespace holds methods and variables for mouse support
	 */
	mouse: {
		
		/**
		 * variable to enable/disable gesture recognition
		 */
		recognize: false,
	
		/**
		 * @private variable for current session
		 */
		session: null,
		
		/**
		 * @private event handler for mouse events
		 */
		handler: function(event) {
			if(!GUI.input.touch.ing) {
				//Firefox pen detection
				if(!GUI.isPointerDevice
				&& $.isNumeric(event["mozInputSource"])
				&& event["mozInputSource"] == event["MOZ_SOURCE_PEN"]) {
					GUI.input.pen.handler(event);
					return;
				}
				
				var type, data, posx = 0, posy = 0;
				
				//ensure we have an event object
				if (!event) var event = window.event;
				
				//get event type
				type = event.type.toLowerCase();
				
				//get mouse position relative to layout
				if (event.pageX || event.pageY) 	{
					posx = event.pageX;
					posy = event.pageY;
				}
				else if (event.clientX || event.clientY) 	{
					posx = event.clientX + document.body.scrollLeft
						+ document.documentElement.scrollLeft;
					posy = event.clientY + document.body.scrollTop
						+ document.documentElement.scrollTop;
				}
				
				var data = {
					x: posx,
					y: posy
				};
				
				if(type.indexOf("down") != -1) {
					var leftclick = false;
					
					if (event.which) leftclick = (event.which == 1);
					else if (event.button) leftclick = (event.button == 0);
					
					if(leftclick) {
						event.preventDefault();
						event.stopPropagation();
						
						//get mouse target
						var targ = null;
						if (event.target) targ = event.target;
						else if (event.srcElement) targ = event.srcElement;
						if (targ.nodeType == 3) // defeat Safari bug
							targ = targ.parentNode;
							
						var node = targ, parent = document.getElementById("content");
						while (node) {
							if (node == parent) {
								GUI.input.mouse.session = new GUI.input.Session(GUI.input.TYPE_MOUSE, targ, data, GUI.input.mouse.recognize);
								break;
							}
							
							node = node.parentNode;
						}
					}
				}
				else if(!$.isEmptyObject(GUI.input.mouse.session)) {
					event.preventDefault();
					event.stopPropagation();
					
					if(type.indexOf("up") != -1
					|| type.indexOf("cancel") != -1
					|| type.indexOf("leave") != -1)
						GUI.input.mouse.session.finalize();
					else GUI.input.mouse.session.push(data);
				}
			}
		}
	},
	
	/**
	 * @namespace holds methods and variables for touch support
	 */
	touch: {
	
		/**
		 * constants
		 */
		MAX_RADIUS: 512,
		ADD_RADIUS: 10,
		
		/**
		 * variable to check if someone is touching ;-)
		 */
		ing: false,
		
		/**
		 * variable to enable/disable multitouch
		 */
		multi: false,
		
		/**
		 * variable to enable/disable gesture recognition
		 */
		recognize: false,
		
		/**
		 * variable to enable/disable pen simulation
		 */
		simulatePen: false,
		
		/**
		 * @private variable for sessions
		 */
		sessions: {},
		
		/**
		 * @private event handler for touch events
		 */
		handler: function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			GUI.input.touch.startTouchTimer();
			
			var touches = [], parent = document.getElementById("content");
			$.each($.makeArray(event.changedTouches), function(id, touch) {
				var node = touch.target;
				
				while (node) {
					if (node == parent) {
						touches.push(touch);
						break;
					}
					
					node = node.parentNode;
				}
			});
			
			for(var i = 0, len = touches.length; i < len; i++) {
				if(GUI.input.touch.simulatePen) {
					// TODO simulate Pen
				}
				
				GUI.input.touch.singleTouchHandler(touches[i].identifier, event.type.toLowerCase(), touches[i].target, touches[i].pageX, touches[i].pageY, touches[i].radiusX, touches[i].radiusY, touches[i].rotationAngle);
			}
		},
		
		/**
		 * @private event handler for a single touch
		 */
		singleTouchHandler: function(id, type, targ, posx, posy, radiusx, radiusy, rotationAngle) {
			var data = {
				x: posx,
				y: posy,
				width: radiusx,
				height: radiusy,
				angle: rotationAngle
			};
			
			if(GUI.input.touch.multi) {
				//TODO multi touch
			}
			else {
				if(type.indexOf("down") != -1
				|| type.indexOf("start") != -1)
					GUI.input.touch.sessions[id] = new GUI.input.Session(GUI.input.TYPE_TOUCH, targ, data, GUI.input.touch.recognize, id);
				else if(!$.isEmptyObject(GUI.input.touch.sessions[id])) {
					GUI.input.touch.sessions[id].push(data);
				
					if(type.indexOf("up") != -1
					|| type.indexOf("end") != -1
					|| type.indexOf("cancel") != -1
					|| type.indexOf("leave") != -1)
						GUI.input.touch.sessions[id].finalize();
				}
			}
		},
		
		/**
		 * @private variable for timer
		 */
		timer: null,

		/**
		 * @private function to block mouse events for 700ms because
		 * 1. mobile browsers dispatch mouse events 300ms after touchend
		 * 2. chrome for android dispatch mousedown for long-touch about 650ms
		 */
		startTouchTimer: function() {
			GUI.input.touch.ing = true;
			
			clearTimeout(GUI.input.touch.timer);
			
			GUI.input.touch.timer = setTimeout(function () {
				GUI.input.touch.ing = false;
			}, 700);
		}
	},
	
	/**
	 * @namespace holds methods and variables for pen support
	 */
	pen: {
		
		/**
		 * variable to enable/disable gesture recognition
		 */
		recognize: false,
	
		/**
		 * @private variable for current session
		 */
		session: null,
		
		/**
		 * @private event handler for pen events
		 */
		handler: function(event) {
			var type, data, posx = 0, posy = 0;
			
			//get event type
			type = event.type.toLowerCase();
			
			var data = {
				x: event.pageX,
				y: event.pageY
			};
			
			if(type.indexOf("down") != -1) {
				event.preventDefault();
				event.stopPropagation();
				
				//get pen target
				var targ = null;
				if (event.target) targ = event.target;
				else if (event.srcElement) targ = event.srcElement;
				if (targ.nodeType == 3) // defeat Safari bug
					targ = targ.parentNode;
				
				var node = targ, parent = document.getElementById("content");
				while (node) {
					if (node == parent) {
						GUI.input.pen.session = new GUI.input.Session(GUI.input.TYPE_PEN, targ, data, GUI.input.pen.recognize, (!$.isEmptyObject(event.pointerId))? event.pointerId : 0);
						break;
					}
					
					node = node.parentNode;
				}
			}
			else if(!$.isEmptyObject(GUI.input.pen.session)) {
				event.preventDefault();
				event.stopPropagation();
				
				GUI.input.pen.session.push(data);
			
				if(type.indexOf("up") != -1
				|| type.indexOf("cancel") != -1
				|| type.indexOf("leave") != -1)
					GUI.input.pen.session.finalize();
			}
		}
	}
};
	
/**
 * class for single session
 * @param {GUI.input.STATE_* constant} type
 * @param {DOMElement} target
 * @param {Object} data
 * @param {number} [id]
 */
GUI.input.Session = function(type, target, data, recognize, id) {

	/**
	 * id of this session
	 */
	this.id = (id === undefined)? 0 : id;

	/**
	 * state of this session (start, move, end)
	 * see GUI.input.STATE_* constants
	 */
	this.state = GUI.input.STATE_START;
	
	/**
	 * input type of this session (mouse, pen, touch)
	 * see GUI.input.TYPE_* constants
	 */
	this.type = type;
	
	/**
	 * DOM target
	 */
	this.target = target;
	
	/**
	 * recognizer active for this session
	 */
	this.recognize = (recognize == true);
	
	/**
	 * track of data (position etc.) in this session
	 */
	this.data = [];
	
	/**
	 * count of processed data
	 */
	this.processed = 0;
	
	/**
	 * indicates if session will be terminated
	 */
	this.isFinal = false;
	
	//add first data
	this.push(data);
}

GUI.input.Session.prototype = {

	/**
	 * get latest X coordinate
	 */
	getX: function() {
		return this.data[this.data.length -1].x;
	},
	
	/**
	 * get latest Y coordinate
	 */
	getY: function() {
		return this.data[this.data.length -1].y;
	},
	
	/**
	 * get latest pointer width
	 */
	getWidth: function() {
		return this.data[this.data.length -1].width;
	},
	
	/**
	 * get latest pointer height
	 */
	getHeight: function() {
		return this.data[this.data.length -1].height;
	},
	
	/**
	 * pushes new input data
	 * @param {object} data
	 */
	push: function(data) {
		this.data.push($.extend({
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			angle: 0
		}, data));
	},
	
	/**
	 * set variable isFinal to true
	 */
	finalize: function() {
		this.isFinal = true;
	},
	
	/**
	 * triggers events to listeners
	 */
	render: function() {
		if(this.state != GUI.input.STATE_START && this.recognize) {
			//TODO
		}
		
		switch(this.state) {
		case GUI.input.STATE_START:
			switch(this.type) {
			case GUI.input.TYPE_MOUSE:
				GUI.input.trigger("mousestart", this);
			break;
			case GUI.input.TYPE_PEN:
				GUI.input.trigger("penstart", this);
			break;
			case GUI.input.TYPE_TOUCH:
				GUI.input.trigger("touchstart", this);
			break;
			}
			GUI.input.trigger("start", this);
			
			this.state = this.isFinal? GUI.input.STATE_END : GUI.input.STATE_MOVE;
			this.processed = this.data.length;
		break;
		case GUI.input.STATE_MOVE:
			if(this.isFinal) {
				this.state = GUI.input.STATE_END;
				return;
			}
			else if(this.data.length > this.processed) {
				var recognize = false;
				
				switch(this.type) {
				case GUI.input.TYPE_MOUSE:
					recognize = GUI.input.mouse.recognize;
				break;
				case GUI.input.TYPE_PEN:
					recognize = GUI.input.pen.recognize;
				break;
				case GUI.input.TYPE_TOUCH:
					recognize = GUI.input.touch.recognize;
				break;
				}
				
				switch(this.type) {
				case GUI.input.TYPE_MOUSE:
					GUI.input.trigger("mousemove", this);
				break;
				case GUI.input.TYPE_PEN:
					GUI.input.trigger("penmove", this);
				break;
				case GUI.input.TYPE_TOUCH:
					GUI.input.trigger("touchmove", this);
				break;
				}
				GUI.input.trigger("move", this);
				
				this.processed = this.data.length;
			}
		break;
		case GUI.input.STATE_END:
			switch(this.type) {
			case GUI.input.TYPE_MOUSE:
				GUI.input.trigger("mouseend", this);
			break;
			case GUI.input.TYPE_PEN:
				GUI.input.trigger("penend", this);
			break;
			case GUI.input.TYPE_TOUCH:
				GUI.input.trigger("touchend", this);
			break;
			}
			GUI.input.trigger("end", this);
			
			switch(this.type) {
			case GUI.input.TYPE_MOUSE:
				GUI.input.mouse.session = null;
			break;
			case GUI.input.TYPE_PEN:
				GUI.input.pen.session = null;
			break;
			case GUI.input.TYPE_TOUCH:
				if(GUI.input.touch.multi) {
					//TODO destroy single session in multi session
				}
				else delete GUI.input.touch.sessions[this.id];
			break;
			}
		break;
		}
	}
}

/**
 * class for multi sessions
 */
GUI.input.MultiSession = function(session) {

	/**
	 * array of sessions
	 */
	this.sessions = [session];
	
	//TODO
}

GUI.input.MultiSession.prototype = {

	/**
	 * get latest X coordinate
	 */
	/*getX: function() {
		return this.data[this.data.length -1].x;
	}*/
}

/******************************************************************************************
 * TODO delete
 * old touch handler for object selection
 */
// GUI.input.touch.handler = function(event) {
	
	// jPopoverManager.hideAll();
	
	// var contentPosition = $("#content").offset();

	// var x = event.pageX-contentPosition.left;
	// var y = event.pageY-contentPosition.top;
	
	// if (event.touches.length >= 1) {
		// var x = event.touches[event.touches.length-1].pageX-contentPosition.left;
		// var y = event.touches[event.touches.length-1].pageY-contentPosition.top;
	// }
	
	// /* find objects at this position */
	// var clickedObject = GUI.getObjectAt(x, y);

	// if (clickedObject && event.target != $("#content>svg").get(0)) {
		// event.preventDefault();
		// event.stopPropagation();
		// clickedObject.click(event);
	// } else {
		// GUI.deselectAllObjects();
		// GUI.updateInspector();
	// }
// }