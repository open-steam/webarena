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
GUI.enterCouplingMode = function() {

	if (Modules.Config.couplingMode) {
		GUI.couplingModeActive = true;

		GUI.couplingNavigationActive = true;

		GUI.sidebar.saveStateAndHide();

		window.scrollTo(0, 0);
		$('body').css('overflow', 'hidden');

		$("#header > div.header_left").children().hide();
		$("#header > div.header_right").children().hide();
		
		// add navigation button
		var navigationButton = document.createElement("span");
		$(navigationButton).addClass("header_button");
		$(navigationButton).addClass("jCoupling_navi");
		$(navigationButton).html(GUI.translate("Navigation"));
		$(navigationButton).bind("click", function(event) {
			if (GUI.couplingNavigationActive) {
				$('#couplingNavigation').hide('blind');
				GUI.couplingNavigationActive = false;
			} else {
				$('#couplingNavigation').show('blind');
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
		$(verticalBar).bind('mousedown', function(event) {
		    $(document).bind('mousemove', function(event) {
		       	$(verticalBar).attr('x1', event.pageX);
		       	$(verticalBar).attr('x2', event.pageX);

		       	$('#room_right_wrapper').attr('x', event.pageX);
				$('#room_right_wrapper').attr('width', $(window).width() - event.pageX);
				$('#couplingGreyRectangle').attr('width', $(window).width() - event.pageX);
				$('#room_left_wrapper').attr('width', event.pageX);

				$(navigationButton).offset({
					left : (event.pageX - ($(navigationButton).width() / 2) - 10)
				})	
				$('#couplingNavigation').dialog({
					position: [event.pageX - 100, 30],
				});
		    });

		    $(document).bind('mouseup',function(){
		        $(document).unbind('mousemove')
		    });
		});

		// window resize handling
		$(window).resize(function() {
			if (GUI.couplingModeActive) {
				$('#couplingBar').attr('y2', $(window).height());

				$('#couplingGreyRectangle').attr('height', $(window).height());
				$('#couplingGreyRectangle').attr('width', $(window).width() - $('#couplingBar').attr('x1'));

				$('#room_right_wrapper').attr('height', $(window).height());
				$('#room_right_wrapper').attr('width', $(window).width() - $('#couplingBar').attr('x1'));

				$('#leftCouplingControl').attr('y', $(window).height()-138);
				$('#rightCouplingControl').attr('y', $(window).height()-138);

				$("#canvas").css("width", $(window).width());
				$("#content").css("width", $(window).width());
				
				$("#canvas").css("height", $(window).height());
				$("#content").css("height", $(window).height());
			}
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
	        	GUI.addZoomPanControl('right', $(window).width()-105, $('#couplingBar').attr('y2')-138);
	        } else {
	        	alert(GUI.translate("Room already displayed"));
	        }
		});
		$('#couplingNavigation').append(navigationDiv);

		// initialize left zoom and pan control
		GUI.addZoomPanControl('left', 4, $('#couplingBar').attr('y2')-138);
		
		// initialize grey rectangle in right work area
		var greyRectangle = GUI.svg.rect($('#room_right'),
			0, //x
			0, //y
			($(window).width() / 2), //width
			$(window).height() //height
		);
		$(greyRectangle).attr("fill", "grey");
		$(greyRectangle).attr("id", "couplingGreyRectangle");

		// mouse wheel scrolling
		$(document).bind("mousewheel", function(event, delta, deltaX, deltaY) {
			if (event.pageX < parseInt($('#room_right_wrapper').attr("x"))) {
				GUI.deselectAllObjects();
				GUI.pan('left', deltaX * 25, deltaY * 25);
			} else {
				if (ObjectManager.getRoomID('right')) {
					GUI.deselectAllObjects();
					GUI.pan('right', deltaX * 25, deltaY * 25);
				}
			}
		});

		// resize left and right room
		$('#room_right_wrapper').attr("x", ($(window).width() / 2));
		$('#room_right_wrapper').attr("width", ($(window).width() / 2));
		$('#room_left_wrapper').attr("width", ($(window).width() / 2));

		$("#canvas").css("width", $(window).width());
		$("#canvas").css("height", $(window).height());
		$("#content").css("width", $(window).width());
		$("#content").css("height", $(window).height());
	}
}

/**
 * Close the coupling mode
 */
GUI.closeCouplingMode = function() {
	
	GUI.couplingModeActive = false;

	GUI.couplingNavigationActive = false;
	
	$('#couplingBar').remove();

	GUI.sidebar.restoreFromSavedState();

	$('body').removeAttr('style');
	
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

  	//document.getElementById('room_left_wrapper').removeAttribute('width');
  	$('#room_left_wrapper').attr("width", "100%"); // else chrome displays an empty workarea
  	//document.getElementById('room_right_wrapper').removeAttribute('x');
  	//document.getElementById('room_right_wrapper').removeAttribute('width');

  	$(document).unbind("mousewheel");

  	ObjectManager.leaveRoom(ObjectManager.getRoomID('right'), 'right', !GUI.relogin);
		
	GUI.adjustContent();

	$('#room_right').html("");
}

GUI.addZoomPanControl = function(index, x, y) {
	if ($("#"+index+"CouplingControl").length == 0) {
		var control = GUI.svg.svg($('#canvas'));
		$(control).attr('id', index+'CouplingControl');
		$(control).attr('x', x);
		$(control).attr('y', y);
		GUI.svg.rect(control, 0, 0, 100, 100, 0, 0, { strokeWidth: 1, stroke: 'black', fill: 'white' });
		GUI.svg.circle(control, 50, 50, 20, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		var zoomMinus = GUI.svg.circle(control, 50, 59, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		$(zoomMinus).addClass('couplingButton');
		$(zoomMinus).click(function() { GUI.zoom(index, 0.8); });
		var zoomPlus = GUI.svg.circle(control, 50, 41, 8, { fill: '#fff', stroke: '#000', strokeWidth: 1.5 });
		$(zoomPlus).addClass('couplingButton');
		$(zoomPlus).click(function() { GUI.zoom(index, 1.25); });
		var plusMinus = GUI.svg.rect(control, 46, 58, 8, 3);
		$(plusMinus).addClass('couplingPlusMinus');
		var plusMinus = GUI.svg.rect(control, 46, 39, 8, 3);
		$(plusMinus).addClass('couplingPlusMinus');
		var plusMinus = GUI.svg.rect(control, 48.5, 36, 3, 9);
		$(plusMinus).addClass('couplingPlusMinus');
		var path = GUI.svg.createPath();
		var panRight = GUI.svg.path(control, 
			path.move(75, 40)
				.line(90, 50)
				.line(75, 60)
				.close() 
		);
		$(panRight).addClass('couplingButton');
		$(panRight).click(function() { GUI.pan(index,-50,0); });
		var path = GUI.svg.createPath();
		var panLeft = GUI.svg.path(control, 
			path.move(25, 40)
				.line(10, 50)
				.line(25, 60)
				.close()
		);
		$(panLeft).addClass('couplingButton');
		$(panLeft).click(function() { GUI.pan(index,50,0); });
		var path = GUI.svg.createPath();
		var panTop = GUI.svg.path(control, 
			path.move(40, 25)
				.line(50, 10)
				.line(60, 25)
				.close()
		);
		$(panTop).addClass('couplingButton');
		$(panTop).click(function() { GUI.pan(index,0,50); });
		var path = GUI.svg.createPath();
		var panBottom = GUI.svg.path(control, 
			path.move(40, 75)
				.line(50, 90)
				.line(60, 75)
				.close()
		);
		$(panBottom).addClass('couplingButton');
		$(panBottom).click(function() { GUI.pan(index,0,-50); });
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
	if (GUI.couplingTransformMatrix[index][4] + dx > 0 || GUI.couplingTransformMatrix[index][5] + dy > 0) return;

  	GUI.couplingTransformMatrix[index][4] += dx;
  	GUI.couplingTransformMatrix[index][5] += dy;
            
  	var newMatrix = "matrix(" +  GUI.couplingTransformMatrix[index].join(' ') + ")";
  	$('#room_'+index).attr("transform", newMatrix);
}

GUI.getPanX = function(index) {
	return GUI.couplingTransformMatrix[index][4];
}

GUI.getPanY = function(index) {
	return GUI.couplingTransformMatrix[index][5];
}

GUI.defaultZoomPanState = function(index, roomChange, event) {
	var defaultMatrix = [1,0,0,1,0,0];
	if (roomChange) {
		GUI.couplingTransformMatrix[index] = defaultMatrix;

		var newMatrix = "matrix(" +  GUI.couplingTransformMatrix[index].join(' ') + ")";
	  	$('#room_'+index).attr("transform", newMatrix);

	  	return true;
	} else if (GUI.couplingTransformMatrix[index].join(',') !== defaultMatrix.join(',') && (GUI.couplingTransformMatrix[index][0] != 1 || GUI.couplingTransformMatrix[index][3] != 1)) {
		GUI.couplingTransformMatrix[index][4] = parseInt(GUI.couplingTransformMatrix[index][4] / GUI.couplingTransformMatrix[index][0]);
		if (GUI.couplingTransformMatrix[index][4] > 0) {
			GUI.couplingTransformMatrix[index][4] = 0;
		}
		GUI.couplingTransformMatrix[index][5] = parseInt(GUI.couplingTransformMatrix[index][5] / GUI.couplingTransformMatrix[index][0]);
		if (GUI.couplingTransformMatrix[index][5] > 0) {
			GUI.couplingTransformMatrix[index][5] = 0;
		}
		GUI.couplingTransformMatrix[index][0] = 1;
		GUI.couplingTransformMatrix[index][3] = 1;


		var newMatrix = "matrix(" +  GUI.couplingTransformMatrix[index].join(' ') + ")";
	  	$('#room_'+index).attr("transform", newMatrix);

	  	return true;
	} else return false;
}