/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject view component
*
*/

GeneralObject.draw=function(){
	
	if (!this.isGraphical) return;
	
	var rep=this.getRepresentation();

	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));
	this.setViewX(this.getAttribute('x'));
	this.setViewY(this.getAttribute('y'));
			
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}
	
	this.adjustControls();
	
}


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
 * getRepresentation - get access to the dom representation of the object on
 *					   the surface.
 *
 * Always use this function to gain access to the representation. This should 
 * always be done in view-subsections of the objects and must never be done 
 * elsewhere.
 */
GeneralObject.getRepresentation=function(){

	if (!this.isGraphical) return;

	var rep=document.getElementById(this.getAttribute('id'));

	if (!rep){

		var rep = this.createRepresentation();
		this.representationCreated();
		return rep;
		
	}
	return rep;
}


GeneralObject.representationCreated = function() {
	this.bindMoveArea();
}


GeneralObject.createRepresentation = function() {

	if (!this.isGraphical) return;

	var rep = GUI.svg.rect(
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


GeneralObject.initGUI = function(rep) {
	
	var self = this;
	
	/*
	var clickHandler = function(event) {

		event.preventDefault();

		if (!self.selected) {
			self.click(event);
		}
		
	}

	if (GUI.isTouchDevice) {
		rep.addEventListener("touchstart", clickHandler, false);
	} else {
		$(rep).click(clickHandler);
	}
	*/
	
	if (this.getAttribute("shadow")) {
		$(rep).attr("filter", "url(#svg-drop-shadow)");
	}
	
}


GeneralObject.addSelectedIndicator = function() {

	var rep = this.getRepresentation();

	//$(rep).attr("filter", "url(#svg-selected)");
	
	this.oldAttrStroke = $(rep).attr("stroke");
	this.oldAttrStrokeWidth = $(rep).attr("stroke-width");
	
	if (this.oldAttrStroke == undefined) this.oldAttrStroke = "";
	if (this.oldAttrStrokeWidth == undefined) this.oldAttrStrokeWidth = 0;
	
	$(rep).attr("stroke", '#1F7BFE');
	$(rep).attr("stroke-width", "2");

	$(rep).addClass("selected");
	
}

GeneralObject.removeSelectedIndicator = function() {

	var rep = this.getRepresentation();

	if (this.getAttribute("shadow")) {
		//$(rep).attr("filter", "url(#svg-drop-shadow)");
	} else {
		//$(rep).attr("filter", "");
	}

	$(rep).attr("stroke", this.oldAttrStroke);
	$(rep).attr("stroke-width", this.oldAttrStrokeWidth);
	
	$(rep).removeClass("selected");
	
}


GeneralObject.select = function(multiple, groupSelect) {

	if (this.selected) return;
	
	GUI.hideActionsheet();

	if (GUI.hiddenObjectsVisible && !this.getAttribute("hidden")) return;
	if (!GUI.hiddenObjectsVisible && this.getAttribute("hidden")) return;

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
		this.addControls();
	}
	
	if (this.mayMove()) {
		this.makeMovable();
	}
	
	this.addSelectedIndicator();
	
	this.selectHandler();
	
	this.draw();
	
	//TODO: is this really needed?
	//GUI.refreshSVG();

}

GeneralObject.deselect = function() {

	if (!this.selected) return;

	this.selected = false;
	
	this.removeControls();
	this.unmakeMovable();

	this.removeSelectedIndicator();
	
	this.deselectHandler();
	
	this.draw();
	
}


GeneralObject.adjustControls = function() {
	
	var self = this;
	
	var rep = this.getRepresentation();
	
	if (this.controls) {
	$.each(this.controls, function(index, control) {
		
		if (control.type == "x") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth();
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight()/2;
		}

		if (control.type == "y") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth()/2;
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight();
		}
		
		if (control.type == "xy") {
			var x = self.getViewBoundingBoxX()+self.getViewBoundingBoxWidth();
			var y = self.getViewBoundingBoxY()+self.getViewBoundingBoxHeight();
		}

		$(control).attr("cx", x);
		$(control).attr("cy", y);
		
	});
	}
	
}

GeneralObject.addControls = function() {
		
	var self = this;
	
	this.controls = {};

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

	this.addControl("xy", function(dx, dy, startWidth, startHeight, rep) {
		
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
			
			if (width >= 10) {
				self.setViewWidth(width);
			}

			if (height >= 10) {
				self.setViewHeight(height);
			}
			
		}
		
		
	
	});
	
}

GeneralObject.hideControls = function() {
	$("#content").find(".webarenaControl").hide();
}

GeneralObject.showControls = function() {
	$("#content").find(".webarenaControl").show();
}

GeneralObject.removeControls = function() {
	
	$("#content").find(".webarenaControl_"+this.data.id).each(function() {
		GUI.svg.remove(this);
	});

	this.controls = {};
	
}

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
			strokeWidth: border
			//filter: "url(#svg-drop-shadow)"
		}
	);
	
	$(control).attr("class", "webarenaControl webarenaControl_"+this.data.id);
	$(control).attr("layer", 10000000);

	control.moving = false;
	
	control.type = type;
	

	var start = function(event) {
		
		event.preventDefault();
		event.stopPropagation();
		
		//TODO: is this really needed?
		//GUI.updateLayers();
		
		GUI.hideActionsheet();
		GUI.hideLinks(self);

		control.startMouseX = event.pageX;
		control.startMouseY = event.pageY;
		control.objectStartWidth = self.getViewWidth();
		control.objectStartHeight = self.getViewHeight();
		
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
			resizeFunction(dx, dy, control.objectStartWidth, control.objectStartHeight, rep);
			
			self.adjustControls();
			
			self.resizeHandler();
					
		};
		
		var end = function(event) {
			
			event.preventDefault();
			
			control.moving = false;
			
			self.adjustControls();
			
			GUI.showLinks(self);
			
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


GeneralObject.saveMoveStartPosition = function() {
	
	this.moveObjectStartX = this.getViewX();
	this.moveObjectStartY = this.getViewY();
	
}




GeneralObject.moveStart = function(event) {

	if (!this.id || this.id == "") {
		var self = ObjectManager.getObject($(this).parent().attr("id"));
	} else {
		var self = ObjectManager.getObject(this.id);
	}
	
	if (!self.selected) self.select();
	
	var contentPosition = $("#content").offset();
	
	if (!self.hasPixelAt(event.pageX-contentPosition.left, event.pageY-contentPosition.top)) {
		return;
	}


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
	
		event.preventDefault();
		event.stopPropagation();
		
		self.moving = false;
		
		self.showControls();
		self.adjustControls();
		
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

GeneralObject.makeMovable = function() {

	var self = this;
	
	var rep = this.getRepresentation();

	if (!this.restrictedMovingArea) {

		if (GUI.isTouchDevice) {
			/* touch */
			rep.ontouchstart = self.moveStart;
		} else {
			/* mouse */
			$(rep).bind("mousedown", self.moveStart);
		}
	
	}
	
}


GeneralObject.bindMoveArea = function() {

	if (!this.restrictedMovingArea) return;

	//find move area
	var rep = $(this.getRepresentation()).find(".moveArea").get(0);

	if (GUI.isTouchDevice) {
		/* touch */
		rep.ontouchstart = this.moveStart;
	} else {
		/* mouse */
		$(rep).bind("mousedown", this.moveStart);
	}
	
}


GeneralObject.moveRelative = function(dx, dy) {

	this.setViewX(this.moveObjectStartX+dx);
	this.setViewY(this.moveObjectStartY+dy);
	
	this.adjustControls();
	
	this.moveHandler();
	
}


GeneralObject.moveBy = function(x, y) {

	this.setViewX(this.getViewX()+x);
	this.setViewY(this.getViewY()+y);
	
	this.adjustControls();
	
	this.moveHandler();
	
	GUI.hideLinks(this);
	GUI.showLinks(this);
	
}


GeneralObject.unmakeMovable = function() {

	var rep = this.getRepresentation();
	
	$(rep).unbind("mousedown");

	//rep.removeEventListener("touchstart", self.moveStart, false);
	rep.ontouchstart = function() {};
	
}


/* view getter */

/* get the x position of the object (this must not be the left position of the object) */
GeneralObject.getViewX = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("x"));
}

/* get the y position of the object (this must not be the top position of the object) */
GeneralObject.getViewY = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("y"));
}

/* get the width of the object */
GeneralObject.getViewWidth = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("width"));
}

/* get the height of the object */
GeneralObject.getViewHeight = function() {
	var rep = this.getRepresentation();
	return parseInt($(rep).attr("height"));
}

/* get the x position of the objects bounding box (this is the left position of the object) */
GeneralObject.getViewBoundingBoxX = function() {

	var rep = this.getRepresentation();
	
	if (this.moveByTransform) {
		return this.getViewX();
	} else {
			return this.getRepresentation().getBBox().x;
	}

}

/* get the y position of the objects bounding box (this is the top position of the object) */
GeneralObject.getViewBoundingBoxY = function() {
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform) {
		return this.getViewY();
	} else {
			return this.getRepresentation().getBBox().y;
	}
	
}

/* get the width of the objects bounding box */
GeneralObject.getViewBoundingBoxWidth = function() {
	return parseInt(this.getRepresentation().getBBox().width);
}

/* get the height of the objects bounding box */
GeneralObject.getViewBoundingBoxHeight = function() {
	return parseInt(this.getRepresentation().getBBox().height);
}




/* view setter */

GeneralObject.setViewX = function(value) {

	var self = this;
	
	var rep = this.getRepresentation();
	
	if (this.moveByTransform) {
		$(rep).attr("transform", "translate("+value+","+self.getViewY()+")");	
	}
	
	$(rep).attr("x", value);
	
	GUI.adjustContent(this);
	
}

GeneralObject.setViewY = function(value) {

	var self = this;

	var rep = this.getRepresentation();
	
	if (this.moveByTransform) {
		$(rep).attr("transform", "translate("+self.getViewX()+","+value+")");
	}
	
	$(rep).attr("y", value);
	
	GUI.adjustContent(this);

}

GeneralObject.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
}

GeneralObject.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
}


GeneralObject.clickTimeout = false;

/* our own click handler (because we have to differ single click and double click) */
GeneralObject.click = function(event) {

	var self = this;
	
	if (GUI.isTouchDevice) {
		self.clickHandler(event);
		return true;
	}
	
	if (event == undefined) {
		//self.clickTimeout = false; //TODO: needed?
	}

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

		self.clickTimeout = window.setTimeout(function() {

			self.clickTimeout = false;

		}, 600);
		
		self.clickTimeout = true;
		
		self.clickHandler(event);
	
	}

}



/* handler functions */

GeneralObject.clickHandler = function(event) {
	
	if (GUI.isTouchDevice && event.touches.length > 1) {
		this.select(true); //multi select
		event.stopPropagation();
		event.preventDefault();
		return true;
	}
	
	if (this.selected) {
		this.selectedClickHandler(event);
	} else {
		this.selectionClickActive = true; //this is used to prevent a second click-call by mouseup of move when selecting an object (otherwise this would result in an doubleclick)
		this.select();
		this.moveStart(event);
	}
}

GeneralObject.clickRevertHandler = function(event) {
	/* for a faster feeling the click event is called when the first click is recognized, even if there will be a second (double) click. In case of a double click we have to revert the click action */
	this.deselect();
}

GeneralObject.moveHandler = function() {
	this.setPosition(this.getViewX(), this.getViewY());	
}

GeneralObject.resizeHandler = function() {
	this.setDimensions(this.getViewWidth(), this.getViewHeight());
}

GeneralObject.selectHandler = function() {
	GUI.updateInspector();
	GUI.showLinks(this);
}

GeneralObject.deselectHandler = function() {
	GUI.hideLinks(this);
}

GeneralObject.dblclickHandler = function(event) {

	this.execute(event);
}

GeneralObject.selectedClickHandler = function(event) {

	if (GUI.shiftKeyDown) {
		this.deselect();
	} else {

		var x = this.getViewBoundingBoxX()+this.getViewBoundingBoxWidth()/2;
		var y = this.getViewBoundingBoxY();

		GUI.showActionsheet(x, y, this);
	
	}
	
}

GeneralObject.setDisplayGhost = function(s) {
	this.displayGhost = s;
	this.draw();
}



