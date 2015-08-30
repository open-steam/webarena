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
	
	ObjectView.current.refresh();
}

ObjectView.build = function(object) {
	ObjectView.current = object;
	object.setVisibility(true);
	
	// Create the title bar of the object view.
	var titlebar = $('<div></div>');
	var titlebarInner = $('<p style="margin: 0px; padding: 0px"></p>');
	var backButton = $('<img src="../../guis/mobilephone/images/abc_ic_ab_back_holo_light.png" style="opacity: 1; vertical-align: middle; margin-right: 14px; cursor: pointer" />');
	$(titlebarInner).append(backButton);
	$(titlebarInner).append('<span style="vertical-align: middle">' + object.getName() + '</span>');
	$(titlebar).append(titlebarInner);
	$(titlebar).addClass("header");
	
	$("body").append(titlebar);
	
	$(backButton).bind("click", function() {
		object.setVisibility(false);
		ObjectView.current.draw();
		ObjectView.settings.visible = false;
		ObjectList.settings.visible = true;
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$("#objectview div").remove();
		$(titlebar).remove();
	});
	
	ObjectView.current.refresh();
	
	// Create the attribute table.
	var wrapper = $('<div id="attributes"></div>');
	wrapper.append(ObjectView.buildAttributeTable(object));
	$('#objectview').append(wrapper);
}

ObjectView.update = function(object, key, newValue, local) {
	if (object != ObjectView.current) {
		return;
	}
	if (!ObjectView.settings.visible) {
		return;
	}
	
	if (ObjectView.current.hasMobileRep) {
		ObjectView.current.refresh();
	}
	ObjectView.updateContent(object);
}

ObjectView.updateContent = function(object) {
	// Create the attribute table.
	$('#attributes').empty();
	var attrTable = ObjectView.buildAttributeTable(object);
	$('#attributes').append(attrTable);
	
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
