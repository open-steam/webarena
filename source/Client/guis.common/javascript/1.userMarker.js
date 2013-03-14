"use strict";

GUI.userMarker = {
	
	"markers" : {},
	
	"setPosition" : function(objId) {
	
		if (GUI.userMarker.markers[objId] == undefined) return;
		
		var obj = ObjectManager.getObject(objId);
		
		var x = obj.getViewBoundingBoxX();
		var y = obj.getViewBoundingBoxY()-6;
	
		for (var i in GUI.userMarker.markers[objId]["markers"]) {
			var marker = GUI.userMarker.markers[objId]["markers"][i];
			
			y = y-$(marker).find("rect").attr("height")-2;
			
			$(marker).attr("transform", "translate("+x+","+y+")");
			
		}
		
	},
	
	"select" : function(data) {
		
		var infoBox = GUI.svg.group("selection_"+data.objectId+"_"+data.identifier);

		$(infoBox).attr("transform", "translate(200,100)");

		var rect = GUI.svg.rect(infoBox, 0,0,100,16, 3,3);
		$(rect).attr("fill", data.color);

		var text = GUI.svg.text(infoBox, 3, 12, data.title);
		$(text).attr("font-size", 11);
		$(text).attr("fill", "#ffffff");

		var textWidth = $(infoBox).find("text").get(0).getBBox().width;
		
		$(infoBox).find("rect").attr("width", textWidth+6);

		if (GUI.userMarker.markers[data.objectId] === undefined) {
			GUI.userMarker.markers[data.objectId] = {
				"markers" : []
			}
		}
		
		GUI.userMarker.markers[data.objectId]["markers"][data.identifier] = infoBox;

		GUI.userMarker.setPosition(data.objectId);
		
	},
	
	"deselect" : function(data) {

		$(GUI.userMarker.markers[data.objectId]["markers"][data.identifier]).remove();
		GUI.userMarker.markers[data.objectId]["markers"][data.identifier] = undefined;
		
	}
	
}