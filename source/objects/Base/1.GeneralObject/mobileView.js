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

	if (!this.isVisible()) {
		return;
	}
	if (!this.isGraphical) return;
	
	var rep=this.getRepresentation();
	
	//this.setViewWidth(this.getAttribute('width'));
	//this.setViewHeight(this.getAttribute('height'));
	
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
}

/**
 * Updates the position of the representation
 * @param {bool} external True if triggered externally (and not by the object itself)
 */
GeneralObject.drawPosition = function(external) {

	/* animations can be prevented using the objects function "startNoAnimationTimer" and the clients global function "GUI.startNoAnimationTimer" */
	if (external === true && !this.selected && this.noAnimation == undefined && GUI.noAnimation == undefined) {
		/* set position animated when not called locally */
		//this.setViewXYAnimated(this.getAttribute('x'), this.getAttribute('y'));
	} else {
		/* set position without animation */
		//this.setViewX(this.getAttribute('x'));
		//this.setViewY(this.getAttribute('y'));
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

	if (!this.isVisible()) {
		return;
	}
	if (!this.isGraphical) return;

	var rep = document.getElementById(this.getAttribute('id'));
	
	// Do we have no representation?
	if (!rep) {
		var parent = $('#objectview');
		var rep = this.createRepresentation(parent);
		this.representationCreated();
	}
	
	rep.dataObject = this;
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

	if (!this.isVisible()) {
		return;
	}
	if (!this.isGraphical) return;
	
	var rep = GUI.svg.group();
	//var rep = GUI.svg.rect(parent,
	//	10, //x
	//	10, //y
	//	10, //width
	//	10 //height
	//);
	
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
 * Deselects the object
 */
GeneralObject.deselect = function() {}

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

GeneralObject.setVisibility = function(visibility) {
	this.visibility = visibility;
}

GeneralObject.isVisible = function() {
	return this.visibility;
}
