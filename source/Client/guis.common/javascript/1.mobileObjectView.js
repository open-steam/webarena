"use strict";

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
	// Create the title bar of the object view.
	GUI.currentObject = object;
	var titlebar = document.createElement("div");
	titlebar.appendChild(document.createTextNode(object.getName()));
	$(titlebar).addClass("header");
	
	$("body").append(titlebar);
	
	$(titlebar).bind("click", function() {
		object.isSelectedOnMobile = false;
		GUI.currentObject.draw();
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$(objectCont).remove();
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

GUI.updateObjectView = function(object, key, newValue, local) {
	GUI.refreshMobileRepresentation();
}

GUI.refreshMobileRepresentation = function() {
	GUI.svg.configure(
		{width: $(window).width(), height: $(window).width()}, true);
	GUI.currentObject.draw();
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