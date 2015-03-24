/**
 *    Webarena Mouse, Touch and Pen Support
 *    @author Dominik Roﬂ, University of Paderborn, 2014-2015
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
	 * input type constants
	 */
	TYPE_TOUCH: "touch",
	TYPE_PEN: "pen",
	TYPE_MOUSE: "mouse",
	
	/**
	 * session state constants
	 */
	STATE_START: 1,
	STATE_MOVE: 2,
	STATE_END: 3,
	
	/**
	 * move direction constants
	 */
	DIRECTION_NONE: 1,
	DIRECTION_LEFT: 2,
	DIRECTION_RIGHT: 4,
	DIRECTION_UP: 8,
	DIRECTION_DOWN: 16,

	DIRECTION_HORIZONTAL: -1,
	DIRECTION_VERTICAL: -1,
	DIRECTION_ALL: -1,
	
	/**
	 * max move constants
	 */
	MAX_MOVE_COUNT: 100,
	MAX_MOVE_PIXEL: 10,
	
	/**
	 * constants for tab and press gesture
	 */
	TAP_MAX_TIME: 300,
	PRESS_MIN_TIME: 500,
	
	/**
	 * constants for simulatePen
	 */
	SIMULATEPEN_MAX_AREA: 300,
	
	/**
	 * constants for multi session
	 */
	MIN_WAIT: 100,
	MAX_RADIUS: 512,
	ADD_RADIUS: 100,
	
	/**
	 * variable for artboard element
	 */
	artboard: null,
	artboardSVG: null,
	
	/**
	 * variable for artboard offset
	 */
	artboardOffset: { left: 0, top: 0 },
	
	/**
	 * inits event handlers and so on
	 */
	init: function() {
		
		//defining calculated constants
		GUI.input.DIRECTION_HORIZONTAL = GUI.input.DIRECTION_LEFT | GUI.input.DIRECTION_RIGHT;
		GUI.input.DIRECTION_VERTICAL = GUI.input.DIRECTION_UP | GUI.input.DIRECTION_DOWN;
		GUI.input.DIRECTION_ALL = GUI.input.DIRECTION_HORIZONTAL | GUI.input.DIRECTION_VERTICAL;
	
		//check device functions
		GUI.isTouchDevice = ('ontouchstart' in window);
		GUI.isPointerDevice = ('PointerEvent' in window) || ('MSPointerEvent' in window);
		GUI.isMobileDevice = /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent);
		
		//check if mutlitouch is possible
		if(window.navigator.maxTouchPoints <= 1 && GUI.input.touch.multi)
			GUI.input.touch.multi = false;
			
		//set artboard
		GUI.input.artboard = $("#content").get(0);
		GUI.input.artboardSVG = $("#content > svg").get(0);
		GUI.input.offset();
		
		//use event capture or bubble phase
		var useCapture = true;
		
		//init event handlers
		if(GUI.isPointerDevice) {
			
			//css class for pointer input
			$("body").addClass("pointer");
			
			//no simulate pen
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
					GUI.input.touch.singleTouchHandler(
						event.pointerId, 
						event.type.toLowerCase(), 
						event.target, 
						event.clientX, 
						event.clientY, 
						event.width/2, 
						event.height/2, 
						0,
						event.altKey,
						event.ctrlKey,
						event.metaKey,
						event.shiftKey
					);
				}
				else if(type == GUI.input.TYPE_PEN)
					GUI.input.pen.handler(event);
				else if(type == GUI.input.TYPE_MOUSE)
					GUI.input.mouse.handler(event);
			}
			
			//IE10 - pointer
			if(window.MSPointerEvent) {
				GUI.input.artboard.addEventListener("MSPointerDown", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("MSPointerMove", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("MSPointerUp", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("MSPointerCancel", pointerhandler, useCapture);
			}
			//pointer
			else {
				GUI.input.artboard.addEventListener("pointerdown", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("pointermove", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("pointerup", pointerhandler, useCapture);
				GUI.input.artboard.addEventListener("pointercancel", pointerhandler, useCapture);
			}
		}
		else if(GUI.isTouchDevice && GUI.isMobileDevice) {
			
			//just touch input
			$("body").addClass("mobile touch");
			
			//touch
			GUI.input.artboard.addEventListener("touchstart", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchmove", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchend", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchcancel", GUI.input.touch.handler, useCapture);
		}
		else if(!GUI.isTouchDevice) {
			
			//just mouse input
			$("body").addClass("mouse");
			
			//mouse
			GUI.input.artboard.addEventListener("mousedown", GUI.input.mouse.handler, useCapture);
			GUI.input.artboard.addEventListener("mousemove", GUI.input.mouse.handler, useCapture);
			GUI.input.artboard.addEventListener("mouseup", GUI.input.mouse.handler, useCapture);
		}
		else {
			
			//touch and mouse input
			$("body").addClass("touch mouse");
			
			//touch
			GUI.input.artboard.addEventListener("touchstart", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchmove", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchend", GUI.input.touch.handler, useCapture);
			GUI.input.artboard.addEventListener("touchcancel", GUI.input.touch.handler, useCapture);
			
			//mouse
			GUI.input.artboard.addEventListener("mousedown", GUI.input.mouse.handler, useCapture);
			GUI.input.artboard.addEventListener("mousemove", GUI.input.mouse.handler, useCapture);
			GUI.input.artboard.addEventListener("mouseup", GUI.input.mouse.handler, useCapture);
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
		
		//single or multi touch sessions
		$.each(GUI.input.touch.sessions, function(i, session) {
			session.render();
		});
	},
	
	/**
	 * get and refresh the artboard offset variable
	 */
	offset: function() {
		GUI.input.artboardOffset = $(GUI.input.artboard).offset();
		return GUI.input.artboardOffset;
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
		$.each(events.trim().split(/\s+/g), function(i, event) {
			if(!handler) delete handlers[event];
			else handlers[event].splice($.inArray(handlers[event], handler), 1);
		});
	},
	
	/**
	 * trigger event (start, move, end)
	 * @param {string} event
	 * @param {object} data
	 */
	trigger: function(event, data) {
		var handlers = GUI.input.handlers[event] && GUI.input.handlers[event].slice();
		if(!handlers || !handlers.length) return;
		
		for(var i=0, len=handlers.length; i<len; i++)
			handlers[i](data);
	},
	
	/**
	 * @private variable for gestures
	 */
	gestures: [],
	
	/**
	 * add a gesture
	 * @param {function} gesture
	 */
	addGesture: function(gesture) {
		GUI.input.gestures.push(gesture);
	},
	
	/**
	 * remove a gesture
	 * @param {function} gesture
	 */
	removeGesture: function(gesture) {
		GUI.input.gestures.splice($.inArray(GUI.input.gestures, gesture), 1);
	},
	
	/**
	 * get the center of all the pointers
	 * @param {Array} pointers
	 * @return {Object} center contains `x` and `y` properties
	 */
	getCenter: function(pointers) {
	    var pointersLength = pointers.length;

	    // no need to loop when only one point
	    if (pointersLength === 1) {
		   return {
			  x: Math.round(pointers[0].x),
			  y: Math.round(pointers[0].y)
		   };
	    }

	    var x = 0, y = 0, i = 0;
	    while (i < pointersLength) {
		   x += pointers[i].x;
		   y += pointers[i].y;
		   i++;
	    }

	    return {
		   x: Math.round(x / pointersLength),
		   y: Math.round(y / pointersLength)
	    };
	},
	
	/**
	 * calculate the velocity between two points. unit is in px per ms.
	 * @param {Number} deltaTime
	 * @param {Object} p1 {x, y}
	 * @param {Object} p2 {x, y}
	 * @return {Object} velocity `x` and `y` and `all`
	 */
	getVelocity: function(deltaTime, p1, p2) {
		var x = p2.x - p1.x,
		    y = p2.y - p1.y;
		
	    return {
		   x: x / deltaTime || 0,
		   y: y / deltaTime || 0,
		   all: Math.sqrt((x * x) + (y * y)) / deltaTime || 0
	    };
	},
	
	/**
	 * get the direction between two points
	 * @param {Object} p1 {x, y}
	 * @param {Object} p2 {x, y}
	 * @return {Number} direction
	 */
	getDirection: function(p1, p2) {
		var x = p2.x - p1.x,
		    y = p2.y - p1.y;
		
		if (x === y) {
		   return GUI.input.DIRECTION_NONE;
		}

		if (Math.abs(x) >= Math.abs(y)) {
		   return x > 0 ? GUI.input.DIRECTION_LEFT : GUI.input.DIRECTION_RIGHT;
		}
		return y > 0 ? GUI.input.DIRECTION_UP : GUI.input.DIRECTION_DOWN;
	},
	
	/**
	 * calculate the absolute distance between two points
	 * @param {Object} p1 {x, y}
	 * @param {Object} p2 {x, y}
	 * @return {Number} distance
	 */
	getDistance: function(p1, p2) {
	    var x = p2.x - p1.x,
		   y = p2.y - p1.y;

	    return Math.sqrt((x * x) + (y * y));
	},
	
	/**
	 * calculate the angle between two coordinates
	 * @param {Object} p1
	 * @param {Object} p2
	 * @return {Number} angle
	 */
	getAngleBetween: function(p1, p2) {
	    var x = p2.x - p1.x,
		   y = p2.y - p1.y;
		   
	    return Math.atan2(y, x) * 180 / Math.PI;
	},
	
	/**
	 * calculate the rotation degrees between two pointersets
	 * @param {Array} start array of pointers
	 * @param {Array} end array of pointers
	 * @return {Number} rotation
	 */
	getRotation: function(start, end) {
	    return GUI.input.getAngleBetween(end[1], end[0]) - GUI.input.getAngleBetween(start[1], start[0]);
	},
	
	/**
	 * calculate the scale factor between two pointersets
	 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
	 * @param {Array} start array of pointers
	 * @param {Array} end array of pointers
	 * @return {Number} scale
	 */
	getScale: function(start, end) {
	    return GUI.input.getDistance(end[0], end[1]) / GUI.input.getDistance(start[0], start[1]);
	},
	
	/**
	 * @namespace holds methods and variables for mouse support
	 */
	mouse: {
		
		/**
		 * variable to enable/disable gesture recognition
		 */
		recognize: typeof Config.input.recognize !== 'undefined' ? Config.input.recognize : true,
	
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
					y: posy,
					altKey: event.altKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					shiftKey: event.shiftKey
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
							
						var node = targ;
						while (node) {
							if (node == GUI.input.artboard) {
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
					
					GUI.input.mouse.session.push(data);
					
					if(type.indexOf("up") != -1
					|| type.indexOf("cancel") != -1)
						GUI.input.mouse.session.finalize();
				}
			}
		}
	},
	
	/**
	 * @namespace holds methods and variables for touch support
	 */
	touch: {
		
		/**
		 * variable to check if someone is touching ;-)
		 */
		ing: false,
		
		/**
		 * variable to enable/disable multitouch
		 */
		multi: typeof Config.input.multiTouch !== 'undefined' ? Config.input.multiTouch : true,
		
		/**
		 * variable to enable/disable gesture recognition
		 */
		recognize: typeof Config.input.recognize !== 'undefined' ? Config.input.recognize : true,
		
		/**
		 * variable to enable/disable pen simulation
		 */
		simulatePen: typeof Config.input.simulatePen !== 'undefined' ? Config.input.simulatePen : true,
		
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
			
			var touches = [];
			$.each($.makeArray(event.changedTouches), function(id, touch) {
				var node = touch.target;
				
				while (node) {
					if (node == GUI.input.artboard) {
						touches.push(touch);
						break;
					}
					
					node = node.parentNode;
				}
			});
			
			for(var i = 0, len = touches.length; i < len; i++) {
				//simulatePen
				if(GUI.input.touch.simulatePen) {
					if(!$.isEmptyObject(GUI.input.pen.session)) {
						if(GUI.input.pen.session.id == touches[i].identifier) {
							GUI.input.pen.session.push({
								x: touches[i].pageX, 
								y: touches[i].pageY, 
								width: touches[i].radiusX, 
								height: touches[i].radiusY, 
								angle: touches[i].rotationAngle,
								altKey: event.altKey,
								ctrlKey: event.ctrlKey,
								metaKey: event.metaKey,
								shiftKey: event.shiftKey
							});
							
							var type = event.type.toLowerCase();
							if(type.indexOf("end") != -1
							|| type.indexOf("cancel") != -1
							|| type.indexOf("leave") != -1)
								GUI.input.pen.session.finalize();
							
							continue;
						}
					}
					//pen detection
					else if(event.type.toLowerCase().indexOf("start") != -1 
						&& touches[i].radiusX > 1 && touches[i].radiusY > 1
						&& Math.PI * touches[i].radiusX * touches[i].radiusY < GUI.input.SIMULATEPEN_MAX_AREA) {
						
						GUI.input.pen.session = new GUI.input.Session(GUI.input.TYPE_PEN, touches[i].target, {
								x: touches[i].pageX, 
								y: touches[i].pageY, 
								width: touches[i].radiusX, 
								height: touches[i].radiusY, 
								angle: touches[i].rotationAngle,
								altKey: event.altKey,
								ctrlKey: event.ctrlKey,
								metaKey: event.metaKey,
								shiftKey: event.shiftKey
							}, GUI.input.pen.recognize, touches[i].identifier);
						
						continue;
					}
				}
				
				GUI.input.touch.singleTouchHandler(
					touches[i].identifier, 
					event.type.toLowerCase(), 
					touches[i].target, 
					touches[i].pageX, 
					touches[i].pageY, 
					touches[i].radiusX, 
					touches[i].radiusY, 
					touches[i].rotationAngle,
					event.altKey,
					event.ctrlKey,
					event.metaKey,
					event.shiftKey
				);
			}
		},
		
		/**
		 * @private event handler for a single touch
		 */
		singleTouchHandler: function(
			id, 
			type, 
			targ, 
			posx, 
			posy, 
			radiusx, 
			radiusy, 
			rotationAngle, 
			alt,
			ctrl,
			meta,
			shift) 
		{
			var data = {
				x: posx,
				y: posy,
				width: radiusx,
				height: radiusy,
				angle: rotationAngle,
				altKey: alt,
				ctrlKey: ctrl,
				metaKey: meta,
				shiftKey: shift
			};
			
			if(GUI.input.touch.recognize && GUI.input.touch.multi) {
				if(!$.isEmptyObject(GUI.input.touch.sessions)) {
					var found = false;
					var finalize = (type.indexOf("up") != -1
								|| type.indexOf("end") != -1
								|| type.indexOf("cancel") != -1);
					
					//does session id exists?
					$.each(GUI.input.touch.sessions, function(i, multiSession) {
						if(multiSession.push(id, data)) {
							found = true;
							
							if(finalize)
								multiSession.sessions[id].finalize();
							
							return false;
						}
					});
					
					if(!found && !finalize) {
						found = false;
						
						var session = new GUI.input.Session(GUI.input.TYPE_TOUCH, targ, data, GUI.input.touch.recognize, id);
						
						//could a new session be added to an existing multi session?
						$.each(GUI.input.touch.sessions, function(i, multiSession) {
							if(multiSession.add(session)) {
								found = true;
								return false;
							}
						});
						
						if(!found)
							GUI.input.touch.sessions[id] = new GUI.input.MultiSession(session);
					}
				}
				//first new multitouch session
				else if(type.indexOf("down") != -1
					|| type.indexOf("start") != -1)
						GUI.input.touch.sessions[id] = new GUI.input.MultiSession(new GUI.input.Session(GUI.input.TYPE_TOUCH, targ, data, GUI.input.touch.recognize, id));
			}
			else {
				if(type.indexOf("down") != -1
				|| type.indexOf("start") != -1)
					GUI.input.touch.sessions[id] = new GUI.input.Session(GUI.input.TYPE_TOUCH, targ, data, GUI.input.touch.recognize, id);
				else if(!$.isEmptyObject(GUI.input.touch.sessions[id])) {
					GUI.input.touch.sessions[id].push(data);
				
					if(type.indexOf("up") != -1
					|| type.indexOf("end") != -1
					|| type.indexOf("cancel") != -1)
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
		recognize: typeof Config.input.recognize !== 'undefined' ? Config.input.recognize : true,
		
		/**
		 * variable to enable/disable pen mini paint mode
		 */
		paintMode: typeof Config.input.paintMode !== 'undefined' ? Config.input.paintMode : true,
	
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
				y: event.pageY,
				altKey: event.altKey,
				ctrlKey: event.ctrlKey,
				metaKey: event.metaKey,
				shiftKey: event.shiftKey
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
				
				var node = targ;
				while (node) {
					if (node == GUI.input.artboard) {
						GUI.input.pen.session = new GUI.input.Session(GUI.input.TYPE_PEN, targ, data, GUI.input.pen.recognize, event.pointerId);
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
				|| type.indexOf("cancel") != -1)
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
	
	//TODO ontouch check for another target or webarena object GUI.getObjectAt(x,y);
	
	/**
	 * DOM target
	 */
	this.target = target;
	
	/**
	 * WebArena Object
	*/
	if(target != GUI.input.artboard) {
		var temp = target;
		while (temp && !temp.dataObject && temp != GUI.input.artboard) 
			temp = $(temp).parent()[0];
		
		if(temp)
			this.object = (temp.dataObject)? temp.dataObject : false;
		else this.object = false;
	}
	else this.object = false;
	
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
	
	/**
	 * time between session start and now
	 */
	this.deltaTime = 0;
	
	/**
	 * indicates if the pointer moved too much for tap oder press gesture
	 */
	this.isMaxMoved = false;
	
	/**
	 * indicates if a tap gesture is possible
	 */
	this.isTap = true;
	
	/**
	 * indicates if a press gesture is possible
	 */
	this.isPress = false;
	
	/**
	 * current direction
	 */
	this.direction = GUI.input.DIRECTION_NONE;
	
	/**
	 * current velocity
	 */
	this.velocity = 0;
	
	/**
	 * current distance
	 */
	this.distance = 0;
	
	/**
	 * distance form start point
	 */
	this.distanceStart = 0;
	
	/**
	 * @private variable for session event handlers
	 */
	this.handlers = {};
	
	
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
	 * get latest pointer angle
	 */
	getAngle: function() {
		return this.data[this.data.length -1].angle;
	},
	
	/**
	 * get latest state of altKey
	 */
	getAltKey: function() {
		return this.data[this.data.length -1].altKey;
	},
	
	/**
	 * get latest state of ctrlKey
	 */
	getCtrlKey: function() {
		return this.data[this.data.length -1].ctrlKey;
	},
	
	/**
	 * get latest state of metaKey
	 */
	getMetaKey: function() {
		return this.data[this.data.length -1].metaKey;
	},
	
	/**
	 * get latest state of shiftKey
	 */
	getShiftKey: function() {
		return this.data[this.data.length -1].shiftKey;
	},
	
	/**
	 * get latest data
	 */
	get: function() {
		return this.data[this.data.length -1];
	},
	
	/**
	 * pushes new input data
	 * @param {object} data
	 */
	push: function(data) {
		var insert = $.extend({
			time: 0,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			angle: 0,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false
		}, data);
		
		insert.time = Date.now();
		
		this.data.push(insert);
	},
	
	/**
	 * set variable isFinal to true
	 */
	finalize: function() {
		this.isFinal = true;
	},
	
	/**
	 * bind one or more session events (move, end)
	 * @param {string} events
	 * @param {function} handler
	 */
	bind: function(events, handler) {
		var handlers = this.handlers;
		$.each(events.trim().split(/\s+/g), function(i, event) {
			handlers[event] = handlers[event] || [];
			handlers[event].push(handler);
		});
	},
	
	/**
	 * unbind one or more session events (move, end)
	 * @param {string} events
	 * @param {function} [handler]
	 */
	unbind: function(events, handler) {
		var handlers = GUI.input.handlers;
		$.each(events.trim().split(/\s+/g), function(i, event) {
			if(!handler) delete handlers[event];
			else handlers[event].splice($.inArray(handlers[event], handler), 1);
		});
	},
	
	/**
	 * trigger session event (move, end)
	 * @param {string} event
	 * @param {session} session
	 */
	trigger: function(event) {
		var handlers = this.handlers[event] && this.handlers[event].slice();
		if(!handlers || !handlers.length) return;
		
		for(var i=0, len=handlers.length; i<len; i++)
			handlers[i](this);
	},
	
	/**
	 * processes the input
	 */
	process: function(full) {
		full = typeof full !== 'undefined' ? full: true;
		
		//deltaTime
		this.deltaTime = Date.now() - this.data[0].time;
		
		//max move
		if(!this.isMaxMoved) {
			if(this.data.length <= GUI.input.MAX_MOVE_COUNT) {
				for(var i = this.processed+1, len = this.data.length; i < len; i++) {
					if(GUI.input.getDistance(this.data[0], this.data[i]) > GUI.input.MAX_MOVE_PIXEL) {
						this.isMaxMoved = true;
						break;
					}
				}
			}
			else this.isMaxMoved = true;
		}
		
		//is tap gesture possible?
		if(this.isTap && (this.isMaxMoved || this.deltaTime > GUI.input.TAP_MAX_TIME))
			this.isTap = false;
		
		//is press gesture possible?
		if(!this.isPress && !this.isMaxMoved && this.deltaTime > GUI.input.PRESS_MIN_TIME)
			this.isPress = true;
		else if(this.isPress && this.isMaxMoved)
			this.isPress = false;
		
		if(full && this.data.length > 1 && this.processed > 1 && this.data.length > this.processed) {
			var last = this.data[this.processed-1], current = this.get();
			
			//direction
			this.direction = GUI.input.getDirection(last, current);
			
			//velocity
			this.velocity = GUI.input.getVelocity(this.deltaTime, last, current);
			
			//distance
			this.distance = GUI.input.getDistance(last, current);
			this.distanceStart = GUI.input.getDistance(this.data[0], current);
		}
	},
	
	/**
	 * triggers events to listeners
	 */
	render: function() {
		var somethingNew = (this.data.length > this.processed);
		if(somethingNew && this.state != GUI.input.STATE_START) {
			this.process(this.recognize);
			this.processed = this.data.length;
		}
		
		switch(this.state) {
		case GUI.input.STATE_START:
			if(GUI.paintModeActive 
			|| GUI.input.pen.paintMode && this.type == GUI.input.TYPE_PEN)
				GUI.input.trigger("paint.start", this);
			else GUI.input.trigger("start", this);
			
			this.processed = 1;
			this.state = this.isFinal? GUI.input.STATE_END : GUI.input.STATE_MOVE;
		break;
		case GUI.input.STATE_MOVE:
			if(this.isFinal) {
				this.state = GUI.input.STATE_END;
				return;
			}
			else if(somethingNew) {
				if(GUI.paintModeActive 
				|| GUI.input.pen.paintMode && this.type == GUI.input.TYPE_PEN) {
					this.trigger("paint.move");
					GUI.input.trigger("paint.move", this);
				}
				else {
					this.trigger("move");
					GUI.input.trigger("move", this);
				}
			}
		break;
		case GUI.input.STATE_END:
			if(GUI.paintModeActive 
			|| GUI.input.pen.paintMode && this.type == GUI.input.TYPE_PEN) {
				this.trigger("paint.end");
				GUI.input.trigger("paint.end", this);
			}
			else {
				this.trigger("end");
				GUI.input.trigger("end", this);
				
				if(this.isTap) {
					this.trigger("tap");
					GUI.input.trigger("tap", this);
				}
				else if(this.isPress) {
					this.trigger("press");
					GUI.input.trigger("press", this);
				}
			}
			
			switch(this.type) {
			case GUI.input.TYPE_MOUSE:
				GUI.input.mouse.session = null;
			break;
			case GUI.input.TYPE_PEN:
				GUI.input.pen.session = null;
			break;
			case GUI.input.TYPE_TOUCH:
				if(!GUI.input.touch.multi) delete GUI.input.touch.sessions[this.id];
				else $.each(GUI.input.touch.sessions, $.proxy(function(i, ms) {
					if(ms.has(this.id)) {
						ms.remove(this.id);
						return false;
					}
				}, this));
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
	 * id of this multi session (first session id)
	 */
	this.id = session.id

	/**
	 * array of sessions
	 */
	this.sessions = {};
	
	/**
	 * session count
	 */
	this.count = 1;
	
	/**
	 * indicates if in this multi session was  more than one single session
	 */
	this.multi = false;
	
	/**
	 * start timestamp
	 */
	this.start = Date.now();
	
	/**
	 * state of this session (start, move, end)
	 * see GUI.input.STATE_* constants
	 */
	this.state = GUI.input.STATE_START;
	
	/**
	 * ellipse radius
	 */
	this.radius = GUI.input.ADD_RADIUS;
	
	
	//add first session
	this.sessions[session.id] = session;
}

GUI.input.MultiSession.prototype = {

	/**
	 * get center of current session positions
	 */
	getCenter: function() {
		var points = [];
		
		$.each(this.sessions, function(i, s) {
			points.push(s.get());
		});
		
		return GUI.input.getCenter(points);
	},
	
	/**
	 * check if session with specific id exists
	 */
	has: function(id) {
		return !$.isEmptyObject(this.sessions[id])
	},
	
	/**
	 * check if a new session could be added to this multi session and add
	 */
	add: function(session) {
		
		if(!this.has(session.id)) {
			
			var point = session.get();
			var dist = GUI.input.getDistance(this.getCenter(), point);
			
			if(dist <= this.radius) {
				this.sessions[session.id] = session;
				
				if(this.radius < GUI.input.MAX_RADIUS) {
					var newRadius = dist + GUI.input.ADD_RADIUS;
					
					if(newRadius < GUI.input.MAX_RADIUS)
						this.radius = newRadius;
					else this.radius = GUI.input.MAX_RADIUS;
				}
				
				this.count++;
				this.multi = true;
				
				return true;
			}
		}
		
		return false;
	},
	
	/**
	 * push data to a session with specific id
	 */
	push: function(id, data) {
		if(this.has(id)) {
			this.sessions[id].push(data);
			
			return true;
		}
		
		return false;
	},
	
	/**
	 * remove session with specific id
	 */
	remove: function(id) {
		if(this.has(id)) {
			delete this.sessions[id];
			this.count--;
			
			return true;
		}
		
		return false;
	},
	
	/**
	 * triggers events to listeners
	 */
	render: function() { console.log(this.count);
		if(this.count == 1 && Date.now() - this.start <= GUI.input.MIN_WAIT) return;
		
		if(this.count == 1 && !this.multi) {
			$.each(this.sessions, $.proxy(function(i, s) {
				s.render();
			}, this));
		}
		else { 
			$.each(this.sessions, $.proxy(function(i, s) {
				s.process(true);
				s.processed = s.data.length;
				
				if(s.isFinal)
					this.remove(s.id);
			}, this));
			
			var gestures = GUI.input.gestures && GUI.input.gestures.slice();
			if(gestures && gestures.length){
				for(var i=0, len=gestures.length; i<len; i++) {
					if(gestures[i](this))
						break;
				}
			}
			
			switch(this.state) {
			case GUI.input.STATE_START:
				this.state = GUI.input.STATE_MOVE;
			break;
			case GUI.input.STATE_END:
				delete GUI.input.touch.sessions[this.id];
			break;
			}
		}
		
		if(this.count == 0)
			this.state = GUI.input.STATE_END;
	}
}