"use strict";

GUI.objectViewSettings = {
    visible: false,
}

window.onresize = function() {
	if (GUI.currentObject == null) {
		return;
	}
	
	if (GUI.currentObject.hasMobileRep) {
		GUI.refreshMobileRepresentation();
	}
}

GUI.currentObject = null;

GUI.buildObjectView = function(object) {
	ObjectManager.registerOnContentUpdateListener(this.onContentUpdate);
	// Create the title bar of the object view.
	GUI.currentObject = object;
	var titlebar = document.createElement("div");
	var title = $('<p style="margin: 0px; padding: 0px"></p>')
	var backImg = $('<img src="../../guis/mobilephone/images/abc_ic_ab_back_holo_light.png" style="opacity: 1; vertical-align: middle; margin-right: 14px; cursor: pointer" />');
	$(title).append(backImg);
	$(title).append('<span style="vertical-align: middle">' + object.getName() + '</span>');
	$(titlebar).append(title);
	$(titlebar).addClass("header");
	
	$("body").append(titlebar);
	
	$(backImg).bind("click", function() {
		object.isSelectedOnMobile = false;
		GUI.currentObject.draw();
		GUI.objectViewSettings.visible = false;
		GUI.objectListSettings.visible = true;
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$("#objectview div").empty();
		$(titlebar).remove();
	});
	
	// Check for graphical representation on mobile view.
	if (object.hasMobileRep) {
		// Scale the canvas.
		object.isSelectedOnMobile = true;
		GUI.refreshMobileRepresentation();
		// Build the mobile representation.
		// object.buildMobileRep(GUI.mobileSVG);
	}
	
	var objectCont = document.createElement('div');
	$(objectCont).addClass("objectcontent");
	
	// Check for editable content on mobile view.
	if (object.hasEditableMobileContent) {
		var form = object.buildFormForEditableContent();
		$(objectCont).append(form);
	}
	
	// Create the attribute table.
	var attrTable = GUI.buildAttributeTable(object);
	$(objectCont).append(attrTable);
	
	$('#objectview').append(objectCont);
}

GUI.onContentUpdate = function(object) {
	if (!GUI.objectViewSettings.visible) {
		return;
	}
	
	GUI.updateContent(object);
}

GUI.updateObjectView = function(object, key, newValue, local) {
	if (!GUI.objectViewSettings.visible) {
		return;
	}
	
	GUI.refreshMobileRepresentation();
	GUI.updateContent(object);
}

GUI.refreshMobileRepresentation = function() {
	GUI.svg.configure(
		{width: $(window).width(), height: $(window).width()}, true);
	$("#objectview svg").attr("style", "background-color: white");
	GUI.currentObject.draw();
}

GUI.updateContent = function(object) {
	$("#objectview div").empty();
	
	var objectCont = document.createElement('div');
	
	// Check for editable content on mobile view.
	if (object.hasEditableMobileContent) {
		var form = object.buildFormForEditableContent();
		$(objectCont).append(form);
	}
	
	// Create the attribute table.
	var attrTable = GUI.buildAttributeTable(object);
	$(objectCont).append(attrTable);
	
	$('#objectview').append(objectCont);
	
	// Switch to object view.
	$("#objectlist").fadeOut("slow");
	$("#objectview").fadeIn("slow");
}

GUI.buildAttributeTable = function(object) {
    var table = document.createElement("table");
    $(table).addClass("table");
    
    $.each(object.getAttributes(), function(key, attr) {
        if (attr.description == "name" ||
			attr.description == 'layer' ||
			attr.description == 'x' ||
			attr.description == 'y' ||
			attr.description == 'hasContent') {
			return true;
		}
        
        var attrDesc = document.createTextNode(object.translate(GUI.currentLanguage, attr.description));
        var attrVal = document.createTextNode(attr.value);
        var leftCell = document.createElement("td");
        $(leftCell).addClass("leftCell");
        var rightCell = document.createElement("td");
        $(rightCell).addClass("rightCell");
        var row = document.createElement("tr");
        $(row).addClass("row");
        
        leftCell.appendChild(attrDesc);
        rightCell.appendChild(attrVal);
        row.appendChild(leftCell);
        row.appendChild(rightCell);
        table.appendChild(row);
    });
    
    return table;
}