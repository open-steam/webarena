/*GUI.input.bind("start", function(s) {
	console.log("Yeah Start by " + s.type + " at " + s.getX() + ", " + s.getY());
});
GUI.input.bind("move", function(s) {
    console.log("Yeah Move by " + s.type);
});
GUI.input.bind("end", function(s) {
    console.log("Yeah End by " + s.type + " at " + s.getX() + ", " + s.getY());
});

GUI.input.bind("tap", function(s) {
    console.log("Yeah Tap by " + s.type + " at " + s.getX() + ", " + s.getY());
});
GUI.input.bind("press", function(s) {
    console.log("Yeah Press by " + s.type + " at " + s.getX() + ", " + s.getY());
});*/

//press object
GUI.input.bind("press", function(session) {console.log(GUI.svg);
	if (session.object !== false) 
		session.object.dblclickHandler(session);
	else GUI.updateInspector(true);
});

//"click" object
GUI.input.bind("start", function(session) {
	jPopoverManager.hideAll();
	
	if(session.object != false)
		session.object.click(session);
	else {
		GUI.hideActionsheet();
		GUI.updateInspector(true);
	}
});

//couplingMode
GUI.input.bind("start", function(session) {	
	if(GUI.couplingModeActive) {
		if (session.getX() > $('#couplingBar').attr('x1') && $('#couplingBar:hover').length == 0) {
			if ($('#rightCouplingControl:hover').length == 0) {
				if (GUI.defaultZoomPanState('right', false)) return;
			}
		} else {
			if ($('#leftCouplingControl:hover').length == 0) {
				if (GUI.defaultZoomPanState('left', false)) return;
			}
		}
	}
});

//mark images parents on move
GUI.input.bind("move", function(session) {
	var x = session.getX();
	var y = session.getY();
	
	var images=$('image');
	
	$.each(images, function(index, image) {
		
		var parent=$(image).parent();
		
		if (!image.hasPixelAtMousePosition) return;
		
		if(image.hasPixelAtMousePosition(x,y)){
			parent.attr('pointer-events','visiblePainted');
		} else {
			parent.attr('pointer-events','none');
		}
		
	});
});

//object creation via object symbols
GUI.input.bind("tap", function(session) {
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
				"x" : session.getX()-30, 
				"y" : session.getY()-65
		});
	
		$("body").css( 'cursor', 'auto' );			
	}
});

//after selecting the arrow startpoint change the cursor text to arrow endpoint
GUI.input.bind("tap", function(session) {
	if(GUI.getCursorText()==GUI.translate('Choose Arrow-Startpoint')){
		GUI.setCursorText(GUI.translate("Choose Arrow-Endpoint"));
					
		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', position.left+','+position.top);
		
	}
});

//after selecting the line startpoint change the cursor text to line endpoint
GUI.input.bind("tap", function(session) {
	if(GUI.getCursorText()==GUI.translate('Choose Line-Startpoint')){
		GUI.setCursorText(GUI.translate("Choose Line-Endpoint"));

		var position = $('#besideMouse').position();
		
		$('#besideMouse').attr('title', position.left+','+position.top);	
	}
});

//after selecting the arrow endpoint create the arrow and set the position with GUI.setFinalPosition
GUI.input.bind("tap", function(session) {
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
});

//after selecting the line endpoint create the line and set the position with GUI.setFinalPosition
GUI.input.bind("tap", function(session) {
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
});