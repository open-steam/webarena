"use strict";

var ObjectView = {};

ObjectView.current = null;

ObjectView.settings = {
    visible: false,
}

window.onresize = function() {
	if (ObjectView.current == null) {
		return;
	}
	
	if (ObjectView.current.hasMobileRep) {
		ObjectView.refreshMobileRepresentation();
	}
}

ObjectView.build = function(object) {
	ObjectManager.registerOnContentUpdateListener(ObjectView.onContentUpdate);
	ObjectView.current = object;
	object.setVisibility(true);
	
	// Create the title bar of the object view.
	var titlebar = $('<div></div>');
	var title = $('<p style="margin: 0px; padding: 0px"></p>');
	var backButton = $('<img src="../../guis/mobilephone/images/abc_ic_ab_back_holo_light.png" style="opacity: 1; vertical-align: middle; margin-right: 14px; cursor: pointer" />');
	$(title).append(backButton);
	$(title).append('<span style="vertical-align: middle">' + object.getName() + '</span>');
	$(titlebar).append(title);
	$(titlebar).addClass("header");
	
	$("body").append(titlebar);
	
	$(backButton).bind("click", function() {
		object.setVisibility(false);
		ObjectView.current.draw();
		ObjectView.settings.visible = false;
		ObjectList.settings.visible = true;
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$("#objectview svg").empty();
		$("#objectview div").remove();
		$(titlebar).remove();
	});
	
	// Check for graphical representation on mobile view.
	if (object.hasMobileRep) {
		// Scale the canvas.
		ObjectView.refreshMobileRepresentation();
	} else {
		$("#objectview svg").attr("style", "display: none");
	}
	
	var objectCont = $('<div></div>');
	$(objectCont).addClass("objectcontent");
	
	// Check for editable content on mobile view.
	if (object.hasEditableMobileContent) {
		var form = object.buildFormForEditableContent();
		form.attr("style", "width: 100%; border-bottom: 1px solid #000000; text-align: center");
		$(objectCont).append(form);
	}
	
	// Create the attribute table.
	var attrTable = ObjectView.buildAttributeTable(object);
	$(objectCont).append(attrTable);
	
	$('#objectview').append(objectCont);
}

ObjectView.onContentUpdate = function(object) {
	if (object != ObjectView.current) {
		return;
	}
	if (!ObjectView.settings.visible) {
		return;
	}
	
	ObjectView.updateContent(object);
}

ObjectView.update = function(object, key, newValue, local) {
	if (object != ObjectView.current) {
		return;
	}
	if (!ObjectView.settings.visible) {
		return;
	}
	
	if (ObjectView.current.hasMobileRep) {
		ObjectView.refreshMobileRepresentation();
	}
	ObjectView.updateContent(object);
}

ObjectView.refreshMobileRepresentation = function() {
	GUI.svg.configure(
		{width: $(window).width(), height: $(window).width()}, true);
	$("#objectview svg").attr("style", "background-color: white");
	ObjectView.current.refresh();
	//GUI.currentObject.draw();
	//$("#objectview svg").children().attr("style", "visibility: hidden");
	//$("#objectview svg").find("#" + GUI.currentObject.getID()).attr("style", "visibility: visible");
	//$("#objectview svg").find("#" + GUI.currentObject.getID()).children().attr("style", "visibility: visible");
}

ObjectView.updateContent = function(object) {
	$("#objectview div").empty();
	
	var objectCont = document.createElement('div');
	
	// Check for editable content on mobile view.
	if (object.hasEditableMobileContent) {
		var form = object.buildFormForEditableContent();
		$(objectCont).append(form);
	}
	
	// Create the attribute table.
	var attrTable = ObjectView.buildAttributeTable(object);
	$(objectCont).append(attrTable);
	
	$('#objectview').append(objectCont);
	
	// Switch to object view.
	$("#objectlist").fadeOut("slow");
	$("#objectview").fadeIn("slow");
}

ObjectView.buildAttributeTable = function(object) {	
	var categories = {};
	$.each(object.getAttributes(), function(attribute, info) {
		if (info.hidden || info.mobile == false) return;

		if (categories[info.category] == undefined) {
			categories[info.category] = {};
		}

		if (categories[info.category][attribute] == undefined) {
			/* add new attribute */
			categories[info.category][attribute] = info;
			categories[info.category][attribute].multipleValues = false;
		}
	});
	
	var categoryTable = $('<table class="table"></table>');
	$.each(categories, function(category, elements) {
		categoryTable.append('<tr><td class="leftCell" colspan="2" style="border-bottom: 1px solid #000000; padding-top: 20px; font-weight: bold;">' + GUI.translate(category) + '</td></tr>');
		
		$.each(elements, function(attribute, info) {
			var row = $('<tr></tr>');
			var attrDesc = $('<td class="leftCell">' + object.translate(GUI.currentLanguage, info.description) + '</td>');
			
			if (info.readonly) {
				var attrVal  = $('<td class="rightCell" style="text-align: right">' + object.translate(GUI.currentLanguage, info.value) + " " + object.translate(GUI.currentLanguage, info.unit) + '</td>');
			} else {
				if (info.type == "number") {
					var attrVal  = $('<td class="rightCell"><input class="input" style="width: 100%; text-align: right" type="text" size="8" value="' + object.translate(GUI.currentLanguage, info.value) + " " + object.translate(GUI.currentLanguage, info.unit) + '"/></td>');
				}
				var attrVal  = $('<td class="rightCell"><input class="input" style="width: 100%; text-align: right" type="text" size="8" value="' + object.translate(GUI.currentLanguage, info.value) + " " + object.translate(GUI.currentLanguage, info.unit) + '"/></td>');
			}
			
			row.append(attrDesc);
			row.append(attrVal);
			categoryTable.append(row);
		});
	});
	
	return categoryTable;
}