"use strict";

/* paint */

/**
 * true if paint mode is active
 */
GUI.paintModeActive = false;
GUI.paintColors = [];
GUI.paintSizes = [];

$(window).resize(function() {		
	GUI.resizePaintToolbar();
});


/**
 * Set a color to paint with
 * @param {String} color The (hex-) color to paint with
 * @param {String} colorName The colors name
 */
GUI.setPaintColor = function(color, colorName){
	GUI.paintColor = color;
	GUI.setPaintCursor(colorName);
	GUI.setPaintMode(GUI.paintMode);
	$("#header").find(".jPaint_navi_color").removeClass("active");
	$("#header").find(".jPaint_navi_color_"+colorName).addClass("active");
}


/**
 * Set pen or highlight mode
 * @param {String} pen or highlighter
 */
GUI.setPaintMode = function(mode){
	if(mode == "pen"){
		GUI.paintMode = "pen";
		GUI.paintEraseModeActive = false;
		GUI.paintOpacity = 1;
		$("#header").find("#pen_button").addClass("active");
		$("#header").find("#highlighter_button").removeClass("active");
		$("#header").find("#eraser_button").removeClass("active");
	}
	else if(mode == "highlighter"){
		GUI.paintMode = "highlighter";
		GUI.paintEraseModeActive = false;
		GUI.paintOpacity = 0.01;
		$("#header").find("#highlighter_button").addClass("active");
		$("#header").find("#pen_button").removeClass("active");
		$("#header").find("#eraser_button").removeClass("active");
	}
	else if(mode == "eraser"){
		GUI.paintEraseModeActive = true;
		$("#header").find("#eraser_button").addClass("active");
		$("#header").find("#highlighter_button").removeClass("active");
		$("#header").find("#pen_button").removeClass("active");
	}
}


/**
 * Set the cursor
 * @param {String} cursorName The name of the cursor icon
 */
GUI.setPaintCursor = function(cursorName){
	GUI.paintCursor = "../../guis.common/images/paint/cursors/"+cursorName+".png";
}


/**
 * Set the size of the "pencil"
 * @param {int} value Size of the "pencil"
 */
GUI.setPaintSize = function(value){
	GUI.paintSize = value;
	GUI.setPaintMode(GUI.paintMode);
	$("#header").find(".jPaint_navi_size").removeClass("active");
	$("#header").find(".jPaint_navi_size_"+value).addClass("active");
}


var COPY = {	
	started: false,
	selecting: false,
	dragging: false,
	enabled: false,

	sourceX: 0,
	sourceY: 0,
	sourceXTemp: 0,
	sourceYTemp: 0,
	destX: 0,
	destY: 0,

	draggingOffsetX: 0,
	draggingOffsetY: 0,

	timingPaste: 0,
	mouseOverSelectionBox: false,
				
	start: null,
	move: null,
	end: null,
	paste: null,
	cancel: null
};


var CUT = {		
	started: false,
	selecting: false,
	dragging: false,
	enabled: false,

	sourceX: 0,
	sourceY: 0,
	sourceXTemp: 0,
	sourceYTemp: 0,
	destX: 0,
	destY: 0,

	draggingOffsetX: 0,
	draggingOffsetY: 0,

	selectionData: "",
	timingPaste: 0,
	mouseOverSelectionBox: false,
	
	start: null,
	move: null,
	end: null,
	paste: null,
	cancel: null
};


var ERASER = {	
	enabled: false,
	selecting: false,
	x: 0,
	y: 0,
	xTemp: 0,
	yTemp: 0,
	width: 0,
	height: 0,  
	
	start: null,
	move: null,
	end: null
};


ERASER.start = function(event){
	if (!ERASER.enabled) return;
	
	event.preventDefault();
	event.stopPropagation();
	
	if(GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}
	
	ERASER.selecting = true;
	
	// start creating selection frame
	ERASER.xTemp = x;
	ERASER.yTemp = y;

	GUI.paintContextTemp.strokeStyle = 'rgba(0,0,255,1)';
	GUI.paintContextTemp.lineWidth = 2;
};


ERASER.move = function(event){
	if (!ERASER.enabled || !ERASER.selecting) return;

	if (GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}
	
	// creating selection frame
	ERASER.x = Math.min(x, ERASER.xTemp);
	ERASER.y = Math.min(y, ERASER.yTemp);
	ERASER.width = Math.abs(x - ERASER.xTemp);
	ERASER.height = Math.abs(y - ERASER.yTemp);

	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
	if (!ERASER.width || !ERASER.height) return; 
	GUI.paintContextTemp.strokeRect(ERASER.x, ERASER.y, ERASER.width, ERASER.height);
};


ERASER.end = function(event){
	if (!ERASER.enabled || !ERASER.selecting) return;

	ERASER.selecting = false;
	ERASER.enabled = false;
	
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	$(".header_button").css("display", "inline");
	$("#abort_button").css("display", "none");
		
	GUI.paintContext.clearRect(ERASER.x, ERASER.y, ERASER.width, ERASER.height);
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	GUI.savePaintMode();
};


COPY.start = function(event){
	if (!COPY.enabled) return;

	event.preventDefault();
	event.stopPropagation();
	
	if (GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	COPY.started = true;
	
	$(".header_button").css("display", "none");
	$("#abort_button").css("display", "inline");
	
	//$("#statusLabel").html(GUI.translate("Mode") + ": " + GUI.translate("copy"));
	//$("#statusLabel").css("display", "inline");
	
	if(!COPY.selecting){
		// start creating selection frame
		COPY.sourceXTemp = x;
		COPY.sourceYTemp = y;

		GUI.paintContextTemp.strokeStyle = 'rgba(0,0,255,1)';
		GUI.paintContextTemp.lineWidth = 2;
	}
	else if(!COPY.dragging && COPY.mouseOverSelectionBox){
		// start moving selection frame
		COPY.dragging = true;
		COPY.draggingOffsetX =  x - COPY.destX;
		COPY.draggingOffsetY =  y - COPY.destY;
		clearTimeout(COPY.timingPaste);
	}
	else return;
};


COPY.move = function(event){
	if (!COPY.enabled) return;

	event.preventDefault();
	event.stopPropagation();

	if (GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	if (!COPY.started) return;

	if (!COPY.selecting){
		// creating selection frame
		COPY.sourceX = Math.min(x, COPY.sourceXTemp);
		COPY.sourceY = Math.min(y, COPY.sourceYTemp);
		COPY.sourceW = Math.abs(x - COPY.sourceXTemp);
		COPY.sourceH = Math.abs(y - COPY.sourceYTemp);

		COPY.destX = COPY.sourceX;
		COPY.destY = COPY.sourceY;
		
		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		if (!COPY.sourceW || !COPY.sourceH) return;
		GUI.paintContextTemp.strokeRect(COPY.sourceX, COPY.sourceY, COPY.sourceW, COPY.sourceH);
	}
	else if (!COPY.dragging){
		// selection frame drawn
		COPY.mouseOverSelectionBox = ( COPY.destX < x && x < COPY.destX + COPY.sourceW ) && ( COPY.destY < y && y < COPY.destY + COPY.sourceH );
	
		if (COPY.mouseOverSelectionBox) $(GUI.paintCanvasTemp).css("cursor", "move");
		else $(GUI.paintCanvasTemp).css("cursor", "crosshair");
	}
	else{
		// selection frame currently moving
		COPY.destX = x - COPY.draggingOffsetX;
		COPY.destY = y - COPY.draggingOffsetY;

		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		GUI.paintContextTemp.strokeRect(COPY.destX, COPY.destY, COPY.sourceW, COPY.sourceH);
		
		GUI.paintContextTemp.drawImage(
			GUI.paintCanvas,
			COPY.sourceX, // source x	 
			COPY.sourceY, // source y
			COPY.sourceW, // source width
			COPY.sourceH, // source height
			COPY.destX, // dest x
			COPY.destY, // dest y
			COPY.sourceW, // dest width
			COPY.sourceH // dest height
		);
	}
};


COPY.end = function(event){
	if (!COPY.enabled) return;

	event.preventDefault();
	event.stopPropagation();

	if (!COPY.selecting){
		// selection frame just created
		COPY.selecting = true;
	}
	else if (COPY.dragging){
		// selection frame just moved
		COPY.dragging = false;
		//COPY.timingPaste = setTimeout(function(){COPY.paste();}, 2000);
		COPY.timingPaste = setTimeout(function(){COPY.paste();}, 0);
	}
};


COPY.paste = function(){
	COPY.started = false;
	COPY.selecting = false;
	COPY.dragging = false;
	COPY.enabled = false;

	GUI.paintContext.drawImage(GUI.paintCanvas,
		COPY.sourceX, // source x	 
		COPY.sourceY, // source y
		COPY.sourceW, // source width
		COPY.sourceH, // source height
		COPY.destX, // dest x
		COPY.destY, // dest y
		COPY.sourceW, // dest width
		COPY.sourceH // dest height
	);

	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(COPY.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abort_button").css("display", "none");
	GUI.resizePaintToolbar();
	//$("#statusLabel").css("display", "none");
	
	GUI.savePaintMode();
};


COPY.cancel = function(){
	COPY.started = false;
	COPY.selecting = false;
	COPY.dragging = false;
	COPY.enabled = false;
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(COPY.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abort_button").css("display", "none");
	//$("#statusLabel").css("display", "none");
};


CUT.start = function(event){
	if (!CUT.enabled) return;

	event.preventDefault();
	event.stopPropagation();
	
	if (GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	CUT.started = true;
	
	$(".header_button").css("display", "none");
	$("#abort_button").css("display", "inline");
	
	//$("#statusLabel").html(GUI.translate("Mode") + ": " + GUI.translate("cut"));
	//$("#statusLabel").css("display", "inline");

	if (!CUT.selecting){
		// start creating selection frame
		CUT.sourceXTemp = x;
		CUT.sourceYTemp = y;

		GUI.paintContextTemp.strokeStyle = 'rgba(0,0,255,1)';
		GUI.paintContextTemp.lineWidth = 2;
	}
	else if (!CUT.dragging && CUT.mouseOverSelectionBox){
		// start moving selection frame
		CUT.dragging = true;
		CUT.draggingOffsetX =  x - CUT.destX;
		CUT.draggingOffsetY =  y - CUT.destY;
		clearTimeout(CUT.timingPaste);
	}
	else return;
};


CUT.move = function(event){
	if (!CUT.enabled) return;

	event.preventDefault();
	event.stopPropagation();

	if (GUI.isTouchDevice){
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0){ // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0){ // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	if (!CUT.started) return;

	if (!CUT.selecting){
		// creating selection frame
		CUT.sourceX = Math.min(x, CUT.sourceXTemp);
		CUT.sourceY = Math.min(y, CUT.sourceYTemp);
		CUT.sourceW = Math.abs(x - CUT.sourceXTemp);
		CUT.sourceH = Math.abs(y - CUT.sourceYTemp);

		CUT.destX = CUT.sourceX;
		CUT.destY = CUT.sourceY;
		
		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		if (!CUT.sourceW || !CUT.sourceH) return;
		GUI.paintContextTemp.strokeRect(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
	}
	else if (!CUT.dragging){
		// selection frame drawn
		CUT.mouseOverSelectionBox = ( CUT.destX < x && x < CUT.destX + CUT.sourceW ) && ( CUT.destY < y && y < CUT.destY + CUT.sourceH );
	
		if (CUT.mouseOverSelectionBox) $(GUI.paintCanvasTemp).css("cursor", "move");
		else $(GUI.paintCanvasTemp).css("cursor", "crosshair");
	}
	else{
		// selection frame currently moving
		CUT.destX = x - CUT.draggingOffsetX;
		CUT.destY = y - CUT.draggingOffsetY;

		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		
		GUI.paintContextTemp.strokeRect(CUT.destX, CUT.destY, CUT.sourceW, CUT.sourceH);
		GUI.paintContextTemp.putImageData(CUT.selectionData, CUT.destX, CUT.destY);
	}
};


CUT.end = function(event){
	if (!CUT.enabled) return;

	event.preventDefault();
	event.stopPropagation();

	if (!CUT.selecting){
		// selection frame just created
		CUT.selecting = true;
		
		CUT.selectionData = GUI.paintContext.getImageData(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
		GUI.paintContext.clearRect(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
		GUI.paintContextTemp.putImageData(CUT.selectionData, CUT.sourceX, CUT.sourceY);
	}
	else if (CUT.dragging){
		// selection frame just moved
		CUT.dragging = false;
		//CUT.timingPaste = setTimeout(function(){CUT.paste();}, 2000);
		CUT.timingPaste = setTimeout(function(){CUT.paste();}, 0);
	}
};


CUT.paste = function(){

	CUT.started = false;
	CUT.selecting = false;
	CUT.dragging = false;
	CUT.enabled = false;
	
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');

	tempCanvas.width = CUT.selectionData.width;
	tempCanvas.height = CUT.selectionData.height;
	
	tempContext.putImageData(CUT.selectionData, 0, 0);
	
	GUI.paintContext.drawImage(tempCanvas, CUT.destX, CUT.destY);
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(CUT.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abort_button").css("display", "none");
	GUI.resizePaintToolbar();
	//$("#statusLabel").css("display", "none");
	
	GUI.savePaintMode();
};


CUT.cancel = function(){
	CUT.started = false;
	CUT.selecting = false;
	CUT.dragging = false;
	CUT.enabled = false;
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	GUI.paintContext.putImageData(CUT.selectionData, CUT.sourceX, CUT.sourceY);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(CUT.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abort_button").css("display", "none");
	//$("#statusLabel").css("display", "none");
};


/**
 * Reset all paint colors
 */
GUI.resetPaintColors = function(){
	GUI.paintColors = [];
}


/**
 * Reset all paint sizes
 */
GUI.resetPaintSizes = function(){
	GUI.paintSizes = [];
}


/**
 * Add a paint color
 * @param {String} color The (hex-) color value
 * @param {String} colorName The colors name
 */
GUI.addPaintColor = function(color, colorName){
	if (colorName == undefined){
		colorName = color;
	}
	GUI.paintColors.push([color,colorName]);
}


/**
 * Set the size of the "pencil"
 * @param {int} size Size of the "pencil"
 */
GUI.addPaintSize = function(size){
	GUI.paintSizes.push(size);
}


/**
 * Enter the paint edit mode
 * @param {webarenaObject} webarenaObject The webarena object to save/load the paint data
 * @param {bool} highlighterMode True if the paint mode should be displayed in highlighter mode (different colors, sizes and opacity)
 */
GUI.editPaint = function(){

	GUI.painted = false;
	GUI.paintModeActive = true;
	GUI.sidebar.saveStateAndHide();
	GUI.deselectAllObjects();
	
	$("#header > div.header_left").children().hide();
	$("#header > div.header_right").children().hide();
	$("#header_toggle_sidebar_show").hide();
	$("img[id^='userPainting_']").hide();
	
	GUI.resetPaintColors();
	GUI.addPaintColor(ObjectManager.getUser().color, "usercolor");
	GUI.addPaintColor("#000000", "black");
	GUI.addPaintColor("#ff0000", "red");
	GUI.addPaintColor("#008000", "green");
	GUI.addPaintColor("#0000ff", "blue");
	GUI.addPaintColor("#ffff00", "yellow");
	GUI.resetPaintSizes();
	
	GUI.addPaintSize(1);
	GUI.addPaintSize(3);
	GUI.addPaintSize(7);
	
	GUI.addPaintSize(14);
	GUI.addPaintSize(20);
	GUI.addPaintSize(24);
	
	/* add color selection */
	/*
	$.each(GUI.paintColors, function(index, color){
		var colorSelection = document.createElement("img");
		$(colorSelection).attr("src", "../../guis.common/images/paint/colors/"+color[1]+".png");
		$(colorSelection).addClass("jPaint_navi");
		$(colorSelection).addClass("jPaint_navi_color");
		$(colorSelection).addClass("jPaint_navi_color_"+color[1]);
		$(colorSelection).bind("click", function(event){
			GUI.setPaintColor(color[0], color[1]);
		});

		$("#header > div.header_left").append(colorSelection);
		
	});
	*/
	
	/*add color selection menu */
    var colorSelectionButton = document.createElement("img");
    $(colorSelectionButton).attr("src", "../../guis.common/images/paint/colors/colors.png").attr("alt", "");
    $(colorSelectionButton).attr("width", "24").attr("height", "24");
    $(colorSelectionButton).attr("id", "color_selection_button");
    $(colorSelectionButton).addClass("sidebar_button");
	$(colorSelectionButton).addClass("jPaint_navi");
    $(colorSelectionButton).attr("title", GUI.translate("Color Selection"));
	$("#header > div.header_left").append(colorSelectionButton);

    $(colorSelectionButton).jPopover({
        positionOffsetX: 0,
        positionOffsetY: 20,
        arrowOffsetRight: 12,
		minWidth : 150,
        onSetup: function(domEl, popover) {

            Object.defineProperty(popover.options, 'positionOffsetX', {
                get: function() {
                    return 7 + $("#header > .header_left").position().left;
                }
            });
            Object.defineProperty(popover.options, 'arrowOffsetRight', {
                get: function() {
                    return 30 + $("#header > .header_left").position().left;
                }
            });

            var page = popover.addPage(GUI.translate("Color Selection"));
            var section = page.addSection();

			/* add colors */
			$.each(GUI.paintColors, function(index, color){
		
				var colorButton = document.createElement("img");
				$(colorButton).attr("src", "../../guis.common/images/paint/colors/"+color[1]+".png").attr("alt", "");
				$(colorButton).attr("width", "24").attr("height", "24");
				$(colorButton).attr("id", color[1]);
				$(colorButton).css("opacity", 1);
				$(colorButton).addClass("sidebar_button");
				$(colorButton).attr("title", GUI.translate(color[1]));
				var btnColor = section.addElement($(colorButton).prop('outerHTML') + GUI.translate(color[1])); //add menu icon
				var clickColor = function() { //click handler
					GUI.setPaintColor(color[0], color[1]);
					popover.hide();
				};
	  
				if (GUI.isTouchDevice) {
					$(btnColor.getDOM()).bind("touchstart", clickColor);
				} else {
					$(btnColor.getDOM()).bind("mousedown", clickColor);
				}
			});
			
			//add color picker widget
			var element = section.addElement(GUI.translate('custom') + ':');
			var widget = element.addWidget("color");
			widget.setColor("transparent");
			$(element.getDOM()).css("height", "14px");
			widget.onChange(function(value){
				//console.log(value);
				var val = value.replace(/\s/g, "").replace("rgb(", "").replace(")", "");
				var rgb = val.split(",");
				GUI.paintColor = "#"+GUI.convertRGBToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
			});
			
        }
    });
	
	/* add size selection */
	/*
	$.each(GUI.paintSizes, function(index, size){
		var sizeSelection = document.createElement("img");
		$(sizeSelection).attr("src", "../../guis.common/images/paint/sizes/"+size+".png");
		$(sizeSelection).addClass("jPaint_navi");
		$(sizeSelection).addClass("jPaint_navi_size");
		$(sizeSelection).addClass("jPaint_navi_size_"+size);
		$(sizeSelection).bind("click", function(event){
			GUI.setPaintSize(size);
		});

		$("#header > div.header_left").append(sizeSelection);
		
	});
	*/
	
	/*add size selection menu */
    var sizeSelectionButton = document.createElement("img");
    $(sizeSelectionButton).attr("src", "../../guis.common/images/paint/sizes/sizes.png").attr("alt", "");
    $(sizeSelectionButton).attr("width", "24").attr("height", "24");
    $(sizeSelectionButton).attr("id", "size_selection_button");
    $(sizeSelectionButton).addClass("sidebar_button");
	$(sizeSelectionButton).addClass("jPaint_navi");
    $(sizeSelectionButton).attr("title", GUI.translate("Size Selection"));
	$("#header > div.header_left").append(sizeSelectionButton);

    $(sizeSelectionButton).jPopover({
        positionOffsetX: 0,
        positionOffsetY: 20,
        arrowOffsetRight: 12,
		minWidth : 120,
        onSetup: function(domEl, popover) {

            Object.defineProperty(popover.options, 'positionOffsetX', {
                get: function() {
                    return 7 + $("#header > .header_left").position().left;
                }
            });
            Object.defineProperty(popover.options, 'arrowOffsetRight', {
                get: function() {
                    return 30 + $("#header > .header_left").position().left;
                }
            });

            var page = popover.addPage(GUI.translate("Size Selection"));
            var section = page.addSection();

			/* add sizes */
			$.each(GUI.paintSizes, function(index, size){
		
				var sizeButton = document.createElement("img");
				$(sizeButton).attr("src", "../../guis.common/images/paint/sizes/"+size+"_grey.png").attr("alt", "");
				$(sizeButton).attr("width", "24").attr("height", "24");
				$(sizeButton).attr("id", size);
				$(sizeButton).addClass("sidebar_button");
				$(sizeButton).attr("title", size);
				var btnSize = section.addElement($(sizeButton).prop('outerHTML') + size + " Pixel"); //add menu icon
				var clickSize = function() { //click handler
					GUI.setPaintSize(size);
					popover.hide();
				};
	  
				if (GUI.isTouchDevice) {
					$(btnSize.getDOM()).bind("touchstart", clickSize);
				} else {
					$(btnSize.getDOM()).bind("mousedown", clickSize);
				}
			});
        }
    });
	
	
	/*add pen selection menu*/
    var penSelectionButton = document.createElement("img");
    $(penSelectionButton).attr("src", "../../guis.common/images/paint/Pens.png").attr("alt", "");
    $(penSelectionButton).attr("width", "24").attr("height", "24");

    $(penSelectionButton).attr("id", "pen_selection_button");
    $(penSelectionButton).addClass("sidebar_button");
	$(penSelectionButton).addClass("jPaint_navi");
    $(penSelectionButton).attr("title", GUI.translate("Pen Selection"));
    $("#header > .header_left").append(penSelectionButton);
	
    $(penSelectionButton).jPopover({
        positionOffsetX: 0,
        positionOffsetY: 20,
        arrowOffsetRight: 12,
		minWidth : 160,
        onSetup: function(domEl, popover) {

            Object.defineProperty(popover.options, 'positionOffsetX', {
                get: function() {
                    return 7 + $("#header > .header_left").position().left;
                }
            });
            Object.defineProperty(popover.options, 'arrowOffsetRight', {
                get: function() {
                    return 30 + $("#header > .header_left").position().left;
                }
            });

            var page = popover.addPage(GUI.translate("Pen Selection"));
            var section = page.addSection();

			
			/*add pen button*/
			var penButton = document.createElement("img");
			$(penButton).attr("src", "../../guis.common/images/paint_grey.png").attr("alt", "");
			$(penButton).attr("width", "24").attr("height", "24");
			$(penButton).attr("id", "pen_button");
			$(penButton).addClass("sidebar_button");
			$(penButton).attr("title", GUI.translate("Pen"));
			var btnPen = section.addElement($(penButton).prop('outerHTML') + GUI.translate("Pen")); //add menu icon
			$(penButton).attr("src", "../../guis.common/images/paint.png").attr("alt", "");	
			$(penButton).addClass("jPaint_navi");		
			$("#header > .header_left").append(penButton); //add header icon
			var clickPen = function() { //click handler
				GUI.setPaintMode("pen");
				GUI.paintEraseModeActive = false;
                popover.hide();
            };
			
			
			/*add highlighter button*/
			var highlighterButton = document.createElement("img");
			$(highlighterButton).attr("src", "../../guis.common/images/categories/Highlighters_grey.png").attr("alt", "");
			$(highlighterButton).attr("width", "24").attr("height", "24");
			$(highlighterButton).attr("id", "highlighter_button");
			$(highlighterButton).addClass("sidebar_button");
			$(highlighterButton).attr("title", GUI.translate("Highlighter"));
			var btnHighlighter = section.addElement($(highlighterButton).prop('outerHTML') + GUI.translate("Highlighter")); //add menu icon
			$(highlighterButton).attr("src", "../../guis.common/images/categories/Highlighters.png").attr("alt", "");
			$(highlighterButton).addClass("jPaint_navi");			
			$("#header > .header_left").append(highlighterButton); //add header icon
			var clickHighlighter = function() { //click handler
				GUI.setPaintMode("highlighter");
				GUI.paintEraseModeActive = false;
                popover.hide();
            };
			
			
			/*add eraser button*/
			var eraserButton = document.createElement("img");
			$(eraserButton).attr("src", "../../guis.common/images/paint/eraser.png").attr("alt", "");
			$(eraserButton).attr("width", "24").attr("height", "24");
			$(eraserButton).attr("id", "eraser_button");
			$(eraserButton).addClass("sidebar_button");
			$(eraserButton).attr("title", GUI.translate("Eraser"));
			var btnEraser = section.addElement($(eraserButton).prop('outerHTML') + GUI.translate("Eraser")); //add menu icon
			$(eraserButton).addClass("jPaint_navi");
			$("#header > .header_left").append(eraserButton); //add header icon
			var clickEraser  = function() { //click handler
				GUI.setPaintMode("eraser");
				GUI.setPaintCursor("eraser");
				GUI.paintEraseModeActive = true;
                popover.hide();
            };
 
			
            if (GUI.isTouchDevice) {
				//header:
				$(penButton).bind("touchstart", clickPen);
				$(highlighterButton).bind("touchstart", clickHighlighter);
				$(eraserButton).bind("touchstart", clickEraser);
				//menu:
				$(btnPen.getDOM()).bind("touchstart", clickPen);
				$(btnHighlighter.getDOM()).bind("touchstart", clickHighlighter);
				$(btnEraser.getDOM()).bind("touchstart", clickEraser);
            } else {
				//header:
				$(penButton).bind("mousedown", clickPen);
				$(highlighterButton).bind("mousedown", clickHighlighter);
				$(eraserButton).bind("mousedown", clickEraser);
				//menu:
				$(btnPen.getDOM()).bind("mousedown", clickPen);
				$(btnHighlighter.getDOM()).bind("mousedown", clickHighlighter);
				$(btnEraser.getDOM()).bind("mousedown", clickEraser);
            }
        }
    });
	
	
	/* add pen selection */
	/*
	var pen = document.createElement("img");
	$(pen).attr("src", "../../guis.common/images/paint.png");
	$(pen).addClass("jPaint_navi");
	$(pen).addClass("jPaint_navi_pen");
	$(pen).bind("click", function(event){
		GUI.setPaintMode("pen");
		GUI.paintEraseModeActive = false;
	});
	
	$("#header > div.header_left").append(pen);
	*/
	
	/* add highlighter selection */
	/*
	var highlighter = document.createElement("img");
	$(highlighter).attr("src", "../../guis.common/images/categories/Highlighters.png");
	$(highlighter).addClass("jPaint_navi");
	$(highlighter).addClass("jPaint_navi_highlighter");
	$(highlighter).bind("click", function(event){
		GUI.setPaintMode("highlighter");
		GUI.paintEraseModeActive = false;
	});

	$("#header > div.header_left").append(highlighter);	
	*/

	/* add eraser selection */
	/*
	var eraser = document.createElement("img");
	$(eraser).attr("src", "../../guis.common/images/paint/eraser.png");
	$(eraser).addClass("jPaint_navi");
	$(eraser).addClass("jPaint_navi_eraser");
	$(eraser).bind("click", function(event){
		GUI.setPaintMode("eraser");
		GUI.setPaintCursor("eraser");
		GUI.paintEraseModeActive = true;
	});

	$("#header > div.header_left").append(eraser);
	*/
	
	/* add status label */
	/*
	var statusLabel = document.createElement("span");
	$(statusLabel).addClass("header_label");
	$(statusLabel).css("display", "none");
	$(statusLabel).attr("id", "statusLabel");
	
	$("#header > div.header_right").append(statusLabel);
	*/
	
	
	/* add cancel button for copy'n'paste and cut'n'paste */
	var abortButton = document.createElement("img");
	$(abortButton).attr("src", "../../guis.common/images/abort.png").attr("alt", "");
	$(abortButton).attr("width", "24").attr("height", "24");
	$(abortButton).attr("id", "abort_button");
	$(abortButton).addClass("sidebar_button");
	$(abortButton).addClass("jPaint_navi");
	$(abortButton).attr("title", GUI.translate("Abort"));
	$(abortButton).css("display", "none");
	$(abortButton).css("margin-right", "-10px");
	$("#header > .header_right").append(abortButton); //add header icon
	var clickAbort = function() { //click handler
		if (CUT.started) CUT.cancel();
		else if (COPY.started) COPY.cancel();	
	};
	
	/* add delete button */
	var deleteButton = document.createElement("img");
	$(deleteButton).attr("src", "../../guis.common/images/delete.png").attr("alt", "");
	$(deleteButton).attr("width", "24").attr("height", "24");
	$(deleteButton).attr("id", "delete_button");
	$(deleteButton).addClass("sidebar_button");
	$(deleteButton).addClass("header_button");
	$(deleteButton).addClass("jPaint_navi");
	$(deleteButton).attr("title", GUI.translate("Delete"));
	$("#header > .header_right").append(deleteButton); //add header icon
	var clickDelete = function() { //click handler
		ERASER.enabled = true; 
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	};
	
	/* add copy'n'paste */
	var copyPasteButton = document.createElement("img");
	$(copyPasteButton).attr("src", "../../guis.common/images/copy.png").attr("alt", "");
	$(copyPasteButton).attr("width", "24").attr("height", "24");
	$(copyPasteButton).attr("id", "copyPaste_button");
	$(copyPasteButton).addClass("sidebar_button");
	$(copyPasteButton).addClass("header_button");
	$(copyPasteButton).addClass("jPaint_navi");
	$(copyPasteButton).attr("title", GUI.translate("Copy"));
	$("#header > .header_right").append(copyPasteButton); //add header icon
	var clickCopyPaste = function() { //click handler
		COPY.enabled = true;
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	};
	
	/* add cut'n'paste */
	var cutPasteButton = document.createElement("img");
	$(cutPasteButton).attr("src", "../../guis.common/images/cut.png").attr("alt", "");
	$(cutPasteButton).attr("width", "24").attr("height", "24");
	$(cutPasteButton).attr("id", "cutPaste_button");
	$(cutPasteButton).addClass("sidebar_button");
	$(cutPasteButton).addClass("header_button");
	$(cutPasteButton).addClass("jPaint_navi");
	$(cutPasteButton).attr("title", GUI.translate("Cut"));
	$("#header > .header_right").append(cutPasteButton); //add header icon
	var clickCutPaste = function() { //click handler
		CUT.enabled = true; 
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	};
	
	/* add close button */
	var closeButton = document.createElement("img");
	$(closeButton).attr("src", "../../guis.common/images/close.png").attr("alt", "");
	$(closeButton).attr("width", "24").attr("height", "24");
	$(closeButton).attr("id", "close_button");
	$(closeButton).addClass("sidebar_button");
	$(closeButton).addClass("header_button");
	$(closeButton).addClass("jPaint_navi");
	$(closeButton).css("margin-right", "-10px");
	$(closeButton).attr("title", GUI.translate("Close"));
	$("#header > .header_right").append(closeButton); //add header icon
	var clickClose = function() { //click handler
		GUI.closePaintMode();
		//$("#statusLabel").remove();
	};
	
	if (GUI.isTouchDevice){
		//header:
		$(abortButton).bind("touchstart", clickAbort);
		$(deleteButton).bind("touchstart", clickDelete);
		$(copyPasteButton).bind("touchstart", clickCopyPaste);
		$(cutPasteButton).bind("touchstart", clickCutPaste);
		$(closeButton).bind("touchstart", clickClose);
    } else {
		//header:
		$(abortButton).bind("mousedown", clickAbort);
		$(deleteButton).bind("mousedown", clickDelete);
		$(copyPasteButton).bind("mousedown", clickCopyPaste);
		$(cutPasteButton).bind("mousedown", clickCutPaste);
		$(closeButton).bind("mousedown", clickClose);
	}
	
	/* add cancel button for copy'n'paste and cut'n'paste */
	/*
	var abortButton = document.createElement("span");
	$(abortButton).addClass("header_button");
	$(abortButton).addClass("button_save");
	$(abortButton).addClass("jPaint_navi");
	$(abortButton).html(GUI.translate("cancel"));
	$(abortButton).css("display", "none");
	$(abortButton).css("margin-right", "0px");
	$(abortButton).attr("id", "abortButton");
	$(abortButton).bind("click", function(event){
		if (CUT.started) CUT.cancel();
		else if (COPY.started) COPY.cancel();		
	});

	$("#header > div.header_right").append(abortButton);
	*/
	
	
	/* add area eraser selection */
	/*
	var areaEraserButton = document.createElement("span");
	$(areaEraserButton).addClass("header_button");
	$(areaEraserButton).addClass("jPaint_navi");
	$(areaEraserButton).html(GUI.translate("erase"));
	$(areaEraserButton).bind( "click", function(event){ 
		ERASER.enabled = true; 
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	});
	
	$("#header > div.header_right").append(areaEraserButton);
	*/
	
	/* add copy'n'paste */
	/*
	var copyPasteButton = document.createElement("span");
	$(copyPasteButton).addClass("header_button");
	$(copyPasteButton).addClass("jPaint_navi");
	$(copyPasteButton).html(GUI.translate("copy"));
	$(copyPasteButton).bind( "click", function(event){ 
		COPY.enabled = true;
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	});	

	$("#header > div.header_right").append(copyPasteButton);
	*/
	
	/* add cut'n'paste */
	/*
	var cutPasteButton = document.createElement("span");
	$(cutPasteButton).addClass("header_button");
	$(cutPasteButton).addClass("jPaint_navi");
	$(cutPasteButton).html(GUI.translate("cut"));
	$(cutPasteButton).bind( "click", function(event){ 
		CUT.enabled = true; 
		$(GUI.paintCanvasTemp).css("visibility", "visible"); 
	});

	$("#header > div.header_right").append(cutPasteButton);		
	*/
	
	/* add cancel button */
	/*
	var cancelButton = document.createElement("span");
	$(cancelButton).addClass("header_button");
	$(cancelButton).addClass("jPaint_navi");
	$(cancelButton).html(GUI.translate("cancel"));
	$(cancelButton).bind("click", function(event){
		GUI.cancelPaintMode();
	});

	$("#header > div.header_right").append(cancelButton);
	*/
	
	/* add close button */
	/*
	var closeButton = document.createElement("span");
	$(closeButton).addClass("header_button");
	$(closeButton).addClass("button_save");
	$(closeButton).addClass("jPaint_navi");
	$(closeButton).html(GUI.translate("close"));
	$(closeButton).css("margin-right", "0px");
	$(closeButton).bind("click", function(event){
		GUI.closePaintMode();
		//$("#statusLabel").remove();
	});
	
	$("#header > div.header_right").append(closeButton);
	*/
	
	/* create html canvas */
	GUI.paintCanvas = document.createElement("canvas");
	GUI.paintCanvasTemp = document.createElement("canvas");
	
	GUI.paintContext = GUI.paintCanvas.getContext('2d');
	GUI.paintContextTemp = GUI.paintCanvasTemp.getContext('2d');

	GUI.paintCanvasTemp.addEventListener("mousedown", COPY.start, false);
	GUI.paintCanvasTemp.addEventListener("mousemove", COPY.move, false);
	GUI.paintCanvasTemp.addEventListener("mouseup", COPY.end, false);

	GUI.paintCanvasTemp.addEventListener("mousedown", CUT.start, false);
	GUI.paintCanvasTemp.addEventListener("mousemove", CUT.move, false);
	GUI.paintCanvasTemp.addEventListener("mouseup", CUT.end, false);
	
	GUI.paintCanvasTemp.addEventListener("mousedown", ERASER.start, false);
	GUI.paintCanvasTemp.addEventListener("mousemove", ERASER.move, false);
	GUI.paintCanvasTemp.addEventListener("mouseup", ERASER.end, false);
	
	var svgpos = $("#content").offset();
	
	/* align canvas */
	$(GUI.paintCanvas).css("position", "absolute");
	$(GUI.paintCanvasTemp).css("position", "absolute");

	$(GUI.paintCanvas).css("top", svgpos.top);
	$(GUI.paintCanvasTemp).css("top", svgpos.top);

	$(GUI.paintCanvas).css("left", svgpos.left);
	$(GUI.paintCanvasTemp).css("left", svgpos.left);
	
	var windowWidth = $(window).width();
	var roomWidth = ObjectManager.getCurrentRoom().getAttribute('width');

	$(GUI.paintCanvas).attr("width", Math.max(windowWidth, roomWidth));
	$(GUI.paintCanvasTemp).attr("width", Math.max(windowWidth, roomWidth));

	var windowHeight = $(window).height();
	var roomHeight = ObjectManager.getCurrentRoom().getAttribute('height');
	
	$(GUI.paintCanvas).attr("height", Math.max(windowHeight, roomHeight));
	$(GUI.paintCanvasTemp).attr("height", Math.max(windowHeight, roomHeight));

	$(GUI.paintCanvas).css("z-index", 10000);
	$(GUI.paintCanvasTemp).css("z-index", 10001);

	$(GUI.paintCanvas).attr("id", "webarena_paintCanvas");
	$(GUI.paintCanvasTemp).attr("id", "webarena_paintCanvas_temp");
	
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	$(GUI.paintCanvasTemp).css("cursor", "crosshair");

	$("body:first").append(GUI.paintCanvas);
	$("body:first").append(GUI.paintCanvasTemp);
	
	/* load content */
	GUI.painted = true;

	var img = new Image();
	
	$(img).bind("load", function(){
		var canvasContext = $("canvas").filter("#webarena_paintCanvas").get(0).getContext('2d');
		canvasContext.drawImage(img, 0, 0, img.width, img.height);
	});
		
	$(img).attr("src", ObjectManager.getCurrentRoom().getUserPaintingURL());
	
	//unbind old events
	$("canvas").filter("#webarena_paintCanvas").unbind("mousedown");
	$("canvas").filter("#webarena_paintCanvas").unbind("touchend");
	
	// set initial values
	GUI.setPaintColor(ObjectManager.getUser().color, "usercolor");
	GUI.setPaintMode("pen");
	GUI.setPaintSize(3);
	
	GUI.resizePaintToolbar();
	
	var start = function(event){
	
		GUI.paintLastPoint = undefined;

		event.preventDefault();
		event.stopPropagation();
		$("#header").find("#color_selection_button").removeClass("active");	
		$("#header").find("#size_selection_button").removeClass("active");
		$("#header").find("#pen_selection_button").removeClass("active");
		
		GUI.painted = true;

		if (GUI.isTouchDevice){
			/* touch */
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;
		} else {
			/* click */
			var x = event.pageX;
			var y = event.pageY;
		}

		if (!GUI.paintEraseModeActive){
			var canvasContext = $("canvas").filter("#webarena_paintCanvas").get(0).getContext('2d');

			var hex2rgb = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/;
			var matches = hex2rgb.exec(GUI.paintColor);
			var rgba = "rgba(" + parseInt(matches[1], 16) + "," + parseInt(matches[2], 16) + "," + parseInt(matches[3], 16) + "," + GUI.paintOpacity + ")";

			canvasContext.strokeStyle = rgba;
			canvasContext.lineWidth = GUI.paintSize;
			canvasContext.lineCap = "round";
			canvasContext.beginPath();
		
			GUI.paintMove(x, y);
			GUI.paintPaint(x, y);
			GUI.paintPaint(x+1, y);
		} else {
			GUI.paintErase(x, y);
		}

		var move = function(event){
			
			event.preventDefault();
			event.stopPropagation();

			if (GUI.isTouchDevice){
				/* touch */
				var x = event.targetTouches[0].pageX;
				var y = event.targetTouches[0].pageY;
			} else {
				/* click */
				var x = event.pageX;
				var y = event.pageY;
			}

			if (!GUI.paintEraseModeActive){
				GUI.paintPaint(x, y);
			} else {
				GUI.paintErase(x, y);
			}
		}

		var end = function(event){
			
			event.preventDefault();
			event.stopPropagation();
			GUI.savePaintMode();

			$("canvas").filter("#webarena_paintCanvas").unbind("mousemove");
			$("canvas").filter("#webarena_paintCanvas").unbind("mouseup");
			
			$("canvas").filter("#webarena_paintCanvas").unbind("touchmove");
			$("canvas").filter("#webarena_paintCanvas").unbind("touchend");
		};
		
		if (GUI.isTouchDevice){
			/* touch */
			$("canvas").filter("#webarena_paintCanvas").get(0).addEventListener("touchmove", move, false);
			$("canvas").filter("#webarena_paintCanvas").get(0).addEventListener("touchend", end, false);
		} else {
			/* click */
			$("canvas").filter("#webarena_paintCanvas").bind("mousemove", move);
			$("canvas").filter("#webarena_paintCanvas").bind("mouseup", end);
		}
	}
	
	if (GUI.isTouchDevice){
		/* touch */		
		$("canvas").filter("#webarena_paintCanvas").get(0).addEventListener("touchstart", function(event){
			start(event);
			$(".jPopover").hide();
		}, false);
		
	} else {
		/* click */
		$("canvas").filter("#webarena_paintCanvas").bind("mousedown", function(event){
			start(event);
			$(".jPopover").hide();
		});
	}
	
	$(document).bind("keydown.paint", function(event){
		
		if (event.keyCode == 16){
			GUI.paintShiftKeyDown = true;
			GUI.paintShiftKeyDirection = undefined;
		}
		
		if (event.keyCode == 13){
			GUI.savePaintMode();
		}
		
	});
	
	$(document).bind("keyup.paint", function(event){
		
		if (event.keyCode == 16){
			GUI.paintShiftKeyDown = false;
		}
		
	});
}


/**
 * True if the shift key is pushed (to draw straight lines)
 */
GUI.paintShiftKeyDown = false;


/**
 * Direction of straight line
 */
GUI.paintShiftKeyDirection = undefined;


/**
 * Paint a line to position x,y
 * @param {int} x x position of the lines end
 * @param {int} y y position of the lines end
 */
GUI.paintPaint = function(x,y){

	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	if (GUI.paintLastPoint == undefined){
		GUI.paintLastPoint = [x,y];
		return;
	}
	
	if (GUI.paintShiftKeyDown){
		/* paint straight line */
	
		if (GUI.paintShiftKeyDirection == undefined && (Math.abs(GUI.paintLastPoint[1]-y) > 2 || Math.abs(GUI.paintLastPoint[0]-x) > 2)){
			if (Math.abs(GUI.paintLastPoint[1]-y) > Math.abs(GUI.paintLastPoint[0]-x)){
				/* Y direction */
				GUI.paintShiftKeyDirection = "y";
			} else {
				/* X direction */
				GUI.paintShiftKeyDirection = "x";
			}
		}
		
		if (GUI.paintShiftKeyDirection !== undefined){
			
			if (GUI.paintShiftKeyDirection == "y"){
				/* Y direction */
				x = GUI.paintLastPoint[0];
			} else {
				/* X direction */
				y = GUI.paintLastPoint[1];
			}

			var xc = x;
			var yc = y;
			
		} else {
			var xc = (GUI.paintLastPoint[0] + x) / 2;
			var yc = (GUI.paintLastPoint[1] + y) / 2;
		}
	
	} else {
		/* normal paint */
		var xc = (GUI.paintLastPoint[0] + x) / 2;
		var yc = (GUI.paintLastPoint[1] + y) / 2;
	}

	var canvasContext = $("canvas").filter("#webarena_paintCanvas").get(0).getContext('2d');

	canvasContext.quadraticCurveTo(GUI.paintLastPoint[0], GUI.paintLastPoint[1], xc, yc);
	
	GUI.paintLastPoint = [x,y];
	
	canvasContext.stroke();

	var paintRadius = GUI.paintSize/2;
	
	/* set min/max */
	if (GUI.paintMaxX == undefined || x+paintRadius > GUI.paintMaxX){
		GUI.paintMaxX = x+paintRadius;
	}
	if (GUI.paintMaxY == undefined || y+paintRadius > GUI.paintMaxY){
		GUI.paintMaxY = y+paintRadius;
	}
	if (GUI.paintMinX == undefined || x-paintRadius < GUI.paintMinX){
		GUI.paintMinX = x-paintRadius;
	}
	if (GUI.paintMinY == undefined || y-paintRadius < GUI.paintMinY){
		GUI.paintMinY = y-paintRadius;
	}
}


/**
 * Move to position x,y without painting
 *@param {int} x x position
 *@param {int} y y position
 */
GUI.paintMove = function(x,y){

	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	var canvasContext = $("canvas").filter("#webarena_paintCanvas").get(0).getContext('2d');
	
	canvasContext.moveTo(x,y);
	
}


/**
 * Erease around position x,y
 *@param {int} x x position
 *@param {int} y y position
 */
GUI.paintErase = function(x,y){
	
	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	var eraserSize = 20;
	
	x = x-(eraserSize/2);
	y = y-(eraserSize/2);
	
	var canvasContext = $("canvas").filter("#webarena_paintCanvas").get(0).getContext('2d');
	
	canvasContext.clearRect(x, y, eraserSize,eraserSize);
	
}


/**
 * Cancel the paint mode (without saving) and close it
 */
GUI.cancelPaintMode = function(){
	
	if (!GUI.painted){
		GUI.currentPaintObject.deleteIt();
	}
	
	GUI.closePaintMode();
	
}


/**
 * Close the paint mode
 */
GUI.closePaintMode = function(){
	
	GUI.paintModeActive = false;
	
	$("#content").unbind("mousedown.paint");
	
	GUI.sidebar.restoreFromSavedState();
	
	$("#header").find(".jPaint_navi").remove();
	
	$("#header > div.header_left").children().show();
	$("#header > div.header_right").children().show();
	$("img[id^='userPainting_']").show();
	
	$("canvas").remove("#webarena_paintCanvas");
	$("canvas").remove("#webarena_paintCanvas_temp");
	
	/* set normal opacity to all objects */
	$.each(ObjectManager.getObjects(), function(index, object){
		$(object.getRepresentation()).css("opacity", object.normalOpacity);
	});
	
	GUI.resizeToolbar();
	
	$(document).unbind("keyup.paint");
	$(document).unbind("keydown.paint");
	
}


/**
 * Save the wonderful painting and close the paint mode
 */
GUI.savePaintMode = function(){
	//This is where the content is saved.
	ObjectManager.getCurrentRoom().saveUserPaintingData($("canvas").filter("#webarena_paintCanvas").get(0).toDataURL(), function(){});
}


/**
 * decides which icons are shown in the paint toolbar, depending on the free space  
 */
GUI.resizePaintToolbar = function(){

	if(GUI.paintModeActive){

		var width = $(window).width();
		
		if(width < 415){
			$("#pen_selection_button").show();
			$("#header > div.header_left").find("#pen_button").hide();
			$("#header > div.header_left").find("#highlighter_button").hide();
			$("#header > div.header_left").find("#eraser_button").hide();
		}
		else{
			$("#pen_selection_button").hide();
			$("#header > div.header_left").find("#pen_button").show();
			$("#header > div.header_left").find("#highlighter_button").show();
			$("#header > div.header_left").find("#eraser_button").show();
		}
		
		if(width < 330){
			$("#delete_button").hide();
		}
		else{
			$("#delete_button").show()
		}
	}

}


/**
 * converts RGB-values in a single hex value
 */
GUI.convertRGBToHex = function(R,G,B){
	
	function toHex(n) {
		n = parseInt(n,10);
		if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
	}

	return toHex(R)+toHex(G)+toHex(B);
}