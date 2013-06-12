"use strict";

/**
 * Edit a text using a dialog
 * @param {webarenaObject} webarenaObject The web arena object
 * @param {bool} multiLine True if multiple lines should be edited
 * @param {int} width Width of the dialog
 * @param {int} [height] Height of the dialog
 * @param {bool} [passThrough] Additional options for the dialog
 */
GUI.editText = function(webarenaObject, multiLine, width, height, passThrough) {
	
	var style = 'font-family: '+webarenaObject.getAttribute("font-family")+'; ';
	style += 'color: '+webarenaObject.getAttribute("font-color")+'; ';
	style += 'font-size: '+webarenaObject.getAttribute("font-size")+'px; ';
	style += 'resize:none; ';
	style += 'width: 100%; ';
	
	if (height) {
		style += 'height: '+height+'px; ';
	} else {
		style += 'height: 100%; ';
	}
	
	if (multiLine) {
		var dom = $('<textarea name="textedit" style="'+style+'">'+webarenaObject.getContentAsString()+'</textarea>');
	} else {
		var content = webarenaObject.getContentAsString();
		var placeholder = webarenaObject.translate(webarenaObject.currentLanguage, 'No text yet!');
		if (content == placeholder) content = "";
		else placeholder = "";

		var dom = $('<input type="text" name="textedit" value="'+content.replace(/"/g, "&quot;")+'" placeholder="'+placeholder+'" style="'+style+'" />');
		dom.bind("keyup", function(event) {
			if (event.keyCode == 13) {
				dom.parent().parent().find(".ui-button-text").click();
			}
		});
	}
	
	var buttons = {};
	
	buttons[GUI.translate("save")] = function(domContent){
		
		if (multiLine) {
		
			var value = $(domContent).find("textarea").val();
			webarenaObject.setContent(value);
		
		} else {
		
			var value = $(domContent).find("input").val();
			webarenaObject.setContent(value);
		
		}
		
	};
	
	GUI.dialog(GUI.translate("Edit text"), dom, buttons, width, passThrough);
	
}