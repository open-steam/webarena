"use strict";

GUI.editValueTable = function(webarenaObject) {
	var content = JSON.parse(webarenaObject.content);
	var dom = $('<table></table>');
	var xValues = $('<tr></tr>');
	var yValues = $('<tr></tr>');
	
	for (var i = 0; i < content.points.length; ++i) {
		var valueX = $('<td><input type="text" name="x' + i + '" value="' + content.points[i][0] + '" /></td>');
		var valueY = $('<td><input type="text" name="y' + i + '" value="' + content.points[i][1] + '" /></td>');
		
		$(xValues).append(valueX);
		$(yValues).append(valueY);
	}
	
	var addValuePair = $('<input type="button" name="newValuePair" value="Neuer Eintrag" />');
	$(addValuePair).bind("click", function() {
		content.points.push([0, 0]);
		
		webarenaObject.setContent(JSON.stringify(content));
	});
	
	$(dom).append(addValuePair);
	$(dom).append(xValues);
	$(dom).append(yValues);
	
	var buttons = {};
	
	buttons[GUI.translate("save")] = function(domContent){
		for (var i = 0; i < content.points.length; ++i) {
			var valueX = $(domContent).find('input[name=x' + i + ']').val();
			var valueY = $(domContent).find('input[name=y' + i + ']').val();
			
			content.points[i][0] = valueX;
			content.points[i][1] = valueY;
			
			webarenaObject.setContent(JSON.stringify(content));
		}
	};
	
	GUI.dialog("Edit value table", dom, buttons)
}