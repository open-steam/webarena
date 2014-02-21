"use strict";

GUI.buildObjectView = function(object) {
	// Check for graphical representation on mobile view.
	if (object.hasMobileRep) {
		// Scale the canvas.
		GUI.mobileSVG.configure(
			{width: $(window).width(), height: $(window).height() / 2}, true);
		
		// Build the mobile representation.
		object.buildMobileRep(GUI.mobileSVG);
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
	
	// Create a close button.
	var closeButton = document.createElement("div");
    var buttonText = document.createTextNode("Ansicht schliessen");
    closeButton.appendChild(buttonText);
    $(closeButton).addClass("closeButton");
                
    $("body").append(closeButton);
                
    $(closeButton).bind("click", function() {
		// Close the object view.
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$(objectCont).remove();
		$(closeButton).remove();
        GUI.mobileSVG.clear(true);
    });
	
	// Switch to object view.
	$("#objectlist").fadeOut("slow");
	$("#objectview").fadeIn("slow");
}

GUI.buildAttributeTable = function(object) {
    var table = document.createElement("table");
    $(table).addClass("table");
    
    $.each(object.getAttributes(), function(key, attr) {
        if (attr.description == "name") {
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