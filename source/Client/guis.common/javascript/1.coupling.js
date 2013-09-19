/**
 * true if coupling mode is active
 */
GUI.couplingModeActive = false;

/**
 * true if coupling navigation is active
 */
GUI.couplingNavigationActive = false;

/**
 * initialize transformation matrices
 */
GUI.couplingTransformMatrix = { 'left': [1,0,0,1,0,0], 'right' : [1,0,0,1,0,0] };

/**
 * Enter the coupling mode
 */
GUI.enterCouplingMode= function() {

	GUI.couplingModeActive = true;

	GUI.couplingNavigationActive = true;

	GUI.sidebar.saveStateAndHide();

	$("#header > div.header_left").children().hide();
	$("#header > div.header_right").children().hide();
	
	// add navigation button
	var navigationButton = document.createElement("span");
	$(navigationButton).addClass("header_button");
	$(navigationButton).addClass("jCoupling_navi");
	$(navigationButton).html(GUI.translate("Navigation"));
	$(navigationButton).bind("click", function(event) {
		if (GUI.couplingNavigationActive) {
			$('#couplingNavigation').dialog("close");
			GUI.couplingNavigationActive = false;
		} else {
			$('#couplingNavigation').dialog("open");
			GUI.couplingNavigationActive = true;
		}
	});

	$("#header > div.header_left").append(navigationButton);

	$(navigationButton).css({
		position : "absolute"
	});
	$(navigationButton).offset({
		left : ($(window).width() / 2) - (($(navigationButton).width() / 2) + 10)
	})	

	// add close button
	var closeButton = document.createElement("span");
	$(closeButton).addClass("header_button");
	$(closeButton).addClass("button_save");
	$(closeButton).addClass("jCoupling_navi");
	$(closeButton).html(GUI.translate("close"));
	$(closeButton).bind("click", function(event) {
		GUI.closeCouplingMode();
	});

	$("#header > div.header_right").append(closeButton);	

	// add vertical bar
	var verticalBar = GUI.svg.line($(window).width() / 2, 0, $(window).width() / 2, $(window).height(), { 'stroke' : 'black', 'stroke-width' : 10 });
	$(verticalBar).attr("id", "couplingBar");
	$(verticalBar).hover(function() {
		$(this).css('cursor','w-resize');
	}, function() {
		$(this).css('cursor','n-pointer');
	});

	// window resize handling
	$(window).resize(function() {
		$('#couplingBar').attr('x1', $(window).width() / 2);
		$('#couplingBar').attr('x2', $(window).width() / 2);
		$('#couplingBar').attr('y2', $(window).height());

		//$('#room_left').attr('viewBox', '0 0 ' + ($(window).width() / 2) + ' ' + ($(window).height() + 33));
		//$('#room_right').attr('viewBox', '0 0 ' + ($(window).width() / 2) + ' ' + ($(window).height() + 33));
		$('#room_right').attr('x', ($(window).width() / 2));
		$('#room_right').attr('width', ($(window).width() / 2));
		$('#room_left').attr('width', ($(window).width() / 2));
	});

	// initialize navigation
	$('#couplingNavigation').dialog({ 
		draggable: false,
		resizable: false,
		position: [($(window).width() / 2) - 100, 30],
		height: 'auto',
		width: 200
	});
	$("#couplingNavigation").siblings('div.ui-dialog-titlebar').remove();

	// initialize jsTree in navigation
	var navigationDiv = document.createElement("div");
	$(navigationDiv).jstree({
		json_data : {
			"ajax" : {
				"url" : "/getRoomHierarchy",
				"data" : function (n) {
					return { id : n.attr ? n.attr("id") : "" };
				}
			},
			"ui" : {
				"select_limit" : 1,
			},
		},
		plugins : [ "themes", "json_data", "ui" ],
		callback : {
	      	onselect: function(node, tree) {
	         	alert('test');
	      	}
   		}
	}).bind('select_node.jstree', function(event,data) { 
		var selectedObj = data.rslt.obj;
		var roomId = selectedObj.attr("id");

		if (ObjectManager.getRoomID('left') != roomId && ObjectManager.getRoomID('right') != roomId) {
        	ObjectManager.loadRoom(selectedObj.attr("id"), true, 'right');
        	$('#couplingGreyRectangle').remove();
        	GUI.addRightCouplingControl();
        } else {
        	alert('error');
        }
	});
	$('#couplingNavigation').append(navigationDiv);

	// initialize left zoom and pan control
	var leftControl = GUI.svg.group($('#canvas'), { x: 0, y: $('#couplingBar').attr('y2')-120, width: 100, height: 100 });
	$(leftControl).attr('id', 'leftCouplingControl');
	GUI.svg.rect(leftControl, 0, $('#couplingBar').attr('y2')-120, 100, 100, 0, 0, { strokeWidth: 1, stroke: 'black', fill: 'white' });
	GUI.svg.circle(leftControl, 50, $('#couplingBar').attr('y2')-70, 20, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
	var zoomMinus = GUI.svg.circle(leftControl, 50, $('#couplingBar').attr('y2')-61, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
	$(zoomMinus).addClass('couplingButton');
	$(zoomMinus).click(function() { GUI.zoom('left', 0.8); });
	var zoomPlus = GUI.svg.circle(leftControl, 50, $('#couplingBar').attr('y2')-79, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
	$(zoomPlus).addClass('couplingButton');
	$(zoomPlus).click(function() { GUI.zoom('left', 1.25); });
	var plusMinus = GUI.svg.rect(leftControl, 46, $('#couplingBar').attr('y2')-62, 8, 3);
	$(plusMinus).addClass('couplingPlusMinus');
	var plusMinus = GUI.svg.rect(leftControl, 46, $('#couplingBar').attr('y2')-81, 8, 3);
	$(plusMinus).addClass('couplingPlusMinus');
	var plusMinus = GUI.svg.rect(leftControl, 48.5, $('#couplingBar').attr('y2')-84, 3, 9);
	$(plusMinus).addClass('couplingPlusMinus');
	var path = GUI.svg.createPath();
	var panRight = GUI.svg.path(leftControl, 
		path.move(75, $('#couplingBar').attr('y2')-80)
			.line(90, $('#couplingBar').attr('y2')-70)
			.line(75, $('#couplingBar').attr('y2')-60)
			.close() 
	);
	$(panRight).addClass('couplingButton');
	$(panRight).click(function() { GUI.pan('left',-50,0); });
	var path = GUI.svg.createPath();
	var panLeft = GUI.svg.path(leftControl, 
		path.move(25, $('#couplingBar').attr('y2')-80)
			.line(10, $('#couplingBar').attr('y2')-70)
			.line(25, $('#couplingBar').attr('y2')-60)
			.close()
	);
	$(panLeft).addClass('couplingButton');
	$(panLeft).click(function() { GUI.pan('left',50,0); });
	var path = GUI.svg.createPath();
	var panTop = GUI.svg.path(leftControl, 
		path.move(40, $('#couplingBar').attr('y2')-95)
			.line(50, $('#couplingBar').attr('y2')-110)
			.line(60, $('#couplingBar').attr('y2')-95)
			.close()
	);
	$(panTop).addClass('couplingButton');
	$(panTop).click(function() { GUI.pan('left',0,50); });
	var path = GUI.svg.createPath();
	var panBottom = GUI.svg.path(leftControl, 
		path.move(40, $('#couplingBar').attr('y2')-45)
			.line(50, $('#couplingBar').attr('y2')-30)
			.line(60, $('#couplingBar').attr('y2')-45)
			.close()
	);
	$(panBottom).addClass('couplingButton');
	$(panBottom).click(function() { GUI.pan('left',0,-50); });
	
	// initialize grey rectangle in right work area
	var greyRectangle = GUI.svg.rect($('#room_right'),
		0, //x
		0, //y
		($(window).width() / 2), //width
		$(window).height() //height
	);
	$(greyRectangle).attr("fill", "grey");
	$(greyRectangle).attr("id", "couplingGreyRectangle");

	// resize left and right room
	//$('#room_left').attr('viewBox', '0 0 ' + ($(window).width() / 2) + ' ' + ($(window).height() + 33));
	//$('#room_right').attr('viewBox', '0 0 ' + ($(window).width() / 2) + ' ' + ($(window).height() + 33));
	$('#room_right').attr("x", ($(window).width() / 2));
	$('#room_right').attr("width", ($(window).width() / 2));
	$('#room_left').attr("width", ($(window).width() / 2));

	// TODO
	//$("#header").attr("width", $(window).width());
	$("#canvas").css("width", $(window).width());
	$("#canvas").css("height", $(window).height());
	$("#content").css("width", $(window).width());
	$("#content").css("height", $(window).height());
}

/**
 * Close the coupling mode
 */
GUI.closeCouplingMode = function() {
	
	GUI.couplingModeActive = false;

	GUI.couplingNavigationActive = false;
	
	$('#couplingBar').remove();

	GUI.sidebar.restoreFromSavedState();
	
	$("#header").find(".jCoupling_navi").remove();
	
	$("#header > div.header_left").children().show();
	$("#header > div.header_right").children().show();

	$('#couplingNavigation').dialog("close");
	$('#couplingNavigation').html("");

	$('#couplingGreyRectangle').remove();

	$('#leftCouplingControl').remove();
	$('#rightCouplingControl').remove();

	GUI.couplingTransformMatrix = { 'left': [1,0,0,1,0,0], 'right' : [1,0,0,1,0,0] };
	var newMatrix = "matrix(" +  [1,0,0,1,0,0].join(' ') + ")";
  	$('#room_left').attr("transform", newMatrix);
  	$('#room_right').attr("transform", newMatrix);

	$('#room_right').attr('x', '');
	$('#room_left').attr('width', '');

	ObjectManager.leaveRoom('', 'right');

	GUI.adjustContent();
}

GUI.addRightCouplingControl = function() {
	if ($("#rightCouplingControl").length == 0) {
		var rightControl = GUI.svg.group($('#canvas'), { x: $(window).width()-100, y: $('#couplingBar').attr('y2')-120, width: 100, height: 100 });
		$(rightControl).attr('id', 'rightCouplingControl');
		GUI.svg.rect(rightControl, $(window).width()-100, $('#couplingBar').attr('y2')-120, 100, 100, 0, 0, { strokeWidth: 1, stroke: 'black', fill: 'white' });
		GUI.svg.circle(rightControl, $(window).width()-50, $('#couplingBar').attr('y2')-70, 20, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		var zoomMinus = GUI.svg.circle(rightControl, $(window).width()-50, $('#couplingBar').attr('y2')-61, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		$(zoomMinus).addClass('couplingButton');
		$(zoomMinus).click(function() { GUI.zoom('right', 0.8); });
		var zoomPlus = GUI.svg.circle(rightControl, $(window).width()-50, $('#couplingBar').attr('y2')-79, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		$(zoomPlus).addClass('couplingButton');
		$(zoomPlus).click(function() { GUI.zoom('right', 1.25); });
		var plusMinus = GUI.svg.rect(rightControl, $(window).width()-54, $('#couplingBar').attr('y2')-62, 8, 3);
		$(plusMinus).addClass('couplingPlusMinus');
		var plusMinus = GUI.svg.rect(rightControl, $(window).width()-54, $('#couplingBar').attr('y2')-81, 8, 3);
		$(plusMinus).addClass('couplingPlusMinus');
		var plusMinus = GUI.svg.rect(rightControl, $(window).width()-51.5, $('#couplingBar').attr('y2')-84, 3, 9);
		$(plusMinus).addClass('couplingPlusMinus');
		var path = GUI.svg.createPath();
		var panRight = GUI.svg.path(rightControl, 
			path.move($(window).width()-25, $('#couplingBar').attr('y2')-80)
				.line($(window).width()-10, $('#couplingBar').attr('y2')-70)
				.line($(window).width()-25, $('#couplingBar').attr('y2')-60)
				.close() 
		);
		$(panRight).addClass('couplingButton');
		$(panRight).click(function() { GUI.pan('right',-50,0); });
		var path = GUI.svg.createPath();
		var panLeft = GUI.svg.path(rightControl, 
			path.move($(window).width()-75, $('#couplingBar').attr('y2')-80)
				.line($(window).width()-90, $('#couplingBar').attr('y2')-70)
				.line($(window).width()-75, $('#couplingBar').attr('y2')-60)
				.close()
		);
		$(panLeft).addClass('couplingButton');
		$(panLeft).click(function() { GUI.pan('right',50,0); });
		var path = GUI.svg.createPath();
		var panTop = GUI.svg.path(rightControl, 
			path.move($(window).width()-60, $('#couplingBar').attr('y2')-95)
				.line($(window).width()-50, $('#couplingBar').attr('y2')-110)
				.line($(window).width()-40, $('#couplingBar').attr('y2')-95)
				.close()
		);
		$(panTop).addClass('couplingButton');
		$(panTop).click(function() { GUI.pan('right',0,50); });
		var path = GUI.svg.createPath();
		var panBottom = GUI.svg.path(rightControl, 
			path.move($(window).width()-60, $('#couplingBar').attr('y2')-45)
				.line($(window).width()-50, $('#couplingBar').attr('y2')-30)
				.line($(window).width()-40, $('#couplingBar').attr('y2')-45)
				.close()
		);
		$(panBottom).addClass('couplingButton');
		$(panBottom).click(function() { GUI.pan('right',0,-50); });
	}
}

GUI.zoom = function(index, factor) {
	var width = $('#room_'+index).width();
	var height = $('#room_'+index).height();

  	for (var i=0; i<GUI.couplingTransformMatrix[index].length; i++) {
    	GUI.couplingTransformMatrix[index][i] *= factor;
  	}

  	GUI.couplingTransformMatrix[index][4] += (1-factor)*width/2;
  	GUI.couplingTransformMatrix[index][5] += (1-factor)*height/2;
		        
  	var newMatrix = "matrix(" +  GUI.couplingTransformMatrix[index].join(' ') + ")";
  	$('#room_'+index).attr("transform", newMatrix);
}

GUI.pan = function(index, dx, dy) {
  	GUI.couplingTransformMatrix[index][4] += dx;
  	GUI.couplingTransformMatrix[index][5] += dy;
            
  	var newMatrix = "matrix(" +  GUI.couplingTransformMatrix[index].join(' ') + ")";
  	$('#room_'+index).attr("transform", newMatrix);
}