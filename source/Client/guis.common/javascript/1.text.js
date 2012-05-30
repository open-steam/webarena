"use strict";

GUI.editText = function(webarenaObject, multiLine, width, height) {
	
	var style = 'font-family: '+webarenaObject.getAttribute("font-family")+'; ';
	style += 'color: '+webarenaObject.getAttribute("font-color")+'; ';
	style += 'font-size: '+webarenaObject.getAttribute("font-size")+'px; ';
	style += 'width: 100%; ';
	
	if (height) {
		style += 'height: '+height+'px; ';
	} else {
		style += 'height: 100%; ';
	}
	
	if (multiLine) {
		var dom = '<textarea name="textedit" style="'+style+'">'+webarenaObject.getContentAsString()+'</textarea>';
	} else {
		var dom = '<input type="text" name="textedit" value="'+webarenaObject.getContentAsString()+'" style="'+style+'" />';
	}
	
	GUI.dialog("edit text", dom, {
		"save" : function(domContent){
			
			if (multiLine) {
			
				var value = $(domContent).find("textarea").val();
				webarenaObject.setContent(value);
			
			} else {
			
				var value = $(domContent).find("input").val();
				webarenaObject.setContent(value);
			
			}
			
		}
	}, width);
	
}