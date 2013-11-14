/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject view component
*
*/

/**
 * Updates the representation using the attributes
 * @param {bool} external True if triggered externally (and not by the object itself)
 */
GeneralObject.draw=function(external){

	if (!this.isGraphical) return;
	
	var rep=this.getRepresentation();

	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));
	
	this.drawPosition(external);
			
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		
		if (this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			
			if (this.getAttribute("visible")) {
				
				if (external) {
					if ($(rep).css("visibility") == "hidden") {
						/* fade in */
						$(rep).css("opacity", 0);
						$(rep).css("visibility", "visible");
						$(rep).animate({
							"opacity" : 1
						}, {queue:false, duration:500});
					}
				} else {
					$(rep).css("visibility", "visible");
				}
				
			} else {
				
				if (external) {
					if ($(rep).css("visibility") == "visible") {
						/* fade out */
						$(rep).css("opacity", 1);
						$(rep).animate({
							"opacity" : 0
						}, {queue:false, 
							complete:function() {
								$(rep).css("visibility", "hidden");
							}
							});
					}
				} else {
					$(rep).css("visibility", "hidden");
				}
				
			}
			
		}

		
	}
	
	this.adjustControls();
	
}

/**
 * Updates the position of the representation
 * @param {bool} external True if triggered externally (and not by the object itself)
 */
GeneralObject.drawPosition = function(external) {

	/* animations can be prevented using the objects function "startNoAnimationTimer" and the clients global function "GUI.startNoAnimationTimer" */
	if (external === true && !this.selected && this.noAnimation == undefined && GUI.noAnimation == undefined) {
		/* set position animated when not called locally */
		this.setViewXYAnimated(this.getAttribute('x'), this.getAttribute('y'));
	} else {
		/* set position without animation */
		this.setViewX(this.getAttribute('x'));
		this.setViewY(this.getAttribute('y'));
	}
	
}

GeneralObject.drawDimensions = GeneralObject.drawPosition;

/**
 * Prevents all animations by drawPosition for the next second
 */
GeneralObject.startNoAnimationTimer = function() {
	var self = this;
	this.noAnimation = window.setTimeout(function() {
		self.noAnimation = undefined;
	}, 1000);
}


/**
 * @deprecated still used?
 */
GeneralObject.updateGUI=function(){
	
	//check if we are allowed to paint
	
	if (!ObjectManager) return;
	if (!ObjectManager.hasObject(this)){
		debug(this+' not in inventory');
		return;
	}
	
	this.draw();
	
	GUI.updateGUI(this);
	
}

/**
 * Gets access to the dom representation of the object on the surface.
 *
 * Always use this function to gain access to the representation. This should 
 * always be done in view-subsections of the objects and must never be done 
 * elsewhere.
 *
 * @returns {DomObject} The DOM object representing the object
 */
GeneralObject.getRepresentation=function(){

	if (!this.isGraphical) return;

	var rep=document.getElementById(this.getAttribute('id'));

	if (!rep){
		var parent = $('#room_'+ObjectManager.getIndexOfObject(this.getAttribute("inRoom")));
		var rep = this.createRepresentation(parent);
		this.representationCreated();
		
	}
	
	rep.dataObject=this;
	return rep;
}

/**
 * Called when the representation for this object was created
 */
GeneralObject.representationCreated = function() {

	if (!GUI.couplingModeActive) {
		GUI.updateLayersDelayed();
	} else {
		GUI.updateLayers();
	}
}

/**
 * Creates a new representation for this object
 * 
 * @returns {DomObject} The new DOM object representing the object
 */
GeneralObject.createRepresentation = function() {

	if (!this.isGraphical) return;

	var rep = GUI.svg.rect(parent,
		10, //x
		10, //y
		10, //width
		10 //height
	);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


/**
 * @deprecated ? (called by all createRepresentation functions)
 */
GeneralObject.initGUI = function(rep) {
	
	var self = this;
	
}


/**
 * Adds a graphical indicator for selected objects
 * This typically is a blue border around the objects SVG representation
 * (If the SVG object itself has no border property, an SVG rect with the class "borderRect" can be used as the indicator)
 */
GeneralObject.addSelectedIndicator = function() {

	var rep = this.getRepresentation();

	var borderRep = rep;

	if (rep.tagName == "g") {
		/* group --> search first child */
		borderRep = $(rep).children();
	}
	
	if ($(rep).find(".borderRect").length > 0) {
		/* border rect exists */
		borderRep = $(rep).find(".borderRect").get(0);
	}

	this.oldAttrStroke = $(borderRep).attr("stroke");
	this.oldAttrStrokeWidth = $(borderRep).attr("stroke-width");
	
	if (this.oldAttrStroke == undefined) this.oldAttrStroke = "";
	if (this.oldAttrStrokeWidth == undefined) this.oldAttrStrokeWidth = 0;
	
	$(borderRep).attr("stroke", '#1F7BFE');
	$(borderRep).attr("stroke-width", "2");

	$(rep).addClass("selected");
	
}

/**
 * Removes the graphical indicator of selected objects
 */
GeneralObject.removeSelectedIndicator = function() {

	var rep = this.getRepresentation();
	
	var borderRep = rep;
	
	if (rep.tagName == "g") {
		/* group --> search first child */
		borderRep = $(rep).children();
	}
	
	if ($(rep).find(".borderRect").length > 0) {
		/* border rect exists */
		borderRep = $(rep).find(".borderRect").get(0);
	}
	
	
	$(borderRep).attr("stroke", this.oldAttrStroke);
	$(borderRep).attr("stroke-width", this.oldAttrStrokeWidth);
	
	$(rep).removeClass("selected");
	
}

/**
 * Selects the object
 * 
 * @param {bool} multiple True is multiple objects should be selected (otherwise the selection of an object will deselect all other objects)
 * @param {bool} groupSelect ?
 */
GeneralObject.select = function(multiple, groupSelect) {

	if (this.selected) return;
	
	GUI.hideActionsheet();

	if (!GUI.shiftKeyDown && !multiple) {

		/* deselect all selected objects */
		$.each(ObjectManager.getSelected(), function(index, object) {
			object.deselect();
		});
	
	}
	
	this.selected = true;
	
	if (this.getAttribute("group") != 0 && !groupSelect) {
		$.each(this.getGroupMembers(), function(index, object) {
			object.select(true, true);
		});
	}
	
	
	if (this.mayResize()) {
		/* add controls for resizing */
		this.addControls();
	}
	
	if (this.mayMove()) {
		/* add event handlers to make the object movable */
		this.makeMovable();
	}
	
	this.addSelectedIndicator();
	
	if(!multiple) this.selectHandler();

	if (GUI.updateInspectorDelay){
		window.clearTimeout(GUI.updateInspectorDelay);
		GUI.updateInspectorDelay=false;
	}

	GUI.updateInspectorDelay=window.setTimeout(function(){
		GUI.updateInspector(true);
	},100);

	
	if (!groupSelect && !multiple) GUI.showLinks(this);
	
	this.draw();
	
	/* inform all clients about the selection */
	ObjectManager.informAboutSelection(this.id);
	
}

/**
 * Deselects the object
 */
GeneralObject.deselect = function() {

	if (!this.selected) return;

	this.selected = false;
	
	this.removeControls();
	this.unmakeMovable();

	this.removeSelectedIndicator();
	
	this.deselectHandler();
	
	this.startNoAnimationTimer();
	
	this.draw();
	
	/* inform all clients about the deselection */
	ObjectManager.informAboutDeselection(this.id);
	
}


/**
 * Adjusts the positions of all GUI controls of the object
 */
GeneralObject.adjustControls = function() {

	var self = this;
	
	var rep = this.getRepresentation();

	var couplingX = 0;
	var couplingY = 0;
	if (GUI.couplingModeActive) {
		if (ObjectManager.getIndexOfObject(this.id) != 'left') {
			couplingX = parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX('right');
			couplingY = GUI.getPanY('right');
		} else {
			couplingX = GUI.getPanX('left');
			couplingY = GUI.getPanY('left');
		}
	}
	
	if (this.controls) {
	$.each(this.controls, function(index, control) {
		
		/* Position: right, vertically centered */
		if (control.type == "x") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth()+couplingX;
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight()/2+couplingY;
		}
		
		/* Position: left, vertically centered */
		if (control.type == "x2") {
			var x = self.getViewBoundingBoxX()+couplingX;
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight()/2+couplingY;
		}

		/* Position: bottom, horizontally centered */
		if (control.type == "y") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth()/2+couplingX;
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight()+couplingY;
		}
		
		/* Position: top, horizontally centered */
		if (control.type == "y2") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth()/2+couplingX;
			var y = self.getViewBoundingBoxY()+couplingY;
		}
		
		/* Position: left, top */
		if (control.type == "xy1") {
			var x = self.getViewX()+couplingX;
			var y = self.getViewY()+couplingY;
		}
		
		/* Position: right, top */
		if (control.type == "xy2") {
			var x = self.getViewX()+self.getViewWidth()+couplingX;
			var y = self.getViewY()+couplingY;
		}
		
		/* Position: right, bottom */
		if (control.type == "xy3") {
			var x = self.getViewX()+self.getViewWidth()+couplingX;
			var y = self.getViewY()+self.getViewHeight()+couplingY;
		}
		
		/* Position: left, bottom */
		if (control.type == "xy4") {
			var x = self.getViewX()+couplingX;
			var y = self.getViewY()+self.getViewHeight()+couplingY;
		}

		$(control).attr("cx", x);
		$(control).attr("cy", y);
		
	});
	}

	GUI.userMarker.setPosition(this.id);
	
}

/**
 * Adds all possible controls for the object
 */
GeneralObject.addControls = function() {
		
	var self = this;
	
	this.controls = {};

	if (self.controlIsAllowed === undefined || self.controlIsAllowed("x") === true)
	this.addControl("x", function(dx, dy, startWidth, startHeight, rep) {
		
		if (self.resizeProportional()) {

			var width = startWidth+dx;
			var height = startHeight*(width/startWidth);

			if (width >= 10) {
				self.setViewWidth(width);
			}

			if (height >= 10) {
				self.setViewHeight(height);
			}
			
		} else {
			
			var width = startWidth+dx;
			
			if (width < 10) return;
			self.setViewWidth(width);
			
		}
		
	});
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("x2") === true)
	this.addControl("x2", function(dx, dy, startWidth, startHeight, rep, startX, startY) {

		if (self.resizeProportional()) {

			var width = startWidth-dx;
			var height = startHeight*(width/startWidth);

			var x =  startX+dx;

			if (width >= 10) {
				self.setViewWidth(width);
				self.setViewX(x);
			}

			if (height >= 10) {
				self.setViewHeight(height);
			}
			
		} else {
			
			var width = startWidth-dx;
			var x =  startX+dx;
			
			if (width < 10) return;
			self.setViewWidth(width);
			self.setViewX(x);
			
		}
		
	});

	if (self.controlIsAllowed === undefined || self.controlIsAllowed("y") === true)
	this.addControl("y", function(dx, dy, startWidth, startHeight, rep) {
		
		if (self.resizeProportional()) {
			
			var height = startHeight+dy;
			var width = startWidth*(height/startHeight);
			
			if (width >= 10) {
				self.setViewWidth(width);
			}

			if (height >= 10) {
				self.setViewHeight(height);
			}
			
		} else {
			
			var height = startHeight+dy;
			
			if (height < 10) return;
			self.setViewHeight(height);
			
		}
		
	});
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("y2") === true)
	this.addControl("y2", function(dx, dy, startWidth, startHeight, rep, startX, startY) {
		
		if (self.resizeProportional()) {
			
			var height = startHeight-dy;
			var width = startWidth*(height/startHeight);
			
			var y =  startY+dy;
			
			if (width >= 10) {
				self.setViewWidth(width);
			}

			if (height >= 10) {
				self.setViewHeight(height);
				self.setViewY(y);
			}
			
		} else {
			
			var height = startHeight-dy;
			var y =  startY+dy;
			
			if (height < 10) return;
			self.setViewHeight(height);
			self.setViewY(y);
			
		}
		
	});
	
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("xy1") === true)
	if (!self.resizeProportional())
	this.addControl("xy1", function(dx, dy, startWidth, startHeight, rep, startX, startY) {

		if (!self.resizeProportional()) {
			
			var width = startWidth-dx;
			var height = startHeight-dy;
			
			var x =  startX+dx;
			var y =  startY+dy;
			
			if (width >= 10 || self.ignoreMinDimensions === true) {
				self.setViewWidth(width);
				self.setViewX(x);
			}

			if (height >= 10 || self.ignoreMinDimensions === true) {
				self.setViewHeight(height);
				self.setViewY(y);
			}
			
		}
	
	});
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("xy2") === true)
	if (!self.resizeProportional())
	this.addControl("xy2", function(dx, dy, startWidth, startHeight, rep, startX, startY) {

		if (!self.resizeProportional()) {
			
			var width = startWidth+dx;
			var height = startHeight-dy;

			var y =  startY+dy;
			
			if (width >= 10 || self.ignoreMinDimensions === true) {
				self.setViewWidth(width);
			}

			if (height >= 10 || self.ignoreMinDimensions === true) {
				self.setViewHeight(height);
				self.setViewY(y);
			}
			
		}
	
	});
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("xy3") === true)
	this.addControl("xy3", function(dx, dy, startWidth, startHeight, rep) {
		
		if (self.resizeProportional()) {
			/* resize proportional */
			
			if (dx > dy) {
				
				var width = startWidth+dx;
				var height = startHeight*(width/startWidth);
				
			} else {
				
				var height = startHeight+dy;
				var width = startWidth*(height/startHeight);
				
			}
			
			if (width >= 10 && height >= 10) {
				self.setViewWidth(width);
				self.setViewHeight(height);
			}

		} else {
			
			var width = startWidth+dx;
			var height = startHeight+dy;
			
			if (width >= 10 | self.ignoreMinDimensions === true) {
				self.setViewWidth(width);
			}

			if (height >= 10 | self.ignoreMinDimensions === true) {
				self.setViewHeight(height);
			}
			
		}
		
	});
	
	if (self.controlIsAllowed === undefined || self.controlIsAllowed("xy4") === true)
	if (!self.resizeProportional())
	this.addControl("xy4", function(dx, dy, startWidth, startHeight, rep, startX, startY) {

		if (!self.resizeProportional()) {
			
			var width = startWidth-dx;
			var height = startHeight+dy;
			
			var x =  startX+dx;
			
			if (width >= 10 || self.ignoreMinDimensions === true) {
				self.setViewWidth(width);
				self.setViewX(x);
			}

			if (height >= 10 || self.ignoreMinDimensions === true) {
				self.setViewHeight(height);
			}
			
		}
	
	});
	
}

/**
 * Hides all controls of the object
 */
GeneralObject.hideControls = function() {
	$("#content").find(".webarenaControl").hide();
}

/**
 * Shows all controls of the object
 */
GeneralObject.showControls = function() {
	$("#content").find(".webarenaControl").show();
}

/**
 * Removes all controls of the object
 */
GeneralObject.removeControls = function() {
	
	$("#content").find(".webarenaControl_"+this.id).each(function() {
		GUI.svg.remove(this);
	});

	this.controls = {};
	
}

GeneralObject.onMoveStart=function(){
	GUI.hideActionsheet();
	GUI.hideLinks(this);
}

GeneralObject.onMoveEnd=function(){
	GUI.showLinks(this);
}

/**
 * Adds a single control
 * @param {ControlType} type The type of the new control (see GeneralObject.adjustControls / GeneralObject.addControls)
 * @param {Function} resizeFunction The function called when resizing the object
 */
GeneralObject.addControl = function(type, resizeFunction) {

	var self = this;

	var rep = this.getRepresentation();

	if (GUI.isTouchDevice) {
		/* touch */
		var radius = 11;
		var border = 3;
	} else {
		/* mouse */
		var radius = 7;
		var border = 2;
	}

	var control = GUI.svg.circle(
		10, //cx
		10, //cy
		radius, //radius
		{
			fill: "#008DDF",
			stroke: "#FFFFFF",
			strokeWidth: border,
		}
	);
	
	$(control).attr("class", "webarenaControl webarenaControl_"+this.id);
	$(control).attr("layer", 10000000);

	control.moving = false;
	
	control.type = type;
	

	var start = function(event) {
		
		event.preventDefault();
		event.stopPropagation();
		
		self.onMoveStart();

		control.startMouseX = event.pageX;
		control.startMouseY = event.pageY;
		control.objectStartWidth = self.getViewWidth();
		control.objectStartHeight = self.getViewHeight();
		control.objectStartX = self.getViewX();
		control.objectStartY = self.getViewY();

		control.moving = true;
		
		var move = function(event) {

			if (!control.moving) return;
			
			event.preventDefault();

			if (event.pageX) {
				/* mouse */
				var dx = event.pageX-control.startMouseX;
				var dy = event.pageY-control.startMouseY;
			} else {
				/* touch */
				var dx = event.targetTouches[0].pageX-control.startMouseX;
				var dy = event.targetTouches[0].pageY-control.startMouseY;
			}

			/* resize object */
			resizeFunction(dx, dy, control.objectStartWidth, control.objectStartHeight, rep, control.objectStartX, control.objectStartY);
			
			self.adjustControls();
			
			
					
		};
		
		var end = function(event) {
			
			event.preventDefault();
			
			control.moving = false;
			
			self.adjustControls();
			
			self.resizeHandler();
			
			self.onMoveEnd();
			
			if (!GUI.isTouchDevice) {
				/* mouse */
				$("#content").unbind("mousemove.webarenaMove");
				$("#content").unbind("mouseup.webarenaMove");
			} else {
				/* touch */
				$("#content").unbind("touchmove");
				$("#content").unbind("touchend");
			}
			
		};
		
		if (GUI.isTouchDevice) {
			/* touch */
			$("#content").get(0).addEventListener("touchmove", move, false);
			$("#content").get(0).addEventListener("touchend", end, false);			
		} else {
			/* mouse */
			$("#content").bind("mousemove.webarenaMove", move);
			$("#content").bind("mouseup.webarenaMove", end);
		}

			
	};
	
	
	
	if (GUI.isTouchDevice) {
		/* touch */
		control.addEventListener("touchstart", start, false);
	} else {
		/* mouse */
		$(control).bind("mousedown", start);
	}
	
	this.controls[type] = control;
	
	this.adjustControls();
	
}


/**
 * Saves the current position of the object
 * (used by GeneralObject.moveRelative)
 */
GeneralObject.saveMoveStartPosition = function() {
	if (GUI.couplingModeActive) { 
		if (ObjectManager.getIndexOfObject(this.id) === 'right') {
			this.moveObjectStartX = this.getViewX() + parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX('right');
			this.moveObjectStartY = this.getViewY() + GUI.getPanY('right');
		} else {
			this.moveObjectStartX = this.getViewX() + GUI.getPanX('left');
			this.moveObjectStartY = this.getViewY() + GUI.getPanY('left');
		}
	} else {
		this.moveObjectStartX = this.getViewX();
		this.moveObjectStartY = this.getViewY();
	}
}


/**
 * Start moving an object
 * @param {DomEvent} event The DOM event
 */
GeneralObject.moveStart = function(event) {

	if (!this.id || this.id == "") {
		var self = ObjectManager.getObject($(this).closest("svg>*").attr("id"));
	} else {
		var self = ObjectManager.getObject(this.id);
	}

	if (!self.selected) self.select();
	
	var contentPosition = $("#content").offset();

	event.preventDefault();
	event.stopPropagation();
	
	GUI.hideActionsheet();
	GUI.hideLinks(self);

	if (event.pageX) {
		/* mouse */
		self.moveStartMouseX = event.pageX;
		self.moveStartMouseY = event.pageY;
	} else {
		/* touch */
		self.moveStartMouseX = event.targetTouches[0].pageX;
		self.moveStartMouseY = event.targetTouches[0].pageY;
	}

	/* save start position for all selected objects */
	$.each(ObjectManager.getSelected(), function(index, object) {
		object.saveMoveStartPosition();

		if (GUI.couplingModeActive) {
			// append to main canvas
			var rep = object.getRepresentation();
			$(rep).appendTo('#canvas');

			// if object is in the right room adjust x coordinate on main canvas
			if (ObjectManager.getIndexOfObject(object.getId()) != 'left') {
				object.setViewX(object.getViewX() + parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX('right'));
				object.setViewY(object.getViewY() + GUI.getPanY('right'));
			} else {
				object.setViewX(object.getViewX() + GUI.getPanX('left'));
				object.setViewY(object.getViewY() + GUI.getPanY('left'));
			}
		}
	});

	self.moving = true;
	self.moved = false;
	
	self.hideControls();
	
	var move = function(event) {
		if (GUI.isTouchDevice && event.touches.length > 1) return;

		if (!self.moving) return;

		event.preventDefault();
		event.stopPropagation();
		
		self.moved = true;
		
		if (event.pageX) {
			/* mouse */
			var dx = event.pageX-self.moveStartMouseX;
			var dy = event.pageY-self.moveStartMouseY;
		} else {
			/* touch */
			var dx = event.targetTouches[0].pageX-self.moveStartMouseX;
			var dy = event.targetTouches[0].pageY-self.moveStartMouseY;
		}

		/* move all selected objects */
		$.each(ObjectManager.getSelected(), function(index, object) {
			object.moveRelative(dx, dy);
		});

	};
	
	var end = function(event) {
		var cut = !(event.ctrlKey || event.metaKey);

		var movedBetweenRooms = false;

		var rep = self.getRepresentation();
		if (GUI.couplingModeActive) {
			// coupling mode is switched on, determine if elements were moved between rooms
			if (parseInt($('#room_right_wrapper').attr('x')) < event.clientX) {
				GUI.defaultZoomPanState('right', false);
				if (ObjectManager.getIndexOfObject(self.getAttribute('id')) === 'left') {
					// moved from the left room to the right
					if (ObjectManager.getRoomID('right') != false) {
						$.each(ObjectManager.getSelected(), function(index, object) {
							var newX = object.getViewX() - $('#room_right_wrapper').attr('x') - GUI.getPanX('right');
							if (newX < 0) newX = 0;
							var newY = object.getViewY() - GUI.getPanY('right');

							object.setViewX(newX);
							object.setViewY(newY);

							if (cut) {
								$(object.getRepresentation()).appendTo('#room_right');
							}
						});

						GUI.startNoAnimationTimer();
						ObjectManager.moveObjectBetweenRooms(ObjectManager.getRoomID('left'), ObjectManager.getRoomID('right'), cut);

						if (!cut) {
							$.each(ObjectManager.getSelected(), function(index, object) {
								object.setViewX(object.moveObjectStartX);
								object.setViewY(object.moveObjectStartY);

								$(object.getRepresentation()).appendTo('#room_left');
							});
						}

						movedBetweenRooms = true;
					} else {
						$.each(ObjectManager.getSelected(), function(index, object) {
							object.setViewX(object.moveObjectStartX);
							object.setViewY(object.moveObjectStartY);

							$(object.getRepresentation()).appendTo('#room_left');
						});
						alert(GUI.translate('No room loaded.'));
					}
				} else {
					$.each(ObjectManager.getSelected(), function(index, object) {
						if (object.getViewX() > parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX('right')) {
							object.setViewX(object.getViewX() - parseInt($('#room_right_wrapper').attr('x')) - GUI.getPanX('right'));
						} else {
							object.setViewX(0);
						}
						object.setViewY(object.getViewY() - GUI.getPanY('right'));
						$(object.getRepresentation()).appendTo('#room_right');

						object.moveHandler();
					});
					GUI.updateLayers();
				}
			} else {
				GUI.defaultZoomPanState('left', false);
				if (ObjectManager.getIndexOfObject(self.getAttribute('id')) === 'right') {
					// moved from the right room to the left
					$.each(ObjectManager.getSelected(), function(index, object) {
						object.setViewX(object.getViewX() - GUI.getPanX('left'));
						object.setViewY(object.getViewY() - GUI.getPanY('left'));

						if (cut) {
							$(object.getRepresentation()).appendTo('#room_left');
						}
					});

					GUI.startNoAnimationTimer();
					ObjectManager.moveObjectBetweenRooms(ObjectManager.getRoomID('right'), ObjectManager.getRoomID('left'), cut);

					if (!cut) {
						$.each(ObjectManager.getSelected(), function(index, object) {
							object.setViewX(object.moveObjectStartX);
							object.setViewY(object.moveObjectStartY);

							$(object.getRepresentation()).appendTo('#room_right');
						});
					}

					movedBetweenRooms = true;
				} else {
					$.each(ObjectManager.getSelected(), function(index, object) {
						$(object.getRepresentation()).appendTo('#room_left');

						object.setViewX(object.getViewX() - GUI.getPanX('left'));
						object.setViewY(object.getViewY() - GUI.getPanY('left'));

						object.moveHandler();
					});
					GUI.updateLayers();
				}
			}
		}

		event.preventDefault();
		event.stopPropagation();
		
		self.moving = false;
		
		if (!movedBetweenRooms) {
			self.showControls();
			self.adjustControls();
		}
		
		GUI.showLinks(self);
		
		if (!self.moved) {
			if (!self.selectionClickActive) self.click(event);
		}
		
		self.selectionClickActive = false;
		
		if (GUI.isTouchDevice) {
			/* touch */
			$("#content").get(0).removeEventListener("touchmove", move, false);
			$("#content").get(0).removeEventListener("touchend", end, false);
			
		} else {
			/* mouse */
			$("#content").unbind("mousemove.webarenaMove");
			$("#content").unbind("mouseup.webarenaMove");
		}
		
	};

	if (GUI.isTouchDevice) {
		/* touch */
		$("#content").get(0).addEventListener("touchmove", move, false);
		$("#content").get(0).addEventListener("touchend", end, false);
	} else {
		/* mouse */
		$("#content").bind("mousemove.webarenaMove", move);
		$("#content").bind("mouseup.webarenaMove", end);
	}

	
}

/**
 * Sets event handlers to make the objects representation movable
 */
GeneralObject.makeMovable = function() {

	var self = this;
    var rep;

    if(this.restrictedMovingArea){
        rep = $(this.getRepresentation()).find(".moveArea").get(0);
    } else {
        rep = this.getRepresentation();
    }

	if (GUI.isTouchDevice) {
		/* touch */
		rep.ontouchstart = self.moveStart;
	} else {
		/* mouse */
		$(rep).bind("mousedown", self.moveStart);
	}
	

	
}

/**
 * Moves the object relative to the saved position of GeneralObject.saveMoveStartPosition
 * (used when moving groups of objects)
 * @param {int} dx Moved x distance
 * @param {int} dy Moved x distance
 */
GeneralObject.moveRelative = function(dx, dy) {
	if (this.getAttribute("locked")) return;

	this.setViewX(this.moveObjectStartX+dx);
	this.setViewY(this.moveObjectStartY+dy);

	this.adjustControls();

	if (!GUI.couplingModeActive) {
		this.moveHandler();
	}
	
}

/**
 * Moves the object by x/y px
 * @param {int} x Movement in x direction
 * @param {int} y Movement in y direction
 */
GeneralObject.moveBy = function(x, y) {

	this.setViewX(this.getViewX()+x);
	this.setViewY(this.getViewY()+y);
	
	this.adjustControls();
	
	this.moveHandler();
	
	GUI.hideLinks(this);
	GUI.showLinks(this);
	
}

/**
 * Removes all event handles for moving the object
 */
GeneralObject.unmakeMovable = function() {

	var rep;
    if(this.restrictedMovingArea){
        rep = $(this.getRepresentation()).find(".moveArea").get(0);
    } else {
        rep = this.getRepresentation();
    }
	
	$(rep).unbind("mousedown");

	//rep.removeEventListener("touchstart", self.moveStart, false);
	rep.ontouchstart = function() {};
	
}


/* view getter */

/**
 * get the x position of the object
 */
GeneralObject.getViewX = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("x"));
}

/**
 * get the y position of the object
 */
GeneralObject.getViewY = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("y"));
}

/**
 * get the width of the object
 */
GeneralObject.getViewWidth = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("width"));
}

/* get the height of the object */
GeneralObject.getViewHeight = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("height"));
}

/**
 * get the x position of the objects bounding box (this is the left position of the object)
 */
GeneralObject.getViewBoundingBoxX = function() {

	return this.getViewX();

	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		return this.getViewX();
	} else {
		return this.getRepresentation().getBBox().x;
	}

}

/**
 * get the y position of the objects bounding box (this is the top position of the object)
 */
GeneralObject.getViewBoundingBoxY = function() {
	
	return this.getViewY();
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		return this.getViewY();
	} else {
		return this.getRepresentation().getBBox().y;
	}
	
}

/**
 * get the width of the objects bounding box
 * @deprecated Some kind of deprecated because the objects width should be equal
 */
GeneralObject.getViewBoundingBoxWidth = function() {
	return parseInt(this.getRepresentation().getBBox().width);
}

/**
 * get the height of the objects bounding box
 * @deprecated Some kind of deprecated because the objects width should be equal
 */
GeneralObject.getViewBoundingBoxHeight = function() {
	return parseInt(this.getRepresentation().getBBox().height);
}




/* view setter */

/**
 * Sets the objects X position
 * @param {int} value The new X position
 */
GeneralObject.setViewX = function(value) {

	var self = this;
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		
		if (isNaN(self.getViewY())) {
			var y = 0;
		} else {
			var y = self.getViewY();
		}
		
		$(rep).attr("transform", "translate("+value+","+y+")");	
	}
	
	$(rep).attr("x", value);
	
	GUI.adjustContent(this);
	
}

/**
 * Sets the objects Y position
 * @param {int} value The new Y position
 */
GeneralObject.setViewY = function(value) {

	var self = this;

	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {

		if (isNaN(self.getViewX())) {
			var x = 0;
		} else {
			var x = self.getViewX();
		}
		
		$(rep).attr("transform", "translate("+x+","+value+")");
	}
	
	$(rep).attr("y", value);
	
	GUI.adjustContent(this);

}

/**
 * Sets the objects X and Y position (animated)
 * @param {int} x The new X position
 * @param {int} y The new Y position
 */
GeneralObject.setViewXYAnimated = function(x,y) {

	var self = this;
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform()) {
		$(rep).animate({svgTransform: "translate("+x+","+y+")"}, 1000);
		$(rep).attr("x", x);
		$(rep).attr("y", y);
	} else {
		$(rep).animate({svgX: x, svgY: y}, 1000);
	}
	
	GUI.adjustContent(this);
	
}



/**
 * Sets the objects width
 * @param {int} value The new width
 */
GeneralObject.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
}

/**
 * Sets the objects height
 * @param {int} value The new height
 */
GeneralObject.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
}


/**
 * Used by GeneralObject.click
 */
GeneralObject.clickTimeout = false;

/**
 * Click handler
 * (because we have to differ single click and double click)
 * @param {DomEvent} event The DOM click event
 */
GeneralObject.click = function(event) {
	var self = this;
	
	if (GUI.isTouchDevice) {
		self.clickHandler(event);
		return true;
	}
	
	/* stop when the clicked object is the SVG canvas */
	if (event.target == $("#content>svg").get(0)) return;

	if (self.clickTimeout) {
		/* second click */

		window.clearTimeout(self.clickTimeout);
		self.clickTimeout = false;

		if (GUI.shiftKeyDown) return;

		//perform dblclick action
		self.clickRevertHandler(event);

		self.dblclickHandler(event);

	} else {
		/* first click */

		/* set a timer (if another click is called while the timer is active, a second click is performed) */
		self.clickTimeout = window.setTimeout(function() {

			self.clickTimeout = false;

		}, 600);
		
		self.clickTimeout = true;
		
		self.clickHandler(event);
	
	}

}


/* HANDLER FUNCTIONS */

/**
 * Called after a click if performed
 * @param {DomEvent} event DOM click event
 */
GeneralObject.clickHandler = function(event) {
	
	if (GUI.isTouchDevice && event.touches.length > 1) {
		this.select(true); 
		event.stopPropagation();
		event.preventDefault();
		return true;
	}
	
	if (this.selected) {
        if(this.restrictedMovingArea && !$(event.target).hasClass("moveArea")){

        } else {
            this.selectedClickHandler(event);
        }
	} else {
		this.selectionClickActive = true; //this is used to prevent a second click-call by mouseup of move when selecting an object (otherwise this would result in an doubleclick)
		this.select();

		if(this.restrictedMovingArea && !$(event.target).hasClass("moveArea")){

		} else {
			
			this.moveStart(event);
		}
	}
	
}

/**
 * Called when a click was reverted by an double click event
 * @param {DomEvent} event DOM click event
 */
GeneralObject.clickRevertHandler = function(event) {
	/* for a faster feeling the click event is called when the first click is recognized, even if there will be a second (double) click. In case of a double click we have to revert the click action */
	this.deselect();
}

/**
 * Called after an object movement
 */
GeneralObject.moveHandler = function() {
	this.setPosition(this.getViewX(), this.getViewY());	
}

/**
 * Called after an object resizing
 */
GeneralObject.resizeHandler = function() {
	this.setDimensions(this.getViewWidth(), this.getViewHeight());
	this.setPosition(this.getViewX(), this.getViewY());
}

/**
 * Called after object selection
 */
GeneralObject.selectHandler = function() {
	GUI.updateInspector(true);
	GUI.showLinks(this);
}

/**
 * Called after object deselection
 */
GeneralObject.deselectHandler = function() {
	GUI.hideLinks(this);
}

/**
 * Called when a double click was performed
 * @param {DomEvent} event DOM click event
 */
GeneralObject.dblclickHandler = function(event) {

	this.execute(event);
}

/**
 * Called when a click was performed and the object is selected
 * @param {DomEvent} event DOM click event
 */
GeneralObject.selectedClickHandler = function(event) {


	if (GUI.shiftKeyDown) {
		this.deselect();
	} else {

		var x = this.getViewBoundingBoxX()+this.getViewBoundingBoxWidth()/2;
		var y = this.getViewBoundingBoxY();

		if (GUI.couplingModeActive) {
			var index = ObjectManager.getIndexOfObject(this.getId());
			if (index === 'right') {
				x += parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX(index);
			} else {
				x += GUI.getPanX(index);
			}
			y += GUI.getPanY(index);
		}

		GUI.showActionsheet(x, y, this);
	
	}
	
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
GeneralObject.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}

	if (fillcolor === 'transparent' && linecolor === 'transparent') {
		return false;
	} else return true;
}

/**
 * @deprecated No reference found. Remove?
 */
GeneralObject.setDisplayGhost = function(s) {
	this.displayGhost = s;
	this.draw();
}



