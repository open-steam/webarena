"use strict";

/**
 * @namespace Functions to control markers which display user activity
 */
GUI.userMarker = {
	
	/**
	 * List of markers
	 * 
	 * {
	 * 		"objectId" : {
	 * 			"markers" : {
	 * 				"marker identifier" : MarkerDOMElement,
	 * 				...
	 * 			}, 
	 * 			...
	 * 		},
	 * 		...
	 * }
	 * 
	 */
	"markers" : {},
	
	/**
	 * set position of markers for an webarena object
	 * @param {int} objId ID of webarena object
	 * @param {bool} noAnimation True to prevent animation
	 */
	"setPosition" : function(objId, noAnimation) {
	
		if (GUI.userMarker.markers[objId] == undefined) return;
		
		var obj = ObjectManager.getObject(objId);
		
		//var x = obj.getViewBoundingBoxX();
		//var y = obj.getViewBoundingBoxY()-6;
		var x = obj.getAttribute("x");
		var y = obj.getAttribute("y")-6;
	
		for (var i in GUI.userMarker.markers[objId]["markers"]) {
			var marker = GUI.userMarker.markers[objId]["markers"][i];

			if (!marker) continue;
			
			y = y-$(marker).find("rect").attr("height")-2;
			
			if (obj.selected || noAnimation) {
				$(marker).attr("transform", "translate("+x+","+y+")");	
			} else {
				$(marker).animate({svgTransform: "translate("+x+","+y+")"}, 1000);
			}
			
		}
		
		
	},
	
	/**
	 * Add new marker
	 * @param {Object} data Object of options
	 * @param {int} data.objectId The webarena object id
	 * @param {String} data.identifier Unique use identifier for the marker
	 * @param {String} data.color The users color
	 * @param {String} data.title The title of the marker (e.g. the username)
	 */
	"select" : function(data) {
		
		if (GUI.userMarker.markers[data.objectId] && GUI.userMarker.markers[data.objectId]["markers"][data.identifier]) {
			$(GUI.userMarker.markers[data.objectId]["markers"][data.identifier]).remove();
		}
		
		var parent = $('#room_'+ObjectManager.getIndexOfObject(data.objectId));

		var infoBox = GUI.svg.group(parent, "selection_"+data.objectId+"_"+data.identifier);

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

		GUI.userMarker.setPosition(data.objectId, true);
		
	},
	
	/**
	 * Remove a marker
	 * @param {Object} data Object of options
	 * @param {int} data.objectId The webarena object id
	 * @param {String} data.identifier Unique use identifier for the marker
	 */
	"deselect" : function(data) {

		if (GUI.userMarker.markers[data.objectId] && GUI.userMarker.markers[data.objectId]["markers"][data.identifier]) {
			$(GUI.userMarker.markers[data.objectId]["markers"][data.identifier]).remove();
			GUI.userMarker.markers[data.objectId]["markers"][data.identifier] = undefined;
		}
		
	},
		
	/**
	 * Remove markers of offline listenres
	 * @param {Object} an array of user objects who are online
	 */	
	"removeOfflineUsers": function (users){
		
		var present={};
		
		for (var i in users){
			var user=users[i];
			present[user.id]=true;
		}
		
		for (var objectId in GUI.userMarker.markers){
			var markers=GUI.userMarker.markers[objectId].markers;
			for (var identifier in markers){
				if (!present[identifier]) {
					var data={"objectId":objectId,"identifier":identifier};
					this.deselect(data);
				}
			}
		}
	}
	
}