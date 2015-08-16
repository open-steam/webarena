"use strict";

/**
 * @namespace Holding methods and variables to display the recent changes
 */
GUI.recentChanges = {};


/**
 * add a single change entry
 */
GUI.recentChanges.addChange = function(room, change) {
	
	var action = GUI.translate(change.action);
	if(change.action == "set Attribute"){
		action = action+': '+room.translate(GUI.currentLanguage, change.attribute);
	}
	
	$("#recent_changes").prepend(
		'<div class="recent_change_other">'+
		'<span style="color:  #000000">'+change.user+' ('+change.date+')</span>'+
		action+
		'<span style="color:  #000000; font-weight: normal; font-size: 9px">'+change.objectID+'</span>'+
		'</div>'
	);
}


/**
 * called when the recent changes window is opened in GUI
 */
GUI.recentChanges.opened = function() {

	$("#recentChanges").find('div').remove();
	
	$("#recentChanges").append('<div id="recent_changes"></div>');
	
	var room = ObjectManager.getCurrentRoom();

	room.serverCall("getRecentChanges", {"roomID" : room.id}, function(result){
		
		for(var i = 0; i<result.length; i++){
			
			GUI.recentChanges.addChange(room, result[i]);
			
		}
	
	});
	
}


/**
 * called when the recent changes window is closed in GUI
 */
GUI.recentChanges.update = function() {

	GUI.recentChanges.opened();

}