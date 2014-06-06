"use strict";

GUI.editValueTable = function(webarenaObject) {
	var content = webarenaObject.getContentAsObject();
	var dom = $('<table></table>');
	var titleSettings = $("<tr></tr>");
	var xAxisSettings = $("<tr></tr>");
	var yAxisSettings = $("<tr></tr>");
	
	var title  = $('<td>Titel:</td><td><input type="text" name="title" value="' + content.title + '" /></td>');
	var xLabel = $('<td>Label X-Achse:</td><td><input type="text" name="xLabel" value="' + content.xAxis.label + '" /></td>');
	var xMin   = $('<td>Minimum X-Achse:</td><td><input type="text" name="xMin" value="' + content.xAxis.scale.min + '" /></td>');
	var xMax   = $('<td>Maximum X-Achse:</td><td><input type="text" name="xMax" value="' + content.xAxis.scale.max + '" /></td>');
	var yLabel = $('<td>Label Y-Achse:</td><td><input type="text" name="yLabel" value="' + content.yAxis.label + '" /></td>');
	var yMin   = $('<td>Minimum Y-Achse:</td><td><input type="text" name="yMin" value="' + content.yAxis.scale.min + '" /></td>');
	var yMax   = $('<td>Maximum Y-Achse:</td><td><input type="text" name="yMax" value="' + content.yAxis.scale.max + '" /></td>');
	
	$(titleSettings).append(title);
	$(xAxisSettings).append(xLabel);
	$(xAxisSettings).append(xMin);
	$(xAxisSettings).append(xMax);
	$(yAxisSettings).append(yLabel);
	$(yAxisSettings).append(yMin);
	$(yAxisSettings).append(yMax);
	$(dom).append(titleSettings);
	$(dom).append(xAxisSettings);
	$(dom).append(yAxisSettings);
	/*
	var xValues = $('<tr></tr>');
	var yValues = $('<tr></tr>');
	
	for (var i = 0; i < content.values.length; ++i) {
		var valueX = $('<td><input type="text" name="x' + i + '" value="' + content.values[i][0] + '" /></td>');
		var valueY = $('<td><input type="text" name="y' + i + '" value="' + content.values[i][1] + '" /></td>');
		
		$(xValues).append(valueX);
		$(yValues).append(valueY);
	}
	
	var addValuePair = $('<input type="button" name="newValuePair" value="Neuer Eintrag" />');
	$(addValuePair).bind("click", function() {
		content.values.push([0, 0]);
		
		webarenaObject.setContent(JSON.stringify(content));
		content = JSON.parse(webarenaObject.content);
		
		var newValueX = $('<td><input type="text" name="x' + i + '" value="' + content.values[content.length-1][0] + '" /></td>');
		var newValueY = $('<td><input type="text" name="y' + i + '" value="' + content.values[content.length-1][1] + '" /></td>');
		$(xValues).append(newValueX);
		$(yValues).append(newValueY);
	});
	*/
	
	//$(dom).append(addValuePair);
	//$(dom).append(xValues);
	//$(dom).append(yValues);
	
	var buttons = {};
	
	buttons[GUI.translate("save")] = function(domContent){
		var title = $(domContent).find('input[name=title]').val();
		var xLabel = $(domContent).find('input[name=xLabel]').val();
		var xMin = $(domContent).find('input[name=xMin]').val();
		var xMax = $(domContent).find('input[name=xMax]').val();
		var yLabel = $(domContent).find('input[name=yLabel]').val();
		var yMin = $(domContent).find('input[name=yMin]').val();
		var yMax = $(domContent).find('input[name=yMax]').val();
		
		content.title = title;
		content.xAxis.label = xLabel;
		content.xAxis.scale.min = xMin;
		content.xAxis.scale.max = xMax;
		content.yAxis.label = yLabel;
		content.yAxis.scale.min = yMin;
		content.yAxis.scale.max = yMax;
		/*
		for (var i = 0; i < content.values.length; ++i) {
			var valueX = $(domContent).find('input[name=x' + i + ']').val();
			var valueY = $(domContent).find('input[name=y' + i + ']').val();
			
			content.values[i][0] = valueX;
			content.values[i][1] = valueY;
		}
		*/
		
		webarenaObject.setContentAsJSON(content);
	};
	
	GUI.dialog("Plotter Configuration", dom, buttons)
}