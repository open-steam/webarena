"use strict";

/* paint */

/**
 * true if paint mode is active
 */
GUI.paintModeActive = false;


/**
 * Set a color to paint with
 * @param {String} color The (hex-) color to paint with
 * @param {String} colorName The colors name
 */
GUI.setPaintColor = function(color, colorName) {
	GUI.paintColor = color;
	GUI.setPaintCursor(colorName);
	GUI.paintEraseModeActive = false;
	$("#header").find(".jPaint_navi_color").removeClass("active");
	$("#header").find(".jPaint_navi_eraser").removeClass("active");
	$("#header").find(".jPaint_navi_color_"+colorName).addClass("active");
}

/**
 * Set the cursor
 * @param {String} cursorName The name of the cursor icon
 */
GUI.setPaintCursor = function(cursorName) {
	GUI.paintCursor = "../../guis.common/images/paint/cursors/"+cursorName+".png";
}

/**
 * Set the size of the "pencil"
 * @param {int} value Size of the "pencil"
 */
GUI.setPaintSize = function(value) {
	GUI.paintSize = value;
	GUI.paintEraseModeActive = false;
	$("#header").find(".jPaint_navi_size").removeClass("active");
	$("#header").find(".jPaint_navi_eraser").removeClass("active");
	$("#header").find(".jPaint_navi_size_"+value).addClass("active");
}

GUI.paintColors = [];
GUI.paintSizes = [];

var COPY = {	started     : false,
				selecting   : false,
				dragging    : false,
				enabled     : false,

				sourceX     : 0,
				sourceY     : 0,
				sourceXTemp : 0,
				sourceYTemp : 0,
				destX       : 0,
				destY       : 0,

				draggingOffsetX : 0,
				draggingOffsetY : 0,

				timingPaste     : 0,
				mouseOverSelectionBox : false,
				
				start : "",
				move : "",
				end : "",
				paste : "",
				cancel : ""
};

var CUT = {		started     : false,
				selecting   : false,
				dragging    : false,
				enabled     : false,

				sourceX     : 0,
				sourceY     : 0,
				sourceXTemp : 0,
				sourceYTemp : 0,
				destX       : 0,
				destY       : 0,

				draggingOffsetX : 0,
				draggingOffsetY : 0,

				selectionData   : "",
				timingPaste     : 0,
				mouseOverSelectionBox : false,
				
				start : "",
				move : "",
				end : "",
				paste : "",
				cancel : ""
};

COPY.start = function(event)
{
	if ( !COPY.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();
	
	if (GUI.isTouchDevice)
	{
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0) { // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0) { // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	COPY.started = true;
	
	$(".header_button").css("display", "none");
	$("#abortButton").css("display", "inline");

	if (!COPY.selecting)
	{
		// start creating selection frame
		COPY.sourceXTemp = x;
		COPY.sourceYTemp = y;

		GUI.paintContextTemp.strokeStyle = 'rgba(0,0,255,1)';
		GUI.paintContextTemp.lineWidth = 2;
	}
	else if (!COPY.dragging && COPY.mouseOverSelectionBox)
	{
		// start moving selection frame
		COPY.dragging = true;
		COPY.draggingOffsetX =  x - COPY.destX;
		COPY.draggingOffsetY =  y - COPY.destY;
		clearTimeout(COPY.timingPaste);
	}
	else { return; }
}

COPY.move = function(event)
{
	if ( !COPY.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();

	if (GUI.isTouchDevice) {
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0) { // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0) { // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	if ( !COPY.started ) { return; }

	if (!COPY.selecting)
	{
		// creating selection frame
		COPY.sourceX = Math.min(x, COPY.sourceXTemp);
		COPY.sourceY = Math.min(y, COPY.sourceYTemp);
		COPY.sourceW = Math.abs(x - COPY.sourceXTemp);
		COPY.sourceH = Math.abs(y - COPY.sourceYTemp);

		COPY.destX = COPY.sourceX;
		COPY.destY = COPY.sourceY;
		
		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		if (!COPY.sourceW || !COPY.sourceH) { return; }
		GUI.paintContextTemp.strokeRect(COPY.sourceX, COPY.sourceY, COPY.sourceW, COPY.sourceH);
	}
	else if (!COPY.dragging)
	{
		// selection frame drawn
		COPY.mouseOverSelectionBox = ( COPY.destX < x && x < COPY.destX + COPY.sourceW ) && ( COPY.destY < y && y < COPY.destY + COPY.sourceH );
	
		if (COPY.mouseOverSelectionBox) { document.body.style.cursor = "pointer"; }
		else { document.body.style.cursor = "default"; }
	}
	else
	{
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
}

COPY.end = function(event)
{
	if ( !COPY.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();

	if (!COPY.selecting)
	{
		// selection frame just created
		COPY.selecting = true;
	}
	else if (COPY.dragging)
	{
		// selection frame just moved
		COPY.dragging = false;
		COPY.timingPaste = setTimeout(function(){COPY.paste();}, 2000);
	}
};

COPY.paste = function()
{
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
	$("#abortButton").css("display", "none");
	
	GUI.savePaintMode();
};

COPY.cancel = function()
{
	COPY.started = false;
	COPY.selecting = false;
	COPY.dragging = false;
	COPY.enabled = false;
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(COPY.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abortButton").css("display", "none");
};

CUT.start = function(event)
{
	if ( !CUT.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();
	
	if (GUI.isTouchDevice)
	{
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0) { // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0) { // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	CUT.started = true;
	
	$(".header_button").css("display", "none");
	$("#abortButton").css("display", "inline");

	if (!CUT.selecting)
	{
		// start creating selection frame
		CUT.sourceXTemp = x;
		CUT.sourceYTemp = y;

		GUI.paintContextTemp.strokeStyle = 'rgba(0,0,255,1)';
		GUI.paintContextTemp.lineWidth = 2;
	}
	else if (!CUT.dragging && CUT.mouseOverSelectionBox)
	{
		// start moving selection frame
		CUT.dragging = true;
		CUT.draggingOffsetX =  x - CUT.destX;
		CUT.draggingOffsetY =  y - CUT.destY;
		clearTimeout(CUT.timingPaste);
	}
	else { return; }
}

CUT.move = function(event)
{
	if ( !CUT.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();

	if (GUI.isTouchDevice) {
		/* touch */
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
	} else {
		/* click */
		if (event.layerX || event.layerX == 0) { // Firefox
		  var x = event.layerX;
		  var y = event.layerY;
		} else if (event.offsetX || event.offsetX == 0) { // Opera
		  var x = event.offsetX;
		  var y = event.offsetY;
		}
	}

	if ( !CUT.started ) { return; }

	if (!CUT.selecting)
	{
		// creating selection frame
		CUT.sourceX = Math.min(x, CUT.sourceXTemp);
		CUT.sourceY = Math.min(y, CUT.sourceYTemp);
		CUT.sourceW = Math.abs(x - CUT.sourceXTemp);
		CUT.sourceH = Math.abs(y - CUT.sourceYTemp);

		CUT.destX = CUT.sourceX;
		CUT.destY = CUT.sourceY;
		
		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		if (!CUT.sourceW || !CUT.sourceH) { return; }
		GUI.paintContextTemp.strokeRect(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
	}
	else if (!CUT.dragging)
	{
		// selection frame drawn
		CUT.mouseOverSelectionBox = ( CUT.destX < x && x < CUT.destX + CUT.sourceW ) && ( CUT.destY < y && y < CUT.destY + CUT.sourceH );
	
		if (CUT.mouseOverSelectionBox) { document.body.style.cursor = "pointer"; }
		else { document.body.style.cursor = "default"; }
	}
	else
	{
		// selection frame currently moving
		CUT.destX = x - CUT.draggingOffsetX;
		CUT.destY = y - CUT.draggingOffsetY;

		GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvasTemp.width, GUI.paintCanvasTemp.height);
		GUI.paintContextTemp.strokeRect(CUT.destX, CUT.destY, CUT.sourceW, CUT.sourceH);
		GUI.paintContextTemp.putImageData(CUT.selectionData, CUT.destX, CUT.destY);
	}

}

CUT.end = function(event)
{
	if ( !CUT.enabled ) { return; }

	event.preventDefault();
	event.stopPropagation();

	if (!CUT.selecting)
	{
		// selection frame just created
		CUT.selecting = true;

		CUT.selectionData = GUI.paintContext.getImageData(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
		GUI.paintContext.clearRect(CUT.sourceX, CUT.sourceY, CUT.sourceW, CUT.sourceH);
		GUI.paintContextTemp.putImageData(CUT.selectionData, CUT.sourceX, CUT.sourceY);
	}
	else if (CUT.dragging)
	{
		// selection frame just moved
		CUT.dragging = false;
		CUT.timingPaste = setTimeout(function(){CUT.paste();}, 2000);
	}
}

CUT.paste = function()
{
	CUT.started = false;
	CUT.selecting = false;
	CUT.dragging = false;
	CUT.enabled = false;
	
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');

	tempContext.putImageData(CUT.selectionData, 0, 0);
	GUI.paintContext.drawImage(tempCanvas, CUT.destX, CUT.destY);
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(CUT.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abortButton").css("display", "none");
	
	GUI.savePaintMode();
};

CUT.cancel = function()
{
	CUT.started = false;
	CUT.selecting = false;
	CUT.dragging = false;
	CUT.enabled = false;
	
	GUI.paintContextTemp.clearRect(0, 0, GUI.paintCanvas.width, GUI.paintCanvas.height);
	GUI.paintContext.putImageData(CUT.selectionData, CUT.sourceX, CUT.sourceY);
	$(GUI.paintCanvasTemp).css("visibility", "hidden");
	clearTimeout(CUT.timingPaste);
	
	$(".header_button").css("display", "inline");
	$("#abortButton").css("display", "none");
};

/**
 * Reset all paint colors
 */
GUI.resetPaintColors = function() {
	GUI.paintColors = [];
}

/**
 * Reset all paint sizes
 */
GUI.resetPaintSizes = function() {
	GUI.paintSizes = [];
}

/**
 * Add a paint color
 * @param {String} color The (hex-) color value
 * @param {String} colorName The colors name
 */
GUI.addPaintColor = function(color, colorName) {
	if (colorName == undefined) {
		colorName = color;
	}
	GUI.paintColors.push([color,colorName]);
}

/**
 * Set the size of the "pencil"
 * @param {int} size Size of the "pencil"
 */
GUI.addPaintSize = function(size) {
	GUI.paintSizes.push(size);
}

/**
 * Enter the paint edit mode
 * @param {webarenaObject} webarenaObject The webarena object to save/load the paint data
 * @param {bool} highlighterMode True if the paint mode should be displayed in highlighter mode (different colors, sizes and opacity)
 */
GUI.editPaint = function() {

	GUI.painted = false;
	GUI.paintModeActive = true;
	GUI.sidebar.saveStateAndHide();
	
	$("#header > div.header_left").children().hide();
	$("#header > div.header_right").children().hide();
	$("img[id^='userPainting_']").hide();
	
	GUI.resetPaintColors();
	GUI.addPaintColor("#000000", "black");
	GUI.addPaintColor("red");
	GUI.addPaintColor("green");
	GUI.addPaintColor("blue");
	GUI.resetPaintSizes();
	
	GUI.addPaintSize(1);
	GUI.addPaintSize(3);
	GUI.addPaintSize(7);
	
	GUI.addPaintSize(14);
	GUI.addPaintSize(20);
	GUI.addPaintSize(24);
	
	/* add color selection */
	
	$.each(GUI.paintColors, function(index, color) {
	
		var colorSelection = document.createElement("img");
		$(colorSelection).attr("src", "../../guis.common/images/paint/colors/"+color[1]+".png");
		$(colorSelection).addClass("jPaint_navi");
		$(colorSelection).addClass("jPaint_navi_color");
		$(colorSelection).addClass("jPaint_navi_color_"+color[1]);
		$(colorSelection).bind("click", function(event) {
			GUI.setPaintColor(color[0], color[1]);
		});

		$("#header > div.header_left").append(colorSelection);
		
	});
	
	
	/* add size selection */
	
	$.each(GUI.paintSizes, function(index, size) {
		
		var sizeSelection = document.createElement("img");
		$(sizeSelection).attr("src", "../../guis.common/images/paint/sizes/"+size+".png");
		$(sizeSelection).addClass("jPaint_navi");
		$(sizeSelection).addClass("jPaint_navi_size");
		$(sizeSelection).addClass("jPaint_navi_size_"+size);
		$(sizeSelection).bind("click", function(event) {
			GUI.setPaintSize(size);
		});

		$("#header > div.header_left").append(sizeSelection);
		
	});
	

	/* add eraser selection */
	
	var eraser = document.createElement("img");
	$(eraser).attr("src", "../../guis.common/images/paint/eraser.png");
	$(eraser).addClass("jPaint_navi");
	$(eraser).addClass("jPaint_navi_eraser");
	$(eraser).bind("click", function(event) {
		GUI.setPaintCursor("eraser");
		GUI.paintEraseModeActive = true;

		$("#header").find(".jPaint_navi_eraser").addClass("active");
		
	});

	$("#header > div.header_left").append(eraser);

	GUI.setPaintColor("#000000", "black");
	GUI.setPaintSize(3);

	/* add cancel button for copy'n'paste and cut'n'paste */
	var abortButton = document.createElement("span");
	$(abortButton).addClass("header_button");
	$(abortButton).addClass("button_save");
	$(abortButton).addClass("jPaint_navi");
	$(abortButton).html(GUI.translate("cancel"));
	$(abortButton).css("display", "none");
	$(abortButton).attr("id", "abortButton");
	$(abortButton).bind("click", function(event) {
		if (CUT.started) CUT.cancel();
		else if (COPY.started) COPY.cancel();		
	});

	$("#header > div.header_right").append(abortButton);
	
	/* add copy'n'paste */
	var copyPasteButton = document.createElement("span");
	$(copyPasteButton).addClass("header_button");
	$(copyPasteButton).addClass("jPaint_navi");
	$(copyPasteButton).html(GUI.translate("copy"));
	$(copyPasteButton).bind( "click", function(event) { COPY.enabled = true; $(GUI.paintCanvasTemp).css("visibility", "visible"); } );	

	$("#header > div.header_right").append(copyPasteButton);


	/* add cut'n'paste */
	var cutPasteButton = document.createElement("span");
	$(cutPasteButton).addClass("header_button");
	$(cutPasteButton).addClass("jPaint_navi");
	$(cutPasteButton).html(GUI.translate("cut"));
	$(cutPasteButton).bind( "click", function(event) { CUT.enabled = true; $(GUI.paintCanvasTemp).css("visibility", "visible"); } );

	$("#header > div.header_right").append(cutPasteButton);	


	/* add cancel button */
	/*
	var cancelButton = document.createElement("span");
	$(cancelButton).addClass("header_button");
	$(cancelButton).addClass("jPaint_navi");
	$(cancelButton).html(GUI.translate("cancel"));
	$(cancelButton).bind("click", function(event) {
		GUI.cancelPaintMode();
	});

	$("#header > div.header_right").append(cancelButton);
	*/
	
	/* add close button */
	var closeButton = document.createElement("span");
	$(closeButton).addClass("header_button");
	$(closeButton).addClass("button_save");
	$(closeButton).addClass("jPaint_navi");
	$(closeButton).html(GUI.translate("close"));
	$(closeButton).bind("click", function(event) {
		GUI.closePaintMode();
	});
	
	$("#header > div.header_right").append(closeButton);	
	
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
	
	var svgpos = $("#content").offset();
	
	/* align canvas */
	$(GUI.paintCanvas).css("position", "absolute");
	$(GUI.paintCanvasTemp).css("position", "absolute");

	$(GUI.paintCanvas).css("top", svgpos.top);
	$(GUI.paintCanvasTemp).css("top", svgpos.top);

	$(GUI.paintCanvas).css("left", svgpos.left);
	$(GUI.paintCanvasTemp).css("left", svgpos.left);
	
	$(GUI.paintCanvas).attr("width", ObjectManager.getCurrentRoom().getAttribute('width'));
	$(GUI.paintCanvasTemp).attr("width", ObjectManager.getCurrentRoom().getAttribute('width'));

	$(GUI.paintCanvas).attr("height", ObjectManager.getCurrentRoom().getAttribute('height')-svgpos.top);
	$(GUI.paintCanvasTemp).attr("height", ObjectManager.getCurrentRoom().getAttribute('height')-svgpos.top);

	$(GUI.paintCanvas).css("z-index", 10000);
	$(GUI.paintCanvasTemp).css("z-index", 10001);

	$(GUI.paintCanvas).attr("id", "webarena_paintCanvas");
	$(GUI.paintCanvasTemp).attr("id", "webarena_paintCanvas_temp");
	
	$(GUI.paintCanvasTemp).css("visibility", "hidden");

	$("body").append(GUI.paintCanvas);
	$("body").append(GUI.paintCanvasTemp);

	
	/* load content */
	GUI.painted = true;

	var img = new Image();
	
	$(img).bind("load", function() {
		var canvasContext = $("#webarena_paintCanvas").get(0).getContext('2d');
		
		canvasContext.drawImage(img, 0, 0, img.width, img.height);
		
	});
		
	$(img).attr("src", ObjectManager.getCurrentRoom().getUserPaintingURL());
	
	//unbind old events
	$("#webarena_paintCanvas").unbind("mousedown");
	$("#webarena_paintCanvas").unbind("touchend");
	
	var start = function(event) {

		GUI.paintLastPoint = undefined;

		event.preventDefault();
		event.stopPropagation();
		
		GUI.painted = true;

		if (GUI.isTouchDevice)
		{
			/* touch */
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;
		} else {
			/* click */
			var x = event.pageX;
			var y = event.pageY;
		}

		if (!GUI.paintEraseModeActive)
		{
			var canvasContext = $("#webarena_paintCanvas").get(0).getContext('2d');

			canvasContext.strokeStyle = GUI.paintColor;
			canvasContext.lineWidth = GUI.paintSize;
			canvasContext.lineCap = "round";
			canvasContext.beginPath();
		
		
			if (GUI.isTouchDevice) {
				/* touch */
				GUI.paintMove(x, y);
				GUI.paintPaint(x, y);
				GUI.paintPaint(x+1, y);
			} else {
				/* click */
				GUI.paintMove(x, y);
				GUI.paintPaint(x, y);
				GUI.paintPaint(x+1, y);
			}

		} else {
			
			if (GUI.isTouchDevice) {
				/* touch */
				GUI.paintErase(x, y);
			} else {
				/* click */
				GUI.paintErase(x, y);
			}
			
		}

		var move = function(event) {
			
			event.preventDefault();
			event.stopPropagation();

			if (GUI.isTouchDevice) {
				/* touch */
				var x = event.targetTouches[0].pageX;
				var y = event.targetTouches[0].pageY;
			} else {
				/* click */
				var x = event.pageX;
				var y = event.pageY;
			}

			if (!GUI.paintEraseModeActive) {
				GUI.paintPaint(x, y);
			} else {
				GUI.paintErase(x, y);
			}

		}

		var end = function(event) {
			
			event.preventDefault();
			event.stopPropagation();
			GUI.savePaintMode();

			$("#webarena_paintCanvas").unbind("mousemove");
			$("#webarena_paintCanvas").unbind("mouseup");
			
			$("#webarena_paintCanvas").unbind("touchmove");
			$("#webarena_paintCanvas").unbind("touchend");
		};
		
		
		if (GUI.isTouchDevice) {
			/* touch */
			$("#webarena_paintCanvas").get(0).addEventListener("touchmove", move, false);
			$("#webarena_paintCanvas").get(0).addEventListener("touchend", end, false);
		} else {
			/* click */
			$("#webarena_paintCanvas").bind("mousemove", move);
			$("#webarena_paintCanvas").bind("mouseup", end);
		}
	}
	
	if (GUI.isTouchDevice) {
		/* touch */		
		$("#webarena_paintCanvas").get(0).addEventListener("touchstart", start, false);
	} else {
		/* click */
		$("#webarena_paintCanvas").bind("mousedown", start);
	}
	
	$(document).bind("keydown.paint", function(event) {
		
		if (event.keyCode == 16) {
			GUI.paintShiftKeyDown = true;
			GUI.paintShiftKeyDirection = undefined;
		}
		
		if (event.keyCode == 13) {
			GUI.savePaintMode();
		}
		
	});
	
	$(document).bind("keyup.paint", function(event) {
		
		if (event.keyCode == 16) {
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
GUI.paintPaint = function(x,y) {

	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	if (GUI.paintLastPoint == undefined) {
		GUI.paintLastPoint = [x,y];
		return;
	}
	
	if (GUI.paintShiftKeyDown) {
		/* paint straight line */
	
		if (GUI.paintShiftKeyDirection == undefined && (Math.abs(GUI.paintLastPoint[1]-y) > 2 || Math.abs(GUI.paintLastPoint[0]-x) > 2)) {
			if (Math.abs(GUI.paintLastPoint[1]-y) > Math.abs(GUI.paintLastPoint[0]-x)) {
				/* Y direction */
				GUI.paintShiftKeyDirection = "y";
			} else {
				/* X direction */
				GUI.paintShiftKeyDirection = "x";
			}
		}
		
		if (GUI.paintShiftKeyDirection !== undefined) {
			
			if (GUI.paintShiftKeyDirection == "y") {
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

	var canvasContext = $("#webarena_paintCanvas").get(0).getContext('2d');

	canvasContext.quadraticCurveTo(GUI.paintLastPoint[0], GUI.paintLastPoint[1], xc, yc);
	
	GUI.paintLastPoint = [x,y];
	
	canvasContext.stroke();


	var paintRadius = GUI.paintSize/2;
	
	/* set min/max */
	if (GUI.paintMaxX == undefined || x+paintRadius > GUI.paintMaxX) {
		GUI.paintMaxX = x+paintRadius;
	}
	if (GUI.paintMaxY == undefined || y+paintRadius > GUI.paintMaxY) {
		GUI.paintMaxY = y+paintRadius;
	}
	if (GUI.paintMinX == undefined || x-paintRadius < GUI.paintMinX) {
		GUI.paintMinX = x-paintRadius;
	}
	if (GUI.paintMinY == undefined || y-paintRadius < GUI.paintMinY) {
		GUI.paintMinY = y-paintRadius;
	}
	
}


/**
 * Move to position x,y without painting
 *@param {int} x x position
 *@param {int} y y position
 */
GUI.paintMove = function(x,y) {

	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	var canvasContext = $("#webarena_paintCanvas").get(0).getContext('2d');
	
	canvasContext.moveTo(x,y);
	
}

/**
 * Erease around position x,y
 *@param {int} x x position
 *@param {int} y y position
 */
GUI.paintErase = function(x,y) {
	
	var svgpos = $("#content").offset();
	y = y-svgpos.top;

	var eraserSize = 20;
	
	x = x-(eraserSize/2);
	y = y-(eraserSize/2);
	
	var canvasContext = $("#webarena_paintCanvas").get(0).getContext('2d');
	
	canvasContext.clearRect(x, y, eraserSize,eraserSize);
	
}

/**
 * Cancel the paint mode (without saving) and close it
 */
GUI.cancelPaintMode = function() {
	
	if (!GUI.painted) {
		GUI.currentPaintObject.deleteIt();
	}
	
	GUI.closePaintMode();
	
}

/**
 * Close the paint mode
 */
GUI.closePaintMode = function() {
	
	GUI.paintModeActive = false;
	
	$("#content").unbind("mousedown.paint");
	
	GUI.sidebar.restoreFromSavedState();
	
	$("#header").find(".jPaint_navi").remove();
	
	$("#header > div.header_left").children().show();
	$("#header > div.header_right").children().show();
	$("img[id^='userPainting_']").show();
	
	$("#webarena_paintCanvas").remove();
	$("#webarena_paintCanvas_temp").remove();
	
	/* set normal opacity to all objects */
	$.each(ObjectManager.getObjects(), function(index, object) {
		$(object.getRepresentation()).css("opacity", object.normalOpacity);
	});
	
	$(document).unbind("keyup.paint");
	$(document).unbind("keydown.paint");
	
}

/**
 * Save the wonderful painting and close the paint mode
 */
GUI.savePaintMode = function() {
	
	//This is where the content is saved.
	ObjectManager.getCurrentRoom().saveUserPaintingData($("#webarena_paintCanvas").get(0).toDataURL(), function(){});
}