GUI.input.bind("start", function(s) {
	console.log("Yeah Start by " + s.type + " at " + s.getX() + ", " + s.getY());
});
GUI.input.bind("move", function(s) {
	console.log("Yeah Move by " + s.type);
});
GUI.input.bind("end", function(s) {
	console.log("Yeah End by " + s.type + " at " + s.getX() + ", " + s.getY());
});
/**
 * add start event handler
 *//*
GUI.input.bind("start", function(s) {
	jPopoverManager.hideAll();

	// var contentPosition = $("#content").offset();
	
	// var x = s.getX()-contentPosition.left;
	// var y = s.getY()-contentPosition.top;
	
	var temp=s.target;
		
	//object creation via object symbols
	var cursor = $("body").css('cursor');	
	if(cursor != "auto"){
		
		var t = cursor.split("/");
		var s = t[4].split(")");
		var r = s[0];
		
		//special case for Firefox
		if(r.charCodeAt(r.length-1)==34){
			r = r.slice(0,r.length-1);
		}
		
		var proto = ObjectManager.getPrototype(r);
	
		GUI.startNoAnimationTimer();
				
		proto.create({
				"x" : s.getX()-30, 
				"y" : s.getY()-65
		});
	
		$("body").css( 'cursor', 'auto' );			
	}
	
	//after selecting the arrow startpoint change the cursor text to arrow endpoint
	if(GUI.getCursorText()==GUI.translate('Choose Arrow-Startpoint')){
		GUI.setCursorText(GUI.translate("Choose Arrow-Endpoint"));
					
		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', position.left+','+position.top);
		
	}
	
	//after selecting the line startpoint change the cursor text to line endpoint
	if(GUI.getCursorText()==GUI.translate('Choose Line-Startpoint')){
		GUI.setCursorText(GUI.translate("Choose Line-Endpoint"));

		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', position.left+','+position.top);	
	}
	
	//after selecting the arrow endpoint create the arrow and set the position with GUI.setFinalPosition
	if(GUI.getCursorText()==GUI.translate('Choose Arrow-Endpoint')){
		GUI.setCursorText("");

		var proto = ObjectManager.getPrototype('Arrow');
	
		GUI.startNoAnimationTimer();
		
		var title = $('#besideMouse').attr('title');
		
		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', title+','+position.left+','+position.top);
								
		var attributes;
		var content;			
			
		ObjectManager.createObject(proto.type,attributes,content,GUI.setFinalPosition);	
	}
	
	//after selecting the line endpoint create the line and set the position with GUI.setFinalPosition
	if(GUI.getCursorText()==GUI.translate('Choose Line-Endpoint')){
		GUI.setCursorText("");

		var proto = ObjectManager.getPrototype('Line');
	
		GUI.startNoAnimationTimer();
		
		var title = $('#besideMouse').attr('title');
		
		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', title+','+position.left+','+position.top);
								
		var attributes;
		var content;			
			
		ObjectManager.createObject(proto.type,attributes,content,GUI.setFinalPosition);
	}
	
	
	while (temp && !temp.dataObject) {
		temp=$(temp).parent()[0];
	}
	
	var clickedObject=(temp)?temp.dataObject:false;
	
	//TODO check if this can be done similarly for touch devices

	if (GUI.couplingModeActive) {
		if (s.getX() > $('#couplingBar').attr('x1') && $('#couplingBar:hover').length == 0) {
			if ($('#rightCouplingControl:hover').length == 0) {
				if (GUI.defaultZoomPanState('right', false, event)) return;
			}
		} else {
			if ($('#leftCouplingControl:hover').length == 0) {
				if (GUI.defaultZoomPanState('left', false, event)) return;
			}
		}
	}

	if (clickedObject) {
		// Objects with restricted moving areas should get the "native" events
		// Only if clicked on the moving area, e.g. actionbar the default event handling
		// should be prevented
		// if(! clickedObject.restrictedMovingArea || $(event.target).hasClass("moveArea")){
			// event.preventDefault();
			// event.stopPropagation();
		// }

		//clickedObject.click(event);
	} else {
		//clicked on background
		// event.preventDefault();
		// event.stopPropagation();
		//GUI.rubberbandStart(event);
		GUI.updateInspector(true);
	}
});*/

/**
 * add move event handler
 *//*
GUI.input.bind("move", function(s) {
	var x = s.getX();
	var y = s.getY();
	
	var images=$('image');
	
	$.each(images, function(index, image) {
		
		var parent=$(image).parent();
		
		if (!image.hasPixelAtMousePosition) {
			//console.log('Missing hasPixelAtMousePosition for ',parent);
			return;
		}
		
		if(image.hasPixelAtMousePosition(x,y)){
			parent.attr('pointer-events','visiblePainted');
		} else {
			parent.attr('pointer-events','none');
		}
		
	});
});*/